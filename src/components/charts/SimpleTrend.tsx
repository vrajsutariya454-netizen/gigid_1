"use client";

import { motion } from "framer-motion";

interface SimpleTrendProps {
  data: number[];
  height?: number;
  color?: string;
  label?: string;
  max?: number;
}

export function SimpleTrend({ 
  data, 
  height = 60, 
  color = "var(--primary-400)", 
  label,
  max: customMax
}: SimpleTrendProps) {
  const maxVal = customMax || Math.max(...data, 1);
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{label}</span>
          <span className="text-[10px] font-bold text-[var(--text-primary)]">{Math.round(data[data.length - 1]).toLocaleString()}</span>
        </div>
      )}
      <div 
        className="flex items-end gap-1.5 w-full"
        style={{ height }}
      >
        {data.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(val / maxVal) * 100}%` }}
              transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
              className="w-full rounded-t-sm relative"
              style={{ backgroundColor: color }}
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[8px] font-bold px-1.5 py-0.5 rounded border border-[var(--border-color)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                {Math.round(val).toLocaleString()}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
