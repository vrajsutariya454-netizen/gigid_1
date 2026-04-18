import { calculateTrust } from "../utils/trustScore.js";

/**
 * SIMULATION: Fintech-Grade Trust Score Comparison
 */

// 1. AA Verified User (High Trust Profile)
const user1 = {
  name: "Rahul Sharma (AA Verified)",
  incomes: [42000, 45000, 43000, 44000, 43500, 46000],
  activeDays: [26, 27, 25, 26, 27, 28],
  transactions: [
    { amount: 1500, date: "2026-03-01", source: "uber_api" },
    { amount: 2200, date: "2026-03-03", source: "aa_bank" },
    { amount: 1800, date: "2026-03-05", source: "swiggy_api" },
  ],
  aa_data: {
    monthly_inflows: [42000, 45000, 43000, 44000, 43500, 46000],
    avg_balance: 25000,
    monthly_expenses: 18000,
    verified_income: 42000
  }
};

// 2. Manual-Only User (Low Trust / High Risk Profile)
const user2 = {
  name: "Amit Verma (Manual Only)",
  incomes: [30000, 28000, 32000, 29000, 31000, 30500],
  activeDays: [22, 24, 23, 21, 22, 23],
  transactions: [
    { amount: 1200, date: "2026-03-01", source: "manual_entry" },
    { amount: 1500, date: "2026-03-05", source: "manual_entry" },
  ],
  aa_data: null // No AA verification
};

console.log("\n" + "=".repeat(60));
console.log("      GIGID FINTECH TRUST ENGINE: SCORE SIMULATION");
console.log("=".repeat(60));

const score1 = calculateTrust(user1.transactions, user1.incomes, user1.activeDays, user1.aaData); // Note: I used aa_data in code, user1 has aa_data. I'll pass user1.aa_data
const result1 = calculateTrust(user1.transactions, user1.incomes, user1.activeDays, user1.aa_data);
const result2 = calculateTrust(user2.transactions, user2.incomes, user2.activeDays, user2.aa_data);

console.log(`\nPROFILE 1: ${user1.name}`);
console.log(`FINAL TRUST SCORE: ${result1.trustScore}/100`);
console.log("BREAKDOWN:", JSON.stringify(result1.breakdown, null, 2));

console.log(`\n${"-".repeat(60)}`);

console.log(`\nPROFILE 2: ${user2.name}`);
console.log(`FINAL TRUST SCORE: ${result2.trustScore}/100`);
console.log("BREAKDOWN:", JSON.stringify(result2.breakdown, null, 2));

console.log("\n" + "=".repeat(60));
console.log("  Observation: AA Verification & Platform APIs provide");
console.log("  a significant reliability boost to the final score.");
console.log("=".repeat(60) + "\n");
