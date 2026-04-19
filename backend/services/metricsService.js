/**
 * Metrics Service: Modular mathematical logic for GigID Trust Score.
 * Follows the Fintech formula specification.
 */

const REFERENCE_INCOME = 50000;

const mean = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

const std = (arr) => {
  if (arr.length === 0) return 0;
  const mu = mean(arr);
  return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - mu, 2), 0) / arr.length);
};

const clamp = (val) => Math.max(0, Math.min(1, val));

/**
 * 1. Income Stability (S)
 * S = max(0, 1 - σ / μ)
 */
export const calculateStability = (incomes) => {
  if (incomes.length < 2) return 0.5;
  const mu = mean(incomes);
  const sigma = std(incomes);
  return mu === 0 ? 0 : clamp(1 - (sigma / mu));
};

/**
 * 2. Earnings Capacity (E)
 * E = min(1, μ / 50000)
 */
export const calculateCapacity = (incomes) => {
  const mu = mean(incomes);
  return clamp(mu / REFERENCE_INCOME);
};

/**
 * 3. Work Consistency (C)
 * C = (μ_d / 30) × (1 - σ_d / μ_d)
 */
export const calculateConsistency = (activeDays) => {
  if (activeDays.length === 0) return 0;
  const mu_d = mean(activeDays);
  const sigma_d = std(activeDays);
  return mu_d === 0 ? 0 : clamp((mu_d / 30) * (1 - (sigma_d / mu_d)));
};

/**
 * 4. Transaction Regularity (Rt)
 * Rt = 1 - (σ_g / μ_g)
 */
export const calculateRegularity = (txns) => {
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
};

/**
 * 5. Source Reliability (Rs)
 * Rs = Σ(amount × weight) / Σ(amount)
 */
export const calculateReliability = (txns, weights) => {
  if (txns.length === 0) return 0.5;
  let weightedSum = 0;
  let totalAmount = 0;
  
  txns.forEach(t => {
    const weight = weights[t.source]?.reliability || weights.unknown.reliability;
    weightedSum += t.amount * weight;
    totalAmount += t.amount;
  });

  return totalAmount === 0 ? 0.5 : clamp(weightedSum / totalAmount);
};
