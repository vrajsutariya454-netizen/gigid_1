import express from "express";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";
import { gigs, users } from "../data/storage.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

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

// Upload Document endpoint
router.post("/:gigId/documents", upload.array("screenshots"), (req, res) => {
  const { gigId } = req.params;
  
  const gigIndex = gigs.findIndex(g => g.gig_id === gigId);
  if (gigIndex === -1) return res.status(404).json({ error: "Gig not found" });

  if (!gigs[gigIndex].documents) {
    gigs[gigIndex].documents = [];
  }

  const newDocs = req.files.map(file => ({
    id: uuidv4(),
    gig_id: gigId,
    type: "earnings_proof",
    file_url: `/uploads/${file.filename}`,
    source: "screenshot",
    verification: "pending",
    uploaded_at: new Date()
  }));

  gigs[gigIndex].documents.push(...newDocs);

  // Simulate AI Verification asynchronously (verifies after 5 seconds)
  setTimeout(() => {
    newDocs.forEach(doc => doc.verification = "verified");
    console.log(`[AI Verification] Verified documents for gig ${gigId}`);
  }, 5000);

  res.status(201).json({ 
    message: "Documents uploaded successfully", 
    documents: newDocs 
  });
});

export default router;
