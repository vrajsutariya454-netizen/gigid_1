"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Home, FileText, Share2, Settings, 
  Moon, Sun, LogOut, HelpCircle, Shield, 
  User, CheckCircle2, LayoutTemplate, Landmark
} from "lucide-react";
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
  const { 
    theme, setTheme, logout, 
    did, name, phone, email, role, trustScore 
  } = useAppStore();

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[300px] bg-[var(--bg-elevated)] shadow-2xl z-[101] flex flex-col"
          >
            {/* Unified Profile Header Area */}
            <div className="p-8 pt-12 pb-4">
              <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-[var(--primary-500)]">
                    <Shield size={22} strokeWidth={2.5} />
                  </div>
                  <span className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">GigID</span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2.5 rounded-full hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-tertiary)]"
                >
                  <X size={22} />
                </button>
              </div>

              <div 
                onClick={() => handleNav("/profile")}
                className="p-8 rounded-[32px] bg-[var(--bg-secondary)] flex flex-col gap-8 group cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-5">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg shrink-0"
                    style={{
                      background: "linear-gradient(135deg, var(--primary-600), var(--primary-400))",
                      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
                    }}
                  >
                    {initials}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-[var(--text-primary)] leading-tight tracking-tight">
                      {name || "GigID User"}
                    </h3>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-500 w-fit">
                      <CheckCircle2 size={12} />
                      <span className="text-[11px] font-black uppercase tracking-wider">{trustScore}% Trust</span>
                    </div>
                  </div>
                </div>

<<<<<<< HEAD
                <div className="pt-6 border-t border-[var(--bg-primary)] opacity-60">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-2">
                    Identity DID
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] font-mono break-all leading-relaxed">
                    {did?.substring(0, 32) || "did:gigid:0000..."}...
                  </p>
=======
                {/* User Info */}
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] leading-tight tracking-tight">
                    {name || "GigID User"}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-black py-0.5 px-2 rounded-md bg-blue-500/20 text-blue-500 uppercase tracking-widest">
                      {role || "Gig Worker"}
                    </span>
                    <p className="text-[10px] font-bold opacity-60" style={{ color: "var(--text-tertiary)" }}>
                      {email}
                    </p>
                  </div>
                  
                  {/* Technical DID */}
                  <div className="mt-4 p-3 rounded-xl bg-black/20 border border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 ">
                      Verifiable Identifier
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono break-all leading-relaxed">
                      {did || "did:gigid:unregistered"}
                    </p>
                  </div>
>>>>>>> 30f8171e64b4cdb422b576a9ef74051eeca93103
                </div>
              </div>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto p-6 mt-10 flex flex-col gap-2">
              <p className="px-4 py-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-2 mt-2">
                Main Navigation
              </p>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                    pathname === item.path 
                    ? "font-black shadow-sm" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                  }`}
                  style={pathname === item.path ? { backgroundColor: "var(--bg-primary)", color: "var(--primary-500)" } : {}}
                >
                  <item.icon 
                    size={20} 
                    className={pathname === item.path ? "" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]"} 
                    style={pathname === item.path ? { color: "var(--primary-500)" } : {}}
                  />
                  <span className="text-sm font-bold">{item.label}</span>
                  {pathname === item.path && (
                    <motion.div layoutId="nav-active" className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--primary-500)" }} />
                  )}
                </button>
              ))}

              <div className="my-6" />

              <p className="px-4 py-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-1">
                System
              </p>
              
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all"
              >
                {theme === "dark" ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-[var(--primary-500)]" />}
                <span className="text-sm font-bold">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>

              <button
                onClick={() => handleNav("/help")}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all"
              >
                <HelpCircle size={20} className="text-[var(--text-tertiary)]" />
                <span className="text-sm font-bold">Help & Support</span>
              </button>
            </div>

            {/* Footer */}
            <div className="p-6 mt-auto">
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
