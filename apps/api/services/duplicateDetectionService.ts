import { logger } from '../config/logger';
import { Invoice } from '../models/Invoice';
import mongoose from 'mongoose';

/**
 * Duplicate Detection Service for Invoices
 * Implements deterministic duplicate detection based on invoice number and vendor
 */

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingInvoiceId?: mongoose.Types.ObjectId;
  duplicateScore: number; // 0-1
  reason?: string;
}

/**
 * Normalize string for comparison
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Check if invoice is a duplicate
 * 
 * Detection rules (in order of priority):
 * 1. Exact invoice number + vendor match (100% duplicate)
 * 2. Exact invoice number + similar amount (95% duplicate)
 * 3. Similar invoice number + exact vendor + similar amount (90% duplicate)
 * 4. Similar invoice number + exact vendor + exact date (85% duplicate)
 * 
 * Threshold: 85% or higher = duplicate
 */
export async function checkInvoiceDuplicate(
  invoiceNumber: string,
  vendor: string,
  amount: number,
  invoiceDate: Date,
  companyId: mongoose.Types.ObjectId
): Promise<DuplicateCheckResult> {
  try {
    const normalizedInvoiceNumber = normalizeString(invoiceNumber);
    const normalizedVendor = normalizeString(vendor);

    // Rule 1: Exact invoice number + vendor match
    const exactMatch = await Invoice.findOne({
      company: companyId,
      invoiceNumber: { $regex: new RegExp(`^${invoiceNumber}$`, 'i') },
      vendor: { $regex: new RegExp(`^${vendor}$`, 'i') },
    });

    if (exactMatch) {
      logger.warn('Duplicate invoice detected: exact match', {
        invoiceNumber,
        vendor,
        existingId: exactMatch._id,
      });
      return {
        isDuplicate: true,
        existingInvoiceId: exactMatch._id,
        duplicateScore: 1.0,
        reason: 'Exact match on invoice number and vendor',
      };
    }

    // Rule 2: Exact invoice number + similar amount (within 5%)
    const amountMatch = await Invoice.findOne({
      company: companyId,
      invoiceNumber: { $regex: new RegExp(`^${invoiceNumber}$`, 'i') },
      amount: {
        $gte: amount * 0.95,
        $lte: amount * 1.05,
      },
    });

    if (amountMatch) {
      logger.warn('Duplicate invoice detected: invoice number + amount', {
        invoiceNumber,
        amount,
        existingId: amountMatch._id,
      });
      return {
        isDuplicate: true,
        existingInvoiceId: amountMatch._id,
        duplicateScore: 0.95,
        reason: 'Same invoice number with similar amount',
      };
    }

    // Rule 3: Similar invoice number + exact vendor + similar amount
    const allInvoices = await Invoice.find({
      company: companyId,
      vendor: { $regex: new RegExp(`^${vendor}$`, 'i') },
      amount: {
        $gte: amount * 0.95,
        $lte: amount * 1.05,
      },
    });

    for (const invoice of allInvoices) {
      const existingNormalized = normalizeString(invoice.invoiceNumber);
      
      // Check if invoice numbers are very similar (allow 1-2 char difference)
      if (isSimilarInvoiceNumber(normalizedInvoiceNumber, existingNormalized)) {
        logger.warn('Duplicate invoice detected: similar number + vendor + amount', {
          invoiceNumber,
          vendor,
          amount,
          existingId: invoice._id,
        });
        return {
          isDuplicate: true,
          existingInvoiceId: invoice._id,
          duplicateScore: 0.9,
          reason: 'Similar invoice number with same vendor and amount',
        };
      }
    }

    // Rule 4: Similar invoice number + exact vendor + exact date
    const dateMatch = await Invoice.findOne({
      company: companyId,
      vendor: { $regex: new RegExp(`^${vendor}$`, 'i') },
      invoiceDate: {
        $gte: new Date(invoiceDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before
        $lte: new Date(invoiceDate.getTime() + 24 * 60 * 60 * 1000), // 1 day after
      },
    });

    if (dateMatch) {
      const existingNormalized = normalizeString(dateMatch.invoiceNumber);
      if (isSimilarInvoiceNumber(normalizedInvoiceNumber, existingNormalized)) {
        logger.warn('Duplicate invoice detected: similar number + vendor + date', {
          invoiceNumber,
          vendor,
          invoiceDate,
          existingId: dateMatch._id,
        });
        return {
          isDuplicate: true,
          existingInvoiceId: dateMatch._id,
          duplicateScore: 0.85,
          reason: 'Similar invoice number with same vendor and date',
        };
      }
    }

    // No duplicate detected
    logger.info('Duplicate check completed', {
      invoiceNumber,
      vendor,
      isDuplicate: false,
      duplicateScore: 0,
    });

    return {
      isDuplicate: false,
      duplicateScore: 0,
    };
  } catch (error) {
    logger.error('Error checking invoice duplicate', { error, invoiceNumber, vendor });
    throw error;
  }
}

/**
 * Check if two invoice numbers are similar
 * Allows for minor differences (typos, extra spaces, etc.)
 */
function isSimilarInvoiceNumber(num1: string, num2: string): boolean {
  // If lengths are very different, they're not similar
  if (Math.abs(num1.length - num2.length) > 2) {
    return false;
  }

  // Count differences
  let differences = 0;
  const maxLength = Math.max(num1.length, num2.length);

  for (let i = 0; i < maxLength; i++) {
    if (num1[i] !== num2[i]) {
      differences++;
    }
  }

  // Allow up to 2 character differences for strings of length 5+
  // Allow 1 character difference for shorter strings
  const threshold = num1.length >= 5 ? 2 : 1;
  return differences <= threshold;
}

/**
 * Find all potential duplicates for an invoice
 * Used for review and reporting
 */
export async function findPotentialDuplicates(
  invoiceNumber: string,
  vendor: string,
  amount: number,
  companyId: mongoose.Types.ObjectId
): Promise<Array<{ invoice: any; score: number; reason: string }>> {
  try {
    const results: Array<{ invoice: any; score: number; reason: string }> = [];

    // Find all invoices with same vendor
    const vendorInvoices = await Invoice.find({
      company: companyId,
      vendor: { $regex: new RegExp(`^${vendor}$`, 'i') },
    });

    const normalizedInvoiceNumber = normalizeString(invoiceNumber);

    for (const invoice of vendorInvoices) {
      const existingNormalized = normalizeString(invoice.invoiceNumber);

      // Exact invoice number match
      if (normalizedInvoiceNumber === existingNormalized) {
        results.push({
          invoice,
          score: 1.0,
          reason: 'Exact invoice number and vendor match',
        });
        continue;
      }

      // Similar invoice number
      if (isSimilarInvoiceNumber(normalizedInvoiceNumber, existingNormalized)) {
        // Check amount similarity
        const amountDiff = Math.abs(invoice.amount - amount) / amount;
        if (amountDiff < 0.05) {
          results.push({
            invoice,
            score: 0.9,
            reason: 'Similar invoice number with matching amount',
          });
        } else {
          results.push({
            invoice,
            score: 0.7,
            reason: 'Similar invoice number',
          });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score);
  } catch (error) {
    logger.error('Error finding potential duplicates', { error, invoiceNumber, vendor });
    throw error;
  }
}

/**
 * Duplicate detection service namespace for easier imports
 */
export const duplicateDetectionService = {
  checkInvoiceDuplicate,
  findPotentialDuplicates,
};
