"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, TrendingUp, ShieldCheck, Wallet, ChevronDown, ChevronUp, History, Landmark, AlertCircle } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { TrustScore } from "@/components/dashboard/TrustScore";
import { ConnectPlatformDialog } from "@/components/platform/ConnectPlatformDialog";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { getLiveTrustScore } from "@/lib/scoring/data-bridge";
import { TrustScoreDetails } from "@/components/dashboard/TrustScoreDetails";
import { SimpleTrend } from "@/components/charts/SimpleTrend";
import { motion, AnimatePresence } from "framer-motion";
import { generateMockHistory } from "@/lib/scoring/mock-service";

export default function DashboardPage() {
  const router = useRouter();
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const [showConnect, setShowConnect] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null);

  // Fallback mock check
  const workRecordsCount = useLiveQuery(() => db.workRecords.count()) || 0;
  const manualDataCount = useLiveQuery(() => db.manualScoringData.count()) || 0;
  const isUsingMock = workRecordsCount === 0 && manualDataCount === 0;

  // Fetch live score from bridge
  useEffect(() => {
    async function loadScore() {
      const liveScore = await getLiveTrustScore();
      setScoreBreakdown(liveScore);
    }
    loadScore();
  }, [workRecordsCount, manualDataCount]);

  // For trends, we'll use mock if empty, otherwise we'd need a trend service.
  // We'll stick to historyData for charts for now, but linked to live bridge logic.
  const historyData = useMemo(() => generateMockHistory(), []);

  // Redirect if not onboarded
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.replace("/");
    }
  }, [hasCompletedOnboarding, router]);

  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const credentials = useLiveQuery(() => db.credentials.toArray()) || [];

  const connectedPlatforms = useMemo(
    () => platforms.filter((p) => p.connected),
    [platforms]
  );

  const totalEarnings = useMemo(
    () => connectedPlatforms.reduce((sum, p) => sum + (p.totalEarnings || 0), 0),
    [connectedPlatforms]
  );

  if (!scoreBreakdown) return null;

  return (
    <div className="page-content flex flex-col gap-10 pb-32">
      {/* Premium Trust Score Header */}
      <div className="flex flex-col items-center py-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

        <TrustScore score={scoreBreakdown.finalScore} size={240} />

        {isUsingMock && (
          <div className="mt-4 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-500" />
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Demo Mode: No real data linked</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-5">
        <StatCard
          icon={<ShieldCheck size={24} className="text-teal-500" />}
          value={credentials.length.toString()}
          label="Verified"
          color="rgba(20, 184, 166, 0.1)"
          textColor="var(--success-500)"
        />
        <StatCard
          icon={<Wallet size={24} className="text-blue-500" />}
          value={connectedPlatforms.length.toString()}
          label="Platforms"
          color="rgba(59, 130, 246, 0.1)"
          textColor="var(--primary-500)"
        />
        <StatCard
          icon={<TrendingUp size={24} className="text-amber-500" />}
          value={totalEarnings > 0 ? formatCurrency(totalEarnings) : "₹0"}
          label="Earnings"
          color="rgba(245, 158, 11, 0.1)"
          textColor="var(--warning-500)"
        />
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
          <Landmark size={12} className="text-blue-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">AA Verified Score</span>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-white/5 text-[var(--text-primary)] hover:border-blue-500/30 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-black/20"
        >
          {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showDetails ? "Hide Data Specs" : "View Reliability Specs"}
        </button>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <TrustScoreDetails breakdown={scoreBreakdown} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial Health Trends */}
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-black text-[var(--text-primary)] px-2 flex items-center gap-2">
          <History size={20} className="text-blue-500" />
          Financial Health Trends
        </h2>

        <div className="grid grid-cols-1 gap-5">
          <div className="card p-6 bg-[var(--bg-elevated)] border-white/5 rounded-[2rem] shadow-xl">
            <SimpleTrend
              data={historyData.aaData.monthlyInflows}
              label="Bank Verified Inflows (₹)"
              color="var(--primary-400)"
              height={100}
            />
          </div>
          <div className="card p-6 bg-[var(--bg-elevated)] border-white/5 rounded-[2rem] shadow-xl">
            <SimpleTrend
              data={historyData.activeDays}
              label="Active Work Days"
              color="var(--success-400)"
              height={100}
              max={30}
            />
          </div>
        </div>
      </div>

      {/* Action FAB */}
      <button
        onClick={() => router.push("/data-hub")}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-[2rem] text-white shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform border border-white/10"
        style={{
          background: "linear-gradient(135deg, var(--primary-600), var(--primary-400))",
          boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.5)"
        }}
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      <ConnectPlatformDialog
        open={showConnect}
        onClose={() => setShowConnect(false)}
        onConnected={() => { }}
      />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  textColor,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  textColor: string;
}) {
  return (
    <div className="card p-4 py-7 text-center flex flex-col items-center gap-3 bg-[var(--bg-elevated)] border-white/5 rounded-[1.5rem] shadow-xl">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-1 shadow-inner" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <span className="text-sm font-black text-[var(--text-primary)] leading-none tracking-tight">
        {value}
      </span>
      <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: textColor }}>
        {label}
      </span>
    </div>
  );
}
