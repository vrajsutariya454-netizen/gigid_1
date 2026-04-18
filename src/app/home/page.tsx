"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, TrendingUp, ShieldCheck, Wallet } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { calculateTrustScore } from "@/lib/aggregation/platform-connector";
import { TrustScore } from "@/components/dashboard/TrustScore";
import { ConnectPlatformDialog } from "@/components/platform/ConnectPlatformDialog";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";

export default function DashboardPage() {
  const router = useRouter();
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const [showConnect, setShowConnect] = useState(false);

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

  const trustScore = useMemo(
    () => calculateTrustScore(connectedPlatforms),
    [connectedPlatforms]
  );

  const totalEarnings = useMemo(
    () => connectedPlatforms.reduce((sum, p) => sum + (p.totalEarnings || 0), 0),
    [connectedPlatforms]
  );

  const handlePlatformConnected = useCallback(() => {
    setShowConnect(false);
  }, []);

  return (
    <div className="page-content flex flex-col gap-10">
      {/* Trust Score Section (Main Focus) */}
      <div className="text-center py-8">
        <TrustScore score={trustScore} size={220} />
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

      {/* Connected Platforms */}
      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-[var(--text-primary)] px-2">
          Connected Platforms
        </h2>

        {connectedPlatforms.length === 0 ? (
          <div className="card p-10 text-center bg-[var(--bg-elevated)] border-0 rounded-3xl shadow-sm">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6 text-4xl">
              🔗
            </div>
            <p className="text-base font-bold text-[var(--text-primary)] mb-2">
              No platforms connected yet
            </p>
            <p className="text-sm text-[var(--text-tertiary)] mb-8">
              Link your gig profiles to get started
            </p>
            <button
              onClick={() => setShowConnect(true)}
              className="px-8 py-3.5 rounded-full text-white text-sm font-bold shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
              style={{
                background: "linear-gradient(135deg, var(--primary-600), var(--primary-400))"
              }}
            >
              Connect Platform
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {connectedPlatforms.map((platform) => (
              <div
                key={platform.id}
                className="card p-5 flex items-center gap-5 bg-[var(--bg-elevated)] border-0 rounded-2xl shadow-sm transition-transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-3xl shrink-0">
                  {platform.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {platform.name}
                  </h3>
                  <div className="flex gap-4 text-xs text-[var(--text-tertiary)] mt-1.5 font-medium">
                    <span className="flex items-center gap-1">⭐ {platform.avgRating?.toFixed(1)}</span>
                    <span className="flex items-center gap-1">🚚 {platform.totalDeliveries?.toLocaleString()}</span>
                    <span className="flex items-center gap-1 font-bold text-[var(--text-secondary)]">💰 {formatCurrency(platform.totalEarnings || 0)}</span>
                  </div>
                </div>
                <div className="ml-auto shrink-0 mr-2 px-3 py-1.5 rounded-full bg-teal-500/10 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                   <span className="text-[11px] text-teal-600 font-bold uppercase tracking-wider">Linked</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Platform FAB */}
      <button
        onClick={() => setShowConnect(true)}
        className="fixed bottom-32 left-8 w-16 h-16 rounded-full text-white shadow-xl flex items-center justify-center z-40 active:scale-95 transition-transform"
        style={{
          background: "linear-gradient(135deg, var(--success-500), var(--primary-500))",
          boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)"
        }}
        aria-label="Add Platform"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      <ConnectPlatformDialog
        open={showConnect}
        onClose={() => setShowConnect(false)}
        onConnected={handlePlatformConnected}
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
    <div
      className="card p-4 py-6 text-center flex flex-col items-center gap-3 border-0 rounded-2xl shadow-sm"
      style={{ backgroundColor: "var(--bg-elevated)" }}
    >
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <span className="text-xl font-black text-[var(--text-primary)] leading-none">
        {value}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: textColor }}>
        {label}
      </span>
    </div>
  );
}

