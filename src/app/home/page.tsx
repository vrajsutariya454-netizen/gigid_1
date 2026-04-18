"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, ShieldCheck, History, Landmark, Loader2, XCircle, Database, Search, CheckCircle2, AlertTriangle, ArrowRight, BarChart3, Activity } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { TrustScore } from "@/components/dashboard/TrustScore";
import { ConnectPlatformDialog } from "@/components/platform/ConnectPlatformDialog";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { getLiveTrustScore } from "@/lib/scoring/data-bridge";
import { performGlobalTrustAudit } from "@/lib/services/backend-api";
import { TrustRadarChart } from "@/components/charts/TrustRadarChart";
import { TrustFactorBars } from "@/components/charts/TrustFactorBars";
import { motion, AnimatePresence } from "framer-motion";
import { generateMockHistory } from "@/lib/scoring/mock-service";

export default function DashboardPage() {
  const router = useRouter();
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const setGlobalTrustScore = useAppStore((s) => s.setTrustScore);
  
  const [showConnect, setShowConnect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scoreData, setScoreData] = useState<any>(null);
  
  // View States
  const [viewMode, setViewMode] = useState<"bars" | "radar">("bars");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const connectedPlatforms = useMemo(() => platforms.filter((p) => p.connected), [platforms]);

  const disconnectPlatform = async (id: number) => {
    if (confirm("Remove this platform? All synced history and credentials will be permanently deleted.")) {
      const platform = platforms.find(p => p.id === id);
      if (platform) {
        setIsLoading(true);
        // Delete work records by instanceId (multi-instance aware)
        await db.workRecords.where("instanceId").equals(id).delete();
        // Also clean up any legacy records by platformId
        await db.workRecords.where("platformId").equals(platform.platformId.toLowerCase()).delete();
        await db.credentials.where("credentialSubject.platform").equals(platform.name).delete();
        // Fully remove the platform entry
        await db.platforms.delete(id);
        setIsLoading(false);
      }
    }
  };

  const refreshScore = async () => {
    if (connectedPlatforms.length === 0) {
      setScoreData(null);
      setGlobalTrustScore(0);
      return;
    }
    
    setIsRefreshing(true);
    try {
      const result = await performGlobalTrustAudit();
      setScoreData(result);
      setGlobalTrustScore(result.trustScore);
    } catch (err) {
      console.warn("Backend audit failed - falling back to local estimation");
      const local = await getLiveTrustScore();
      setScoreData({
        trustScore: local.finalScore,
        breakdown: {
          S: local.stability.toFixed(3),
          E: local.earnings.toFixed(3),
          C: local.consistency.toFixed(3),
          Rt: local.regularity.toFixed(3),
          Rs: local.reliability.toFixed(3),
          AA: { Raa: local.aaScore.toFixed(3) }
        }
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await refreshScore();
      setIsLoading(false);
    }
    loadData();
  }, [connectedPlatforms.length]);

  const factorsData = useMemo(() => {
    if (!scoreData) return [];
    const b = scoreData.breakdown;
    return [
      { 
        label: "Stability", 
        value: parseFloat(b.S), 
        weight: "30%", 
        description: "Consistency of monthly income variance" 
      },
      { 
        label: "Capacity", 
        value: parseFloat(b.E), 
        weight: "25%", 
        description: "Aggregated monthly average vs. local reference" 
      },
      { 
        label: "Consistency", 
        value: parseFloat(b.C), 
        weight: "25%", 
        description: "Active work days and volume over time" 
      },
      { 
        label: "Regularity", 
        value: parseFloat(b.Rt), 
        weight: "20%", 
        description: "Transaction frequency and interval health" 
      },
      { 
        label: "Reliability", 
        value: parseFloat(b.Rs) * parseFloat(b.AA.Raa), 
        weight: "Multiplier", 
        description: "Verification level of data sources (AA + API)" 
      },
    ];
  }, [scoreData]);

  if (!hasCompletedOnboarding) return null;

  return (
    <div className="page-content flex flex-col gap-10 pb-32">
      {/* Header + Score */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center py-6 relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 blur-[120px] pointer-events-none" />
        
        {isLoading ? (
          <div className="h-[240px] flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={48} />
          </div>
        ) : (
          <TrustScore score={scoreData?.trustScore || 0} size={240} />
        )}
      </motion.div>

      {/* NEW: TRUST FACTOR ENGINE */}
      <section className="card p-8 bg-[var(--bg-elevated)] border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={12} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Scoring Algorithm v2.0</span>
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Trust Factor Engine</h2>
          </div>

          <div className="flex bg-black/40 p-1.5 rounded-2xl gap-1">
            <button 
              onClick={() => setViewMode("bars")}
              className={`p-2.5 rounded-xl transition-all ${viewMode === "bars" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-[var(--text-tertiary)] hover:text-white"}`}
            >
              <BarChart3 size={18} />
            </button>
            <button 
              onClick={() => setViewMode("radar")}
              className={`p-2.5 rounded-xl transition-all ${viewMode === "radar" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-[var(--text-tertiary)] hover:text-white"}`}
            >
              <Activity size={18} />
            </button>
          </div>
        </div>

        {scoreData && connectedPlatforms.length > 0 ? (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {viewMode === "bars" ? (
              <TrustFactorBars data={factorsData} />
            ) : (
              <TrustRadarChart data={factorsData.map(f => ({ label: f.label, value: f.value, weight: f.weight }))} />
            )}
            
            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Data Syncing Via</span>
                <span className="text-xs font-bold text-teal-500 flex items-center gap-1.5 mt-0.5">
                  <Landmark size={12} /> Account Aggregator Verified
                </span>
              </div>
              <button 
                onClick={refreshScore}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 text-xs font-black uppercase tracking-widest transition-all active:scale-95"
              >
                {isRefreshing ? <Loader2 size={14} className="animate-spin" /> : <History size={14} />}
                Re-Audit
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="py-20 flex items-center justify-center flex-col gap-5 text-center px-10 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02]">
             <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/20">
               <Database size={32} />
             </div>
             <div>
               <p className="text-sm font-black text-[var(--text-primary)] mb-1">Identity Vault Empty</p>
               <p className="max-w-[200px] text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-tight leading-relaxed">
                 You have 0 scoring sources. Link a platform to calculate your Trust Fingerprint.
               </p>
             </div>
             <button 
               onClick={() => setShowConnect(true)}
               className="mt-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] underline underline-offset-8 decoration-2"
             >
               Connect Now
             </button>
          </div>
        )}
      </section>

      {/* Linked Platforms Management */}
      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-black text-[var(--text-primary)] px-2 flex items-center gap-2">
          <Database size={20} className="text-blue-500" />
          Linked Integrations
        </h2>
        
        <div className="grid grid-cols-1 gap-3">
          {connectedPlatforms.map(p => (
            <div key={p.id} className="card p-5 bg-[var(--bg-elevated)] border-white/5 rounded-3xl flex items-center justify-between group shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-2xl">💼</div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-[var(--text-primary)]">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Verified Link</span>
                    <button 
                      onClick={() => router.push("/credentials")}
                      className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest underline underline-offset-4"
                    >
                      View Doc
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => disconnectPlatform(p.id!)} className="p-2 text-red-500/30 hover:text-red-500 transition-colors"><XCircle size={20} /></button>
            </div>
          ))}
          
          {/* ADD PLATFORM CARD */}
          <button 
            onClick={() => setShowConnect(true)}
            className="flex items-center gap-4 p-5 rounded-[2rem] border-2 border-dashed border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group overflow-hidden relative"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-black text-[var(--text-primary)]">Connect New Platform</span>
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Sync Work History</span>
            </div>
            <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight size={18} className="text-blue-500" />
            </div>
          </button>
        </div>
      </div>

      <ConnectPlatformDialog open={showConnect} onClose={() => setShowConnect(false)} onConnected={() => {}} />
    </div>
  );
}
