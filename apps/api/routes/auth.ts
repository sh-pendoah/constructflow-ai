import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config';
import { logger } from '../config/logger';
import { registerValidators, loginValidators } from '../middleware/validators';
import { validate } from '../middleware/validate';

const router = Router();

function generateToken(user: { id: string; email: string; role: string; tenantId?: string }): string {
  return jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
}

router.post('/register', registerValidators, validate, async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, company } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const user = await User.create({ email, password, name, role, company });
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      tenantId: user.tenantId?.toString() 
    });

    res.status(201).json({ user, token });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', loginValidators, validate, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Account deactivated' });
      return;
    }

    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      tenantId: user.tenantId?.toString() 
    });
    res.json({ user, token });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
