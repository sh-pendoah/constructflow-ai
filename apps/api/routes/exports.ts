import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { exportService } from '../services/exportService';
import { logger } from '../config/logger';

const router = express.Router();

/**
 * GET /api/exports/wc-audit
 * Generate and download Workers' Compensation audit report
 */
router.get('/wc-audit', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { dateFrom, dateTo, format = 'json' } = req.query;
    const companyId = req.user!.id;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({ 
        message: 'dateFrom and dateTo parameters are required' 
      });
    }

    const from = new Date(dateFrom as string);
    const to = new Date(dateTo as string);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Generate report
    const report = await exportService.generateWCAuditReport(
      companyId!,
      from,
      to
    );

    // Return in requested format
    if (format === 'csv') {
      const csv = await exportService.exportWCAuditReportToCSV(report);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="wc-audit-${from.toISOString().split('T')[0]}-to-${to.toISOString().split('T')[0]}.csv"`
      );
      res.send(csv);
    } else {
      res.json(report);
    }
  } catch (error) {
    logger.error('Error generating WC audit report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

/**
 * GET /api/exports/invoices
 * Export invoices to CSV
 */
router.get('/invoices', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { dateFrom, dateTo, jobId } = req.query;
    const companyId = req.user!.id;

    const options: any = { format: 'csv' };
    
    if (dateFrom) options.dateFrom = new Date(dateFrom as string);
    if (dateTo) options.dateTo = new Date(dateTo as string);
    if (jobId) options.jobId = jobId as string;

    const csv = await exportService.exportInvoices(companyId!, options);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoices-export-${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting invoices:', error);
    res.status(500).json({ message: 'Failed to export invoices' });
  }
});

/**
 * GET /api/exports/compliance
 * Export compliance documents to CSV
 */
router.get('/compliance', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.id;

    const csv = await exportService.exportCompliance(companyId!, {
      format: 'csv',
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="compliance-export-${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting compliance:', error);
    res.status(500).json({ message: 'Failed to export compliance documents' });
  }
});

export default router;
