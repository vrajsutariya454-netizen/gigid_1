import express from "express";

const router = express.Router();

// In-memory OTP store (keyed by aadhaar number, expires in 5 minutes)
const otpStore = new Map();

/**
 * POST /kyc/send-otp
 * Simulates sending an OTP to the mobile linked with the Aadhaar number.
 * In production: call UIDAI/AuthBridge/Digio API here.
 */
router.post("/send-otp", (req, res) => {
  const { aadhaar } = req.body;

  if (!aadhaar || aadhaar.replace(/\s/g, "").length !== 12) {
    return res.status(400).json({ success: false, error: "Invalid Aadhaar number" });
  }

  const cleanAadhaar = aadhaar.replace(/\s/g, "");

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(cleanAadhaar, { otp, expiresAt, attempts: 0 });

  // In production, send via SMS gateway. For demo: log to console.
  console.log(`\x1b[33m%s\x1b[0m`, `[KYC OTP] Aadhaar: ${cleanAadhaar.slice(0, 4)}XXXX${cleanAadhaar.slice(-4)} → OTP: ${otp}`);

  // Mask the last 4 digits of aadhaar for the response
  const maskedMobile = `+91 XXXXX-XX${cleanAadhaar.slice(-3)}`; // Simulate mobile derived from aadhaar

  res.json({
    success: true,
    message: "OTP sent to registered mobile number",
    maskedMobile,
    // DEMO ONLY: return OTP so user can see it without SMS integration
    demoOtp: otp
  });
});

/**
 * POST /kyc/verify-otp
 * Verifies the OTP entered by the user.
 */
router.post("/verify-otp", (req, res) => {
  const { aadhaar, otp } = req.body;

  if (!aadhaar || !otp) {
    return res.status(400).json({ success: false, error: "Missing parameters" });
  }

  const cleanAadhaar = aadhaar.replace(/\s/g, "");
  const record = otpStore.get(cleanAadhaar);

  if (!record) {
    return res.status(400).json({ success: false, error: "OTP not found. Please request a new one." });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanAadhaar);
    return res.status(400).json({ success: false, error: "OTP expired. Please request a new one." });
  }

  if (record.attempts >= 3) {
    otpStore.delete(cleanAadhaar);
    return res.status(429).json({ success: false, error: "Too many attempts. Please request a new OTP." });
  }

  if (record.otp !== otp) {
    otpStore.set(cleanAadhaar, { ...record, attempts: record.attempts + 1 });
    return res.status(400).json({
      success: false,
      error: "Invalid OTP",
      attemptsLeft: 3 - (record.attempts + 1)
    });
  }

  // ✅ OTP verified
  otpStore.delete(cleanAadhaar);

  res.json({
    success: true,
    verified: true,
    message: "Aadhaar verified successfully",
    aadhaarVerified: true
  });
});

export default router;
