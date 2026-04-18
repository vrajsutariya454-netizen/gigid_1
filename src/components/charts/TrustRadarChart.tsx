"use client";

import { motion } from "framer-motion";

interface RadarChartProps {
  data: {
    label: string;
    value: number; // 0 to 1
    weight: string;
  }[];
  size?: number;
}

export function TrustRadarChart({ data, size = 300 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.7; // Leave room for labels
  const totalPoints = data.length;

  // Helper to get coordinates
  const getCoordinates = (index: number, val: number) => {
    const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2;
    return {
      x: center + radius * val * Math.cos(angle),
      y: center + radius * val * Math.sin(angle),
    };
  };

  // Generate the polygon points for the data
  const dataPoints = data.map((d, i) => {
    const coords = getCoordinates(i, d.value);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  // Generate the background web (rings)
  const rings = [0.25, 0.5, 0.75, 1].map((lvl, rIdx) => {
    return (
      <polygon
        key={`ring-${rIdx}`}
        points={data.map((_, i) => {
          const coords = getCoordinates(i, lvl);
          return `${coords.x},${coords.y}`;
        }).join(" ")}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
      />
    );
  });

  // Generate axis lines
  const axes = data.map((d, i) => {
    const end = getCoordinates(i, 1);
    const labelPos = getCoordinates(i, 1.2);
    return (
      <g key={`axis-${i}`}>
        <line
          x1={center}
          y1={center}
          x2={end.x}
          y2={end.y}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
        <text
          x={labelPos.x}
          y={labelPos.y}
          textAnchor="middle"
          className="fill-[var(--text-tertiary)] font-black uppercase tracking-[0.1em]"
          style={{ fontSize: "8px" }}
        >
          {d.label}
        </text>
        <text
          x={labelPos.x}
          y={labelPos.y + 10}
          textAnchor="middle"
          className="fill-blue-500 font-bold"
          style={{ fontSize: "7px" }}
        >
          {d.weight}
        </text>
      </g>
    );
  });

  return (
    <div className="flex items-center justify-center py-4">
      <svg width={size} height={size} className="overflow-visible">
        {/* Web */}
        {rings}
        {axes}
        
        {/* Data Shape */}
        <motion.polygon
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          points={dataPoints}
          fill="rgba(59, 130, 246, 0.25)"
          stroke="rgba(59, 130, 246, 1)"
          strokeWidth="2"
          className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        />

        {/* Center Point */}
        <circle cx={center} cy={center} r="3" fill="var(--text-primary)" />
      </svg>
    </div>
  );
}
