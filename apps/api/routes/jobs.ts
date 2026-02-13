import { Router, Response } from 'express';
import { Job } from '../models/Job';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import { createJobValidators, updateJobValidators, idValidator } from '../middleware/validators';
import { validate } from '../middleware/validate';

const router: Router = Router();

router.use(authMiddleware);

// List all jobs for the company
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await Job.find({ company: req.user!.id })
      .populate('createdBy', 'name email')
      .populate('costCodes', 'code description')
      .sort({ updatedAt: -1 });
    res.json({ jobs });
  } catch (error) {
    logger.error('List jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get a specific job
router.get('/:id', idValidator, validate, async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('costCodes', 'code description');

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ job });
  } catch (error) {
    logger.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Create a new job
router.post('/', createJobValidators, validate, async (req: AuthRequest, res: Response) => {
  try {
    const { jobNumber, name, description, customer, address, status, startDate, endDate, budget, costCodes } =
      req.body;

    const job = await Job.create({
      jobNumber,
      name,
      description,
      company: req.user!.id,
      customer,
      address,
      status,
      startDate,
      endDate,
      budget,
      costCodes,
      createdBy: req.user!.id,
    });

    res.status(201).json({ job });
  } catch (error: any) {
    logger.error('Create job error:', error);
    if (error.code === 11000) {
      res.status(409).json({ error: 'Job number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create job' });
    }
  }
});

// Update a job
router.put('/:id', updateJobValidators, validate, async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ job: updated });
  } catch (error) {
    logger.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete a job
router.delete('/:id', idValidator, validate, async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (error) {
    logger.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

export default router;

