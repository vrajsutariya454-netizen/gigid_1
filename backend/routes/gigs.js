import express from "express";
import { v4 as uuidv4 } from "uuid";
import { gigs, users } from "../data/storage.js";

const router = express.Router();

// Connect Platform
router.post("/", (req, res) => {
  const { user_id, platform, connection_type } = req.body;
  
  const userExists = users.find(u => u.user_id === user_id);
  if (!userExists) return res.status(404).json({ error: "User not found" });

  const newGig = {
    gig_id: uuidv4(),
    user_id,
    platform,
    connection_type, // api, aa, manual, upload
    connected_at: new Date()
  };

  gigs.push(newGig);
  res.status(201).json(newGig);
});

// Get User Gigs
router.get("/user/:userId", (req, res) => {
  const userGigs = gigs.filter(g => g.user_id === req.params.userId);
  res.json(userGigs);
});

export default router;
