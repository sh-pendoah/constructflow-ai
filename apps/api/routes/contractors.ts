import { Router, Response } from 'express';
import { Contractor } from '../models/Contractor';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { getCsvField } from '../utils/csvHelpers';

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

/**
 * GET /api/contractors
 * List all contractors for the company
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { isActive, search } = req.query;
    const filter: any = { tenantId: req.user!.id };
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    let query = Contractor.find(filter);
    
    // Add search capability
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query = query.or([
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ]);
    }
    
    const contractors = await query.sort({ name: 1 });
    res.json({ contractors });
  } catch (error) {
    logger.error('List contractors error:', error);
    res.status(500).json({ error: 'Failed to fetch contractors' });
  }
});

/**
 * GET /api/contractors/:id
 * Get a specific contractor
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const contractor = await Contractor.findById(req.params.id);

    if (!contractor) {
      res.status(404).json({ error: 'Contractor not found' });
      return;
    }

    if (contractor.tenantId.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ contractor });
  } catch (error) {
    logger.error('Get contractor error:', error);
    res.status(500).json({ error: 'Failed to fetch contractor' });
  }
});

/**
 * POST /api/contractors
 * Create a new contractor
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, address, licenseNumber, insuranceInfo, aliases, isActive } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Contractor name is required' });
      return;
    }

    const contractor = await Contractor.create({
      name,
      email,
      phone,
      address,
      licenseNumber,
      insuranceCarrier: insuranceInfo,
      aliases: aliases || [],
      tenantId: req.user!.id,
      isActive: isActive !== undefined ? isActive : true,
    });

    logger.info(`Contractor created: ${contractor._id}`);
    res.status(201).json({ contractor });
  } catch (error: any) {
    logger.error('Create contractor error:', error);
    if (error.code === 11000) {
      res.status(409).json({ error: 'Contractor with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create contractor' });
    }
  }
});

/**
 * PUT /api/contractors/:id
 * Update a contractor
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const contractor = await Contractor.findById(req.params.id);

    if (!contractor) {
      res.status(404).json({ error: 'Contractor not found' });
      return;
    }

    if (contractor.tenantId.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updated = await Contractor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    logger.info(`Contractor updated: ${req.params.id}`);
    res.json({ contractor: updated });
  } catch (error) {
    logger.error('Update contractor error:', error);
    res.status(500).json({ error: 'Failed to update contractor' });
  }
});

/**
 * DELETE /api/contractors/:id
 * Delete a contractor (soft delete by setting isActive = false)
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const contractor = await Contractor.findById(req.params.id);

    if (!contractor) {
      res.status(404).json({ error: 'Contractor not found' });
      return;
    }

    if (contractor.tenantId.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Soft delete by setting isActive to false
    contractor.isActive = false;
    await contractor.save();

    logger.info(`Contractor soft deleted: ${req.params.id}`);
    res.json({ message: 'Contractor deactivated successfully' });
  } catch (error) {
    logger.error('Delete contractor error:', error);
    res.status(500).json({ error: 'Failed to delete contractor' });
  }
});

/**
 * POST /api/contractors/import/preview
 * Preview CSV import for contractors
 */
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

    // Validate and prepare preview
    const preview: any[] = [];
    const errors: any[] = [];
    const companyId = req.user!.id;

    // Get existing contractors to check for duplicates
    const existingContractors = await Contractor.find({ tenantId: companyId });
    const existingNames = new Set(existingContractors.map(c => c.name.toLowerCase()));

    for (let i = 0; i < Math.min(records.length, 100); i++) {
      const record = records[i];
      const rowNum = i + 2; // +2 for header row and 0-indexing

      const name = getCsvField(record, 'name') || getCsvField(record, 'contractor_name') || getCsvField(record, 'contractor');
      const email = getCsvField(record, 'email') || getCsvField(record, 'email_address') || getCsvField(record, 'contact_email');
      const phone = getCsvField(record, 'phone') || getCsvField(record, 'phone_number') || getCsvField(record, 'contact_phone');
      const licenseNumber = getCsvField(record, 'license_number') || getCsvField(record, 'license') || getCsvField(record, 'license_no');

      const rowErrors: string[] = [];

      // Validation
      if (!name) {
        rowErrors.push('Missing contractor name');
      } else if (existingNames.has(name.toLowerCase())) {
        rowErrors.push('Duplicate contractor name');
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        rowErrors.push('Invalid email format');
      }

      preview.push({
        rowNum,
        name,
        email,
        phone,
        licenseNumber,
        errors: rowErrors,
        isValid: rowErrors.length === 0,
      });

      if (rowErrors.length > 0) {
        errors.push({ rowNum, errors: rowErrors });
      }
    }

    res.json({
      totalRows: records.length,
      previewRows: preview,
      validRows: preview.filter(r => r.isValid).length,
      invalidRows: errors.length,
      errors,
    });
  } catch (error) {
    logger.error('CSV preview error:', error);
    res.status(500).json({ error: 'Failed to preview CSV' });
  }
});

/**
 * POST /api/contractors/import
 * Import contractors from CSV
 */
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

    const companyId = req.user!.id;
    const contractors: any[] = [];
    const errors: any[] = [];

    // Get existing contractors to check for duplicates
    const existingContractors = await Contractor.find({ tenantId: companyId });
    const existingNames = new Set(existingContractors.map(c => c.name.toLowerCase()));

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNum = i + 2;

      try {
        const name = getCsvField(record, 'name') || getCsvField(record, 'contractor_name') || getCsvField(record, 'contractor');
        const email = getCsvField(record, 'email') || getCsvField(record, 'email_address') || getCsvField(record, 'contact_email');
        const phone = getCsvField(record, 'phone') || getCsvField(record, 'phone_number') || getCsvField(record, 'contact_phone');
        const licenseNumber = getCsvField(record, 'license_number') || getCsvField(record, 'license') || getCsvField(record, 'license_no');
        const address = getCsvField(record, 'address') || getCsvField(record, 'street_address');

        // Skip if missing name or duplicate
        if (!name) {
          errors.push({ rowNum, error: 'Missing contractor name' });
          continue;
        }

        if (existingNames.has(name.toLowerCase())) {
          errors.push({ rowNum, error: 'Duplicate contractor name' });
          continue;
        }

        contractors.push({
          name,
          email,
          phone,
          address,
          licenseNumber,
          tenantId: companyId,
          isActive: true,
        });

        // Add to existing names set to prevent duplicates within the same import
        existingNames.add(name.toLowerCase());
      } catch (error: any) {
        errors.push({ rowNum, error: error.message });
      }
    }

    // Bulk insert valid contractors
    let insertedCount = 0;
    if (contractors.length > 0) {
      const result = await Contractor.insertMany(contractors, { ordered: false });
      insertedCount = result.length;
    }

    logger.info(`Imported ${insertedCount} contractors with ${errors.length} errors`);

    res.json({
      imported: insertedCount,
      totalRows: records.length,
      errors,
    });
  } catch (error) {
    logger.error('CSV import error:', error);
    res.status(500).json({ error: 'Failed to import CSV' });
  }
});

/**
 * GET /api/contractors/export
 * Export contractors to CSV
 */
router.get('/export', async (req: AuthRequest, res: Response) => {
  try {
    const contractors = await Contractor.find({ 
      tenantId: req.user!.id,
      isActive: true,
    }).sort({ name: 1 });

    const csvData = contractors.map(c => ({
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      license_number: c.licenseNumber || '',
    }));

    const csv = stringify(csvData, { header: true });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contractors.csv');
    res.send(csv);
  } catch (error) {
    logger.error('Export contractors error:', error);
    res.status(500).json({ error: 'Failed to export contractors' });
  }
});

export default router;

