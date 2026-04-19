"use client";

import { useAppStore, type ThemeMode, type TextSize, type Language } from "@/lib/store/app-store";
import { clearAllData } from "@/lib/db/database";
import { 
  Settings as SettingsIcon, Sun, Moon, EyeOff, Type, Globe, 
  Trash2, Info, ChevronRight, Monitor, Palette, Bell,
  ShieldCheck, ArrowLeft, Check, Sparkles, ChevronLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

const THEMES: { id: ThemeMode; labelKey: string; icon: any; color: string }[] = [
  { id: "light", labelKey: "light", icon: Sun, color: "text-amber-500" },
  { id: "dark", labelKey: "dark", icon: Moon, color: "text-primary" },
  { id: "high-contrast", labelKey: "high_contrast", icon: EyeOff, color: "text-emerald-500" },
];

const TEXT_SIZES: { id: TextSize; labelKey: string; size: string }[] = [
  { id: "normal", labelKey: "normal", size: "text-base" },
  { id: "large", labelKey: "large", size: "text-lg" },
  { id: "extra-large", labelKey: "extra_large", size: "text-xl" },
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
  const pathname = usePathname();
  const t = useTranslations("settings");
  const commonT = useTranslations("common");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // If not authenticated, we should probably redirect to landing
      // But we need to make sure we don't redirect if it's a demo mode
      // For now, let's keep it consistent with the original code
      if (!user && !did) router.replace("/");
    };
    checkAuth();
  }, [router, did]);

  const handleClearData = async () => {
    await clearAllData();
    logout();
    router.push("/");
  };

  const handleLanguageChange = (newLang: Language) => {
    // Swap the locale segment in the current URL path
    const segments = pathname.split("/");
    segments[1] = newLang; // replace /en/settings -> /hi/settings
    router.replace(segments.join("/"));
    setLanguage(newLang);
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] animate-float opacity-30" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[130px] animate-float [animation-delay:3s] opacity-20" />
      </div>

      <div className="relative z-10 page-content pb-32 flex flex-col gap-10">
        
        {/* Header Area */}
        <section className="pt-6 flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()} 
              className="p-3 rounded-2xl glass border-border text-muted-foreground hover:text-foreground transition-all active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={10} strokeWidth={3} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Environment Tuning</span>
              </div>
              <h1 className="font-display text-4xl tracking-tight text-gradient">{t('title')}</h1>
            </div>
          </div>
          <p className="max-w-md text-sm font-medium text-muted-foreground leading-relaxed -mt-2 ml-2">
            Customize your interaction layer, interface themes, and cryptographic security protocols.
          </p>
        </section>

        <div className="grid lg:grid-cols-1 gap-12">
          
          {/* Appearance Section */}
          <Section title="Interface Layer" icon={Palette}>
            <div className="grid gap-8">
              {/* Theme Grid */}
              <div className="grid grid-cols-3 gap-4">
                {THEMES.map((tItem) => {
                  const isActive = theme === tItem.id;
                  return (
                    <button
                      key={tItem.id}
                      onClick={() => setTheme(tItem.id)}
                      className={`relative p-8 rounded-[2rem] border transition-all flex flex-col items-center gap-4 group active:scale-[0.98] noise ${
                        isActive 
                        ? "bg-primary/5 border-primary shadow-xl shadow-primary/10" 
                        : "glass border-border/40 hover:border-primary/20"
                      }`}
                    >
                      <tItem.icon className={`w-8 h-8 ${isActive ? "text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "text-muted-foreground/40"}`} />
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? "text-foreground" : "text-muted-foreground/60"}`}>
                        {t(tItem.labelKey)}
                      </span>
                      {isActive && (
                        <motion.div layoutId="theme-active" className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary border-[3px] border-background flex items-center justify-center shadow-lg">
                          <Check size={10} className="text-white" strokeWidth={5} />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Text Size Segmented Control */}
              <div className="flex items-center justify-between p-2 rounded-[2rem] glass border-border/40 shadow-inner">
                {TEXT_SIZES.map((ts) => {
                  const isActive = textSize === ts.id;
                  return (
                    <button
                      key={ts.id}
                      onClick={() => setTextSize(ts.id)}
                      className={`flex-1 py-4 px-3 rounded-[1.5rem] transition-all text-[10px] font-black uppercase tracking-widest relative ${
                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isActive && (
                        <motion.div layoutId="size-active" className="absolute inset-0 bg-background/60 shadow-lg border border-border rounded-[1.5rem] backdrop-blur-md" />
                      )}
                      <span className="relative z-10">{t(ts.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* Localization Section */}
          <Section title="Localization Hub" icon={Globe}>
            <div className="grid sm:grid-cols-2 gap-4">
              {LANGUAGES.map((lang) => {
                const isActive = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all group active:scale-[0.98] noise ${
                      isActive 
                      ? "bg-primary/5 border-primary shadow-xl shadow-primary/10" 
                      : "glass border-border/40 hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <span className="text-3xl filter saturate-[0.8]">{lang.flag}</span>
                      <div className="flex flex-col items-start gap-1">
                        <span className={`font-black tracking-tight text-base ${isActive ? "text-foreground" : "text-foreground/70"}`}>{lang.native}</span>
                        <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/40">{lang.label} Node</span>
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Account Security Section */}
          <Section title="Decentralized Identity" icon={ShieldCheck}>
            <div className="flex flex-col gap-6">
              {/* DID Box */}
              <div className="noise glass-card p-10 rounded-[2.5rem] flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <ShieldCheck size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-foreground tracking-tight">Active Cryptographic Identifier</h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Verified on-chain via GigID Node</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:underline transition-all">{t('revoke_did') || 'Revoke DID'}</button>
                </div>
                <code className="text-[11px] text-muted-foreground font-mono bg-background/40 p-6 rounded-2xl border border-border break-all leading-relaxed shadow-inner">
                  {did || "did:gigid:unregistered_0x...f3a"}
                </code>
              </div>

              {/* Danger Zone */}
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full h-20 rounded-[2.5rem] border-2 border-dashed border-border/40 glass hover:bg-red-500/5 hover:border-red-500/30 text-muted-foreground hover:text-red-500 transition-all flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] active:scale-[0.98] group"
              >
                <Trash2 className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                {t('clear_data')}
              </button>
            </div>
          </Section>

        </div>

        {/* Footer Info */}
        <footer className="mt-20 flex flex-col items-center gap-6 py-12 border-t border-border/40">
          <div className="flex items-center gap-3 opacity-40">
            <ShieldCheck className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('app_version') || 'GigID Protocol v1.2.4'}</span>
          </div>
          <p className="text-[10px] text-muted-foreground/30 max-w-sm text-center font-medium leading-relaxed uppercase tracking-[0.05em]">
            Identity records are secured locally via AES-256 node encryption. Purging data is final and cannot be recovered by centralized authority.
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
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm p-10 rounded-[3rem] glass border-border shadow-2xl flex flex-col items-center text-center gap-8 noise"
            >
              <div className="w-20 h-20 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Trash2 className="w-10 h-10 text-red-500" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-4xl tracking-tight text-foreground">{t('clear_data')}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  This action will disintegrate your digital identity, linked credentials, and data vault.
                </p>
              </div>
              <div className="flex flex-col w-full gap-4">
                <button
                  onClick={handleClearData}
                  className="w-full h-18 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-red-500/30 active:scale-95 transition-all"
                >
                  {commonT('authorize_purge') || 'Authorize Purge'}
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="w-full h-18 rounded-2xl glass text-muted-foreground font-black uppercase tracking-widest text-[11px] hover:text-foreground transition-all"
                >
                  {commonT('cancel')}
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
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3 px-2">
        <div className="w-1.5 h-6 bg-gradient-to-b from-primary to-accent rounded-full shadow-[0_0_12px_rgba(var(--primary),0.5)]" />
        <Icon size={18} className="text-primary" />
        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}
