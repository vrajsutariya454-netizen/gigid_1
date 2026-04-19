import { db, getSetting } from "@/lib/db/database";
import { ScoreBreakdown } from "@/lib/scoring/trust-score";

const BACKEND_URL = "http://localhost:5000";

/**
 * Service to communicate with the Node.js + Express backend.
 */
export async function performGlobalTrustAudit(): Promise<any> {
  // Simulate backend delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Return a mock success response that matches component expectations
  return {
    success: true,
    trustScore: 84,
    status: "verified",
    breakdown: {
      S: "0.850",
      E: "0.720",
      C: "0.910",
      Rt: "0.880",
      Rs: "0.950",
      AA: { Raa: "0.980" }
    },
    message: "Global trust audit completed via simulated node."
  };
}

/**
 * Fetches duration-based estimates for a platform. (MOCKED)
 */
export async function performEstimate(platformId: string, duration: number): Promise<any> {
  await new Promise((res) => setTimeout(res, 1000));

  return {
    success: true,
    limit: 50000,
    deliveries: 120 * (duration / 3), // Mock data matching expected UI fields
    rating: "4.8",
    earnings: 25000 * (duration / 3)
  };
}
