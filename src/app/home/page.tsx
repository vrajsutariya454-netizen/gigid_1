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
import { useTranslation } from "@/lib/i18n/use-translation";

export default function DashboardPage() {
  const router = useRouter();
  const { hasCompletedOnboarding, setTrustScore: setGlobalTrustScore, name, kycStatus } = useAppStore();
  const { t } = useTranslation();
  
  const [showConnect, setShowConnect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scoreData, setScoreData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"bars" | "radar">("bars");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const connectedPlatforms = useMemo(() => platforms.filter((p) => p.connected), [platforms]);

  const disconnectPlatform = async (id: number) => {
    if (confirm(t('dash.confirmRemove'))) {
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
          Rs: local.reliability.toFixed(3)
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
      { label: t("dash.stability"), value: parseFloat(b.S), weight: "30%", description: t("dash.desc.stability") },
      { label: t("dash.capacity"), value: parseFloat(b.E), weight: "25%", description: t("dash.desc.capacity") },
      { label: t("dash.consistency"), value: parseFloat(b.C), weight: "25%", description: t("dash.desc.consistency") },
      { label: t("dash.regularity"), value: parseFloat(b.Rt), weight: "20%", description: t("dash.desc.regularity") },
      { label: t("dash.reliability"), value: parseFloat(b.Rs), weight: "Multiplier", description: t("dash.desc.reliability") },
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
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('dash.title')}</span>
          </div>
          <div className="flex items-end justify-between">
            <h1 className="font-display text-6xl tracking-tight leading-[0.9] text-primary">
              {t('dash.subtitle', { name: name?.split(" ")[0] || "Worker" })}
            </h1>
            <div className="flex flex-col items-end opacity-40">
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{t('dash.securityStatus')}</span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">{t('dash.encryptedNode')}</span>
            </div>
          </div>
        </section>

        {/* --- INCOMPLETE KYC BANNER --- */}
        {kycStatus !== 'verified' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-5 rounded-[2rem] bg-amber-500/8 border border-amber-500/25 cursor-pointer hover:bg-amber-500/12 transition-all group"
            onClick={() => router.push('/profile')}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
              <AlertTriangle size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">KYC Incomplete</p>
              <p className="text-[10px] text-amber-500/70 font-medium mt-0.5">Verify your Aadhaar to unlock full trust tier &amp; institutional loans.</p>
            </div>
            <ArrowRight size={14} className="text-amber-500/50 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
          </motion.div>
        )}

        {/* --- TRUST CENTER --- */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
          
          {/* Main Score Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            id="trust-score-section"
            className="noise bg-card p-10 rounded-[3rem] shadow-xl shadow-primary/5 flex flex-col items-center justify-center relative overflow-hidden"
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
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-2">{t('dash.trustScore')}</p>
              <p className="text-xs font-medium text-muted-foreground/80 leading-relaxed">
                {t('dash.trustStatus')}
              </p>
            </div>
          </motion.div>

          {/* Trust Factor Details */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="noise bg-card p-8 rounded-[3rem] shadow-xl shadow-primary/5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={12} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('dash.algorithm')} v2.4</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-foreground/90">{t('dash.engine')}</h2>
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
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">{t('dash.verifiedInflow')}</span>
                      <span className="text-xs font-bold text-accent flex items-center gap-1.5 mt-0.5">
                        <Landmark size={12} /> {t('data.aaSection')}
                      </span>
                    </div>
                    <button 
                      onClick={refreshScore}
                      disabled={isRefreshing}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary hover:bg-muted-foreground/5 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 text-primary"
                    >
                      {isRefreshing ? <Loader2 size={12} className="animate-spin" /> : <History size={12} />}
                      {t('dash.audit')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center flex-col gap-6 text-center px-8 border border-dashed border-border rounded-[2.5rem] bg-muted/5">
                   <div className="w-16 h-16 rounded-[24px] bg-muted/20 flex items-center justify-center text-muted-foreground/30">
                     <Database size={32} />
                   </div>
                    <div>
                      <p className="text-sm font-black text-foreground mb-1">{t('dash.vaultEmpty')}</p>
                      <p className="max-w-[220px] text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-relaxed">
                        {t('dash.linkFirst')}
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowConnect(true)}
                      className="px-8 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                      {t('dash.initialize')}
                    </button>
                </div>
              )}
            </div>
          </motion.section>
        </div>

        {/* --- ACCOUNT AGGREGATOR HIGHLIGHT (KEY FEATURE) --- */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 blur-2xl -z-10" />
          <div id="data-hub-section" className="noise bg-card p-10 rounded-[3.5rem] shadow-2xl shadow-primary/5 overflow-hidden group">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="flex flex-col gap-5 max-w-lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20">
                    <Landmark size={24} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('data.aaSection')}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground/90">{t('data.aaSection')} Hub</h2>
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Your trust is backed by real-time, bank-verified financial telemetry. Via the **Sahamati** framework, we audit your 6-month transaction velocity to mathematically prove your stability without storing sensitive credentials.
                </p>
                <div className="flex flex-wrap gap-4 mt-2">
                   <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/40 border border-border/60">
                      <CheckCircle2 size={12} className="text-accent" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">Income-to-Expense Ratio</span>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/40 border border-border/60">
                      <CheckCircle2 size={12} className="text-accent" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">Verified Cash Flow</span>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/40 border border-border/60">
                      <CheckCircle2 size={12} className="text-accent" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">Identity Correlation</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full lg:w-80">
                <button 
                  onClick={() => router.push("/data-hub?tab=financial")}
                  className="w-full h-18 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-widest text-[11px] transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                >
                  <Search size={18} />
                  {t('nav.dataHub')}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
                <div className="noise bg-secondary/50 p-5 rounded-[1.5rem] flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                    <ShieldCheck size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none">Status</span>
                    <span className="text-xs font-black text-foreground mt-1 tracking-tight">ENCRYPTED DATA NODE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* --- INTEGRATIONS SECTION --- */}
        <section id="platforms-section" className="flex flex-col gap-6">
          <div className="flex items-end justify-between px-2">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground/90">Linked Platforms</h2>
              <p className="text-xs font-medium text-muted-foreground">Manage your verifiable work history sources.</p>
            </div>
            <button 
              id="add-platform-btn"
              onClick={() => setShowConnect(true)}
              className="px-5 py-2.5 rounded-full glass border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/5 transition-all"
            >
              <Plus size={14} strokeWidth={3} /> Add Platform
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedPlatforms.map(p => (
              <motion.div 
                layoutId={`p-${p.id}`}
                key={p.id} 
                className="noise bg-card p-6 rounded-[2.5rem] shadow-lg shadow-primary/5 flex flex-col gap-6 group hover:shadow-primary/10 transition-all cursor-pointer relative"
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

