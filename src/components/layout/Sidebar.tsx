"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Home, FileText, Share2, Settings, 
  LogOut, HelpCircle, Shield, 
  User, CheckCircle2, LayoutTemplate, Landmark,
  QrCode, ExternalLink, Fingerprint
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useAppStore } from "@/lib/store/app-store";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { 
    theme, setTheme, logout, 
    did, name, email, role, trustScore, kycStatus 
  } = useAppStore();

  const navItems = [
    { label: t("nav.home"), icon: Home, path: "/home" },
    { label: t("nav.profile"), icon: User, path: "/profile" },
    { label: t("nav.platforms"), icon: LayoutTemplate, path: "/platforms" },
    { label: t("nav.bank"), icon: Landmark, path: "/bank" },
    { label: t("nav.credentials"), icon: FileText, path: "/credentials" },
    { label: t("nav.kyc"), icon: Fingerprint, path: "/kyc" },
    { label: t("nav.share"), icon: Share2, path: "/share" },
    { label: t("nav.settings"), icon: Settings, path: "/settings" },
  ];

  const handleNav = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push("/");
    onClose();
  };

  const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase() || "ID";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 left-0 h-full w-[320px] bg-background shadow-2xl z-[101] flex flex-col noise"
          >
            {/* Header / Brand */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Shield size={18} className="text-primary" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-display font-bold text-foreground tracking-tight">GigID</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Section (Non-scrollable) */}
            <div className="px-8 py-6">
              <div 
                onClick={() => handleNav("/profile")}
                className="group p-6 rounded-3xl bg-secondary cursor-pointer active:scale-[0.98] transition-all hover:bg-muted-foreground/5"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-lg font-bold text-white shadow-xl shadow-primary/20">
                      {initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center">
                      <CheckCircle2 size={10} className="text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="font-bold text-foreground truncate tracking-tight">{name || "Gig Worker"}</h3>
                    <p className="text-[10px] text-muted-foreground/60 truncate font-medium uppercase tracking-wider">{email || "Account Unverified"}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between px-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">{t("profile.trustScore")}</span>
                    <span className="text-lg font-display font-black text-primary">{trustScore}%</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">{t("profile.status")}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest leading-none mt-1 ${
                      kycStatus === 'verified' ? 'text-emerald-400' : 
                      kycStatus === 'pending' ? 'text-amber-400' : 'text-muted-foreground/40'
                    }`}>
                      {kycStatus || "Unverified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Navigation Area */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-10 scrollbar-hide">
              {/* Main Nav */}
              <div className="flex flex-col gap-1">
                <span className="px-4 text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-2">{t("nav.title")}</span>
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all relative group ${
                        isActive 
                        ? "text-primary bg-primary/10 font-black" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon size={18} className={isActive ? "text-primary" : "text-muted-foreground/40 group-hover:text-foreground/70"} />
                      <span className="text-sm tracking-tight">{item.label}</span>
                      {isActive && (
                        <motion.div layoutId="nav-active-pip" className="absolute left-0 w-1 h-6 rounded-r-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Identity Section */}
              <div className="flex flex-col gap-1">
                <span className="px-4 text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-2">{t("did.title")}</span>
                <div className="mx-4 p-4 rounded-2xl bg-muted/30 border border-border flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode size={12} className="text-muted-foreground/40" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{t("did.publicKey")}</span>
                    </div>
                    <ExternalLink size={10} className="text-muted-foreground/30" />
                  </div>
                  <code className="text-[9px] text-muted-foreground/60 font-mono break-all leading-relaxed bg-background/50 p-2 rounded-lg border border-border">
                    {did || "did:gigid:unregistered"}
                  </code>
                </div>
              </div>

              {/* System Section */}
              <div className="flex flex-col gap-1">
                <span className="px-4 text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-2">{t("system.title")}</span>
                <button
                  onClick={() => handleNav("/help")}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <HelpCircle size={18} className="text-muted-foreground/40" />
                  <span className="text-sm tracking-tight">{t("system.help")}</span>
                </button>
              </div>
            </div>

            {/* Fixed Bottom Section */}
            <div className="p-8 border-t border-border flex flex-col gap-6 bg-background/20 backdrop-blur-md">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/10 transition-all active:scale-[0.98] group"
              >
                <LogOut size={16} strokeWidth={2.5} className="transition-transform group-hover:-translate-x-1" />
                <span className="text-xs font-bold uppercase tracking-widest">{t("profile.logout")}</span>
              </button>
              
              <div className="flex items-center justify-between opacity-30">
                <span className="text-[8px] font-bold uppercase tracking-widest">{t("system.secure")}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest">v1.2.4</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
