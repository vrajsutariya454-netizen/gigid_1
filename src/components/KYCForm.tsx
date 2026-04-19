"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Loader2, CheckCircle2, IdCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface KYCFormProps {
  onSuccess: () => void;
}

export const KYCForm = ({ onSuccess }: KYCFormProps) => {
  const [panNumber, setPanNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleVerify = async () => {
    if (!panNumber || panNumber.length < 10) {
      setErrorMessage("Please enter a valid 10-digit PAN");
      setStatus("failed");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panNumber: panNumber.toUpperCase() }),
      });

      const data = await response.json();

      if (data.verified) {
        setStatus("success");
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setStatus("failed");
        setErrorMessage(data.error || "Verification failed. Please check your PAN.");
      }
    } catch (error) {
      setStatus("failed");
      setErrorMessage("Service unavailable. Try again later.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="noise glass-card p-10 rounded-[3rem] border-primary/20 bg-primary/5 shadow-2xl overflow-hidden relative"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] glass border-primary/20 bg-primary/5 flex items-center justify-center text-primary shadow-xl">
            <IdCard size={36} strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl tracking-tight text-foreground">Identity Verification</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              Secure PAN verification via Signzy Protocol
            </p>
          </div>

          <div className="w-full space-y-4 mt-4">
            <div className="relative group">
              <input
                type="text"
                maxLength={10}
                placeholder="ENTER PAN NUMBER"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                disabled={status === "loading" || status === "success"}
                className="w-full h-16 px-6 rounded-2xl glass bg-muted/20 border-border text-center font-black tracking-[0.3em] outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all disabled:opacity-50"
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-20 group-focus-within:opacity-100 transition-opacity">
                 {status === "success" && <CheckCircle2 className="text-emerald-500" size={20} />}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {status === "failed" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-wider"
                >
                  <ShieldAlert size={14} />
                  {errorMessage}
                </motion.div>
              )}
              
              {status === "success" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center justify-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-wider"
                >
                  <ShieldCheck size={14} />
                  KYC Verified ✅
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleVerify}
              disabled={status === "loading" || status === "success" || panNumber.length < 10}
              className={`w-full h-16 rounded-[1.25rem] font-black uppercase tracking-widest text-[11px] shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 disabled:hover:scale-100
                ${status === "success" 
                  ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                  : "bg-primary text-white shadow-primary/20 hover:scale-[1.02]"
                }
              `}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Authenticating...
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle2 size={18} />
                  Access Granted
                </>
              ) : (
                <>
                  Verify KYC
                </>
              )}
            </button>
          </div>

          <p className="text-[9px] text-muted-foreground leading-relaxed max-w-[240px] mt-2">
            By verifying, you consent to secure data retrieval for institutional credit assessment.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
