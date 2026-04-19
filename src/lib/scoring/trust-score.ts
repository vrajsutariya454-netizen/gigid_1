/**
 * Mathematical model for calculating Gig Worker Trust Score (0-100)
 * Includes Account Aggregator (AA) verified financial data.
 */

export interface Transaction {
  amount: number;
  timestamp: Date;
  source: 'platform' | 'bank' | 'screenshot' | 'verified_screenshot' | 'manual' | 'aa_verified' | 'unknown' | 'pending';
}

export interface AAData {
  monthlyInflows: number[];
  avgMonthlyBalance: number;
  monthlyExpenses: number;
  verifiedIncomeAmount: number;
  verifiedTransactions?: VerifiedTransaction[];
}

export interface VerifiedTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  bank: string;
  type: 'credit' | 'debit';
}

export interface ScoreBreakdown {
  stability: number;   // S
  earnings: number;    // E
  consistency: number; // C
  regularity: number;  // Rt
  reliability: number; // Rs
  aaScore: number;     // Raa (Combined AA metric)
  aaDetails: {
    verifiedIncomeRatio: number; // Vi
    cashFlowConsistency: number; // Cf
    balanceHealth: number;       // Bh
  };
  finalScore: number;  // T
  aaTransactions: VerifiedTransaction[];
}

export const RELIABILITY_WEIGHTS: Record<Transaction['source'], number> = {
  platform: 1.0,         // Direct API / Cryptographically Signed
  bank: 0.9,             // Bank matched
  verified_screenshot: 0.8, // Screenshot verified by backend
  screenshot: 0.5,       // Raw screenshot uploaded
  manual: 0.3,           // User entered manually
  aa_verified: 1.0,      // Account Aggregator / Digital Signature
  unknown: 0.0,
  pending: 0.0
};

const REFERENCE_INCOME = 50000;

// Helper: Mean
const mean = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

// Helper: Std Dev
const stdDev = (arr: number[]) => {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / (arr.length || 1));
};

// Helper: Clamp 0-1
const clamp = (val: number) => Math.max(0, Math.min(1, val));

/**
 * 1. Income Stability (S)
 */
export function calculateStability(incomes: number[]): number {
  if (incomes.length < 2) return 0.5;
  const mu = mean(incomes);
  const sigma = stdDev(incomes);
  return mu === 0 ? 0 : clamp(1 - (sigma / mu));
}

/**
 * 2. Earnings Capacity (E)
 */
export function calculateCapacity(incomes: number[]): number {
  const mu = mean(incomes);
  return clamp(mu / REFERENCE_INCOME);
}

/**
 * 3. Work Consistency (C)
 */
export function calculateConsistency(activeDays: number[]): number {
  if (activeDays.length === 0) return 0;
  const mu_d = mean(activeDays);
  const sigma_d = stdDev(activeDays);
  return mu_d === 0 ? 0 : clamp((mu_d / 30) * (1 - (sigma_d / mu_d)));
}

/**
 * 4. Transaction Regularity (Rt)
 */
export function calculateRegularity(transactions: Transaction[]): number {
  if (transactions.length < 3) return 0.5;
  const sorted = [...transactions].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].timestamp.getTime() - sorted[i-1].timestamp.getTime();
    gaps.push(diff / (1000 * 60 * 60 * 24));
  }
  const mu_g = mean(gaps);
  const sigma_g = stdDev(gaps);
  return mu_g === 0 ? 1 : clamp(1 - (sigma_g / mu_g));
}

/**
 * 5. Source Reliability (Rs)
 */
export function calculateReliability(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0.5;
  let weightedSum = 0;
  let totalAmount = 0;
  transactions.forEach(t => {
    weightedSum += t.amount * RELIABILITY_WEIGHTS[t.source];
    totalAmount += t.amount;
  });
  return totalAmount === 0 ? 0.5 : clamp(weightedSum / totalAmount);
}

/**
 * Account Aggregator Matrix:
 * 6. Verified Income Ratio (Vi)
 * 7. Cash Flow Consistency (Cf)
 * 8. Balance Health (Bh)
 */
export function calculateAAComponents(aaData: AAData, totalIncome: number) {
  const vi = totalIncome > 0 ? clamp(aaData.verifiedIncomeAmount / totalIncome) : 0.5;
  
  const mu_inflow = mean(aaData.monthlyInflows);
  const sigma_inflow = stdDev(aaData.monthlyInflows);
  const cf = mu_inflow === 0 ? 0 : clamp(1 - (sigma_inflow / mu_inflow));
  
  const bh = aaData.monthlyExpenses > 0 ? clamp(aaData.avgMonthlyBalance / aaData.monthlyExpenses) : 1;

  return { vi, cf, bh };
}

/**
 * 9. AA Reliability Score (Raa)
 */
export function calculateAAReliability(vi: number, cf: number, bh: number): number {
  return clamp((0.4 * vi) + (0.3 * cf) + (0.3 * bh));
}

/**
 * Final Trust Score (T)
 * T = 100 * T_core * Rs * Raa
 */
export function computeFinalScore(
  incomes: number[], 
  activeDays: number[], 
  transactions: Transaction[],
  aaData: AAData,
  kycVerified: boolean = false
): ScoreBreakdown {
  const s = calculateStability(incomes);
  const e = calculateCapacity(incomes);
  const c = calculateConsistency(activeDays);
  const rt = calculateRegularity(transactions);
  const rs = calculateReliability(transactions);
  
  const { vi, cf, bh } = calculateAAComponents(aaData, mean(incomes) * incomes.length);
  const raa = calculateAAReliability(vi, cf, bh);

  const tCore = (0.30 * s) + (0.25 * e) + (0.25 * c) + (0.20 * rt);
  const kycMultiplier = kycVerified ? 1.25 : 1.0;
  const finalScore = Math.round(100 * clamp(tCore) * clamp(rs * kycMultiplier) * raa);
  
  return {
    stability: s,
    earnings: e,
    consistency: c,
    regularity: rt,
    reliability: rs,
    aaScore: raa,
    aaDetails: {
      verifiedIncomeRatio: vi,
      cashFlowConsistency: cf,
      balanceHealth: bh
    },
    finalScore,
    aaTransactions: aaData.verifiedTransactions || []
  };
}

export function getInterpretation(score: number): { label: string, color: string } {
  if (score >= 85) return { label: "score.highTrust", color: "var(--success-500)" };
  if (score >= 70) return { label: "score.moderate", color: "var(--primary-500)" };
  if (score >= 55) return { label: "score.risky", color: "var(--warning-500)" };
  return { label: "score.highRisk", color: "var(--danger-500)" };
}
