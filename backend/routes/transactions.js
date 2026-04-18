import express from "express";
import { v4 as uuidv4 } from "uuid";
import { transactions, users } from "../data/storage.js";
import { SOURCE_CONFIG } from "../config/sourceConfig.js";

const router = express.Router();

// Add Transaction with Source Attribution
router.post("/", (req, res) => {
  const { user_id, gig_id, amount, date, source } = req.body;
  
  const userExists = users.find(u => u.user_id === user_id);
  if (!userExists) return res.status(404).json({ error: "User not found" });

  const config = SOURCE_CONFIG[source];
  if (!config) return res.status(400).json({ error: "Invalid source. Check sourceConfig.js" });

  const newTxn = {
    txn_id: uuidv4(),
    user_id,
    gig_id,
    amount,
    date: date || new Date(),
    source, // e.g. uber_api, aa_bank
    source_type: config.type,
    verification_level: config.verification
  };

  transactions.push(newTxn);
  res.status(201).json(newTxn);
});

export default router;
