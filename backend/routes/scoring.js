import express from "express";
import { calculateTrust } from "../utils/trustScore.js";

const router = express.Router();

/**
 * POST /calculate
 * Performs a high-fidelity trust calculation on a provided snapshot of data.
 * Used for "Global Audit" without persisting data.
 */
router.post("/", (req, res) => {
  const { transactions, incomes, activeDays, aa_data } = req.body;

  try {
    const result = calculateTrust(
      transactions || [], 
      incomes || [], 
      activeDays || [], 
      aa_data || null
    );
    
    res.json(result);
  } catch (error) {
    console.error("Scoring error:", error);
    res.status(500).json({ error: "Failed to compute Trust Score" });
  }
});

/**
 * POST /estimate
 * Fetches dynamic financial metadata based on platform and duration.
 */
router.post("/estimate", (req, res) => {
  const { platformId, duration } = req.body;
  
  // Custom calibration per duration
  const config = {
    12: { earnings: 420000, deliveries: 2100, rating: 4.8, activeDays: 24 },
    6: { earnings: 180000, deliveries: 950, rating: 4.6, activeDays: 22 },
    3: { earnings: 75000, deliveries: 400, rating: 4.2, activeDays: 18 }
  };

  const base = config[duration] || config[6];
  
  res.json({
    earnings: Math.round(base.earnings + (Math.random() * 10000)),
    deliveries: Math.round(base.deliveries + (Math.random() * 50)),
    rating: (base.rating + (Math.random() * 0.2)).toFixed(1),
    activeDays: Array(duration).fill(0).map(() => base.activeDays + Math.floor(Math.random() * 4))
  });
});

export default router;
