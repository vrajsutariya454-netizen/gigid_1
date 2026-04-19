"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, ShieldCheck, History, Landmark, Loader2, XCircle, Database, Search, CheckCircle2, AlertTriangle, ArrowRight, BarChart3, Activity, ArrowUpRight, Sparkles } from "lucide-react";
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

export default function DashboardPage() {
  const router = useRouter();
  const { hasCompletedOnboarding, setTrustScore: setGlobalTrustScore, name } = useAppStore();
  
  const [showConnect, setShowConnect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scoreData, setScoreData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"bars" | "radar">("bars");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const connectedPlatforms = useMemo(() => platforms.filter((p) => p.connected), [platforms]);

  const disconnectPlatform = async (id: number) => {
    if (confirm("Remove this platform? All synced history and credentials will be permanently deleted.")) {
      const platform = platforms.find(p => p.id === id);
      if (platform) {
        setIsLoading(true);
        await db.workRecords.where("instanceId").equals(id).delete();
        await db.workRecords.where("platformId").equals(platform.platformId.toLowerCase()).delete();
        await db.credentials.where("credentialSubject.platform").equals(platform.name).delete();
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
      { label: "Stability", value: parseFloat(b.S), weight: "30%", description: "Consistency of monthly income variance" },
      { label: "Capacity", value: parseFloat(b.E), weight: "25%", description: "Aggregated monthly average vs. local reference" },
      { label: "Consistency", value: parseFloat(b.C), weight: "25%", description: "Active work days and volume over time" },
      { label: "Regularity", value: parseFloat(b.Rt), weight: "20%", description: "Transaction frequency and interval health" },
      { label: "Reliability", value: parseFloat(b.Rs) * parseFloat(b.AA.Raa), weight: "Multiplier", description: "Verification level of data sources" },
    ];
  }, [scoreData]);

  if (!hasCompletedOnboarding) return null;

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Aurora Background (Matches Landing Page) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] animate-float opacity-30" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[130px] animate-float [animation-delay:3s] opacity-20" />
      </div>

      <div className="relative z-10 page-content flex flex-col gap-12 pb-32">
        {/* Header Section */}
        <section className="flex flex-col gap-2 pt-6">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={12} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Personal Identity Hub</span>
          </div>
          <div className="flex items-end justify-between">
            <h1 className="font-display text-5xl tracking-tight leading-none text-gradient">
              Welcome back, <br />
              <span className="italic font-normal">{name?.split(" ")[0] || "Worker"}</span>
            </h1>
            <div className="flex flex-col items-end opacity-40">
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Security Status</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Encrypted</span>
            </div>
          </div>
        </section>

        {/* --- TRUST CENTER --- */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
          
          {/* Main Score Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="noise glass-card p-10 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={120} strokeWidth={1} />
            </div>
            
            {isLoading ? (
              <div className="h-[280px] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
              </div>
            ) : (
              <TrustScore score={scoreData?.trustScore || 0} size={280} />
            )}

            <div className="mt-8 text-center max-w-xs transition-all">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-2">Global Trust Index</p>
              <p className="text-xs font-medium text-muted-foreground/80 leading-relaxed">
                Your score reflects verified earnings, work continuity, and platform reliability.
              </p>
            </div>
          </motion.div>

          {/* Trust Factor Details */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="noise glass-card p-8 rounded-[3rem] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={12} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Algorithm v2.4</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-foreground/90">Identity Engine</h2>
              </div>

              <div className="flex bg-muted/30 p-1.5 rounded-2xl gap-1">
                <button 
                  onClick={() => setViewMode("bars")}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === "bars" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <BarChart3 size={18} />
                </button>
                <button 
                  onClick={() => setViewMode("radar")}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === "radar" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Activity size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] flex flex-col">
              {scoreData && connectedPlatforms.length > 0 ? (
                <div className="flex flex-col h-full">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1"
                  >
                    {viewMode === "bars" ? (
                      <TrustFactorBars data={factorsData} />
                    ) : (
                      <TrustRadarChart data={factorsData.map(f => ({ label: f.label, value: f.value, weight: f.weight }))} />
                    )}
                  </motion.div>
                  
                  <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Verified Inflow</span>
                      <span className="text-xs font-bold text-accent flex items-center gap-1.5 mt-0.5">
                        <Landmark size={12} /> AA-Secure Multi-Link
                      </span>
                    </div>
                    <button 
                      onClick={refreshScore}
                      disabled={isRefreshing}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted/50 border border-border hover:border-primary/30 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                      {isRefreshing ? <Loader2 size={12} className="animate-spin" /> : <History size={12} />}
                      Re-Audit Hub
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center flex-col gap-6 text-center px-8 border border-dashed border-border rounded-[2.5rem] bg-muted/5">
                   <div className="w-16 h-16 rounded-[24px] bg-muted/20 flex items-center justify-center text-muted-foreground/30">
                     <Database size={32} />
                   </div>
                   <div>
                     <p className="text-sm font-black text-foreground mb-1">Identity Vault Empty</p>
                     <p className="max-w-[220px] text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-relaxed">
                       Link your first platform to calculate your verifiable trust fingerprint.
                     </p>
                   </div>
                   <button 
                     onClick={() => setShowConnect(true)}
                     className="px-8 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                   >
                     Initialize Now
                   </button>
                </div>
              )}
            </div>
          </motion.section>
        </div>

        {/* --- INTEGRATIONS SECTION --- */}
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between px-2">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground/90">Linked Platforms</h2>
              <p className="text-xs font-medium text-muted-foreground">Manage your verifiable work history sources.</p>
            </div>
            <button 
              onClick={() => setShowConnect(true)}
              className="px-5 py-2.5 rounded-full glass border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/5 transition-all"
            >
              <Plus size={14} strokeWidth={3} /> Add Source
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedPlatforms.map(p => (
              <motion.div 
                layoutId={`p-${p.id}`}
                key={p.id} 
                className="noise glass-card p-6 rounded-[2rem] flex flex-col gap-6 group hover:border-primary/30 transition-all cursor-pointer relative"
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    {p.name.toLowerCase() === 'swiggy' ? '🍔' : p.name.toLowerCase() === 'zomato' ? '🍣' : '💼'}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); disconnectPlatform(p.id!); }} 
                    className="p-2 text-red-500/0 group-hover:text-red-500/40 hover:text-red-500 transition-all"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
                
                <div>
                  <h4 className="font-bold text-foreground tracking-tight">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 size={10} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">Active Sync</span>
                  </div>
                </div>

                <button 
                  onClick={() => router.push("/credentials")}
                  className="w-full py-3 rounded-xl bg-muted/40 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  View Credential <ArrowUpRight size={14} />
                </button>
              </motion.div>
            ))}
            
            {connectedPlatforms.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center gap-4 opacity-30">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No platforms connected</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <ConnectPlatformDialog
        open={showConnect}
        onClose={() => setShowConnect(false)}
        onConnected={() => { refreshScore(); }}
      />
    </main>
  );
}
