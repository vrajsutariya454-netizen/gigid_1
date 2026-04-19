import { SOURCE_CONFIG } from "../config/sourceConfig.js";
import * as metrics from "../services/metricsService.js";

/**
 * Categorize the score based on fintech benchmarks.
 */

function getCategory(score) {
  if (score >= 85) return "High Trust";
  if (score >= 70) return "Moderate";
  if (score >= 55) return "Risky";
  return "High Risk";
}

/**
 * Final Trust Score (T)
 * T_core = 0.30S + 0.25E + 0.25C + 0.20Rt
 * T = 100 * T_core * Rs
 */
export function calculateTrust(userTxns, monthlyIncomes = [], activeDays = [], aa_data = null) {
  const S = metrics.calculateStability(monthlyIncomes);
  const E = metrics.calculateCapacity(monthlyIncomes);
  const C = metrics.calculateConsistency(activeDays);
  const Rt = metrics.calculateRegularity(userTxns);
  const Rs = metrics.calculateReliability(userTxns, SOURCE_CONFIG);
  
  // T_core is the weighted sum of behavioral metrics
  const T_core = (0.30 * S) + (0.25 * E) + (0.25 * C) + (0.20 * Rt);
  
  // Final Score is core trust multiplied by source reliability anchor
  const finalScore = Math.round(100 * T_core * Rs);

  return {
    trustScore: finalScore,
    category: getCategory(finalScore),
    breakdown: {
      S: S.toFixed(3),
      E: E.toFixed(3),
      C: C.toFixed(3),
      Rt: Rt.toFixed(3),
      Rs: Rs.toFixed(3),
      T_core: T_core.toFixed(3)
    }
  };
}