import { Router, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { ApprovalRule } from '../models/ApprovalRule';
import { ReviewQueueItem } from '../models/ReviewQueueItem';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import { matchVendor } from '../services/vendorMatchingService';
import { checkInvoiceDuplicate } from '../services/duplicateDetectionService';
import { evaluateInvoiceRules } from '../services/rulesEngine';
import { createAuditLog, AUDIT_EVENTS } from '../services/auditLoggingService';
import mongoose from 'mongoose';

const router = Router();

router.use(authMiddleware);

// List all invoices
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, job } = req.query;
    const filter: any = { company: req.user!.id };
    
    if (status) {
      filter.status = status;
    }
    if (job) {
      filter.job = job;
    }

    const invoices = await Invoice.find(filter)
      .populate('job', 'jobNumber name')
      .populate('costCode', 'code description')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ invoiceDate: -1 });
    res.json({ invoices });
  } catch (error) {
    logger.error('List invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get a specific invoice
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('job', 'jobNumber name')
      .populate('costCode', 'code description')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    if (invoice.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ invoice });
  } catch (error) {
    logger.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create a new invoice
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      invoiceNumber,
      vendor,
      job,
      costCode,
      amount,
      dueDate,
      invoiceDate,
      status,
      documentUrl,
      extractedData,
      notes,
      ocrConfidence,
    } = req.body;

    const companyId = new mongoose.Types.ObjectId(req.user!.id);

    // Step 1: Match vendor using fuzzy matching service
    const vendorMatch = await matchVendor(vendor, companyId);
    logger.info('Vendor matching complete', { vendorMatch });

    // Step 2: Check for duplicate invoices
    const duplicateCheck = await checkInvoiceDuplicate(
      invoiceNumber,
      vendor,
      amount,
      invoiceDate ? new Date(invoiceDate) : new Date(),
      companyId
    );
    logger.info('Duplicate check complete', { duplicateCheck });

    // Step 3: Get approval threshold rules
    const applicableRules = await ApprovalRule.find({
      company: req.user!.id,
      isActive: true,
      $or: [{ documentType: 'invoice' }, { documentType: 'all' }],
      threshold: { $lte: amount },
    }).sort({ threshold: -1 });

    const approvalThreshold = applicableRules.length > 0 ? applicableRules[0].threshold : undefined;

    // Step 4: Evaluate rules to determine if review is needed
    const rulesResult = evaluateInvoiceRules({
      invoiceNumber,
      vendor,
      vendorId: vendorMatch.vendorId,
      amount,
      date: invoiceDate ? new Date(invoiceDate) : undefined,
      ocrConfidence,
      isDuplicate: duplicateCheck.isDuplicate,
      approvalThreshold,
    });
    logger.info('Rules evaluation complete', { rulesResult });

    // Step 5: Create invoice record
    const invoice = await Invoice.create({
      invoiceNumber,
      vendor,
      job,
      costCode,
      company: req.user!.id,
      amount,
      dueDate,
      invoiceDate,
      status: rulesResult.needsReview ? 'pending' : (status || 'draft'),
      documentUrl,
      extractedData,
      notes,
      createdBy: req.user!.id,
    });

    // Step 6: Log invoice creation in audit trail
    await createAuditLog({
      tenantId: companyId,
      documentId: invoice._id,
      eventType: AUDIT_EVENTS.INVOICE_CREATED,
      actor: 'USER',
      actorUserId: new mongoose.Types.ObjectId(req.user!.id),
      afterState: invoice.toObject() as unknown as Record<string, unknown>,
      metadata: {
        vendorMatchConfidence: vendorMatch.confidence,
        vendorMatchType: vendorMatch.matchType,
        isDuplicate: duplicateCheck.isDuplicate,
        duplicateScore: duplicateCheck.duplicateScore,
        rulesEvaluated: true,
        exceptionsCount: rulesResult.exceptions.length,
      },
    });

    // Step 7: Create review queue item if needed
    if (rulesResult.needsReview) {
      const reviewItem = await ReviewQueueItem.create({
        tenantId: companyId,
        documentId: invoice._id,
        documentType: 'invoice',
        status: 'pending',
        priority: rulesResult.priority,
        exceptions: rulesResult.exceptions.map(ex => ({
          type: ex.type,
          severity: ex.severity,
          message: ex.message,
          field: ex.field,
        })),
        extractedData: extractedData || {},
        fileUrl: documentUrl,
        metadata: {
          invoiceNumber,
          vendor,
          amount,
          vendorMatchConfidence: vendorMatch.confidence,
        },
      });

      logger.info('Review queue item created', { reviewItemId: reviewItem._id });

      await createAuditLog({
        tenantId: companyId,
        documentId: invoice._id,
        reviewItemId: reviewItem._id,
        eventType: AUDIT_EVENTS.REVIEW_ITEM_CREATED,
        actor: 'SYSTEM',
        afterState: reviewItem.toObject() as unknown as Record<string, unknown>,
        metadata: {
          exceptionsCount: rulesResult.exceptions.length,
          priority: rulesResult.priority,
        },
      });
    }

    // Response with enhanced data
    res.status(201).json({
      invoice,
      vendorMatch: {
        confidence: vendorMatch.confidence,
        matchType: vendorMatch.matchType,
        vendorId: vendorMatch.vendorId,
      },
      duplicateCheck: {
        isDuplicate: duplicateCheck.isDuplicate,
        score: duplicateCheck.duplicateScore,
        existingInvoiceId: duplicateCheck.existingInvoiceId,
      },
      review: {
        needsReview: rulesResult.needsReview,
        priority: rulesResult.priority,
        exceptionsCount: rulesResult.exceptions.length,
        exceptions: rulesResult.exceptions,
      },
      requiresApproval: applicableRules.length > 0,
      applicableRule: applicableRules.length > 0 ? applicableRules[0] : null,
    });
  } catch (error: any) {
    logger.error('Create invoice error:', error);
    if (error.code === 11000) {
      res.status(409).json({ error: 'Invoice number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create invoice', details: error.message });
    }
  }
});

// Update an invoice
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    if (invoice.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updated = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ invoice: updated });
  } catch (error) {
    logger.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Approve an invoice
router.post('/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const { notes } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    if (invoice.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const beforeState = invoice.toObject() as unknown as Record<string, unknown>;

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.user!.id,
        approvedAt: new Date(),
        notes: notes || invoice.notes,
      },
      { new: true }
    );

    // Log approval in audit trail
    await createAuditLog({
      tenantId: new mongoose.Types.ObjectId(req.user!.id),
      documentId: invoice._id,
      eventType: AUDIT_EVENTS.INVOICE_APPROVED,
      actor: 'USER',
      actorUserId: new mongoose.Types.ObjectId(req.user!.id),
      beforeState,
      afterState: updated!.toObject() as unknown as Record<string, unknown>,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        vendor: invoice.vendor,
        amount: invoice.amount,
        notes: notes,
      },
    });

    res.json({ invoice: updated });
  } catch (error) {
    logger.error('Approve invoice error:', error);
    res.status(500).json({ error: 'Failed to approve invoice' });
  }
});

// Reject an invoice
router.post('/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const { notes } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    if (invoice.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const beforeState = invoice.toObject() as unknown as Record<string, unknown>;

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        notes: notes || invoice.notes,
      },
      { new: true }
    );

    // Log rejection in audit trail
    await createAuditLog({
      tenantId: new mongoose.Types.ObjectId(req.user!.id),
      documentId: invoice._id,
      eventType: AUDIT_EVENTS.INVOICE_REJECTED,
      actor: 'USER',
      actorUserId: new mongoose.Types.ObjectId(req.user!.id),
      beforeState,
      afterState: updated!.toObject() as unknown as Record<string, unknown>,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        vendor: invoice.vendor,
        amount: invoice.amount,
        notes: notes,
      },
    });

    res.json({ invoice: updated });
  } catch (error) {
    logger.error('Reject invoice error:', error);
    res.status(500).json({ error: 'Failed to reject invoice' });
  }
});

// Delete an invoice
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    if (invoice.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    logger.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
