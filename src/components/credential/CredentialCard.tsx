"use client";

import { type VerifiableCredential } from "@/lib/db/database";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ShieldCheck, Star, Truck, IndianRupee, ChevronRight, Calendar, Trash2 } from "lucide-react";

interface CredentialCardProps {
  credential: VerifiableCredential;
  onTap?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  Zomato: "#E23744",
  Uber: "#276EF1",
  Swiggy: "#FC8019",
  Ola: "#1C8C3C",
  Dunzo: "#00D573",
};

const PLATFORM_ICONS: Record<string, string> = {
  Zomato: "🍕",
  Uber: "🚗",
  Swiggy: "🛵",
  Ola: "🛺",
  Dunzo: "📦",
};

export function CredentialCard({ credential, onTap, onShare, onDelete }: CredentialCardProps) {
  const { credentialSubject: cs } = credential;
  const platformColor = PLATFORM_COLORS[cs.platform] || "var(--color-primary)";
  const platformIcon = PLATFORM_ICONS[cs.platform] || "📄";

  return (
    <div
      onClick={onTap}
      className={`relative overflow-hidden transition-all duration-300 ${onTap ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'} bg-card rounded-[2.5rem] shadow-xl shadow-primary/5 group hover:shadow-primary/10`}
    >
      {/* Header */}
      <div
        className="px-6 py-5 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${platformColor}12, ${platformColor}05)`,
        }}
      >
        <div className="flex items-center gap-4">
          <div className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500">
            {platformIcon}
          </div>
          <div>
            <h3 className="text-lg font-display font-black text-foreground tracking-tight">
              {cs.platform}
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              Verifiable Trust Packet
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              credential.verificationStatus === "failed" ? "bg-red-500/10 text-red-500" : 
              credential.verificationStatus === "pending" ? "bg-amber-500/10 text-amber-500" : 
              "bg-emerald-500/10 text-emerald-600"
            }`}
          >
            {credential.verificationStatus === 'failed' ? (
              <span>Not verified</span>
            ) : credential.verificationStatus === 'pending' ? (
              <span>Verification Pending</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} strokeWidth={3} />
                Signed {cs.platform}
              </span>
            )}
          </div>
          {onTap && <ChevronRight size={18} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 bg-secondary/30">
        <StatItem
          icon={<Truck size={18} style={{ color: platformColor }} />}
          value={formatNumber(cs.totalDeliveries)}
          label="Deliveries"
        />
        <StatItem
          icon={<Star size={18} className="text-amber-500 fill-amber-500" />}
          value={cs.avgRating.toFixed(1)}
          label="Rating"
        />
        <StatItem
          icon={<IndianRupee size={18} className="text-emerald-600" />}
          value={formatCurrency(cs.last6MonthsEarnings)}
          label="Power Score"
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-4 flex items-center justify-between bg-card text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="opacity-40" />
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
            Issued {new Date(credential.issuanceDate || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
            >
              <Trash2 size={16} />
            </button>
          )}
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="px-6 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Share Proof
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="py-6 flex flex-col items-center gap-2 border-r border-background/20 last:border-0 hover:bg-muted-foreground/5 transition-colors">
      {icon}
      <span className="text-base font-black text-foreground tracking-tight font-display">{value}</span>
      <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">{label}</span>
    </div>
  );
}
