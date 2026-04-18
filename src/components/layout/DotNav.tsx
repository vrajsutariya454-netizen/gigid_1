"use client";

import { motion } from "framer-motion";

interface DotNavProps {
  activeIndex: number;
  onDotClick: (index: number) => void;
  count?: number;
}

export function DotNav({ activeIndex, onDotClick, count = 3 }: DotNavProps) {
  return (
    <div 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 px-6 py-3 rounded-full backdrop-blur-xl border border-white/5 shadow-2xl"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.4)" }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          className="relative group p-2 outline-none"
          aria-label={`Go to slide ${i + 1}`}
        >
          {/* Outer glow ring (only for active) */}
          {activeIndex === i && (
            <motion.div
              layoutId="dot-glow"
              className="absolute inset-0 rounded-full bg-blue-500/20 blur-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}

          {/* The Dot */}
          <motion.div
            animate={{
              width: activeIndex === i ? 24 : 8,
              height: 8,
              backgroundColor: activeIndex === i ? "var(--primary-400)" : "var(--text-tertiary)",
              opacity: activeIndex === i ? 1 : 0.4,
            }}
            className="rounded-full relative z-10"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          {/* Hover effect */}
          <div className="absolute inset-0 scale-0 group-hover:scale-110 transition-transform duration-200">
             <div className="w-full h-full rounded-full bg-white/5" />
          </div>
        </button>
      ))}
    </div>
  );
}
