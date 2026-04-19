"use client";

import { motion } from "framer-motion";

interface SimpleLineChartProps {
  data: number[];
  height?: number;
  color?: string;
  label?: string;
}

export function SimpleLineChart({ 
  data, 
  height = 80, 
  color = "var(--color-primary)", 
  label 
}: SimpleLineChartProps) {
  if (data.length < 2) return null;

  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - minVal) / (range || 1)) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-end mb-4">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
          <span className="text-xs font-black text-foreground">₹{Math.round(data[data.length - 1]).toLocaleString()}</span>
        </div>
      )}
      <div style={{ height }} className="w-full relative px-2">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Area Fill */}
          <motion.polygon
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1 }}
            points={`0,100 ${points} 100,100`}
            fill={color}
          />
          {/* Main Line */}
          <motion.polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          {/* Data Points */}
          {data.map((val, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((val - minVal) / (range || 1)) * 100;
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="white"
                stroke={color}
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + (i * 0.1) }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
