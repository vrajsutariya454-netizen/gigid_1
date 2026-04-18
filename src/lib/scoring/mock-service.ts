import { Transaction, AAData } from "./trust-score";

export interface UserHistoryData {
  monthlyIncomes: number[];
  activeDays: number[];
  transactions: Transaction[];
  aaData: AAData;
}

/**
 * Generates realistic mock data for a 6-month history including AA data
 */
export function generateMockHistory(): UserHistoryData {
  // 1. Monthly incomes (mostly stable around 40k)
  const monthlyIncomes = [40000, 42500, 38000, 41000, 40500, 39500];
  const totalIncome = monthlyIncomes.reduce((a, b) => a + b, 0);

  // 2. Active work days (averaging 25 days/month)
  const activeDays = [25, 27, 26, 24, 26, 25];

  // 3. Transactions
  const transactions: Transaction[] = [];
  const now = new Date();
  
  for (let i = 0; i < 60; i++) {
    const dayOffset = Math.floor(Math.random() * 90);
    const date = new Date(now.getTime() - (dayOffset * 24 * 60 * 60 * 1000));
    
    const rand = Math.random();
    let source: Transaction['source'] = 'platform';
    if (rand > 0.7) source = 'aa_verified';
    else if (rand > 0.85) source = 'bank';
    else if (rand > 0.98) source = 'manual';
    
    let amount = Math.floor(Math.random() * 5000) + 500;
    if (source === 'aa_verified') amount = Math.floor(Math.random() * 10000) + 2000;

    transactions.push({
      amount,
      timestamp: date,
      source
    });
  }

  // 4. AA Data (Mock)
  const aaData: AAData = {
    monthlyInflows: [38000, 41000, 37500, 39000, 40000, 38500],
    avgMonthlyBalance: 25000,
    monthlyExpenses: 20000,
    verifiedIncomeAmount: totalIncome * 0.9 // 90% verification rate
  };

  return {
    monthlyIncomes,
    activeDays,
    transactions,
    aaData
  };
}
