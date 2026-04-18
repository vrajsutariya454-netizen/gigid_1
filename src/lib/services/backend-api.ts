import { db, getSetting } from "@/lib/db/database";
import { ScoreBreakdown } from "@/lib/scoring/trust-score";

const BACKEND_URL = "http://localhost:5000";

/**
 * Service to communicate with the Node.js + Express backend.
 */
export async function performGlobalTrustAudit(): Promise<any> {
  // 1. Gather all local data
  const workRecords = await db.workRecords.toArray();
  const manualData = await db.manualScoringData.toArray();
  
  // 2. Map to Backend Format
  // We use the same aggregation logic as data-bridge but formatted for JSON send
  const mergedMap = new Map<string, { income: number, days: number, verified: number }>();

  manualData.forEach(m => {
    mergedMap.set(m.month, { 
      income: m.income || 0, 
      days: m.activeDays || 0, 
      verified: m.verifiedInflow || 0 
    });
  });

  workRecords.forEach(w => {
    const existing = mergedMap.get(w.month) || { income: 0, days: 0, verified: 0 };
    mergedMap.set(w.month, {
      income: existing.income + w.earnings,
      days: Math.max(existing.days, (w.trips / 5)), 
      verified: existing.verified + w.earnings
    });
  });

  const sortedMonths = Array.from(mergedMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6);

  const incomes = sortedMonths.map(m => m[1].income);
  const activeDays = sortedMonths.map(m => m[1].days);

  // Map transactions with source attribution
  // For this demo, we assume platform records are 'uber_api' and manual are 'manual_entry'
  const transactions = workRecords.map(w => ({
    amount: w.earnings,
    date: new Date(w.month + "-15"),
    source: "uber_api" // Defaulting to high-trust for synced data
  })).concat(manualData.map(m => ({
    amount: m.income,
    date: new Date(m.month + "-01"),
    source: "manual_entry"
  })));

  // AA Data from settings
  const storedBal = await getSetting("aa_avg_balance");
  const storedExp = await getSetting("aa_monthly_expenses");
  const storedVer = await getSetting("aa_verified_income");

  const aa_data = {
    monthly_inflows: sortedMonths.map(m => m[1].verified),
    avg_balance: storedBal ? parseFloat(storedBal) : 0,
    monthly_expenses: storedExp ? parseFloat(storedExp) : 1,
    verified_income: storedVer ? parseFloat(storedVer) : 0
  };

  // 3. POST to Backend
  const response = await fetch(`${BACKEND_URL}/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactions,
      incomes,
      activeDays,
      aa_data
    })
  });

  if (!response.ok) {
    throw new Error("Backend audit failed");
  }

  return response.json();
}

/**
 * Fetches duration-based estimates for a platform.
 */
export async function performEstimate(platformId: string, duration: number): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/calculate/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platformId, duration })
  });
  if (!response.ok) throw new Error("Estimation failed");
  return response.json();
}
