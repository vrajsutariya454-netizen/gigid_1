import express from "express";
import cors from "cors";
import userRoutes from "./routes/users.js";
import gigRoutes from "./routes/gigs.js";
import txnRoutes from "./routes/transactions.js";
import scoringRoutes from "./routes/scoring.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/gigs", gigRoutes);
app.use("/transactions", txnRoutes);
app.use("/calculate", scoringRoutes);

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