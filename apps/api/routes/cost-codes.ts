import { Router, Response } from 'express';
import { CostCode } from '../models/CostCode';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { getCsvField } from '../utils/csvHelpers';

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

// List all cost codes
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.query;
    const filter: any = { company: req.user!.id };
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const costCodes = await CostCode.find(filter).sort({ code: 1 });
    res.json({ costCodes });
  } catch (error) {
    logger.error('List cost codes error:', error);
    res.status(500).json({ error: 'Failed to fetch cost codes' });
  }
});

// Get a specific cost code
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const costCode = await CostCode.findById(req.params.id);

    if (!costCode) {
      res.status(404).json({ error: 'Cost code not found' });
      return;
    }

    if (costCode.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ costCode });
  } catch (error) {
    logger.error('Get cost code error:', error);
    res.status(500).json({ error: 'Failed to fetch cost code' });
  }
});

// Create a new cost code
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { code, description, category, isActive } = req.body;

    const costCode = await CostCode.create({
      code,
      description,
      category,
      company: req.user!.id,
      isActive,
    });

    res.status(201).json({ costCode });
  } catch (error: any) {
    logger.error('Create cost code error:', error);
    if (error.code === 11000) {
      res.status(409).json({ error: 'Cost code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create cost code' });
    }
  }
});

// Update a cost code
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const costCode = await CostCode.findById(req.params.id);

    if (!costCode) {
      res.status(404).json({ error: 'Cost code not found' });
      return;
    }

    if (costCode.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updated = await CostCode.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ costCode: updated });
  } catch (error) {
    logger.error('Update cost code error:', error);
    res.status(500).json({ error: 'Failed to update cost code' });
  }
});

// Delete a cost code
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const costCode = await CostCode.findById(req.params.id);

    if (!costCode) {
      res.status(404).json({ error: 'Cost code not found' });
      return;
    }

    if (costCode.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await CostCode.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cost code deleted' });
  } catch (error) {
    logger.error('Delete cost code error:', error);
    res.status(500).json({ error: 'Failed to delete cost code' });
  }
});

// Import cost codes from CSV
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
    const existingCodes = await CostCode.find({ company: companyId }).select('code').lean();
    const existingCodeSet = new Set(existingCodes.map(c => c.code));

    for (let i = 0; i < Math.min(records.length, 100); i++) {
      const record = records[i];
      const row = i + 2; // +2 for header row + 0-index

      const code = getCsvField(record, 'code');
      const description = getCsvField(record, 'description');
      const category = getCsvField(record, 'category');

      const errors = [];
      
      if (!code) errors.push('Code is required');
      if (!description) errors.push('Description is required');
      if (existingCodeSet.has(code)) errors.push('Duplicate code in database');

      if (errors.length > 0) {
        validationErrors.push({ row, code, errors });
      }

      preview.push({
        row,
        code,
        description,
        category,
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
    logger.error('Preview cost codes error:', error);
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
        const costCode = await CostCode.create({
          code: getCsvField(record, 'code'),
          description: getCsvField(record, 'description'),
          category: getCsvField(record, 'category'),
          company: req.user!.id,
          isActive: true,
        });
        imported.push(costCode);
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
    logger.error('Import cost codes error:', error);
    res.status(500).json({ error: 'Failed to import cost codes' });
  }
});

// Export cost codes to CSV
router.get('/export/csv', async (req: AuthRequest, res: Response) => {
  try {
    const costCodes = await CostCode.find({ company: req.user!.id }).lean();

    const csv = stringify(costCodes, {
      header: true,
      columns: ['code', 'description', 'category', 'isActive'],
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=cost-codes.csv');
    res.send(csv);
  } catch (error) {
    logger.error('Export cost codes error:', error);
    res.status(500).json({ error: 'Failed to export cost codes' });
  }
});

export default router;

