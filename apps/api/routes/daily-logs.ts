import { Router, Response } from 'express';
import { DailyLog } from '../models/DailyLog';
import { ReviewQueueItem } from '../models/ReviewQueueItem';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import { matchWorker } from '../services/workerContractorMatchingService';
import wcCodeSuggestionEngine, { WCCodeSuggestion } from '../services/wcCodeSuggestionEngine';
import { evaluateDailyLogRules } from '../services/rulesEngine';
import { createAuditLog, AUDIT_EVENTS } from '../services/auditLoggingService';
import mongoose from 'mongoose';

const router = Router();

router.use(authMiddleware);

// List all daily logs
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { job, startDate, endDate } = req.query;
    const filter: any = { company: req.user!.id };
    
    if (job) {
      filter.job = job;
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate as string);
      }
    }

    const logs = await DailyLog.find(filter)
      .populate('job', 'jobNumber name')
      .populate('workers.wcCode', 'code description')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });
    res.json({ logs });
  } catch (error) {
    logger.error('List daily logs error:', error);
    res.status(500).json({ error: 'Failed to fetch daily logs' });
  }
});

// Get a specific daily log
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const log = await DailyLog.findById(req.params.id)
      .populate('job', 'jobNumber name')
      .populate('workers.wcCode', 'code description')
      .populate('createdBy', 'name email');

    if (!log) {
      res.status(404).json({ error: 'Daily log not found' });
      return;
    }

    if (log.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ log });
  } catch (error) {
    logger.error('Get daily log error:', error);
    res.status(500).json({ error: 'Failed to fetch daily log' });
  }
});

// Create a new daily log
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { job, date, weather, workPerformed, workers, equipment, materials, notes, documentUrl, ocrConfidence } = req.body;

    const companyId = new mongoose.Types.ObjectId(req.user!.id);

    // Step 1: Process each worker - match name and suggest WC codes
    const processedWorkers = [];
    const workerMatchResults = [];
    const wcCodeSuggestions: Record<string, any> = {};
    
    for (const worker of workers || []) {
      // Match worker by name
      const workerMatch = await matchWorker(worker.name, companyId);
      workerMatchResults.push({
        inputName: worker.name,
        matchedId: workerMatch.id,
        matchedName: workerMatch.name,
        confidence: workerMatch.confidence,
        matchType: workerMatch.matchType,
      });

      // Get WC code suggestions if not already assigned
      let wcCodeSuggestionList: WCCodeSuggestion[] = [];
      if (!worker.wcCode) {
        wcCodeSuggestionList = await wcCodeSuggestionEngine.getSuggestions(
          {
            workerName: worker.name,
            task: worker.task,
            jobName: job?.name || workPerformed,
            workDescription: workPerformed,
            hours: worker.hours,
          },
          req.user!.id,
          'CA', // TODO: Get state from job or company settings
          3 // Top 3 suggestions
        );

        wcCodeSuggestions[worker.name] = wcCodeSuggestionList;
      }

      processedWorkers.push({
        name: worker.name,
        workerId: workerMatch.id,
        hours: worker.hours,
        task: worker.task,
        wcCode: worker.wcCode, // Use assigned code if provided
        wcCodeSuggestions: wcCodeSuggestionList.length > 0 ? wcCodeSuggestionList : undefined,
      });
    }

    // Step 2: Evaluate rules to determine if review is needed
    const rulesResult = evaluateDailyLogRules({
      date: date ? new Date(date) : undefined,
      workers: processedWorkers.map(w => ({
        name: w.name,
        workerId: w.workerId,
        hours: w.hours,
      })),
      wcCodeSuggestions: Object.values(wcCodeSuggestions).flat().map((s: any) => ({
        code: s.code,
        confidence: s.confidence,
      })),
      ocrConfidence,
    });
    logger.info('Rules evaluation complete for daily log', { rulesResult });

    // Step 3: Create daily log record
    const log = await DailyLog.create({
      job,
      company: req.user!.id,
      date,
      weather,
      workPerformed,
      workers: processedWorkers,
      equipment,
      materials,
      notes,
      documentUrl,
      createdBy: req.user!.id,
    });

    // Step 4: Log daily log creation in audit trail
    await createAuditLog({
      tenantId: companyId,
      documentId: log._id,
      eventType: AUDIT_EVENTS.DAILY_LOG_CREATED,
      actor: 'USER',
      actorUserId: companyId,
      afterState: log.toObject() as unknown as Record<string, unknown>,
      metadata: {
        workersCount: workers?.length || 0,
        totalHours: workers?.reduce((sum: number, w: any) => sum + (w.hours || 0), 0) || 0,
        workerMatches: workerMatchResults.length,
        rulesEvaluated: true,
        exceptionsCount: rulesResult.exceptions.length,
      },
    });

    // Step 5: Create review queue item if needed
    if (rulesResult.needsReview) {
      const reviewItem = await ReviewQueueItem.create({
        company: companyId,
        documentId: log._id,
        documentType: 'daily-log',
        status: 'pending',
        priority: rulesResult.priority,
        exceptions: rulesResult.exceptions.map(ex => ({
          type: ex.type,
          severity: ex.severity,
          message: ex.message,
          field: ex.field,
        })),
        extractedData: {
          job,
          date,
          workPerformed,
          workers: processedWorkers,
        },
        fileUrl: documentUrl,
      });

      logger.info('Review queue item created for daily log', { reviewItemId: reviewItem._id });

      await createAuditLog({
        tenantId: companyId,
        documentId: log._id,
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
      log,
      workerMatches: workerMatchResults,
      wcCodeSuggestions,
      review: {
        needsReview: rulesResult.needsReview,
        priority: rulesResult.priority,
        exceptionsCount: rulesResult.exceptions.length,
        exceptions: rulesResult.exceptions,
      },
    });
  } catch (error) {
    logger.error('Create daily log error:', error);
    res.status(500).json({ error: 'Failed to create daily log', details: (error as Error).message });
  }
});

// Update a daily log
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const log = await DailyLog.findById(req.params.id);

    if (!log) {
      res.status(404).json({ error: 'Daily log not found' });
      return;
    }

    if (log.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const beforeState = log.toObject() as unknown as Record<string, unknown>;

    const updated = await DailyLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Log update in audit trail
    await createAuditLog({
      tenantId: new mongoose.Types.ObjectId(req.user!.id),
      documentId: log._id,
      eventType: AUDIT_EVENTS.DAILY_LOG_UPDATED,
      actor: 'USER',
      actorUserId: new mongoose.Types.ObjectId(req.user!.id),
      beforeState,
      afterState: updated!.toObject() as unknown as Record<string, unknown>,
    });

    res.json({ log: updated });
  } catch (error) {
    logger.error('Update daily log error:', error);
    res.status(500).json({ error: 'Failed to update daily log' });
  }
});

// Delete a daily log
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const log = await DailyLog.findById(req.params.id);

    if (!log) {
      res.status(404).json({ error: 'Daily log not found' });
      return;
    }

    if (log.company.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await DailyLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Daily log deleted' });
  } catch (error) {
    logger.error('Delete daily log error:', error);
    res.status(500).json({ error: 'Failed to delete daily log' });
  }
});

// Export daily logs for Workers Comp reporting
router.get('/export/wc-report', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, job } = req.query;
    const filter: any = { company: req.user!.id };
    
    if (job) {
      filter.job = job;
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate as string);
      }
    }

    const logs = await DailyLog.find(filter)
      .populate('job', 'jobNumber name')
      .populate('workers.wcCode', 'code description state')
      .sort({ date: 1 });

    // Aggregate worker hours by WC code
    const wcReport: Record<string, any> = {};

    logs.forEach((log) => {
      log.workers.forEach((worker) => {
        if (worker.wcCode && (worker.wcCode as any)._id) {
          const wcCodeId = (worker.wcCode as any)._id.toString();
          if (!wcReport[wcCodeId]) {
            wcReport[wcCodeId] = {
              code: (worker.wcCode as any).code,
              description: (worker.wcCode as any).description,
              state: (worker.wcCode as any).state,
              totalHours: 0,
              workers: [],
            };
          }
          wcReport[wcCodeId].totalHours += worker.hours;
          wcReport[wcCodeId].workers.push({
            name: worker.name,
            hours: worker.hours,
            date: log.date,
            job: (log.job as any).jobNumber,
          });
        }
      });
    });

    res.json({ report: Object.values(wcReport), logs });
  } catch (error) {
    logger.error('Export WC report error:', error);
    res.status(500).json({ error: 'Failed to export WC report' });
  }
});

export default router;
