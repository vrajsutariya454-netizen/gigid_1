"use client";

import { useAppStore, type ThemeMode, type TextSize, type Language } from "@/lib/store/app-store";
import { clearAllData } from "@/lib/db/database";
import { 
  Settings as SettingsIcon, Sun, Moon, EyeOff, Type, Globe, 
  Trash2, Info, ChevronRight, Monitor, Palette, Bell,
  ShieldCheck, ArrowLeft, Check
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

const THEMES: { id: ThemeMode; label: string; icon: any; color: string }[] = [
  { id: "light", label: "Pristine", icon: Sun, color: "text-amber-500" },
  { id: "dark", label: "Cosmic", icon: Moon, color: "text-primary" },
  { id: "high-contrast", label: "Onyx", icon: EyeOff, color: "text-emerald-500" },
];

const TEXT_SIZES: { id: TextSize; label: string; size: string }[] = [
  { id: "normal", label: "Standard", size: "text-base" },
  { id: "large", label: "Large", size: "text-lg" },
  { id: "extra-large", label: "Extra", size: "text-xl" },
];

const LANGUAGES: { id: Language; label: string; native: string; flag: string }[] = [
  { id: "en", label: "English", native: "English", flag: "🇬🇧" },
  { id: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { id: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { id: "bn", label: "Bengali", native: "বাংলা", flag: "🇮🇳" },
];

export default function SettingsPage() {
  const { theme, setTheme, textSize, setTextSize, language, setLanguage, did, logout } = useAppStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.replace("/");
    };
    checkAuth();
  }, [router]);

  const handleClearData = async () => {
    await clearAllData();
    logout();
    router.push("/");
  };

  return (
    <main className="min-h-screen pb-24 lg:pb-12 bg-background transition-colors duration-500">
      <div className="max-w-3xl mx-auto px-6 pt-12">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-display font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground/60 text-sm font-medium">Customize your digital hub experience</p>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
        </header>

        <div className="flex flex-col gap-10">
          
          {/* Appearance Section */}
          <Section title="Appearance" icon={Palette}>
            <div className="grid gap-6">
              {/* Theme Grid */}
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map((t) => {
                  const isActive = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`relative p-5 rounded-2xl border transition-all flex flex-col items-center gap-3 group active:scale-[0.98] ${
                        isActive 
                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/10" 
                        : "bg-surface border-white/5 hover:border-white/20"
                      }`}
                    >
                      <t.icon className={`w-6 h-6 ${isActive ? t.color : "text-muted-foreground/40"}`} />
                      <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? "text-foreground" : "text-muted-foreground/60"}`}>
                        {t.label}
                      </span>
                      {isActive && (
                        <motion.div layoutId="theme-active" className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary border-4 border-background flex items-center justify-center">
                          <Check size={8} className="text-white" strokeWidth={4} />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Text Size Segmented Control */}
              <div className="flex items-center justify-between p-2 rounded-2xl bg-muted border border-border mt-2">
                {TEXT_SIZES.map((ts) => {
                  const isActive = textSize === ts.id;
                  return (
                    <button
                      key={ts.id}
                      onClick={() => setTextSize(ts.id)}
                      className={`flex-1 py-3 px-2 rounded-[14px] transition-all text-sm font-bold tracking-tight relative ${
                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isActive && (
                        <motion.div layoutId="size-active" className="absolute inset-0 bg-background rounded-[14px] shadow-sm" />
                      )}
                      <span className="relative z-10">{ts.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* Localization Section */}
          <Section title="Localization" icon={Globe}>
            <div className="grid sm:grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => {
                const isActive = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all group active:scale-[0.98] ${
                      isActive 
                      ? "bg-primary/5 border-primary shadow-lg shadow-primary/10" 
                      : "bg-muted border-border hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className={`font-bold text-sm ${isActive ? "text-foreground" : "text-foreground/70"}`}>{lang.native}</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/40">{lang.label}</span>
                      </div>
                    </div>
                    {isActive && <Check className="w-5 h-5 text-primary" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Account Security Section */}
          <Section title="Security & Data" icon={ShieldCheck}>
            <div className="flex flex-col gap-4">
              {/* DID Box */}
              <div className="p-8 rounded-3xl bg-muted/30 border border-dashed border-border flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Digital Identifier</span>
                  </div>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Revoke DID</button>
                </div>
                <code className="text-xs text-muted-foreground leading-relaxed font-mono bg-background p-4 rounded-xl border border-border break-all">
                  {did || "did:gigid:unregistered_0x...f3a"}
                </code>
              </div>

              {/* Danger Zone */}
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full h-16 rounded-2xl border-2 border-dashed border-border bg-muted/30 hover:bg-red-500/5 hover:border-red-500/30 text-muted-foreground hover:text-red-500 transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs active:scale-[0.98] group"
              >
                <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                Clear Hub Data
              </button>
            </div>
          </Section>

        </div>

        {/* Footer Info */}
        <footer className="mt-20 text-center flex flex-col items-center gap-3 py-10 border-t border-border">
          <div className="flex items-center gap-2 opacity-30">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">GigID Secure v1.0.4</span>
          </div>
          <p className="text-[10px] text-muted-foreground/40 max-w-xs leading-relaxed uppercase tracking-wider">
            Your data is stored locally using AES-256 encryption. Clearing data is permanent and irreversible.
          </p>
        </footer>

      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm p-8 rounded-[2.5rem] bg-background border border-border shadow-2xl flex flex-col items-center text-center gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-display font-bold text-foreground">Irreversible Action</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will wipe your entire digital identity, credentials, and settings. This cannot be undone.
                </p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleClearData}
                  className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  Confirm Deletion
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="w-full py-4 rounded-2xl bg-muted text-muted-foreground font-bold uppercase tracking-widest text-xs hover:bg-muted/80 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 px-1">
        <div className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
        <Icon size={16} className="text-muted-foreground/40" />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">{title}</h2>
      </div>
      {children}
    </div>
  );
}
