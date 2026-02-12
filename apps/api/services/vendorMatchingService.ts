import { logger } from '../config/logger';
import { Vendor } from '../models/Vendor';
import mongoose from 'mongoose';

/**
 * Vendor Matching Service
 * Implements fuzzy matching and normalization for vendor names
 */

interface VendorMatchResult {
  vendorId: mongoose.Types.ObjectId | null;
  vendorName: string;
  confidence: number;
  matchType: 'EXACT' | 'ALIAS' | 'FUZZY' | 'UNKNOWN';
}

/**
 * Normalize vendor name for matching
 * - Convert to lowercase
 * - Remove common prefixes/suffixes (LLC, Inc, Corp, etc.)
 * - Remove punctuation
 * - Trim whitespace
 */
function normalizeVendorName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(llc|inc|corp|corporation|company|co|ltd|limited)\b/gi, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score (0-1) between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * Match vendor by name with fuzzy matching
 * Returns the best match with confidence score
 * 
 * Matching strategy:
 * 1. Exact name match (confidence: 1.0)
 * 2. Alias match (confidence: 0.95)
 * 3. Fuzzy match with threshold (confidence: similarity score)
 * 4. Unknown vendor (confidence: 0.0)
 */
export async function matchVendor(
  vendorName: string,
  tenantId: mongoose.Types.ObjectId,
  fuzzyThreshold: number = 0.8
): Promise<VendorMatchResult> {
  try {
    const normalizedInput = normalizeVendorName(vendorName);

    // Step 1: Try exact name match
    const exactMatch = await Vendor.findOne({
      tenantId,
      name: { $regex: new RegExp(`^${vendorName}$`, 'i') },
      isActive: true,
    });

    if (exactMatch) {
      logger.info('Vendor matched exactly', { vendorId: exactMatch._id, vendorName });
      return {
        vendorId: exactMatch._id,
        vendorName: exactMatch.name,
        confidence: 1.0,
        matchType: 'EXACT',
      };
    }

    // Step 2: Try alias match
    const aliasMatch = await Vendor.findOne({
      tenantId,
      aliases: { $regex: new RegExp(`^${vendorName}$`, 'i') },
      isActive: true,
    });

    if (aliasMatch) {
      logger.info('Vendor matched by alias', { vendorId: aliasMatch._id, vendorName });
      return {
        vendorId: aliasMatch._id,
        vendorName: aliasMatch.name,
        confidence: 0.95,
        matchType: 'ALIAS',
      };
    }

    // Step 3: Try fuzzy matching
    const allVendors = await Vendor.find({ tenantId, isActive: true });
    
    let bestMatch: { vendor: any; similarity: number } | null = null;

    for (const vendor of allVendors) {
      // Check name similarity
      const nameSimilarity = calculateSimilarity(
        normalizedInput,
        normalizeVendorName(vendor.name)
      );

      if (nameSimilarity > (bestMatch?.similarity || 0)) {
        bestMatch = { vendor, similarity: nameSimilarity };
      }

      // Check alias similarities
      for (const alias of vendor.aliases) {
        const aliasSimilarity = calculateSimilarity(
          normalizedInput,
          normalizeVendorName(alias)
        );

        if (aliasSimilarity > (bestMatch?.similarity || 0)) {
          bestMatch = { vendor, similarity: aliasSimilarity };
        }
      }
    }

    // If fuzzy match exceeds threshold, return it
    if (bestMatch && bestMatch.similarity >= fuzzyThreshold) {
      logger.info('Vendor matched by fuzzy logic', {
        vendorId: bestMatch.vendor._id,
        vendorName: bestMatch.vendor.name,
        similarity: bestMatch.similarity,
      });
      return {
        vendorId: bestMatch.vendor._id,
        vendorName: bestMatch.vendor.name,
        confidence: bestMatch.similarity,
        matchType: 'FUZZY',
      };
    }

    // Step 4: No match found
    logger.warn('No vendor match found', { vendorName, tenantId });
    return {
      vendorId: null,
      vendorName: vendorName,
      confidence: 0.0,
      matchType: 'UNKNOWN',
    };
  } catch (error) {
    logger.error('Error matching vendor', { error, vendorName, tenantId });
    throw error;
  }
}

/**
 * Add alias to existing vendor
 */
export async function addVendorAlias(
  vendorId: mongoose.Types.ObjectId,
  alias: string
): Promise<void> {
  try {
    await Vendor.findByIdAndUpdate(
      vendorId,
      { $addToSet: { aliases: alias } },
      { new: true }
    );
    logger.info('Added vendor alias', { vendorId, alias });
  } catch (error) {
    logger.error('Error adding vendor alias', { error, vendorId, alias });
    throw error;
  }
}
