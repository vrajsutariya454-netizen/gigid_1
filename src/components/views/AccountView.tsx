"use client";

import { useAppStore, type ThemeMode, type TextSize } from "@/lib/store/app-store";
import { clearAllData } from "@/lib/db/database";
import { User, Sun, Moon, EyeOff, Type, Trash2, Info } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const THEMES: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { id: "light", label: "Light", icon: <Sun size={18} /> },
  { id: "dark", label: "Dark", icon: <Moon size={18} /> },
  { id: "high-contrast", label: "Contrast", icon: <EyeOff size={18} /> },
];

export function AccountView() {
  const { theme, setTheme, textSize, setTextSize, did, logout } = useAppStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const router = useRouter();

  const handleClearData = async () => {
    await clearAllData();
    logout();
    router.push("/");
  };

  return (
    <div className="p-4 pb-32">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-teal-500/10">
            <User size={24} className="text-teal-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Account Info
          </h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)] ml-1">
          Manage your DID and workspace
        </p>
      </div>

      {/* DID Card */}
      <div className="card p-5 mb-6 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-primary)]">
        <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">
          Verifiable Identifier (DID)
        </h4>
        <div className="p-3 rounded-lg bg-muted border border-border font-mono text-[10px] text-muted-foreground break-all leading-relaxed">
          {did || "Loading ID..."}
        </div>
      </div>

      {/* Theme Selection */}
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-3">
          <Moon size={16} className="text-blue-500" /> Appearance
        </h3>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                theme === t.id 
                ? "border-blue-500 bg-blue-500/10 text-blue-500" 
                : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
              }`}
            >
              {t.icon}
              <span className="text-[11px] font-bold">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 py-6 border-t border-[var(--border-color)]">
        <button
          onClick={() => setShowClearConfirm(true)}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-red-500/30 text-red-500 text-sm font-bold hover:bg-red-500/5 transition-colors"
        >
          <Trash2 size={18} />
          Wipe Data & Logout
        </button>
      </div>

      {/* About Section */}
      <div className="mt-4 p-4 rounded-xl border border-[var(--border-color)] flex items-center justify-between opacity-60">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
          <Info size={14} /> Version 1.0.0-beta
        </div>
        <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">GigID Secure</span>
      </div>

       {/* Clear Data Confirm Dialog */}
       {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
          <div className="relative w-full max-w-sm bg-[var(--bg-elevated)] rounded-2xl p-6 text-center animate-in zoom-in-95 fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-2">Are you sure?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6"> This will permanently delete your identity and all saved credentials.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 p-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm">Cancel</button>
              <button onClick={handleClearData} className="flex-1 p-3 rounded-xl bg-red-500 text-white font-bold text-sm">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
