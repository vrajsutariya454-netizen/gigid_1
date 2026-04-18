"use client";

import { useAppStore } from "@/lib/store/app-store";
import { useState } from "react";
import {
  Zap,
  Lock,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

// Bank List
const BANKS = [
  { id: "hdfc", name: "HDFC Bank", icon: "🏦" },
  { id: "icici", name: "ICICI Bank", icon: "🏛️" },
  { id: "axis", name: "Axis Bank", icon: "🏢" },
  { id: "sbi", name: "State Bank of India", icon: "🏦" },
  { id: "kotak", name: "Kotak Mahindra Bank", icon: "🏛️" },
  { id: "indusind", name: "IndusInd Bank", icon: "🏢" },
  { id: "yes", name: "Yes Bank", icon: "🏦" },
  { id: "idfc", name: "IDFC First Bank", icon: "🏛️" },
  { id: "bob", name: "Bank of Baroda", icon: "🏢" },
  { id: "pnb", name: "Punjab National Bank", icon: "🏦" },
];

export default function BankPage() {
  const { trustScore } = useAppStore();

  const [activeTab, setActiveTab] = useState<"direct" | "private">("direct");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    type: string;
    limit: number;
  } | null>(null);

  const handleProcess = async (type: "direct" | "private") => {
    setIsProcessing(true);
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    const multiplier = type === "direct" ? 1.2 : 0.9;
    const baseLimit = trustScore * 10000 * multiplier;

    setResult({
      type:
        type === "direct"
          ? "Direct Approval"
          : "Zero-Knowledge Approval",
      limit: baseLimit,
    });

    setIsProcessing(false);
  };

  return (
    <div className="page-content pb-24 max-w-2xl mx-auto px-4">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">
          GigID Banking
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-2">
          Instant financial services for gig workers
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--bg-card)] p-1.5 rounded-2xl mb-10 border border-[var(--border-color)]">
        <button
          onClick={() => {
            setActiveTab("direct");
            setResult(null);
          }}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "direct"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-[var(--text-tertiary)]"
          }`}
        >
          Direct Approval
        </button>
        <button
          onClick={() => {
            setActiveTab("private");
            setResult(null);
          }}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "private"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-[var(--text-tertiary)]"
          }`}
        >
          Invisible Approval (ZK)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isProcessing && !result ? (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {activeTab === "direct" ? (
              <>
                {/* Direct Card */}
                <div className="p-6 rounded-2xl bg-blue-500/5 border-blue-500/20 border-2">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-blue-500 text-white">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[var(--text-primary)]">
                        Instant Direct Credit
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        Share your raw work history and earnings directly with
                        partner banks for the highest possible loan limits.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank List */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest px-1">
                    Partner Banks
                  </h4>

                  <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3">
                    {BANKS.map((bank) => (
                      <div
                        key={bank.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-green-500/40 transition-all"
                      >
                        {/* LEFT: Bank Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-lg">
                            {bank.icon}
                          </div>
                          <span className="text-sm font-semibold text-[var(--text-primary)]">
                            {bank.name}
                          </span>
                        </div>

                        {/* RIGHT: Apply Button (fixed alignment) */}
                        <div className="pr-2">
                          <button
                            onClick={() => handleProcess("direct")}
                            className="px-4 py-2 rounded-lg bg-green-500 text-white 
                                       text-xs font-semibold shadow-md shadow-green-500/20 
                                       hover:bg-green-600 transition whitespace-nowrap"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ZK Card */}
                <div className="p-6 rounded-2xl bg-teal-500/5 border-teal-500/20 border-2">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-teal-500 text-white">
                      <Lock size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[var(--text-primary)]">
                        Zero-Knowledge Loan Proof
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        Authorize a loan without showing your data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Privacy Features */}
                <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                    <ShieldAlert size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Privacy Features
                    </span>
                  </div>

                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <CheckCircle2 size={14} className="text-teal-500" />
                      Hide platform names
                    </li>
                    <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <CheckCircle2 size={14} className="text-teal-500" />
                      Mask earnings
                    </li>
                    <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <CheckCircle2 size={14} className="text-teal-500" />
                      Only approval status shared
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleProcess("private")}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-sm shadow-xl active:scale-[0.98] transition-all"
                >
                  Generate Invisible Proof
                </button>
              </>
            )}
          </motion.div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full border-4 border-t-white border-white/10"
            />
            <p className="text-base font-black text-[var(--text-primary)] mt-8">
              Processing...
            </p>
          </div>
        ) : (
          <motion.div className="text-center">
            <CheckCircle2 size={50} className="text-teal-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white">
              Eligibility Confirmed
            </h2>

            <p className="mt-4 text-4xl font-black text-white">
              {formatCurrency(result.limit)}
            </p>

            <button
              onClick={() => setResult(null)}
              className="mt-8 px-6 py-3 bg-white text-black rounded-xl font-bold"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-14 p-5 rounded-2xl border border-[var(--border-color)] bg-black/20 flex items-start gap-4">
        <ShieldCheck size={18} className="text-blue-500" />
        <p className="text-[11px] text-[var(--text-tertiary)]">
          GigID is not a bank. We provide cryptographic proof of eligibility.
        </p>
      </div>
    </div>
  );
}