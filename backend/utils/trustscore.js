import { SOURCE_CONFIG } from "../config/sourceConfig.js";

/**
 * Mathematical model for calculating Gig Worker Trust Score (0-100)
 * Integrated with Account Aggregator (AA) metrics.
 */

const REFERENCE_INCOME = 50000;

// Helper: Mean
export const mean = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

// Helper: Std Dev
export const std = (arr) => {
  if (arr.length < 2) return 0;
  const mu = mean(arr);
  return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - mu, 2), 0) / arr.length);
};

// Helper: Clamp 0-1
export const clamp = (val) => Math.max(0, Math.min(1, val));

/**
 * 1. Income Stability (S)
 */
function calculateS(incomes) {
  if (incomes.length < 2) return 0.5;
  const mu = mean(incomes);
  const sigma = std(incomes);
  return mu === 0 ? 0 : clamp(1 - (sigma / mu));
}

/**
 * 2. Earnings Capacity (E)
 */
function calculateE(incomes) {
  const mu = mean(incomes);
  return clamp(mu / REFERENCE_INCOME);
}

/**
 * 3. Work Consistency (C)
 */
function calculateC(activeDays) {
  if (activeDays.length === 0) return 0;
  const mu_d = mean(activeDays);
  const sigma_d = std(activeDays);
  return mu_d === 0 ? 0 : clamp((mu_d / 30) * (1 - (sigma_d / mu_d)));
}

/**
 * 4. Transaction Regularity (Rt)
 */
function calculateRt(txns) {
  if (txns.length < 3) return 0.5;
  const sorted = [...txns].sort((a, b) => new Date(a.date) - new Date(b.date));
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff = new Date(sorted[i].date) - new Date(sorted[i-1].date);
    gaps.push(diff / (1000 * 60 * 60 * 24));
  }
  const mu_g = mean(gaps);
  const sigma_g = std(gaps);
  return mu_g === 0 ? 1 : clamp(1 - (sigma_g / mu_g));
}

/**
 * 5. Source Reliability (Rs)
 */
function calculateRs(txns) {
  if (txns.length === 0) return 0.5;
  let weightedSum = 0;
  let totalAmount = 0;
  txns.forEach(t => {
    const config = SOURCE_CONFIG[t.source] || SOURCE_CONFIG.manual_entry;
    weightedSum += t.amount * config.reliability;
    totalAmount += t.amount;
  });
  return totalAmount === 0 ? 0.5 : clamp(weightedSum / totalAmount);
}

/**
 * Account Aggregator (AA) Calculations
 */
function calculateAA(aa_data, monthly_incomes) {
  if (!aa_data || !aa_data.monthly_inflows || aa_data.monthly_inflows.length === 0) {
    return { Vi: 0.5, Cf: 0.5, Bh: 0.5, Raa: 0.85 }; // Default boost for unverified
  }

  // 1. Verified Income Ratio (Vi)
  const mu_income = mean(monthly_incomes);
  const Vi = mu_income > 0 ? clamp(aa_data.verified_income / mu_income) : 0;

  // 2. Cash Flow Consistency (Cf)
  const mu_inflow = mean(aa_data.monthly_inflows);
  const sigma_inflow = std(aa_data.monthly_inflows);
  const Cf = mu_inflow === 0 ? 0 : clamp(1 - (sigma_inflow / mu_inflow));

  // 3. Balance Health (Bh)
  const Bh = aa_data.monthly_expenses > 0 ? clamp(aa_data.avg_balance / aa_data.monthly_expenses) : 1;

  // 4. AA Reliability Score (Raa)
  const Raa = clamp((0.4 * Vi) + (0.3 * Cf) + (0.3 * Bh));

  return { Vi, Cf, Bh, Raa };
}

/**
 * Final Trust Score Calculation
 */
export function calculateTrust(userTxns, monthlyIncomes = [], activeDays = [], aa_data = null) {
  const S = calculateS(monthlyIncomes);
  const E = calculateE(monthlyIncomes);
  const C = calculateC(activeDays);
  const Rt = calculateRt(userTxns);
  const Rs = calculateRs(userTxns);
  
  const AA = calculateAA(aa_data, monthlyIncomes);

  const T_core = clamp((0.30 * S) + (0.25 * E) + (0.25 * C) + (0.20 * Rt));
  const finalScore = Math.round(100 * T_core * Rs * AA.Raa);

  return {
    trustScore: finalScore,
    breakdown: {
      S: S.toFixed(3),
      E: E.toFixed(3),
      C: C.toFixed(3),
      Rt: Rt.toFixed(3),
      Rs: Rs.toFixed(3),
      AA: {
        Vi: AA.Vi.toFixed(3),
        Cf: AA.Cf.toFixed(3),
        Bh: AA.Bh.toFixed(3),
        Raa: AA.Raa.toFixed(3)
      }
    }
  };
}