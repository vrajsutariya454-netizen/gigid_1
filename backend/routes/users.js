import express from "express";
import { v4 as uuidv4 } from "uuid";
import { users, transactions } from "../data/storage.js";
import { calculateTrust } from "../utils/trustScore.js";

const router = express.Router();

// Create User
router.post("/", (req, res) => {
  const { name, aa_data } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const newUser = {
    user_id: uuidv4(),
    name,
    aa_data: aa_data || null, // Optional AA data
    created_at: new Date()
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// Get User Profile + Structured Score
router.get("/:id", (req, res) => {
  const user = users.find(u => u.user_id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const userTxns = transactions.filter(t => t.user_id === user.user_id);
  
  // High-fidelity Mock historical data for calculation
  const monthlyIncomes = [42000, 45000, 43000, 44000, 43500, 46000];
  const activeDays = [26, 27, 25, 26, 27, 28];

  const scoringResult = calculateTrust(userTxns, monthlyIncomes, activeDays, user.aa_data);

  res.json({
    user,
    transactions: userTxns,
    ...scoringResult
  });
});

export default router;