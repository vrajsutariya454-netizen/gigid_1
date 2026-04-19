import { db } from "@/lib/db/database";
import { createCredential, storeCredential } from "@/lib/identity/credentials";

export interface DemoProfile {
  user_id: string;
  name: string;
  gigs: string[];
  monthly_incomes: number[];
  active_days: number[];
  transactions: { amount: number; date: string; source: string }[];
  aa_data: {
    monthly_inflows: number[];
    avg_balance: number;
    monthly_expenses: number;
    verified_income: number;
  };
}

export const DEMO_PROFILES: DemoProfile[] = [
  {
    "user_id": "U001",
    "name": "Rahul Sharma",
    "gigs": ["Uber", "Swiggy"],
    "monthly_incomes": [42000, 45000, 43000, 44000, 43500, 46000],
    "active_days": [26, 27, 25, 26, 27, 28],
    "transactions": [
      {"amount": 1500, "date": "2026-03-01", "source": "platform"},
      {"amount": 2200, "date": "2026-03-03", "source": "aa_verified"},
      {"amount": 1800, "date": "2026-03-05", "source": "platform"},
      {"amount": 2000, "date": "2026-03-08", "source": "bank"},
      {"amount": 1700, "date": "2026-03-10", "source": "aa_verified"}
    ],
    "aa_data": {
      "monthly_inflows": [42000, 45000, 43000, 44000, 43500, 46000],
      "avg_balance": 25000,
      "monthly_expenses": 18000,
      "verified_income": 42000
    }
  },
  {
    "user_id": "U002",
    "name": "Amit Verma",
    "gigs": ["Zomato", "Rapido", "Freelance"],
    "monthly_incomes": [30000, 28000, 32000, 29000, 31000, 30500],
    "active_days": [22, 24, 23, 21, 22, 23],
    "transactions": [
      {"amount": 1200, "date": "2026-03-02", "source": "manual"},
      {"amount": 1500, "date": "2026-03-06", "source": "platform"},
      {"amount": 1700, "date": "2026-03-09", "source": "bank"},
      {"amount": 1400, "date": "2026-03-12", "source": "manual"}
    ],
    "aa_data": {
      "monthly_inflows": [30000, 28000, 32000, 29000, 31000, 30500],
      "avg_balance": 12000,
      "monthly_expenses": 20000,
      "verified_income": 22000
    }
  },
  {
    "user_id": "U003",
    "name": "Priya Patel",
    "gigs": ["UrbanClap", "Freelance Design"],
    "monthly_incomes": [55000, 60000, 58000, 62000, 61000, 59000],
    "active_days": [24, 25, 26, 25, 24, 26],
    "transactions": [
      {"amount": 3000, "date": "2026-03-01", "source": "aa_verified"},
      {"amount": 3500, "date": "2026-03-04", "source": "aa_verified"},
      {"amount": 3200, "date": "2026-03-07", "source": "platform"},
      {"amount": 4000, "date": "2026-03-10", "source": "aa_verified"}
    ],
    "aa_data": {
      "monthly_inflows": [55000, 60000, 58000, 62000, 61000, 59000],
      "avg_balance": 40000,
      "monthly_expenses": 25000,
      "verified_income": 55000
    }
  },
  {
    "user_id": "U004",
    "name": "Sanjay Kumar",
    "gigs": ["Ola", "Delivery"],
    "monthly_incomes": [20000, 25000, 18000, 22000, 24000, 21000],
    "active_days": [18, 20, 17, 19, 21, 18],
    "transactions": [
      {"amount": 900, "date": "2026-03-03", "source": "manual"},
      {"amount": 1100, "date": "2026-03-07", "source": "manual"},
      {"amount": 1000, "date": "2026-03-11", "source": "bank"}
    ],
    "aa_data": {
      "monthly_inflows": [20000, 25000, 18000, 22000, 24000, 21000],
      "avg_balance": 8000,
      "monthly_expenses": 15000,
      "verified_income": 10000
    }
  },
  {
    "user_id": "U005",
    "name": "Neha Singh",
    "gigs": ["Freelance Writing", "Swiggy"],
    "monthly_incomes": [35000, 37000, 36000, 38000, 39000, 36500],
    "active_days": [23, 24, 25, 24, 26, 25],
    "transactions": [
      {"amount": 1800, "date": "2026-03-01", "source": "platform"},
      {"amount": 2000, "date": "2026-03-05", "source": "aa_verified"},
      {"amount": 2100, "date": "2026-03-09", "source": "platform"},
      {"amount": 1900, "date": "2026-03-12", "source": "bank"}
    ],
    "aa_data": {
      "monthly_inflows": [35000, 37000, 36000, 38000, 39000, 36500],
      "avg_balance": 20000,
      "monthly_expenses": 17000,
      "verified_income": 30000
    }
  }
];

/**
 * Seeds the local Dexie database with a specific persona's data.
 */
export async function seedDemoPersona(personaId: string) {
  const profile = DEMO_PROFILES.find(p => p.user_id === personaId);
  if (!profile) return;

  // 1. Clear existing local data to avoid collisions
  await db.manualScoringData.clear();
  await db.workRecords.clear();
  await db.platforms.clear();
  await db.credentials.clear();

  // 2. Add Manual Scoring Entries for last 6 months
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = monthDate.toISOString().slice(0, 7); // "YYYY-MM"
    
    await db.manualScoringData.add({
      month: monthStr,
      income: profile.monthly_incomes[i] || 0,
      activeDays: profile.active_days[i] || 0,
      verifiedInflow: profile.aa_data.monthly_inflows[i] || 0
    });
  }

  // 3. Add Platforms & Corresponding Documents
  for (const gig of profile.gigs) {
    // Add Platform entry
    await db.platforms.add({
      platformId: gig.toLowerCase(),
      name: gig,
      icon: "💼",
      color: "#3b82f6",
      connected: true,
      isVerified: true, // Demo profiles are pre-verified
      totalEarnings: profile.monthly_incomes.reduce((a,b) => a+b, 0),
      avgRating: 4.8
    });

    // Generate and Store Verifiable Credential (Doc)
    const vc = await createCredential({
      subjectDid: "did:gigid:" + personaId.toLowerCase(),
      platform: gig,
      totalDeliveries: 450, // Seeded base
      avgRating: 4.8,
      last6MonthsEarnings: profile.monthly_incomes.reduce((a,b) => a+b, 0),
      activeMonths: 12,
      zone: "Mumbai Central"
    });
    await storeCredential(vc);
  }

  // 4. Store AA context in settings
  await db.settings.put({ key: "aa_avg_balance", value: profile.aa_data.avg_balance.toString() });
  await db.settings.put({ key: "aa_monthly_expenses", value: profile.aa_data.monthly_expenses.toString() });
  await db.settings.put({ key: "aa_verified_income", value: profile.aa_data.verified_income.toString() });
  await db.settings.put({ key: "current_persona", value: profile.user_id });

  console.log(`Successfully seeded persona: ${profile.name}`);
}
