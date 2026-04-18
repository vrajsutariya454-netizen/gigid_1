"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, TrendingUp, ShieldCheck, Wallet } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { calculateTrustScore } from "@/lib/aggregation/platform-connector";
import { TrustScore } from "@/components/dashboard/TrustScore";
import { ConnectPlatformDialog } from "@/components/platform/ConnectPlatformDialog";
import { formatCurrency } from "@/lib/utils";

export function DashboardView() {
  const [showConnect, setShowConnect] = useState(false);

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
    <div className="p-4 pb-32">
      {/* Trust Score */}
      <div className="text-center py-6">
        <TrustScore score={trustScore} size={200} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          icon={<ShieldCheck size={20} color="var(--success-500)" />}
          value={credentials.length.toString()}
          label="Verified"
          color="var(--success-500)"
        />
        <StatCard
          icon={<Wallet size={20} color="var(--primary-500)" />}
          value={connectedPlatforms.length.toString()}
          label="Platforms"
          color="var(--primary-500)"
        />
        <StatCard
          icon={<TrendingUp size={20} color="var(--warning-500)" />}
          value={totalEarnings > 0 ? formatCurrency(totalEarnings) : "₹0"}
          label="Earnings"
          color="var(--warning-500)"
        />
      </div>

      {/* Connected Platforms */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-3 px-1">
          Platforms
        </h2>

        {connectedPlatforms.length === 0 ? (
          <div className="card p-8 text-center bg-[var(--bg-card)]">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4 text-3xl">
              🔗
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)] mb-1">
              No connections
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mb-5">
              Link your gig profiles to boost score
            </p>
            <button
              onClick={() => setShowConnect(true)}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xs font-bold shadow-lg"
            >
              Connect Now
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {connectedPlatforms.map((platform) => (
              <div
                key={platform.id}
                className="card p-4 flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-color)]"
              >
                <span className="text-3xl">{platform.icon}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {platform.name}
                  </h3>
                  <div className="flex gap-3 text-[10px] text-[var(--text-tertiary)] mt-0.5 font-medium">
                    <span>⭐ {platform.avgRating?.toFixed(1)}</span>
                    <span>🚚 {platform.totalDeliveries?.toLocaleString()}</span>
                    <span>💰 {formatCurrency(platform.totalEarnings || 0)}</span>
                  </div>
                </div>
                <div className="px-2 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
                  <span className="text-[10px] text-teal-500 font-bold">Linked</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Platform FAB - Smaller and pinned to Slide 0 */}
      <button
        onClick={() => setShowConnect(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 text-white shadow-xl flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <Plus size={28} />
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
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div
      className="card p-3 py-4 text-center flex flex-col items-center gap-2 border-t-4"
      style={{ borderTopColor: color }}
    >
      {icon}
      <span className="text-base font-black text-[var(--text-primary)] leading-none mt-1">
        {value}
      </span>
      <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
