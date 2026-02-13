import express, { Response, Router } from 'express';
import mongoose from 'mongoose';
import { logger } from '../config/logger';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware, TenantRequest } from '../middleware/tenant';
import { ReviewQueueItem } from '../models/ReviewQueueItem';
import {
  AUDIT_EVENTS,
  createAuditLog,
  logReviewApproval,
  logReviewRejection,
} from '../services/auditLoggingService';

const router: Router = express.Router();

/**
 * GET /api/review-queue
 * List all review queue items for the company
 */
router.get(
  '/',
  authMiddleware,
  tenantMiddleware,
  async (req: any, res: Response) => {
    const tenantReq = req as TenantRequest;
    try {
      const {
        documentType,
        status,
        priority,
        page = '1',
        limit = '50',
      } = tenantReq.query;
      const tenantId = tenantReq.tenantId;

      // Build filter
      const filter: any = { company: tenantId };

      if (documentType) {
        filter.documentType = documentType;
      }

      if (status) {
        filter.status = status;
      }

      if (priority) {
        filter.priority = priority;
      }

      // Pagination
      const rawPage = parseInt(page as string, 10);
      const rawLimit = parseInt(limit as string, 10);
      const DEFAULT_PAGE = 1;
      const DEFAULT_LIMIT = 50;
      const MAX_LIMIT = 100;

      const pageNum =
        Number.isNaN(rawPage) || rawPage < 1 ? DEFAULT_PAGE : rawPage;
      let limitNum =
        Number.isNaN(rawLimit) || rawLimit < 1 ? DEFAULT_LIMIT : rawLimit;
      if (limitNum > MAX_LIMIT) {
        limitNum = MAX_LIMIT;
      }
      const skip = (pageNum - 1) * limitNum;

      // Query with pagination
      const items = await ReviewQueueItem.find(filter)
        .sort({ priority: -1, submittedAt: 1 }) // Urgent first, then oldest
        .skip(skip)
        .limit(limitNum)
        .populate('assignedTo', 'name email')
        .populate('reviewedBy', 'name email')
        .populate('jobId', 'name code')
        .lean();

      // Count total
      const total = await ReviewQueueItem.countDocuments(filter);

      res.json({
        items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      logger.error('Error fetching review queue:', error);
      res.status(500).json({ message: 'Failed to fetch review queue' });
    }
  }
);

/**
 * GET /api/review-queue/stats
 * Get statistics for review queue
 */
router.get(
  '/stats',
  authMiddleware,
  tenantMiddleware,
  async (req: any, res: Response) => {
    const tenantReq = req as TenantRequest;
    try {
      const tenantId = tenantReq.tenantId;

      const stats = await ReviewQueueItem.aggregate([
        { $match: { company: tenantId } },
        {
          $facet: {
            byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
            byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
            byDocumentType: [
              { $group: { _id: '$documentType', count: { $sum: 1 } } },
            ],
            avgConfidence: [
              {
                $group: {
                  _id: null,
                  avgConfidence: { $avg: '$ocrConfidence' },
                },
              },
            ],
          },
        },
      ]);

      res.json(stats[0] || {});
    } catch (error) {
      logger.error('Error fetching review queue stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  }
);

/**
 * GET /api/review-queue/:id
 * Get specific review queue item
 */
router.get(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  async (req: any, res: Response) => {
    const tenantReq = req as TenantRequest;
    try {
      const { id } = tenantReq.params;
      const tenantId = tenantReq.tenantId;

      const item = await ReviewQueueItem.findOne({
        _id: id,
        company: tenantId,
      })
        .populate('assignedTo', 'name email')
        .populate('reviewedBy', 'name email')
        .populate('jobId', 'name code')
        .lean();

      if (!item) {
        return res.status(404).json({ message: 'Review queue item not found' });
      }

      res.json(item);
    } catch (error) {
      logger.error('Error fetching review queue item:', error);
      res.status(500).json({ message: 'Failed to fetch review queue item' });
    }
  }
);

/**
 * PATCH /api/review-queue/:id/assign
 * Assign review queue item to user
 */
router.patch(
  '/:id/assign',
  authMiddleware,
  tenantMiddleware,
  async (req: any, res: Response) => {
    const tenantReq = req as TenantRequest;
    try {
      const { id } = tenantReq.params;
      const { assignedTo } = tenantReq.body;
      const tenantId = tenantReq.tenantId;

      const item = await ReviewQueueItem.findOneAndUpdate(
        { _id: id, company: tenantId },
        {
          assignedTo: assignedTo || tenantReq.user!.id,
          status: 'in-review',
        },
        { new: true }
      );

      if (!item) {
        return res.status(404).json({ message: 'Review queue item not found' });
      }

      logger.info(
        `Review queue item ${id} assigned to ${assignedTo || tenantReq.user!.id}`
      );
      res.json(item);
    } catch (error) {
      logger.error('Error assigning review queue item:', error);
      res.status(500).json({ message: 'Failed to assign item' });
    }
  }
);

/**
 * POST /api/review-queue/:id/corrections
 * Add correction to review queue item
 */
router.post(
  '/:id/corrections',
  authMiddleware,
  tenantMiddleware,
  async (req: any, res: Response) => {
    const tenantReq = req as TenantRequest;
    try {
      const id = Array.isArray(tenantReq.params.id)
        ? tenantReq.params.id[0]
        : tenantReq.params.id;
      const { field, correctedValue } = tenantReq.body;
      const tenantId = tenantReq.tenantId;

      if (!field || correctedValue === undefined) {
        return res
          .status(400)
          .json({ message: 'Field and correctedValue are required' });
      }

      const item = await ReviewQueueItem.findOne({
        _id: id,
        company: tenantId,
      });

      if (!item) {
        return res.status(404).json({ message: 'Review queue item not found' });
      }

      // Get original value from extracted data
      const originalValue = item.extractedData?.[field];

      // Add correction
      item.addCorrection(
        field,
        originalValue,
        correctedValue,
        new mongoose.Types.ObjectId(tenantReq.user!.id)
      );

      await item.save();

      // Log correction to audit trail
      await createAuditLog({
        tenantId,
        reviewItemId: new mongoose.Types.ObjectId(id),
        eventType: AUDIT_EVENTS.REVIEW_ITEM_CORRECTED,
        actor: 'USER',
        actorUserId: new mongoose.Types.ObjectId(tenantReq.user!.id),
        beforeState: { [field]: originalValue },
        afterState: { [field]: correctedValue },
        metadata: { field, documentType: item.documentType },
      });

      logger.info(`Correction added to review queue item ${id}: ${field}`);
      res.json(item);
    } catch (error) {
      logger.error('Error adding correction:', error);
      res.status(500).json({ message: 'Failed to add correction' });
    }
  }
);

/**
 * POST /api/review-queue/:id/approve
 * Approve review queue item and update source document
 */
router.post(
  '/:id/approve',
  authMiddleware,
  tenantMiddleware,
  async (req: any, res: Response) => {
    const tenantReq = req as TenantRequest;
    try {
      const id = Array.isArray(tenantReq.params.id)
        ? tenantReq.params.id[0]
        : tenantReq.params.id;
      const { notes } = tenantReq.body;
      const tenantId = tenantReq.tenantId;

      const item = await ReviewQueueItem.findOne({
        _id: id,
        company: tenantId,
      });

      if (!item) {
        return res.status(404).json({ message: 'Review queue item not found' });
      }

      // Update the review queue item
      item.status = 'approved';
      item.reviewedBy = tenantReq.user!.id as any;
      item.reviewedAt = new Date();
      item.reviewNotes = notes;
      await item.save();

      // Log approval to audit trail
      await logReviewApproval(
        tenantId,
        new mongoose.Types.ObjectId(id),
        new mongoose.Types.ObjectId(tenantReq.user!.id),
        notes
      );

      // Update source document based on documentType
      try {
        switch (item.documentType) {
          case 'invoice': {
            const Invoice = mongoose.model('Invoice');
            const invoice = await Invoice.findOne({
              _id: item.documentId,
              company: tenantReq.tenantId,
            });

            if (invoice) {
              invoice.status = 'approved';
              invoice.approvedBy = tenantReq.user!.id;
              invoice.approvedAt = new Date();

              // Apply any corrections that were made
              if (item.corrections && item.corrections.length > 0) {
                for (const correction of item.corrections) {
                  if (
                    correction.field &&
                    correction.correctedValue !== undefined
                  ) {
                    invoice[correction.field] = correction.correctedValue;
                  }
                }
              }

              await invoice.save();
              logger.info(`Invoice ${item.documentId} approved and updated`);
            }
            break;
          }

          case 'daily-log': {
            const DailyLog = mongoose.model('DailyLog');
            const log = await DailyLog.findOne({
              _id: item.documentId,
              company: tenantReq.tenantId,
            });

            if (log) {
              log.status = 'approved';
              log.approvedBy = tenantReq.user!.id;
              log.approvedAt = new Date();

              // Apply any corrections that were made
              if (item.corrections && item.corrections.length > 0) {
                for (const correction of item.corrections) {
                  if (
                    correction.field &&
                    correction.correctedValue !== undefined
                  ) {
                    log[correction.field] = correction.correctedValue;
                  }
                }
              }

              await log.save();
              logger.info(`Daily log ${item.documentId} approved and updated`);
            }
            break;
          }

          case 'compliance': {
            const ComplianceDoc = mongoose.model('ComplianceDoc');
            const doc = await ComplianceDoc.findOne({
              _id: item.documentId,
              company: tenantReq.tenantId,
            });

            if (doc) {
              // For compliance, approved means it's now active
              doc.status = 'ACTIVE';
              doc.approvedBy = tenantReq.user!.id;
              doc.approvedAt = new Date();

              // Apply any corrections that were made
              if (item.corrections && item.corrections.length > 0) {
                for (const correction of item.corrections) {
                  if (
                    correction.field &&
                    correction.correctedValue !== undefined
                  ) {
                    doc[correction.field] = correction.correctedValue;
                  }
                }
              }

              await doc.save();
              logger.info(
                `Compliance doc ${item.documentId} approved and updated`
              );
            }
            break;
          }
        }
      } catch (docError) {
        logger.error(
          `Failed to update source document for ${item.documentType}:`,
          docError
        );
        // Continue - the review queue item is still marked approved
      }

      logger.info(`Review queue item ${id} approved by ${tenantReq.user!.id}`);
      res.json(item);
    } catch (error) {
      logger.error('Error approving item:', error);
      res.status(500).json({ message: 'Failed to approve item' });
    }
  }
);

/**
 * POST /api/review-queue/:id/reject
 * Reject review queue item and update source document
 */
router.post(
  '/:id/reject',
  authMiddleware,
  tenantMiddleware,
  async (req: any, res: Response) => {
    const tenantReq = req as TenantRequest;
    try {
      const id = Array.isArray(tenantReq.params.id)
        ? tenantReq.params.id[0]
        : tenantReq.params.id;
      const { notes } = tenantReq.body;
      const tenantId = tenantReq.tenantId;

      if (!notes) {
        return res
          .status(400)
          .json({ message: 'Rejection notes are required' });
      }

      const item = await ReviewQueueItem.findOne({
        _id: id,
        company: tenantId,
      });

      if (!item) {
        return res.status(404).json({ message: 'Review queue item not found' });
      }

      // Update the review queue item
      item.status = 'rejected';
      item.reviewedBy = tenantReq.user!.id as any;
      item.reviewedAt = new Date();
      item.reviewNotes = notes;
      await item.save();

      // Log rejection to audit trail
      await logReviewRejection(
        tenantId,
        new mongoose.Types.ObjectId(id),
        new mongoose.Types.ObjectId(tenantReq.user!.id),
        notes
      );

      // Update source document based on documentType
      try {
        switch (item.documentType) {
          case 'invoice': {
            const Invoice = mongoose.model('Invoice');
            const invoice = await Invoice.findOne({
              _id: item.documentId,
              company: tenantReq.tenantId,
            });

            if (invoice) {
              invoice.status = 'rejected';
              invoice.rejectedBy = tenantReq.user!.id;
              invoice.rejectedAt = new Date();
              invoice.rejectionNotes = notes;
              await invoice.save();
              logger.info(`Invoice ${item.documentId} rejected and updated`);
            }
            break;
          }

          case 'daily-log': {
            const DailyLog = mongoose.model('DailyLog');
            const log = await DailyLog.findOne({
              _id: item.documentId,
              company: tenantReq.tenantId,
            });

            if (log) {
              log.status = 'rejected';
              log.rejectedBy = tenantReq.user!.id;
              log.rejectedAt = new Date();
              log.rejectionNotes = notes;
              await log.save();
              logger.info(`Daily log ${item.documentId} rejected and updated`);
            }
            break;
          }

          case 'compliance': {
            const ComplianceDoc = mongoose.model('ComplianceDoc');
            const doc = await ComplianceDoc.findOne({
              _id: item.documentId,
              company: tenantReq.tenantId,
            });

            if (doc) {
              doc.status = 'EXPIRED'; // Rejected compliance doc is treated as expired
              doc.rejectedBy = tenantReq.user!.id;
              doc.rejectedAt = new Date();
              doc.rejectionNotes = notes;
              await doc.save();
              logger.info(
                `Compliance doc ${item.documentId} rejected and updated`
              );
            }
            break;
          }
        }
      } catch (docError) {
        logger.error(
          `Failed to update source document for ${item.documentType}:`,
          docError
        );
        // Continue - the review queue item is still marked rejected
      }

      logger.info(`Review queue item ${id} rejected by ${tenantReq.user!.id}`);
      res.json(item);
    } catch (error) {
      logger.error('Error rejecting item:', error);
      res.status(500).json({ message: 'Failed to reject item' });
    }
  }
);

/**
 * POST /api/review-queue/:id/request-correction
 * Request correction for review queue item
 */
router.post(
  '/:id/request-correction',
  authMiddleware,
  tenantMiddleware,
  async (req: any, res: Response) => {
    const tenantReq = req as TenantRequest;
    try {
      const { id } = tenantReq.params;
      const { notes } = tenantReq.body;
      const tenantId = tenantReq.tenantId;

      const item = await ReviewQueueItem.findOneAndUpdate(
        { _id: id, company: tenantId },
        {
          status: 'needs-correction',
          reviewedBy: tenantReq.user!.id,
          reviewedAt: new Date(),
          reviewNotes: notes,
        },
        { new: true }
      );

      if (!item) {
        return res.status(404).json({ message: 'Review queue item not found' });
      }

      logger.info(`Correction requested for review queue item ${id}`);
      res.json(item);
    } catch (error) {
      logger.error('Error requesting correction:', error);
      res.status(500).json({ message: 'Failed to request correction' });
    }
  }
);

/**
 * DELETE /api/review-queue/:id
 * Delete review queue item
 */
router.delete(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  async (req: any, res: Response) => {
    const tenantReq = req as TenantRequest;
    try {
      const { id } = tenantReq.params;
      const tenantId = tenantReq.tenantId;

      const item = await ReviewQueueItem.findOneAndDelete({
        _id: id,
        company: tenantId,
      });

      if (!item) {
        return res.status(404).json({ message: 'Review queue item not found' });
      }

      logger.info(`Review queue item ${id} deleted`);
      res.json({ message: 'Review queue item deleted successfully' });
    } catch (error) {
      logger.error('Error deleting review queue item:', error);
      res.status(500).json({ message: 'Failed to delete item' });
    }
  }
);

export default router;
