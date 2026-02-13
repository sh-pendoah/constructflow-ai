import { Response, Router } from 'express';
import { logger } from '../config/logger';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { ApprovalRule } from '../models/ApprovalRule';

const router: Router = Router();

router.use(authMiddleware);

// List all approval rules
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.query;
    const filter: any = { company: req.user!.id };

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const rules = await ApprovalRule.find(filter)
      .populate('approvers', 'name email')
      .sort({ threshold: 1 });
    res.json({ rules });
  } catch (error) {
    logger.error('List approval rules error:', error);
    res.status(500).json({ error: 'Failed to fetch approval rules' });
  }
});

// Get a specific approval rule
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const rule = await ApprovalRule.findById(req.params.id).populate(
      'approvers',
      'name email'
    );

    if (!rule) {
      res.status(404).json({ error: 'Approval rule not found' });
      return;
    }

    if (rule.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ rule });
  } catch (error) {
    logger.error('Get approval rule error:', error);
    res.status(500).json({ error: 'Failed to fetch approval rule' });
  }
});

// Create a new approval rule
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, threshold, approvers, documentType, isActive } = req.body;

    const rule = await ApprovalRule.create({
      name,
      company: req.user!.id,
      threshold,
      approvers,
      documentType,
      isActive,
    });

    res.status(201).json({ rule });
  } catch (error) {
    logger.error('Create approval rule error:', error);
    res.status(500).json({ error: 'Failed to create approval rule' });
  }
});

// Update an approval rule
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const rule = await ApprovalRule.findById(req.params.id);

    if (!rule) {
      res.status(404).json({ error: 'Approval rule not found' });
      return;
    }

    if (rule.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updated = await ApprovalRule.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({ rule: updated });
  } catch (error) {
    logger.error('Update approval rule error:', error);
    res.status(500).json({ error: 'Failed to update approval rule' });
  }
});

// Delete an approval rule
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const rule = await ApprovalRule.findById(req.params.id);

    if (!rule) {
      res.status(404).json({ error: 'Approval rule not found' });
      return;
    }

    if (rule.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await ApprovalRule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Approval rule deleted' });
  } catch (error) {
    logger.error('Delete approval rule error:', error);
    res.status(500).json({ error: 'Failed to delete approval rule' });
  }
});

export default router;
