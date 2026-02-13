import { Router, Response } from 'express';
import { WCCode } from '../models/WCCode';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { getCsvField, parseCsvNumber } from '../utils/csvHelpers';

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

// List all WC codes
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { state, isActive } = req.query;
    const filter: any = { company: req.user!.id };
    
    if (state) {
      filter.state = state;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const wcCodes = await WCCode.find(filter).sort({ code: 1 });
    res.json({ wcCodes });
  } catch (error) {
    logger.error('List WC codes error:', error);
    res.status(500).json({ error: 'Failed to fetch WC codes' });
  }
});

// Get a specific WC code
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const wcCode = await WCCode.findById(req.params.id);

    if (!wcCode) {
      res.status(404).json({ error: 'WC code not found' });
      return;
    }

    if (wcCode.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ wcCode });
  } catch (error) {
    logger.error('Get WC code error:', error);
    res.status(500).json({ error: 'Failed to fetch WC code' });
  }
});

// Create a new WC code
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { code, description, state, rate, isActive } = req.body;

    const wcCode = await WCCode.create({
      code,
      description,
      state,
      rate,
      company: req.user!.id,
      isActive,
    });

    res.status(201).json({ wcCode });
  } catch (error: any) {
    logger.error('Create WC code error:', error);
    if (error.code === 11000) {
      res.status(409).json({ error: 'WC code already exists for this state' });
    } else {
      res.status(500).json({ error: 'Failed to create WC code' });
    }
  }
});

// Update a WC code
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const wcCode = await WCCode.findById(req.params.id);

    if (!wcCode) {
      res.status(404).json({ error: 'WC code not found' });
      return;
    }

    if (wcCode.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updated = await WCCode.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ wcCode: updated });
  } catch (error) {
    logger.error('Update WC code error:', error);
    res.status(500).json({ error: 'Failed to update WC code' });
  }
});

// Delete a WC code
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const wcCode = await WCCode.findById(req.params.id);

    if (!wcCode) {
      res.status(404).json({ error: 'WC code not found' });
      return;
    }

    if (wcCode.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await WCCode.findByIdAndDelete(req.params.id);
    res.json({ message: 'WC code deleted' });
  } catch (error) {
    logger.error('Delete WC code error:', error);
    res.status(500).json({ error: 'Failed to delete WC code' });
  }
});

// Import WC codes from CSV
// Preview CSV before import (validation + mapping preview)
router.post('/import/preview', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const preview = [];
    const validationErrors = [];
    const companyId = req.user!.id;

    // Get existing codes for duplicate detection
    const existingCodes = await WCCode.find({ company: companyId }).select('code').lean();
    const existingCodeSet = new Set(existingCodes.map(c => c.code));

    for (let i = 0; i < Math.min(records.length, 100); i++) {
      const record = records[i];
      const row = i + 2; // +2 for header row + 0-index

      const code = getCsvField(record, 'code');
      const description = getCsvField(record, 'description');
      const state = getCsvField(record, 'state');
      const rate = parseCsvNumber(getCsvField(record, 'rate'));

      const errors = [];
      
      if (!code) errors.push('Code is required');
      if (!description) errors.push('Description is required');
      if (!state) errors.push('State is required');
      if (!rate || rate < 0) errors.push('Valid rate is required');
      if (existingCodeSet.has(code)) errors.push('Duplicate code in database');

      if (errors.length > 0) {
        validationErrors.push({ row, code, errors });
      }

      preview.push({
        row,
        code,
        description,
        state,
        rate,
        valid: errors.length === 0,
        errors
      });
    }

    res.json({
      totalRows: records.length,
      previewRows: preview.length,
      preview,
      validCount: preview.filter(p => p.valid).length,
      errorCount: validationErrors.length,
      validationErrors
    });
  } catch (error) {
    logger.error('Preview WC codes error:', error);
    res.status(500).json({ error: 'Failed to preview CSV' });
  }
});

router.post('/import', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const imported = [];
    const errors = [];

    for (const record of records) {
      try {
        const wcCode = await WCCode.create({
          code: getCsvField(record, 'code'),
          description: getCsvField(record, 'description'),
          state: getCsvField(record, 'state'),
          rate: parseCsvNumber(getCsvField(record, 'rate')),
          company: req.user!.id,
          isActive: true,
        });
        imported.push(wcCode);
      } catch (error: any) {
        if (error.code === 11000) {
          errors.push({ code: getCsvField(record, 'code'), error: 'Duplicate code' });
        } else {
          errors.push({ code: getCsvField(record, 'code'), error: error.message });
        }
      }
    }

    res.json({
      message: 'Import completed',
      imported: imported.length,
      errors: errors.length,
      details: errors,
    });
  } catch (error) {
    logger.error('Import WC codes error:', error);
    res.status(500).json({ error: 'Failed to import WC codes' });
  }
});

// Export WC codes to CSV
router.get('/export/csv', async (req: AuthRequest, res: Response) => {
  try {
    const wcCodes = await WCCode.find({ company: req.user!.id }).lean();

    const csv = stringify(wcCodes, {
      header: true,
      columns: ['code', 'description', 'state', 'rate', 'isActive'],
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=wc-codes.csv');
    res.send(csv);
  } catch (error) {
    logger.error('Export WC codes error:', error);
    res.status(500).json({ error: 'Failed to export WC codes' });
  }
});

export default router;

