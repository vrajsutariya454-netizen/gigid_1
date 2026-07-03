import { db, getSetting } from "@/lib/db/database";
import { Transaction, AAData, computeFinalScore, ScoreBreakdown } from "./trust-score";
import { generateMockHistory } from "./mock-service";

/**
 * Gathers all data from local DB and User Inputs to compute the Trust Score.
 * Prioritizes: Platform Data > Manual Data > Mock Fallback
 */
export async function getLiveTrustScore(userId?: string): Promise<ScoreBreakdown> {
  const allWorkRecords = userId ? await db.workRecords.where("userId").equals(userId).toArray() : await db.workRecords.toArray();
  const manualData = userId ? await db.manualScoringData.where("userId").equals(userId).toArray() : await db.manualScoringData.toArray();
  const allPlatforms = userId ? await db.platforms.where("userId").equals(userId).toArray() : await db.platforms.toArray();
  const platforms = allPlatforms.filter(p => p.connected && p.isVerified);
  
  // Only include work records from VERIFIED platforms — unverified platforms must not affect the score
  const verifiedInstanceIds = new Set(platforms.map(p => p.id!));
  const workRecords = allWorkRecords.filter(w => verifiedInstanceIds.has(w.instanceId));
  
  const credentials = userId ? await db.credentials.where("userId").equals(userId).toArray() : await db.credentials.toArray();
  const documents = await db.documents.toArray();

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
      finalScore: 0,
      aaTransactions: []
    };
  }

  // 2. Merge Data
  const mergedMap = new Map<string, { income: number, days: number, verified: number, source: Transaction['source'] }>();

  // Add manual/seeded data
  manualData.forEach(m => {
    mergedMap.set(m.month, {
      income: m.income,
      days: m.activeDays,
      verified: m.verifiedInflow || 0,
      source: 'manual'
    });
  });

  const getSource = (instanceId: number, platformId: string, platformName: string): Transaction['source'] => {
    const vc = credentials.find(c => c.credentialSubject?.platform.includes(platformName.split(" ")[0]));

    if (!platformId.startsWith("manual_")) {
      // It's API driven! Look at cryptographic signature
      if (vc?.verificationStatus === 'pending') return "pending";
      if (vc?.verificationStatus === 'verified') return "platform"; // mathematically verified via signature
      return "unknown"; // Unverified/Tampered API data
    }

    if (!vc) return "manual";
    const platformDocs = documents.filter(d => d.credentialId === vc.credentialId);
    if (platformDocs.length === 0) return "manual";
    return platformDocs.some(d => d.verification === "verified") ? "verified_screenshot" : "screenshot";
  };

  // Overlay with Platform records
  workRecords.forEach(w => {
    const p = platforms.find(pl => pl.id === w.instanceId);
    const source = p ? getSource(w.instanceId, w.platformId, p.name) : 'manual';

    const existing = mergedMap.get(w.month) || { income: 0, days: 0, verified: 0, source: 'manual' };
    mergedMap.set(w.month, {
      income: existing.income + w.earnings,
      days: Math.max(existing.days, (w.trips / 5)),
      verified: existing.verified + w.earnings,
      // Upgrade source if this record is stronger
      source: source === 'platform' ? 'platform' : (source === 'verified_screenshot' && existing.source !== 'platform') ? 'verified_screenshot' : (source === 'screenshot' && existing.source === 'manual') ? 'screenshot' : existing.source
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
    avgMonthlyBalance: storedBal ? parseFloat(storedBal) : (monthlyIncomes.length ? (monthlyIncomes.reduce((a, b) => a + b, 0) / monthlyIncomes.length * 0.4) : 0),
    monthlyExpenses: storedExp ? parseFloat(storedExp) : (monthlyIncomes.length ? (monthlyIncomes.reduce((a, b) => a + b, 0) / monthlyIncomes.length * 0.6) : 0),
    verifiedIncomeAmount: storedVer ? parseFloat(storedVer) : aaInflows.reduce((a, b) => a + b, 0),
    verifiedTransactions: generateMockAATransactions(aaInflows.reduce((a, b) => a + b, 0))
  };

  // 5. Build Transactions
  const transactions: Transaction[] = [];
  const now = new Date();

  sortedMonths.forEach(([month, data], i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
    transactions.push({
      amount: data.income,
      timestamp: date,
      source: data.source
    });
  });

  const profile = await db.profiles.toCollection().first();
  const kycVerified = profile?.kycStatus === 'verified';

  return computeFinalScore(
    monthlyIncomes.length ? monthlyIncomes : [0],
    activeDays.length ? activeDays : [0],
    transactions.length ? transactions : []
  );
}


/**
 * Generates a list of verified transactions to simulate Account Aggregator data
 */
function generateMockAATransactions(totalIncome: number) {
  const transactions = [];
  const banks = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank"];
  const selectedBank = banks[Math.floor(Math.random() * banks.length)];
  const descriptions = [
    "NEFT: Uber India Systems",
    "IMPS: Zomato Payments",
    "RTGS: Swiggy Delivery",
    "UPI: Amazon Flex Pay",
    "UPI: Porter Services",
    "CMS: Rapido Logistics"
  ];

  const count = 12; // Show last 12 verified events
  const baseAmount = totalIncome / 6 / 2; // Split monthly income into two big chunks

  const now = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 15) - Math.floor(Math.random() * 5));
    transactions.push({
      id: `aa-tx-${Math.random().toString(36).substring(7)}`,
      date: date.toISOString().split('T')[0],
      amount: Math.round(baseAmount * (0.9 + Math.random() * 0.2)),
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      bank: selectedBank,
      type: 'credit' as const
    });
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}
