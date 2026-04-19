"use client";

import { motion } from "framer-motion";

interface FactorBarsProps {
  data: {
    label: string;
    value: number; // 0 to 1
    weight: string;
    description: string;
  }[];
}

export function TrustFactorBars({ data }: FactorBarsProps) {
  return (
    <div className="space-y-6 py-4">
      {data.map((factor, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex justify-between items-end px-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] flex items-center gap-2">
                {factor.label}
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20 lowercase">
                  Weight: {factor.weight}
                </span>
              </span>
              <p className="text-[9px] text-[var(--text-tertiary)] opacity-60 font-medium mt-1 italic">
                {factor.description}
              </p>
            </div>
            <span className="text-sm font-black text-[var(--text-primary)]">
              {(factor.value * 100).toFixed(0)}%
            </span>
          </div>
          
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${factor.value * 100}%` }}
              transition={{ duration: 1, delay: idx * 0.1 }}
              className={`h-full relative ${
                factor.value > 0.8 ? "bg-accent" : factor.value > 0.5 ? "bg-primary" : "bg-red-500/50"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}
