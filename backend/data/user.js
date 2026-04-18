const users = [
  {
    user_id: "U001",
    name: "Rahul",
    gigs: ["Uber", "Swiggy"],
    monthly_incomes: [42000, 45000, 43000, 44000, 43500, 46000],
    active_days: [26, 27, 25, 26, 27, 28],
    transactions: [
      { amount: 1500, date: "2026-03-01", source: "platform" },
      { amount: 2200, date: "2026-03-03", source: "aa_verified" }
    ],
    aa_data: {
      monthly_inflows: [42000, 45000, 43000, 44000, 43500, 46000],
      avg_balance: 25000,
      monthly_expenses: 18000,
      verified_income: 42000
    }
  }
];

module.exports = users;