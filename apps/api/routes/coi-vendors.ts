import { Router, Response } from 'express';
import { COIVendor } from '../models/COIVendor';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';

const router = Router();

router.use(authMiddleware);

// List all COI vendors
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = { company: req.user!.id };
    
    if (status) {
      filter.status = status;
    }

    const vendors = await COIVendor.find(filter).sort({ name: 1 });
    res.json({ vendors });
  } catch (error) {
    logger.error('List COI vendors error:', error);
    res.status(500).json({ error: 'Failed to fetch COI vendors' });
  }
});

// Get vendors expiring soon (within 30 days)
router.get('/expiring', async (req: AuthRequest, res: Response) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const vendors = await COIVendor.find({
      company: req.user!.id,
      expirationDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
    }).sort({ expirationDate: 1 });

    res.json({ vendors });
  } catch (error) {
    logger.error('List expiring COI vendors error:', error);
    res.status(500).json({ error: 'Failed to fetch expiring vendors' });
  }
});

// Get a specific COI vendor
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const vendor = await COIVendor.findById(req.params.id);

    if (!vendor) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }

    if (vendor.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ vendor });
  } catch (error) {
    logger.error('Get COI vendor error:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

// Create a new COI vendor
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, certificateNumber, expirationDate, documentUrl, status, notes } = req.body;

    const vendor = await COIVendor.create({
      name,
      email,
      phone,
      company: req.user!.id,
      certificateNumber,
      expirationDate,
      documentUrl,
      status,
      notes,
    });

    res.status(201).json({ vendor });
  } catch (error) {
    logger.error('Create COI vendor error:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// Update a COI vendor
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const vendor = await COIVendor.findById(req.params.id);

    if (!vendor) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }

    if (vendor.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updated = await COIVendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ vendor: updated });
  } catch (error) {
    logger.error('Update COI vendor error:', error);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// Delete a COI vendor
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const vendor = await COIVendor.findById(req.params.id);

    if (!vendor) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }

    if (vendor.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await COIVendor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vendor deleted' });
  } catch (error) {
    logger.error('Delete COI vendor error:', error);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

export default router;
