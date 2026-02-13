import { Router, Response } from 'express';
import { ComplianceDoc } from '../models/ComplianceDoc';
import { COIVendor } from '../models/COIVendor';
import { ReviewQueueItem } from '../models/ReviewQueueItem';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import { matchContractor } from '../services/workerContractorMatchingService';
import { evaluateComplianceRules } from '../services/rulesEngine';
import { createAuditLog, AUDIT_EVENTS } from '../services/auditLoggingService';
import mongoose from 'mongoose';

const router: Router = Router();

router.use(authMiddleware);

// List all compliance documents
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, status } = req.query;
    const filter: any = { company: req.user!.id };
    
    if (type) {
      filter.type = type;
    }
    if (status) {
      filter.status = status;
    }

    const docs = await ComplianceDoc.find(filter)
      .populate('vendor', 'name')
      .populate('createdBy', 'name email')
      .sort({ expirationDate: 1 });
    res.json({ docs });
  } catch (error) {
    logger.error('List compliance docs error:', error);
    res.status(500).json({ error: 'Failed to fetch compliance documents' });
  }
});

// Get expiring documents (within 30 days)
router.get('/expiring', async (req: AuthRequest, res: Response) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const docs = await ComplianceDoc.find({
      company: req.user!.id,
      expirationDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
      status: { $ne: 'expired' },
    })
      .populate('vendor', 'name')
      .sort({ expirationDate: 1 });

    // Update status to expiring-soon if not already
    await ComplianceDoc.updateMany(
      {
        company: req.user!.id,
        expirationDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
        status: 'valid',
      },
      { status: 'expiring-soon' }
    );

    res.json({ docs });
  } catch (error) {
    logger.error('List expiring compliance docs error:', error);
    res.status(500).json({ error: 'Failed to fetch expiring documents' });
  }
});

// Get expired documents
router.get('/expired', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();

    const docs = await ComplianceDoc.find({
      company: req.user!.id,
      expirationDate: { $lt: now },
    })
      .populate('vendor', 'name')
      .sort({ expirationDate: -1 });

    // Update status to expired if not already
    await ComplianceDoc.updateMany(
      {
        company: req.user!.id,
        expirationDate: { $lt: now },
        status: { $ne: 'expired' },
      },
      { status: 'expired' }
    );

    // Also update associated vendors
    const vendorIds = docs.map((doc) => doc.vendor).filter((id): id is mongoose.Types.ObjectId => Boolean(id));
    if (vendorIds.length > 0) {
      await COIVendor.updateMany(
        {
          _id: { $in: vendorIds },
          status: { $ne: 'expired' },
        },
        { status: 'expired' }
      );
    }

    res.json({ docs });
  } catch (error) {
    logger.error('List expired compliance docs error:', error);
    res.status(500).json({ error: 'Failed to fetch expired documents' });
  }
});

// Get a specific compliance document
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await ComplianceDoc.findById(req.params.id)
      .populate('vendor', 'name email phone')
      .populate('createdBy', 'name email');

    if (!doc) {
      res.status(404).json({ error: 'Compliance document not found' });
      return;
    }

    if (doc.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ doc });
  } catch (error) {
    logger.error('Get compliance doc error:', error);
    res.status(500).json({ error: 'Failed to fetch compliance document' });
  }
});

// Create a new compliance document
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      title,
      vendor,
      contractorName,
      documentNumber,
      issueDate,
      expirationDate,
      status,
      documentUrl,
      notes,
      ocrConfidence,
    } = req.body;

    const companyId = new mongoose.Types.ObjectId(req.user!.id);

    // Step 1: Match contractor by name if provided
    let contractorMatch = null;
    if (contractorName) {
      contractorMatch = await matchContractor(contractorName, companyId);
      logger.info('Contractor matching complete', { contractorMatch });
    }

    // Step 2: Evaluate rules to determine if review is needed
    const rulesResult = evaluateComplianceRules({
      contractorName,
      contractorId: contractorMatch?.id,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      ocrConfidence,
    });
    logger.info('Rules evaluation complete for compliance doc', { rulesResult });

    // Step 3: Create compliance document
    const doc = await ComplianceDoc.create({
      type,
      title,
      company: req.user!.id,
      vendor,
      ...(contractorMatch?.id && { contractorId: contractorMatch.id }),
      contractorName,
      documentNumber,
      issueDate,
      expirationDate,
      status: rulesResult.needsReview ? 'EXPIRING' : (status || 'ACTIVE'),
      documentUrl,
      notes,
      createdBy: req.user!.id,
    });

    // Step 4: Log compliance doc creation in audit trail
    await createAuditLog({
      tenantId: companyId,
      documentId: doc._id,
      eventType: AUDIT_EVENTS.COMPLIANCE_DOC_CREATED,
      actor: 'USER',
      actorUserId: companyId,
      afterState: doc.toObject() as unknown as Record<string, unknown>,
      metadata: {
        contractorMatchConfidence: contractorMatch?.confidence,
        contractorMatchType: contractorMatch?.matchType,
        rulesEvaluated: true,
        exceptionsCount: rulesResult.exceptions.length,
      },
    });

    // Step 5: Create review queue item if needed
    if (rulesResult.needsReview) {
      const reviewItem = await ReviewQueueItem.create({
        company: companyId,
        documentId: doc._id,
        documentType: 'compliance',
        status: 'pending',
        priority: rulesResult.priority,
        exceptions: rulesResult.exceptions.map(ex => ({
          type: ex.type,
          severity: ex.severity,
          message: ex.message,
          field: ex.field,
        })),
        extractedData: {
          type,
          title,
          contractorName,
          expirationDate,
          issueDate,
        },
        fileUrl: documentUrl,
      });

      logger.info('Review queue item created for compliance doc', { reviewItemId: reviewItem._id });

      await createAuditLog({
        tenantId: companyId,
        documentId: doc._id,
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
      doc,
      contractorMatch: contractorMatch ? {
        confidence: contractorMatch.confidence,
        matchType: contractorMatch.matchType,
        contractorId: contractorMatch.id,
      } : null,
      review: {
        needsReview: rulesResult.needsReview,
        priority: rulesResult.priority,
        exceptionsCount: rulesResult.exceptions.length,
        exceptions: rulesResult.exceptions,
      },
    });
  } catch (error) {
    logger.error('Create compliance doc error:', error);
    res.status(500).json({ error: 'Failed to create compliance document', details: (error as Error).message });
  }
});

// Update a compliance document
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await ComplianceDoc.findById(req.params.id);

    if (!doc) {
      res.status(404).json({ error: 'Compliance document not found' });
      return;
    }

    if (doc.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updated = await ComplianceDoc.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ doc: updated });
  } catch (error) {
    logger.error('Update compliance doc error:', error);
    res.status(500).json({ error: 'Failed to update compliance document' });
  }
});

// Delete a compliance document
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await ComplianceDoc.findById(req.params.id);

    if (!doc) {
      res.status(404).json({ error: 'Compliance document not found' });
      return;
    }

    if (doc.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await ComplianceDoc.findByIdAndDelete(req.params.id);
    res.json({ message: 'Compliance document deleted' });
  } catch (error) {
    logger.error('Delete compliance doc error:', error);
    res.status(500).json({ error: 'Failed to delete compliance document' });
  }
});

export default router;

