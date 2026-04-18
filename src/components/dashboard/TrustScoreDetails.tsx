"use client";

import { ScoreBreakdown, getInterpretation } from "@/lib/scoring/trust-score";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Calendar, Zap, Award, Landmark, CheckCircle2, Waves, HeartPulse } from "lucide-react";

interface TrustScoreDetailsProps {
  breakdown: ScoreBreakdown;
}

export function TrustScoreDetails({ breakdown }: TrustScoreDetailsProps) {
  const interpretation = getInterpretation(breakdown.finalScore);

  const coreMetrics = [
    { label: "Stability", value: breakdown.stability, icon: TrendingUp, color: "var(--primary-400)", desc: "Income variance" },
    { label: "Capacity", value: breakdown.earnings, icon: Zap, color: "var(--warning-400)", desc: "Market benchmark" },
    { label: "Consistency", value: breakdown.consistency, icon: Calendar, color: "var(--success-400)", desc: "Work day pattern" },
    { label: "Regularity", value: breakdown.regularity, icon: Award, color: "var(--primary-600)", desc: "Transaction cadence" },
  ];

  const aaMetrics = [
    { label: "Verification Ratio", value: breakdown.aaDetails.verifiedIncomeRatio, icon: CheckCircle2, color: "var(--success-500)", desc: "Income verified via AA" },
    { label: "Cash Flow Health", value: breakdown.aaDetails.cashFlowConsistency, icon: Waves, color: "var(--primary-400)", desc: "Bank inflow stability" },
    { label: "Balance Health", value: breakdown.aaDetails.balanceHealth, icon: HeartPulse, color: "var(--success-600)", desc: "Balance vs Expenses" },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Risk Badge */}
      <div className="flex items-center justify-between px-4">
        <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Risk Assessment</span>
        <div 
          className="px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-lg"
          style={{ 
            backgroundColor: `${interpretation.color}15`, 
            borderColor: `${interpretation.color}30`,
            color: interpretation.color 
          }}
        >
          {interpretation.label}
        </div>
      </div>

      {/* Core Score Section */}
      <section className="space-y-4">
        <h3 className="px-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-2">
          <Zap size={14} /> Core Behavioral Metrics
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {coreMetrics.map((m, i) => (
            <MetricCard key={m.label} m={m} index={i} />
          ))}
        </div>
      </section>

      {/* AA Verified Section */}
      <section className="space-y-4">
        <h3 className="px-4 text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <Landmark size={14} /> Financial Reliability (AA Verified)
        </h3>
        <div className="p-1.5 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-2">
          {aaMetrics.map((m, i) => (
            <MetricCard key={m.label} m={m} index={i + 4} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ m, index }: { m: any, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className="card p-4 bg-[var(--bg-elevated)] border-white/5 rounded-2xl flex flex-col gap-3 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${m.color}15`, color: m.color }}
          >
            <m.icon size={16} />
          </div>
          <div>
            <h4 className="text-[13px] font-black text-[var(--text-primary)]">{m.label}</h4>
            <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-tighter">{m.desc}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-[var(--text-primary)]">{Math.round(m.value * 100)}%</span>
        </div>
      </div>

      <div className="w-full h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${m.value * 100}%` }}
          transition={{ duration: 1.2, delay: 0.3 + (0.05 * index), ease: "circOut" }}
          className="h-full rounded-full"
          style={{ 
            backgroundColor: m.color,
            boxShadow: `0 0 10px ${m.color}40`
          }}
        />
      </div>
    </motion.div>
  );
}
