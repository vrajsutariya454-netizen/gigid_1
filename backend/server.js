import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/users.js";
import gigRoutes from "./routes/gigs.js";
import txnRoutes from "./routes/transactions.js";
import scoringRoutes from "./routes/scoring.js";
import authRoutes from "./routes/auth.js";
import { verifySignature } from "./utils/cryptoConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/users", userRoutes);
app.use("/gigs", gigRoutes);
app.use("/transactions", txnRoutes);
app.use("/calculate", scoringRoutes);
app.use("/api/auth", authRoutes);

app.post("/verify-signature", (req, res) => {
  const { data, signature, public_key } = req.body;
  if (!data || !signature || !public_key) {
    return res.status(400).json({ valid: false, error: "Missing parameters" });
  }
  
  try {
    const isValid = verifySignature(data, signature, public_key);
    res.json({ valid: isValid });
  } catch(e) {
    res.status(500).json({ valid: false, error: e.message });
  }
});

// Root
app.get("/", (req, res) => {
  res.json({ 
    message: "GigID Fintech-Grade Backend API",
    version: "1.0.0",
    status: "Active"
  });
});

app.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `--------------------------------------------------`);
  console.log(`\x1b[36m%s\x1b[0m`, `  GigID Trust Engine started on port ${PORT}`);
  console.log(`\x1b[36m%s\x1b[0m`, `  Ready for Fintech-Grade Financial Profiling`);
  console.log(`\x1b[36m%s\x1b[0m`, `--------------------------------------------------`);
});