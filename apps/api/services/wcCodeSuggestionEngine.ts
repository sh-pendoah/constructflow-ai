import { WCCode } from '../models/WCCode';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

export interface WCCodeSuggestion {
  wcCodeId: string;
  code: string;
  description: string;
  state: string;
  rate?: number;
  confidence: number;
  matchReason: string;
}

export interface WorkerTaskInput {
  workerName: string;
  task?: string;
  jobName?: string;
  workDescription?: string;
  hours: number;
}

/**
 * Workers' Compensation Code Suggestion Engine
 * 
 * Uses keyword matching and fuzzy logic to suggest appropriate WC codes
 * based on task descriptions and job context
 */
class WCCodeSuggestionEngine {
  // Common construction task keywords mapped to typical WC codes
  private readonly taskKeywords: Record<string, string[]> = {
    // Carpentry
    carpentry: ['carpenter', 'framing', 'cabinet', 'trim', 'wood', 'lumber'],
    // Electrical
    electrical: ['electrician', 'wiring', 'electric', 'panel', 'circuit', 'lighting'],
    // Plumbing
    plumbing: ['plumber', 'pipe', 'plumbing', 'drain', 'water', 'sewer'],
    // HVAC
    hvac: ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace', 'ventilation'],
    // Masonry
    masonry: ['mason', 'brick', 'block', 'concrete', 'cement', 'stone', 'tile'],
    // Roofing
    roofing: ['roofer', 'roofing', 'shingle', 'roof', 'gutter'],
    // Painting
    painting: ['painter', 'painting', 'paint', 'drywall', 'finishing'],
    // General Labor
    labor: ['laborer', 'general', 'cleanup', 'demo', 'demolition', 'helper'],
    // Heavy Equipment
    equipment: ['operator', 'excavator', 'bulldozer', 'crane', 'loader', 'equipment'],
    // Site Work
    sitework: ['grading', 'excavation', 'site prep', 'earthwork', 'clearing'],
    // Steel Work
    steel: ['steel', 'ironworker', 'welding', 'structural', 'metal'],
    // Supervisor
    supervisor: ['foreman', 'supervisor', 'superintendent', 'manager', 'project manager'],
  };

  /**
   * Get top WC code suggestions for a worker task
   */
  async getSuggestions(
    input: WorkerTaskInput,
    companyId: string,
    state: string,
    limit: number = 3
  ): Promise<WCCodeSuggestion[]> {
    try {
      logger.info(`Getting WC code suggestions for worker: ${input.workerName}`);

      // Fetch all WC codes for this company and state
      const wcCodes = await WCCode.find({
        company: new mongoose.Types.ObjectId(companyId),
        state: state,
      }).lean();

      if (wcCodes.length === 0) {
        logger.warn(`No WC codes found for company ${companyId} and state ${state}`);
        return [];
      }

      // Score each WC code
      const scoredCodes = wcCodes.map(code => {
        const score = this.calculateMatchScore(input, code);
        return {
          code,
          score: score.totalScore,
          matchReason: score.reason,
        };
      });

      // Sort by score and take top N
      const topCodes = scoredCodes
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Convert to suggestions
      return topCodes.map(item => ({
        wcCodeId: item.code._id.toString(),
        code: item.code.code,
        description: item.code.description,
        state: item.code.state,
        rate: item.code.rate,
        confidence: Math.min(item.score / 100, 1), // Normalize to 0-1
        matchReason: item.matchReason,
      }));
    } catch (error) {
      logger.error('Error getting WC code suggestions:', error);
      throw error;
    }
  }

  /**
   * Calculate match score for a WC code based on input
   */
  private calculateMatchScore(
    input: WorkerTaskInput,
    wcCode: any
  ): { totalScore: number; reason: string } {
    let score = 0;
    const reasons: string[] = [];

    // Combine all text for matching
    const inputText = [
      input.task || '',
      input.workDescription || '',
      input.jobName || '',
    ]
      .join(' ')
      .toLowerCase();

    const codeDescription = wcCode.description.toLowerCase();

    // 1. Direct keyword matching in task categories
    for (const [category, keywords] of Object.entries(this.taskKeywords)) {
      const matchCount = keywords.filter(keyword => 
        inputText.includes(keyword) || codeDescription.includes(keyword)
      ).length;

      if (matchCount > 0) {
        const categoryScore = matchCount * 25; // Up to 25 points per keyword
        score += categoryScore;
        reasons.push(`Matched ${category} keywords (${matchCount})`);
      }
    }

    // 2. Direct description matching
    const descriptionWords = codeDescription.split(/\s+/).filter((w: string) => w.length > 3);
    const inputWords = inputText.split(/\s+/).filter((w: string) => w.length > 3);
    
    const commonWords = descriptionWords.filter((word: string) => 
      inputWords.some((inputWord: string) => 
        inputWord.includes(word) || word.includes(inputWord)
      )
    );

    if (commonWords.length > 0) {
      const descriptionScore = commonWords.length * 15;
      score += descriptionScore;
      reasons.push(`Description match: ${commonWords.length} common words`);
    }

    // 3. Code pattern matching (e.g., "5403" might indicate carpentry)
    const codeNumber = parseInt(wcCode.code.replace(/\D/g, ''));
    if (!isNaN(codeNumber)) {
      // Common WC code ranges (approximate)
      const codeRanges: Record<string, [number, number]> = {
        'carpentry': [5400, 5499],
        'electrical': [5190, 5199],
        'plumbing': [5183, 5189],
        'masonry': [5020, 5059],
        'roofing': [5551, 5559],
        'labor': [5220, 5229],
      };

      for (const [category, [min, max]] of Object.entries(codeRanges)) {
        if (codeNumber >= min && codeNumber <= max) {
          const categoryKeywords = this.taskKeywords[category] || [];
          if (categoryKeywords.some(kw => inputText.includes(kw))) {
            score += 30;
            reasons.push(`Code range matches ${category}`);
            break;
          }
        }
      }
    }

    // 4. Fuzzy matching for worker role/title
    if (input.workerName) {
      const nameLower = input.workerName.toLowerCase();
      // Check if worker name contains job title
      for (const [category, keywords] of Object.entries(this.taskKeywords)) {
        if (keywords.some(kw => nameLower.includes(kw))) {
          if (codeDescription.includes(category)) {
            score += 20;
            reasons.push(`Worker name suggests ${category}`);
          }
        }
      }
    }

    return {
      totalScore: Math.min(score, 100), // Cap at 100
      reason: reasons.join('; ') || 'Generic match',
    };
  }

  /**
   * Batch process workers and return suggestions for each
   */
  async batchGetSuggestions(
    workers: WorkerTaskInput[],
    companyId: string,
    state: string
  ): Promise<Map<string, WCCodeSuggestion[]>> {
    const results = new Map<string, WCCodeSuggestion[]>();

    for (const worker of workers) {
      const suggestions = await this.getSuggestions(worker, companyId, state);
      results.set(worker.workerName, suggestions);
    }

    return results;
  }

  /**
   * Validate and provide feedback on WC code assignment
   */
  async validateAssignment(
    workerId: string,
    wcCodeId: string,
    task: string
  ): Promise<{ valid: boolean; warnings: string[] }> {
    const warnings: string[] = [];
    
    // This could be enhanced with historical data analysis
    // For now, we'll return basic validation
    
    return {
      valid: true,
      warnings,
    };
  }

  /**
   * Get historical WC code usage for a company
   */
  async getHistoricalPatterns(
    companyId: string,
    state: string
  ): Promise<Array<{ code: string; count: number; avgHours: number }>> {
    // TODO: Implement historical analysis
    // This would query daily logs and aggregate WC code usage
    
    return [];
  }
}

// Export singleton instance
export const wcCodeSuggestionEngine = new WCCodeSuggestionEngine();
export default wcCodeSuggestionEngine;
