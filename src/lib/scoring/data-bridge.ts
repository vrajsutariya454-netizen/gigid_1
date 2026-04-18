import { db, getSetting } from "@/lib/db/database";
import { Transaction, AAData, computeFinalScore, ScoreBreakdown } from "./trust-score";
import { generateMockHistory } from "./mock-service";

/**
 * Gathers all data from local DB and User Inputs to compute the Trust Score.
 * Prioritizes: Platform Data > Manual Data > Mock Fallback
 */
export async function getLiveTrustScore(): Promise<ScoreBreakdown> {
  const workRecords = await db.workRecords.toArray();
  const manualData = await db.manualScoringData.toArray();
  const platforms = await db.platforms.where("connected").equals(1).toArray();

  // 1. Check if we have any data (real or manual)
  const hasData = workRecords.length > 0 || manualData.length > 0 || platforms.length > 0;

  if (!hasData) {
    return {
      stability: 0,
      earnings: 0,
      consistency: 0,
      regularity: 0,
      reliability: 0,
      aaScore: 0,
      aaDetails: {
        verifiedIncomeRatio: 0,
        cashFlowConsistency: 0,
        balanceHealth: 0
      },
      finalScore: 0
    };
  }

  // 2. Merge Data
  const mergedMap = new Map<string, { income: number, days: number, verified: number }>();

  // Add manual/seeded data
  manualData.forEach(m => {
    mergedMap.set(m.month, { 
      income: m.income, 
      days: m.activeDays, 
      verified: m.verifiedInflow || 0 
    });
  });

  // Overlay with Platform records
  workRecords.forEach(w => {
    const existing = mergedMap.get(w.month) || { income: 0, days: 0, verified: 0 };
    mergedMap.set(w.month, {
      income: existing.income + w.earnings,
      days: Math.max(existing.days, (w.trips / 5)), 
      verified: existing.verified + w.earnings
    });
  });

  // 3. Extract Arrays (last 6 unique months)
  const sortedMonths = Array.from(mergedMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6);

  const monthlyIncomes = sortedMonths.map(m => m[1].income);
  const activeDays = sortedMonths.map(m => m[1].days);
  const aaInflows = sortedMonths.map(m => m[1].verified);

  // 4. Construct AA Data (from settings if persona was seeded)
  const storedBal = await getSetting("aa_avg_balance");
  const storedExp = await getSetting("aa_monthly_expenses");
  const storedVer = await getSetting("aa_verified_income");

  const aaData: AAData = {
    monthlyInflows: aaInflows.length ? aaInflows : [0],
    avgMonthlyBalance: storedBal ? parseFloat(storedBal) : (monthlyIncomes.length ? (monthlyIncomes.reduce((a,b)=>a+b,0) / monthlyIncomes.length * 0.4) : 0),
    monthlyExpenses: storedExp ? parseFloat(storedExp) : (monthlyIncomes.length ? (monthlyIncomes.reduce((a,b)=>a+b,0) / monthlyIncomes.length * 0.6) : 0),
    verifiedIncomeAmount: storedVer ? parseFloat(storedVer) : aaInflows.reduce((a,b) => a+b, 0)
  };

  // 5. Build Transactions
  const transactions: Transaction[] = [];
  const now = new Date();
  
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
