"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { useAppStore } from "@/lib/store/app-store";
import { useState } from "react";
import { Plus, LayoutTemplate, ShieldCheck, ChevronRight, Info, Clock } from "lucide-react";
import { ConnectPlatformDialog } from "@/components/platform/ConnectPlatformDialog";
import { formatCurrency } from "@/lib/utils";

export default function PlatformsPage() {
  const [showConnect, setShowConnect] = useState(false);
  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const connectedPlatforms = platforms.filter(p => p.connected);
  
  // Mock manual pending platforms
  const manualPlatforms = [
    { name: "Local Courier", status: "pending", date: "2026-04-18" }
  ];

  return (
    <div className="page-content pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Manage Platforms</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Connect your work history to build trust</p>
        </div>
        <button 
          onClick={() => setShowConnect(true)}
          className="p-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Connected Platforms */}
      <section className="mb-10">
        <h2 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-4 ml-1">
          Active Connections ({connectedPlatforms.length})
        </h2>
        
        {connectedPlatforms.length === 0 ? (
          <div className="card p-10 text-center bg-blue-500/5 border-dashed border-2 border-blue-500/20">
            <LayoutTemplate size={40} className="mx-auto text-blue-500/30 mb-4" />
            <p className="text-sm font-bold text-[var(--text-secondary)]">No platforms linked yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {connectedPlatforms.map((platform) => (
              <div key={platform.id} className="card p-4 flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-color)] group">
                <div className="text-3xl bg-[var(--bg-primary)] p-2 rounded-xl border border-[var(--border-color)]">
                  {platform.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{platform.name}</h3>
                  <div className="flex gap-3 text-[10px] text-[var(--text-tertiary)] mt-0.5 font-bold uppercase tracking-wider">
                    <span className="text-teal-500">⭐ {platform.avgRating?.toFixed(1)}</span>
                    <span>💰 {formatCurrency(platform.totalEarnings || 0)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-500 text-[10px] font-bold">API ACTIVE</div>
                   <ChevronRight size={16} className="text-[var(--text-tertiary)] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Manual Verifications */}
      <section>
        <h2 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-4 ml-1">
          Manual Verifications
        </h2>
        <div className="flex flex-col gap-3">
          {manualPlatforms.map((mp) => (
            <div key={mp.name} className="card p-4 flex items-center gap-4 bg-amber-500/5 border border-amber-500/20">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{mp.name}</h3>
                <p className="text-[10px] text-amber-500/70 font-bold uppercase mt-0.5">Under Review (Screenshot Proof)</p>
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
                {mp.date}
              </div>
            </div>
          ))}
          
          <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] flex items-start gap-3 opacity-60">
            <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Manual verifications can take 24-48 hours. Please ensure your screenshots clearly show your profile name and delivery statistics.
            </p>
          </div>
        </div>
      </section>

      <ConnectPlatformDialog 
        open={showConnect} 
        onClose={() => setShowConnect(false)} 
        onConnected={() => setShowConnect(false)} 
      />
    </div>
  );
}
