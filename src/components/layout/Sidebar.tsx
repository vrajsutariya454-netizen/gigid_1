"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Home, FileText, Share2, Settings, 
  Moon, Sun, LogOut, HelpCircle, Shield, 
  User, CheckCircle2, LayoutTemplate, Landmark
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, logout, did, name, phone, trustScore } = useAppStore();

  const navItems = [
    { label: "Home", icon: Home, path: "/home" },
    { label: "Profile", icon: User, path: "/profile" },
    { label: "Platforms", icon: LayoutTemplate, path: "/platforms" },
    { label: "Documents", icon: FileText, path: "/credentials" },
    { label: "Bank", icon: Landmark, path: "/bank" },
    { label: "Share", icon: Share2, path: "/share" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  const handleNav = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogout = () => {
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[280px] bg-[var(--bg-elevated)] border-r border-[var(--border-color)] z-[101] flex flex-col"
          >
            {/* Rich Profile Header */}
            <div className="p-6 border-b border-[var(--border-color)] relative bg-gradient-to-b from-blue-500/5 to-transparent">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition-colors text-[var(--text-tertiary)] z-20"
              >
                <X size={20} />
              </button>

              <div 
                onClick={() => handleNav("/profile")}
                className="flex flex-col gap-4 mt-2 cursor-pointer group active:scale-[0.98] transition-all"
              >
                {/* Avatar & Trust Badge */}
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-white/10 text-xl font-black text-white group-hover:scale-105 transition-transform">
                    {initials}
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
                    trustScore >= 80 
                    ? "bg-teal-500/10 border-teal-500/20 text-teal-500" 
                    : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  }`}>
                    <CheckCircle2 size={12} />
                    {trustScore}% Trust
                  </div>
                </div>

                {/* User Info */}
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] leading-tight tracking-tight group-hover:text-blue-500 transition-colors">
                    {name || "GigID User"}
                  </h3>
                  <p className="text-sm font-bold text-blue-500 mt-0.5 opacity-80">
                    {phone || "+91 00000 00000"}
                  </p>
                  
                  {/* Technical DID */}
                  <div className="mt-4 p-3 rounded-xl bg-black/20 border border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 ">
                      Verifiable Identifier
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono break-all leading-relaxed">
                      {did || "did:gigid:unregistered"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
              <p className="px-4 py-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-1">
                Main Navigation
              </p>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                    pathname === item.path 
                    ? "bg-blue-500/10 text-blue-500" 
                    : "text-[var(--text-secondary)] hover:bg-white/5"
                  }`}
                >
                  <item.icon size={20} className={pathname === item.path ? "text-blue-500" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]"} />
                  <span className="text-sm font-bold">{item.label}</span>
                  {pathname === item.path && (
                    <motion.div layoutId="nav-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}

              <div className="h-px bg-[var(--border-color)] my-4 mx-2" />

              <p className="px-4 py-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-1">
                System
              </p>
              
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-[var(--text-secondary)] hover:bg-white/5 transition-all"
              >
                {theme === "dark" ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-blue-500" />}
                <span className="text-sm font-bold">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>

              <button
                onClick={() => handleNav("/help")}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-[var(--text-secondary)] hover:bg-white/5 transition-all"
              >
                <HelpCircle size={20} className="text-[var(--text-tertiary)]" />
                <span className="text-sm font-bold">Help & Support</span>
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border-color)]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
              >
                <LogOut size={18} strokeWidth={2.5} />
                <span className="text-sm font-black uppercase tracking-tighter">Sign Out</span>
              </button>
              <p className="text-center mt-4 text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] opacity-50">
                GigID Secure v1.0.0
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
