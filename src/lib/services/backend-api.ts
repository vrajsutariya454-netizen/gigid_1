import { db, getSetting } from "@/lib/db/database";
import { ScoreBreakdown } from "@/lib/scoring/trust-score";

export const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL;
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};



/**
 * Service to communicate with the Node.js + Express backend.
 */
export async function performGlobalTrustAudit(): Promise<any> {
  // 1. Fetch data from IndexedDB
  const allPlatforms = await db.platforms.toArray();
  const workRecords = await db.workRecords.toArray();
  const manualData = await db.manualScoringData.toArray();

  // 2. Map to Backend Format
  // Only include workRecords from platforms that the user has verified
  const verifiedInstanceIds = new Set(
    allPlatforms.filter(p => p.connected && p.isVerified).map(p => p.id!)
  );
  const verifiedWorkRecords = workRecords.filter(w => verifiedInstanceIds.has(w.instanceId));

  const mergedMap = new Map<string, { income: number, days: number, verified: number }>();

  manualData.forEach(m => {
    mergedMap.set(m.month, { 
      income: m.income || 0, 
      days: m.activeDays || 0, 
      verified: m.verifiedInflow || 0 
    });
  });

  verifiedWorkRecords.forEach(w => {
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

  // Map transactions with source attribution — only verified platform records
  const transactions = verifiedWorkRecords.map(w => ({
    amount: w.earnings,
    date: new Date(w.month + "-15"),
    source: "platform" // Defaulting to high-trust for synced data
  })).concat(manualData.map(m => ({
    amount: m.income,
    date: new Date(m.month + "-01"),
    source: "manual"
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

  const BACKEND_URL = getBackendUrl();

  // 3. POST to Backend
  const response = await fetch(`${BACKEND_URL}/trust-score`, {

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
 * Fetches duration-based estimates for a platform. (MOCKED)
 */
export async function performEstimate(platformId: string, duration: number): Promise<any> {
  const BACKEND_URL = getBackendUrl();
  const response = await fetch(`${BACKEND_URL}/trust-score/estimate`, {

    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platformId, duration })
  });
  if (!response.ok) throw new Error("Estimation failed");
  return response.json();
}
