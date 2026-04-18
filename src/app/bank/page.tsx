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
    <div className="page-content flex flex-col gap-10 pb-32">
      
      {/* Header */}
      <div className="text-left px-2">
        <h1 className="text-4xl font-black text-[var(--text-primary)] leading-tight">
          GigID Banking
        </h1>
        <p className="text-base font-bold text-[var(--text-tertiary)] mt-3">
          Direct approval and private loans based on your work record.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--bg-secondary)] p-2 rounded-[28px]">
        <button
          onClick={() => {
            setActiveTab("direct");
            setResult(null);
          }}
          className={`flex-1 py-4 rounded-[22px] text-sm font-black transition-all duration-300 ${
            activeTab === "direct"
              ? "text-white shadow-xl"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
          style={activeTab === "direct" ? { 
            background: "linear-gradient(135deg, var(--primary-600), var(--primary-400))",
            boxShadow: "0 10px 20px -5px rgba(59, 130, 246, 0.4)"
          } : {}}
        >
          Direct Approval
        </button>
        <button
          onClick={() => {
            setActiveTab("private");
            setResult(null);
          }}
          className={`flex-1 py-4 rounded-[22px] text-sm font-black transition-all duration-300 ${
            activeTab === "private"
              ? "text-white shadow-xl"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
          style={activeTab === "private" ? { 
            background: "linear-gradient(135deg, var(--primary-600), var(--primary-400))",
            boxShadow: "0 10px 20px -5px rgba(59, 130, 246, 0.4)"
          } : {}}
        >
          Zero-Knowledge (ZK)
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
              <div className="flex flex-col gap-10">
                {/* Direct Card */}
                <div 
                  className="p-8 rounded-[32px] transition-all"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <div className="flex items-start gap-6">
                    <div 
                      className="p-4 rounded-2xl text-white shadow-lg"
                      style={{ background: "linear-gradient(135deg, var(--primary-600), var(--primary-400))" }}
                    >
                      <Zap size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[var(--text-primary)]">
                        High-Limit Direct Credit
                      </h3>
                      <p className="text-sm font-bold text-[var(--text-secondary)] mt-2 leading-relaxed">
                        Maximize your loan eligibility by sharing your full verified history directly with our financial partners.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank List */}
                <div className="flex flex-col gap-5">
                  <h4 className="text-[11px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] px-2 mb-2">
                    Partner Banks (10)
                  </h4>

                  <div className="flex flex-col gap-4">
                    {BANKS.map((bank) => (
                      <div
                        key={bank.id}
                        className="relative p-6 rounded-3xl bg-[var(--bg-elevated)] border-0 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[var(--bg-secondary)] text-2xl shrink-0">
                              {bank.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-base font-black text-[var(--text-primary)]">
                                {bank.name}
                              </span>
                              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">
                                Instant Partner
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleProcess("direct")}
                            className="px-6 py-2.5 rounded-xl font-black text-xs text-white shadow-lg active:scale-95 transition-all shrink-0"
                            style={{ 
                              background: "linear-gradient(135deg, var(--primary-600), var(--primary-400))",
                              boxShadow: "0 8px 20px -6px rgba(59, 130, 246, 0.4)"
                            }}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {/* ZK Card */}
                <div 
                  className="p-8 rounded-[32px]"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <div className="flex items-start gap-6">
                    <div 
                      className="p-4 rounded-2xl text-white shadow-lg"
                      style={{ background: "linear-gradient(135deg, var(--success-500), var(--success-600))" }}
                    >
                      <Lock size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[var(--text-primary)]">
                        Invisible Loan Proof (ZK)
                      </h3>
                      <p className="text-sm font-bold text-[var(--text-secondary)] mt-2 leading-relaxed">
                        Prove your creditworthiness cryptographically without ever revealing your private work data or wallet balance.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Privacy Features */}
                <div 
                  className="p-8 rounded-[32px] flex flex-col gap-6"
                  style={{ backgroundColor: "var(--bg-elevated)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
                      <ShieldAlert size={20} />
                    </div>
                    <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">
                      Enterprise Privacy Protection
                    </span>
                  </div>

                  <ul className="flex flex-col gap-4">
                    <li className="flex items-center gap-4 text-base font-bold text-[var(--text-secondary)]">
                      <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-teal-500" />
                      </div>
                      Anonymized platform origins
                    </li>
                    <li className="flex items-center gap-4 text-base font-bold text-[var(--text-secondary)]">
                      <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-teal-500" />
                      </div>
                      Masked single-transaction earnings
                    </li>
                    <li className="flex items-center gap-4 text-base font-bold text-[var(--text-secondary)]">
                      <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-teal-500" />
                      </div>
                      Approval-only data packets
                    </li>
                  </ul>
                </div>

                <div className="px-2">
                  <button
                    onClick={() => handleProcess("private")}
                    className="w-full py-5 rounded-[22px] text-white font-black text-lg shadow-2xl active:scale-[0.98] transition-all"
                    style={{ 
                      background: "linear-gradient(135deg, var(--success-600), var(--success-500))",
                      boxShadow: "0 15px 35px -10px rgba(20, 184, 166, 0.4)"
                    }}
                  >
                    Generate Private Proof
                  </button>
                </div>
              </div>
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
              {formatCurrency(result?.limit || 0)}
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
      <div 
        className="p-8 rounded-[32px] flex items-start gap-6 transition-all"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
          <ShieldCheck size={24} />
        </div>
        <p className="text-sm font-medium text-[var(--text-secondary)] leading-loose">
          <span className="font-black text-[var(--text-primary)] block mb-1">Cryptographic Security</span>
          GigID acts as a verification layer, not a lender. All proofs are generated locally on your device using zero-knowledge protocols.
        </p>
      </div>
    </div>
  );
}