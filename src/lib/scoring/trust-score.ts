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
  platform: 1.0,
  bank: 0.7,
  unknown: 0.5,
  manual: 0.3,
  // Mapping legacy sources for compatibility
  aa_verified: 1.0,
  verified_screenshot: 0.8,
  screenshot: 0.5,
  pending: 0.0
};

const REFERENCE_INCOME = 50000;

// Helper: Mean
const mean = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

// Helper: Std Dev (Population)
const stdDev = (arr: number[]) => {
  if (arr.length === 0) return 0;
  const mu = mean(arr);
  return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - mu, 2), 0) / arr.length);
};

// Helper: Clamp 0-1
const clamp = (val: number) => Math.max(0, Math.min(1, val));

/**
 * 1. Income Stability (S)
 * S = max(0, 1 - σ / μ)
 */
export function calculateStability(incomes: number[]): number {
  if (incomes.length < 2) return 0.5;
  const mu = mean(incomes);
  const sigma = stdDev(incomes);
  return mu === 0 ? 0 : clamp(1 - (sigma / mu));
}

/**
 * 2. Earnings Capacity (E)
 * E = min(1, μ / 50000)
 */
export function calculateCapacity(incomes: number[]): number {
  const mu = mean(incomes);
  return clamp(mu / REFERENCE_INCOME);
}

/**
 * 3. Work Consistency (C)
 * C = (μ_d / 30) × (1 - σ_d / μ_d)
 */
export function calculateConsistency(activeDays: number[]): number {
  if (activeDays.length === 0) return 0;
  const mu_d = mean(activeDays);
  const sigma_d = stdDev(activeDays);
  return mu_d === 0 ? 0 : clamp((mu_d / 30) * (1 - (sigma_d / mu_d)));
}

/**
 * 4. Transaction Regularity (Rt)
 * Rt = 1 - (σ_g / μ_g)
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
 * Rs = Σ(amount × weight) / Σ(amount)
 */
export function calculateReliability(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0.5;
  let weightedSum = 0;
  let totalAmount = 0;
  transactions.forEach(t => {
    const weight = RELIABILITY_WEIGHTS[t.source] ?? RELIABILITY_WEIGHTS.unknown;
    weightedSum += t.amount * weight;
    totalAmount += t.amount;
  });
  return totalAmount === 0 ? 0.5 : clamp(weightedSum / totalAmount);
}

/**
 * Final Trust Score (T)
 * T_core = 0.30S + 0.25E + 0.25C + 0.20Rt
 * T = 100 * T_core * Rs
 */
export function computeFinalScore(
  incomes: number[], 
  activeDays: number[], 
  transactions: Transaction[]
): ScoreBreakdown {
  const s = calculateStability(incomes);
  const e = calculateCapacity(incomes);
  const c = calculateConsistency(activeDays);
  const rt = calculateRegularity(transactions);
  const rs = calculateReliability(transactions);
  
  const tCore = (0.30 * s) + (0.25 * e) + (0.25 * c) + (0.20 * rt);
  const finalScore = Math.round(100 * tCore * rs);
  
  return {
    stability: s,
    earnings: e,
    consistency: c,
    regularity: rt,
    reliability: rs,
    aaScore: 0.85, // Default/Legacy
    aaDetails: {
      verifiedIncomeRatio: 1.0,
      cashFlowConsistency: 1.0,
      balanceHealth: 1.0
    },
    finalScore,
    aaTransactions: []
  };
}

export function getInterpretation(score: number): { label: string, color: string } {
  if (score >= 85) return { label: "score.highTrust", color: "var(--color-primary)" };
  if (score >= 70) return { label: "score.moderate", color: "oklch(0.7 0.1 180)" };
  if (score >= 55) return { label: "score.risky", color: "var(--color-accent)" };
  return { label: "score.highRisk", color: "oklch(0.6 0.2 30)" };
}

