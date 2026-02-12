import { logger } from '../config/logger';
import { Worker } from '../models/Worker';
import { Contractor } from '../models/Contractor';
import mongoose from 'mongoose';

/**
 * Worker and Contractor Matching Service
 * Implements fuzzy matching (80% threshold) for worker and contractor names
 */

interface MatchResult {
  id: mongoose.Types.ObjectId | null;
  name: string;
  confidence: number;
  matchType: 'EXACT' | 'ALIAS' | 'FUZZY' | 'UNKNOWN';
}

/**
 * Normalize name for matching
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate Levenshtein distance
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
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * Match worker by name with 80% fuzzy threshold
 */
export async function matchWorker(
  workerName: string,
  tenantId: mongoose.Types.ObjectId
): Promise<MatchResult> {
  const FUZZY_THRESHOLD = 0.8;
  
  try {
    const normalizedInput = normalizeName(workerName);

    // Step 1: Exact name match
    const exactMatch = await Worker.findOne({
      tenantId,
      name: { $regex: new RegExp(`^${workerName}$`, 'i') },
      isActive: true,
    });

    if (exactMatch) {
      logger.info('Worker matched exactly', { workerId: exactMatch._id, workerName });
      return {
        id: exactMatch._id,
        name: exactMatch.name,
        confidence: 1.0,
        matchType: 'EXACT',
      };
    }

    // Step 2: Alias match
    const aliasMatch = await Worker.findOne({
      tenantId,
      aliases: { $regex: new RegExp(`^${workerName}$`, 'i') },
      isActive: true,
    });

    if (aliasMatch) {
      logger.info('Worker matched by alias', { workerId: aliasMatch._id, workerName });
      return {
        id: aliasMatch._id,
        name: aliasMatch.name,
        confidence: 0.95,
        matchType: 'ALIAS',
      };
    }

    // Step 3: Fuzzy matching (80% threshold)
    const allWorkers = await Worker.find({ tenantId, isActive: true });
    
    let bestMatch: { worker: any; similarity: number } | null = null;

    for (const worker of allWorkers) {
      const nameSimilarity = calculateSimilarity(
        normalizedInput,
        normalizeName(worker.name)
      );

      if (nameSimilarity > (bestMatch?.similarity || 0)) {
        bestMatch = { worker, similarity: nameSimilarity };
      }

      // Check aliases
      for (const alias of worker.aliases) {
        const aliasSimilarity = calculateSimilarity(
          normalizedInput,
          normalizeName(alias)
        );

        if (aliasSimilarity > (bestMatch?.similarity || 0)) {
          bestMatch = { worker, similarity: aliasSimilarity };
        }
      }
    }

    // Return match if above 80% threshold
    if (bestMatch && bestMatch.similarity >= FUZZY_THRESHOLD) {
      logger.info('Worker matched by fuzzy logic', {
        workerId: bestMatch.worker._id,
        workerName: bestMatch.worker.name,
        similarity: bestMatch.similarity,
      });
      return {
        id: bestMatch.worker._id,
        name: bestMatch.worker.name,
        confidence: bestMatch.similarity,
        matchType: 'FUZZY',
      };
    }

    // No match found
    logger.warn('No worker match found', { workerName, tenantId });
    return {
      id: null,
      name: workerName,
      confidence: 0.0,
      matchType: 'UNKNOWN',
    };
  } catch (error) {
    logger.error('Error matching worker', { error, workerName, tenantId });
    throw error;
  }
}

/**
 * Match contractor by name with 80% fuzzy threshold
 */
export async function matchContractor(
  contractorName: string,
  tenantId: mongoose.Types.ObjectId
): Promise<MatchResult> {
  const FUZZY_THRESHOLD = 0.8;
  
  try {
    const normalizedInput = normalizeName(contractorName);

    // Step 1: Exact name match
    const exactMatch = await Contractor.findOne({
      tenantId,
      name: { $regex: new RegExp(`^${contractorName}$`, 'i') },
      isActive: true,
    });

    if (exactMatch) {
      logger.info('Contractor matched exactly', { contractorId: exactMatch._id, contractorName });
      return {
        id: exactMatch._id,
        name: exactMatch.name,
        confidence: 1.0,
        matchType: 'EXACT',
      };
    }

    // Step 2: Alias match
    const aliasMatch = await Contractor.findOne({
      tenantId,
      aliases: { $regex: new RegExp(`^${contractorName}$`, 'i') },
      isActive: true,
    });

    if (aliasMatch) {
      logger.info('Contractor matched by alias', { contractorId: aliasMatch._id, contractorName });
      return {
        id: aliasMatch._id,
        name: aliasMatch.name,
        confidence: 0.95,
        matchType: 'ALIAS',
      };
    }

    // Step 3: Fuzzy matching (80% threshold)
    const allContractors = await Contractor.find({ tenantId, isActive: true });
    
    let bestMatch: { contractor: any; similarity: number } | null = null;

    for (const contractor of allContractors) {
      const nameSimilarity = calculateSimilarity(
        normalizedInput,
        normalizeName(contractor.name)
      );

      if (nameSimilarity > (bestMatch?.similarity || 0)) {
        bestMatch = { contractor, similarity: nameSimilarity };
      }

      // Check aliases
      for (const alias of contractor.aliases) {
        const aliasSimilarity = calculateSimilarity(
          normalizedInput,
          normalizeName(alias)
        );

        if (aliasSimilarity > (bestMatch?.similarity || 0)) {
          bestMatch = { contractor, similarity: aliasSimilarity };
        }
      }
    }

    // Return match if above 80% threshold
    if (bestMatch && bestMatch.similarity >= FUZZY_THRESHOLD) {
      logger.info('Contractor matched by fuzzy logic', {
        contractorId: bestMatch.contractor._id,
        contractorName: bestMatch.contractor.name,
        similarity: bestMatch.similarity,
      });
      return {
        id: bestMatch.contractor._id,
        name: bestMatch.contractor.name,
        confidence: bestMatch.similarity,
        matchType: 'FUZZY',
      };
    }

    // No match found
    logger.warn('No contractor match found', { contractorName, tenantId });
    return {
      id: null,
      name: contractorName,
      confidence: 0.0,
      matchType: 'UNKNOWN',
    };
  } catch (error) {
    logger.error('Error matching contractor', { error, contractorName, tenantId });
    throw error;
  }
}

/**
 * Add alias to worker
 */
export async function addWorkerAlias(
  workerId: mongoose.Types.ObjectId,
  alias: string
): Promise<void> {
  try {
    await Worker.findByIdAndUpdate(
      workerId,
      { $addToSet: { aliases: alias } },
      { new: true }
    );
    logger.info('Added worker alias', { workerId, alias });
  } catch (error) {
    logger.error('Error adding worker alias', { error, workerId, alias });
    throw error;
  }
}

/**
 * Add alias to contractor
 */
export async function addContractorAlias(
  contractorId: mongoose.Types.ObjectId,
  alias: string
): Promise<void> {
  try {
    await Contractor.findByIdAndUpdate(
      contractorId,
      { $addToSet: { aliases: alias } },
      { new: true }
    );
    logger.info('Added contractor alias', { contractorId, alias });
  } catch (error) {
    logger.error('Error adding contractor alias', { error, contractorId, alias });
    throw error;
  }
}
