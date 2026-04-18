"use client";

import { useAppStore } from "@/lib/store/app-store";
import { useState } from "react";
import { 
  Landmark, ShieldCheck, Zap, Lock, 
  ChevronRight, CheckCircle2, AlertCircle,
  FileText, ShieldAlert, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export default function BankPage() {
  const { name, trustScore, connectedPlatforms } = useAppStore();
  const [activeTab, setActiveTab] = useState<"direct" | "private">("direct");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ type: string; limit: number } | null>(null);

  const handleProcess = async (type: "direct" | "private") => {
    setIsProcessing(true);
    setResult(null);
    // Simulate complex calculation/ZK generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock logic based on trust score
    const baseLimit = trustScore * 10000;
    setResult({ 
      type: type === "direct" ? "Direct Approval" : "Zero-Knowledge Approval", 
      limit: baseLimit 
    });
    setIsProcessing(false);
  };

  return (
    <div className="page-content pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">GigID Banking</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Instant financial services for gig workers</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--bg-card)] p-1 rounded-2xl mb-8 border border-[var(--border-color)]">
        <button 
          onClick={() => { setActiveTab("direct"); setResult(null); }}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "direct" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-[var(--text-tertiary)]"
          }`}
        >
          Direct Approval
        </button>
        <button 
          onClick={() => { setActiveTab("private"); setResult(null); }}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "private" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-[var(--text-tertiary)]"
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
                <div className="card p-6 bg-blue-500/5 border-blue-500/20 border-2">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-blue-500 text-white">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[var(--text-primary)]">Instant Direct Credit</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        Share your raw work history and earnings directly with partner banks for the highest possible loan limits.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Partner Banks</h4>
                  {[
                    { id: "hdfc", name: "HDFC Bank", logo: "🏦" },
                    { id: "icici", name: "ICICI Bank", logo: "🏛️" },
                    { id: "axis", name: "Axis Bank", logo: "🏢" }
                  ].map((bank) => (
                    <div key={bank.id} className="card p-4 flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-color)]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{bank.logo}</span>
                        <span className="text-sm font-bold text-[var(--text-primary)]">{bank.name}</span>
                      </div>
                      <button 
                        onClick={() => handleProcess("direct")}
                        className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20"
                      >
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="card p-6 bg-teal-500/5 border-teal-500/20 border-2">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-teal-500 text-white">
                      <Lock size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[var(--text-primary)]">Zero-Knowledge Loan Proof</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        Authorize a loan without showing your data. Banks only see a "Proof of Eligibility" certificate. Your raw earnings stay on your device.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                      <ShieldAlert size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Privacy Features</span>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 size={14} className="text-teal-500" />
                        Hide individual platform names
                      </li>
                      <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 size={14} className="text-teal-500" />
                        Mask exact daily earnings
                      </li>
                      <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 size={14} className="text-teal-500" />
                        Reveal only "Approved/Denied" status
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => handleProcess("private")}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-teal-500/20 active:scale-[0.98] transition-all"
                  >
                    Generate Invisible Proof
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-4 border-t-white border-white/10"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {activeTab === "direct" ? <Zap size={32} className="text-blue-500" /> : <Sparkles size={32} className="text-teal-500" />}
              </div>
            </div>
            <p className="text-base font-black text-[var(--text-primary)] mt-8">
              {activeTab === "direct" ? "Verifying Financial Data..." : "Generating ZK Proof..."}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              Please do not close the app
            </p>
          </div>
        ) : result ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full bg-teal-500/10 border-4 border-teal-500 flex items-center justify-center text-teal-500 mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] text-center">Eligibility Confirmed!</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 text-center">Based on your {result.type}</p>
            
            <div className="w-full mt-10 p-8 rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-white/10 relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full" />

               <div className="relative z-10 text-center">
                  <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] mb-4">Maximum Loan Limit</p>
                  <h3 className="text-5xl font-black text-white tracking-tight">
                    {formatCurrency(result.limit)}
                  </h3>
                  <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                       <span className="text-[10px] font-bold text-gray-400 uppercase">Approval Speed</span>
                       <span className="text-[10px] font-black text-teal-400 uppercase">Instant 🚀</span>
                    </div>
                    <button 
                      onClick={() => setResult(null)}
                      className="w-full py-4 rounded-xl bg-white text-black font-black uppercase text-xs tracking-widest"
                    >
                      Finish Application
                    </button>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Info Notice */}
      <div className="mt-12 p-4 rounded-2xl border border-[var(--border-color)] bg-black/20 flex items-start gap-4">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
          <ShieldCheck size={18} />
        </div>
        <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
          GigID is not a bank. We provide cryptographic proof of eligibility to financial institutions. All data remains encrypted on your device.
        </p>
      </div>
    </div>
  );
}
