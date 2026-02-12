import { DailyLog } from '../models/DailyLog';
import { Invoice } from '../models/Invoice';
import { ComplianceDoc } from '../models/ComplianceDoc';
import { WCCode } from '../models/WCCode';
import { logger } from '../config/logger';
import mongoose from 'mongoose';
import { stringify } from 'csv-stringify/sync';

export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  dateFrom?: Date;
  dateTo?: Date;
  jobId?: string;
  includeMetadata?: boolean;
}

export interface WorkersCompAuditReport {
  companyId: string;
  reportPeriod: {
    from: Date;
    to: Date;
  };
  summary: {
    totalHours: number;
    totalWorkers: number;
    totalJobs: number;
    totalWCCodes: number;
  };
  byWCCode: Array<{
    wcCode: string;
    description: string;
    state: string;
    rate?: number;
    totalHours: number;
    totalCost?: number;
    workerCount: number;
    jobCount: number;
  }>;
  byWorker: Array<{
    workerName: string;
    totalHours: number;
    wcCode?: string;
    wcDescription?: string;
    jobCount: number;
  }>;
  byJob: Array<{
    jobName: string;
    jobCode: string;
    totalHours: number;
    workerCount: number;
    wcCodeBreakdown: Record<string, number>;
  }>;
  detailedLogs: Array<{
    date: Date;
    jobName: string;
    workerName: string;
    hours: number;
    wcCode?: string;
    wcDescription?: string;
    workPerformed: string;
  }>;
}

/**
 * Export Service
 * Handles all data export operations including insurance audit reports
 */
class ExportService {
  /**
   * Generate Workers' Compensation Audit Report
   */
  async generateWCAuditReport(
    companyId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<WorkersCompAuditReport> {
    try {
      logger.info(`Generating WC audit report for company ${companyId} from ${dateFrom} to ${dateTo}`);

      // Fetch all daily logs in the period
      const logs = await DailyLog.find({
        company: new mongoose.Types.ObjectId(companyId),
        date: { $gte: dateFrom, $lte: dateTo },
      })
        .populate('job', 'name code')
        .populate('workers.wcCode')
        .lean();

      // Fetch WC codes for rate lookup
      const wcCodes = await WCCode.find({
        company: new mongoose.Types.ObjectId(companyId),
      }).lean();

      const wcCodeMap = new Map(wcCodes.map(code => [code._id.toString(), code]));

      // Initialize report
      const report: WorkersCompAuditReport = {
        companyId,
        reportPeriod: { from: dateFrom, to: dateTo },
        summary: {
          totalHours: 0,
          totalWorkers: 0,
          totalJobs: 0,
          totalWCCodes: 0,
        },
        byWCCode: [],
        byWorker: [],
        byJob: [],
        detailedLogs: [],
      };

      // Track aggregations
      const wcCodeAgg = new Map<string, {
        code: string;
        description: string;
        state: string;
        rate?: number;
        totalHours: number;
        workerSet: Set<string>;
        jobSet: Set<string>;
      }>();

      const workerAgg = new Map<string, {
        name: string;
        totalHours: number;
        wcCode?: string;
        wcDescription?: string;
        jobSet: Set<string>;
      }>();

      const jobAgg = new Map<string, {
        name: string;
        code: string;
        totalHours: number;
        workerSet: Set<string>;
        wcCodeBreakdown: Map<string, number>;
      }>();

      // Process logs
      for (const log of logs) {
        const job = log.job as any;
        const jobKey = job?._id.toString();
        const jobName = job?.name || 'Unknown Job';
        const jobCode = job?.code || 'N/A';

        // Process each worker in the log
        for (const worker of log.workers) {
          const hours = worker.hours;
          report.summary.totalHours += hours;

          // Get WC code details
          const wcCodeId =
            worker.wcCode && typeof worker.wcCode === 'object' && '_id' in worker.wcCode
              ? (worker.wcCode._id as any)?.toString()
              : (worker.wcCode as any)?.toString();
          const wcCodeData = wcCodeId ? wcCodeMap.get(wcCodeId) : undefined;
          const wcCode = wcCodeData?.code || 'UNASSIGNED';
          const wcDescription = wcCodeData?.description || 'No WC Code';
          const wcState = wcCodeData?.state || 'N/A';
          const wcRate = wcCodeData?.rate;

          // Aggregate by WC code
          if (!wcCodeAgg.has(wcCode)) {
            wcCodeAgg.set(wcCode, {
              code: wcCode,
              description: wcDescription,
              state: wcState,
              rate: wcRate,
              totalHours: 0,
              workerSet: new Set(),
              jobSet: new Set(),
            });
          }
          const wcAgg = wcCodeAgg.get(wcCode)!;
          wcAgg.totalHours += hours;
          wcAgg.workerSet.add(worker.name);
          if (jobKey) wcAgg.jobSet.add(jobKey);

          // Aggregate by worker
          if (!workerAgg.has(worker.name)) {
            workerAgg.set(worker.name, {
              name: worker.name,
              totalHours: 0,
              wcCode,
              wcDescription,
              jobSet: new Set(),
            });
          }
          const wAgg = workerAgg.get(worker.name)!;
          wAgg.totalHours += hours;
          if (jobKey) wAgg.jobSet.add(jobKey);

          // Aggregate by job
          if (jobKey) {
            if (!jobAgg.has(jobKey)) {
              jobAgg.set(jobKey, {
                name: jobName,
                code: jobCode,
                totalHours: 0,
                workerSet: new Set(),
                wcCodeBreakdown: new Map(),
              });
            }
            const jAgg = jobAgg.get(jobKey)!;
            jAgg.totalHours += hours;
            jAgg.workerSet.add(worker.name);
            jAgg.wcCodeBreakdown.set(wcCode, (jAgg.wcCodeBreakdown.get(wcCode) || 0) + hours);
          }

          // Add to detailed logs
          report.detailedLogs.push({
            date: log.date,
            jobName,
            workerName: worker.name,
            hours,
            wcCode,
            wcDescription,
            workPerformed: log.workPerformed,
          });
        }
      }

      // Convert aggregations to arrays
      report.byWCCode = Array.from(wcCodeAgg.values()).map(agg => ({
        wcCode: agg.code,
        description: agg.description,
        state: agg.state,
        rate: agg.rate,
        totalHours: agg.totalHours,
        totalCost: agg.rate ? agg.totalHours * agg.rate : undefined,
        workerCount: agg.workerSet.size,
        jobCount: agg.jobSet.size,
      }));

      report.byWorker = Array.from(workerAgg.values()).map(agg => ({
        workerName: agg.name,
        totalHours: agg.totalHours,
        wcCode: agg.wcCode,
        wcDescription: agg.wcDescription,
        jobCount: agg.jobSet.size,
      }));

      report.byJob = Array.from(jobAgg.values()).map(agg => ({
        jobName: agg.name,
        jobCode: agg.code,
        totalHours: agg.totalHours,
        workerCount: agg.workerSet.size,
        wcCodeBreakdown: Object.fromEntries(agg.wcCodeBreakdown),
      }));

      // Update summary
      report.summary.totalWorkers = workerAgg.size;
      report.summary.totalJobs = jobAgg.size;
      report.summary.totalWCCodes = wcCodeAgg.size;

      logger.info(`WC audit report generated: ${report.summary.totalHours} hours, ${report.summary.totalWorkers} workers`);

      return report;
    } catch (error) {
      logger.error('Error generating WC audit report:', error);
      throw error;
    }
  }

  /**
   * Export WC audit report to CSV
   */
  async exportWCAuditReportToCSV(report: WorkersCompAuditReport): Promise<string> {
    const csvData = report.byWCCode.map(item => ({
      'WC Code': item.wcCode,
      'Description': item.description,
      'State': item.state,
      'Rate': item.rate?.toFixed(2) || 'N/A',
      'Total Hours': item.totalHours.toFixed(2),
      'Total Cost': item.totalCost?.toFixed(2) || 'N/A',
      'Worker Count': item.workerCount,
      'Job Count': item.jobCount,
    }));

    return stringify(csvData, { header: true });
  }

  /**
   * Export invoices to CSV
   */
  async exportInvoices(
    companyId: string,
    options: ExportOptions
  ): Promise<string> {
    try {
      const filter: any = { company: new mongoose.Types.ObjectId(companyId) };
      
      if (options.dateFrom || options.dateTo) {
        filter.invoiceDate = {};
        if (options.dateFrom) filter.invoiceDate.$gte = options.dateFrom;
        if (options.dateTo) filter.invoiceDate.$lte = options.dateTo;
      }

      if (options.jobId) {
        filter.job = new mongoose.Types.ObjectId(options.jobId);
      }

      const invoices = await Invoice.find(filter)
        .populate('job', 'name code')
        .lean();

      const csvData = invoices.map(inv => ({
        'Invoice Number': inv.invoiceNumber,
        'Vendor': inv.vendor,
        'Date': inv.invoiceDate.toISOString().split('T')[0],
        'Amount': inv.amount.toFixed(2),
        'Status': inv.status,
        'Job': (inv.job as any)?.name || 'N/A',
        'Notes': inv.notes || '',
      }));

      return stringify(csvData, { header: true });
    } catch (error) {
      logger.error('Error exporting invoices:', error);
      throw error;
    }
  }

  /**
   * Export compliance documents to CSV
   */
  async exportCompliance(
    companyId: string,
    options: ExportOptions
  ): Promise<string> {
    try {
      const filter: any = { company: new mongoose.Types.ObjectId(companyId) };

      const docs = await ComplianceDoc.find(filter).lean();

      const csvData = docs.map(doc => ({
        'Vendor': (doc.vendor as any)?.name || 'N/A',
        'Document Type': doc.type,
        'Expiration Date': doc.expirationDate?.toISOString().split('T')[0] || 'N/A',
        'Status': doc.status,
        'Document URL': doc.documentUrl || 'N/A',
        'Notes': doc.notes || '',
      }));

      return stringify(csvData, { header: true });
    } catch (error) {
      logger.error('Error exporting compliance:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService();
export default exportService;
