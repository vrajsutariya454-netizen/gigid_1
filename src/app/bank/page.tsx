"use client";

import { useAppStore } from "@/lib/store/app-store";
import { useState, useEffect } from "react";
import {
  Zap,
  Lock,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Fingerprint,
  Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const BANKS = [
  { id: "hdfc", name: "HDFC Bank", icon: "🏦" },
  { id: "icici", name: "ICICI Bank", icon: "🏛️" },
  { id: "axis", name: "Axis Bank", icon: "🏢" },
  { id: "sbi", name: "State Bank of India", icon: "🏦" },
  { id: "kotak", name: "Kotak Mahindra Bank", icon: "🏛️" },
  { id: "indusind", name: "IndusInd Bank", icon: "🏢" },
  { id: "yes", name: "Yes Bank", icon: "🏦" },
  { id: "idfc", name: "IDFC First Bank", icon: "🏛️" },
  { id: "bob", name: "Bank of Baroda", icon: "🏢" },
  { id: "pnb", name: "Punjab National Bank", icon: "🏦" },
];

export default function BankPage() {
  const { trustScore } = useAppStore();

  const [activeTab, setActiveTab] = useState<"direct" | "private">("direct");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/");
      }
    };
    checkAuth();
  }, [router]);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const pageHeader = (
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
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Capital Hub</span>
          </div>
          <h1 className="font-display text-4xl tracking-tight text-gradient">Gig Banking</h1>
        </div>
      </div>
      <p className="max-w-sm text-sm font-medium text-muted-foreground leading-relaxed -mt-2 ml-2">
        Unlock direct lending and private credit lines based on your verified cryptographic work history.
      </p>
    </section>
  );

  // 🔐 PASSWORD SCREEN
  if (selectedBank && !isAuthenticated) {
    return (
      <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] animate-float opacity-30" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[130px] animate-float [animation-delay:3s] opacity-20" />
        </div>
        
        <div className="relative z-10 page-content flex flex-col justify-center items-center h-screen gap-8">
          <div className="w-20 h-20 rounded-[2.5rem] glass border-primary/20 bg-primary/5 flex items-center justify-center text-primary shadow-2xl">
            <Lock size={32} strokeWidth={2.5} />
          </div>

          <div className="text-center">
            <h2 className="font-display text-3xl tracking-tight">Security Access</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-2">
              Authentication required for vault decryption
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <input
              type="password"
              placeholder="Enter Private PIN (Try 1234)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-16 px-6 rounded-2xl glass bg-muted/20 border-border text-center font-black tracking-[0.5em] outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
            />
            <button
              onClick={() => {
                if (password === "1234") {
                  setIsAuthenticated(true);
                } else {
                  alert("Incorrect PIN");
                }
              }}
              className="w-full h-16 rounded-[1.25rem] bg-primary text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Unlock Financial Node
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedBank(null);
              setPassword("");
            }}
            className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground"
          >
            ← Cancel Request
          </button>
        </div>
      </main>
    );
  }

  // 📊 TRANSACTION + TRUST SCREEN
  if (selectedBank && isAuthenticated) {
    return (
      <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] animate-float opacity-30" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[130px] animate-float [animation-delay:3s] opacity-20" />
        </div>

        <div className="relative z-10 page-content flex flex-col gap-10 pb-32">
          <section className="pt-6 flex flex-col gap-6">
            <button
              onClick={() => {
                setSelectedBank(null);
                setIsAuthenticated(false);
                setPassword("");
              }}
              className="w-fit p-3 rounded-2xl glass border-border text-muted-foreground hover:text-foreground transition-all active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-accent">
                <Fingerprint size={12} strokeWidth={3} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Session</span>
              </div>
              <h1 className="font-display text-4xl tracking-tight text-gradient">{selectedBank.toUpperCase()} Activity</h1>
            </div>
          </section>

          {/* Earnings Card */}
          <div className="noise glass-card p-10 rounded-[3rem] border-accent/20 bg-accent/5 flex flex-col items-center text-center gap-2">
            <p className="text-[10px] font-black text-accent uppercase tracking-[0.25em]">Verified Inflow (30D)</p>
            <p className="font-display text-6xl tracking-tight text-foreground">₹48,500</p>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass border-accent/20 text-accent text-[9px] font-black uppercase mt-4">
               <TrendingUp size={10} strokeWidth={3} /> +12.4% vs last period
            </div>
          </div>

          {/* Transactions List */}
          <div className="flex flex-col gap-4">
            <div className="px-2">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Recent Proofs</h3>
            </div>
            {[1, 2, 3, 4, 5].map((t) => (
              <div
                key={t}
                className="noise glass-card p-5 rounded-[1.5rem] flex justify-between items-center group hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Zap size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-foreground">Ride Payment ID:{t}492</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Verified on-chain</span>
                  </div>
                </div>
                <span className="text-sm font-black text-accent">+₹580</span>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="noise glass-card p-8 rounded-[2.5rem] flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary" size={16} />
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Lender Trust Profile</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "Income Stability", value: "98.4%", desc: "Strong consistency history" },
                { label: "Work Frequency", value: "26 Days", desc: "Monthly active engagement" },
                { label: "Earnings Growth", value: "+18%", desc: "High trajectory verified" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-4 rounded-2xl bg-muted/20 border border-border">
                  <div>
                    <span className="text-xs font-black text-foreground">{item.label}</span>
                    <p className="text-[9px] text-muted-foreground font-medium uppercase mt-0.5">{item.desc}</p>
                  </div>
                  <span className="text-sm font-black text-accent">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 🏦 MAIN SCREEN
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] animate-float opacity-30" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[130px] animate-float [animation-delay:3s] opacity-20" />
      </div>

      <div className="relative z-10 page-content flex flex-col gap-10 pb-32">
        {pageHeader}

        {/* Tabs */}
        <div className="flex glass p-2 rounded-[2rem] border-border shadow-2xl">
          <button
            onClick={() => setActiveTab("direct")}
            className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "direct" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Direct Lender
          </button>
          <button
            onClick={() => setActiveTab("private")}
            className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "private" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ZK Credit Hub
          </button>
        </div>

        {/* Bank List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BANKS.map((bank) => (
            <div
              key={bank.id}
              onClick={() => setSelectedBank(bank.id)}
              className="noise glass-card p-6 flex items-center gap-5 rounded-[2rem] cursor-pointer hover:border-primary/40 transition-all hover:scale-[1.02] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {bank.icon}
              </div>
              <div className="flex-1">
                <span className="text-base font-black text-foreground tracking-tight">{bank.name}</span>
                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Institutional Node</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="noise glass-card p-6 rounded-[2rem] flex items-start gap-4 border-dashed border-border/60 bg-transparent">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-medium text-muted-foreground leading-relaxed flex-1">
            <span className="font-black text-foreground uppercase block mb-1">Financial Integrity Protocol</span>
            GigID provides secure cryptographic evidence to participating institutions. We do not provide direct credit; your loans are issued by the verified banks above.
          </p>
        </div>
      </div>
    </main>
  );
}