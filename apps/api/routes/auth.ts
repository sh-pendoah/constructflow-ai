import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthToken, hashToken } from '../models/AuthToken';
import { config } from '../config';
import { logger } from '../config/logger';
import { registerValidators, loginValidators } from '../middleware/validators';
import { validate } from '../middleware/validate';
import { sendMagicLinkEmail } from '../services/emailService';

const router: Router = Router();

function generateToken(user: { id: string; email: string; role: string; tenantId?: string }): string {
  return jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
}

// ── Magic Link: Request Login ──────────────────────────────────────────────
router.post('/request-login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Valid email address is required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find or create user (passwordless — no password required)
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        password: crypto.randomBytes(32).toString('hex'), // random password — not shared with user (passwordless account)
        name: normalizedEmail.split('@')[0],
        role: 'worker',
      });
    }

    // Invalidate any previous unused tokens for this email
    await AuthToken.updateMany(
      { email: normalizedEmail, used: false },
      { $set: { used: true } }
    );

    // Generate secure one-time token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + config.magicLinkExpiryMinutes * 60 * 1000);

    await AuthToken.create({ tokenHash, email: normalizedEmail, expiresAt });

    // Send magic link email
    try {
      await sendMagicLinkEmail(normalizedEmail, rawToken);
    } catch (emailErr) {
      logger.error('Magic link email send failed:', emailErr);
      // In local development, and only when explicitly enabled, log the link for debugging
      if (config.env === 'development' && process.env.LOG_MAGIC_LINKS === 'true') {
        const magicLink = `${config.appUrl}/auth/verify?token=${encodeURIComponent(rawToken)}`;
        logger.info(`[DEV] Magic link for ${normalizedEmail}: ${magicLink}`);
      } else {
        // Clean up the token we just created since the email was not delivered
        await AuthToken.deleteOne({ tokenHash });
        res.status(503).json({ error: 'Email delivery failed. Please try again.' });
        return;
      }
    }

    res.json({ message: 'Magic link sent. Check your email.' });
  } catch (error) {
    logger.error('Request login error:', error);
    res.status(500).json({ error: 'Failed to send magic link' });
  }
});

// ── Magic Link: Verify Token ───────────────────────────────────────────────
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Token is required' });
      return;
    }

    const tokenHash = hashToken(token);
    const authToken = await AuthToken.findOne({ tokenHash });

    if (!authToken) {
      res.status(401).json({ error: 'Invalid or expired magic link' });
      return;
    }

    if (authToken.used) {
      res.status(401).json({ error: 'This magic link has already been used' });
      return;
    }

    if (authToken.expiresAt < new Date()) {
      res.status(401).json({ error: 'Magic link has expired. Please request a new one.' });
      return;
    }

    // Mark token as used
    authToken.used = true;
    await authToken.save();

    // Find user
    const user = await User.findOne({ email: authToken.email });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Account deactivated' });
      return;
    }

    // Update last login
    await User.updateOne({ _id: user._id }, { $set: { updatedAt: new Date() } });

    const jwtToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId?.toString(),
    });

    res.json({ user, token: jwtToken });
  } catch (error) {
    logger.error('Verify magic link error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

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

