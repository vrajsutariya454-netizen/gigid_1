import { db } from "@/lib/db/database";
import { Transaction, AAData, computeFinalScore, ScoreBreakdown } from "./trust-score";
import { generateMockHistory } from "./mock-service";

/**
 * Gathers all data from local DB and User Inputs to compute the Trust Score.
 * Prioritizes: Platform Data > Manual Data > Mock Fallback
 */
export async function getLiveTrustScore(): Promise<ScoreBreakdown> {
  // 1. Fetch Real Data from Dexie
  const workRecords = await db.workRecords.toArray();
  const manualData = await db.manualScoringData.toArray();
  const platforms = await db.platforms.where("connected").equals(1).toArray();

  // If absolutely no data exists, return mock (for demonstration)
  if (workRecords.length === 0 && manualData.length === 0 && platforms.length === 0) {
    const mock = generateMockHistory();
    return computeFinalScore(
      mock.monthlyIncomes,
      mock.activeDays,
      mock.transactions,
      mock.aaData
    );
  }

  // 2. Merge Data
  // Create a map of month -> {income, days}
  const mergedMap = new Map<string, { income: number, days: number, verified: number }>();

  // Add manual data first
  manualData.forEach(m => {
    mergedMap.set(m.month, { 
      income: m.income, 
      days: m.activeDays, 
      verified: m.verifiedInflow || 0 
    });
  });

  // Overlay with Platform work records (assuming platform data is more reliable)
  workRecords.forEach(w => {
    const existing = mergedMap.get(w.month) || { income: 0, days: 0, verified: 0 };
    mergedMap.set(w.month, {
      income: existing.income + w.earnings,
      days: Math.max(existing.days, (w.trips / 5)), // Estimate days if not explicitly there
      verified: existing.verified + w.earnings // Platform income counts as verified
    });
  });

  // 3. Extract Arrays (last 6 unique months)
  const sortedMonths = Array.from(mergedMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6);

  const monthlyIncomes = sortedMonths.map(m => m[1].income);
  const activeDays = sortedMonths.map(m => m[1].days);
  const aaInflows = sortedMonths.map(m => m[1].verified);

  // 4. Construct AA Data
  const aaData: AAData = {
    monthlyInflows: aaInflows.length ? aaInflows : [0],
    avgMonthlyBalance: monthlyIncomes.length ? (monthlyIncomes.reduce((a,b)=>a+b,0) / monthlyIncomes.length * 0.4) : 0,
    monthlyExpenses: monthlyIncomes.length ? (monthlyIncomes.reduce((a,b)=>a+b,0) / monthlyIncomes.length * 0.6) : 0,
    verifiedIncomeAmount: aaInflows.reduce((a,b) => a+b, 0)
  };

  // 5. Build Transactions (Mocked for now based on income events)
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // Create one platform/aa transaction per month of data
  sortedMonths.forEach(([month, data], i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
    transactions.push({
      amount: data.income,
      timestamp: date,
      source: 'aa_verified'
    });
  });

  return computeFinalScore(
    monthlyIncomes.length ? monthlyIncomes : [0],
    activeDays.length ? activeDays : [0],
    transactions.length ? transactions : [],
    aaData
  );
}
