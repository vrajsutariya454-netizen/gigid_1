"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { useAppStore } from "@/lib/store/app-store";
import { useState, useEffect } from "react";
import { 
  Plus, LayoutTemplate, ShieldCheck, ChevronRight, 
  Info, Clock, Sparkles, ChevronLeft, ArrowRight 
} from "lucide-react";
import { ConnectPlatformDialog } from "@/components/platform/ConnectPlatformDialog";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function PlatformsPage() {
  const [showConnect, setShowConnect] = useState(false);
  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const connectedPlatforms = platforms.filter(p => p.connected);
  const router = useRouter();
  
  const manualPlatforms = [
    { name: "Local Courier", status: "pending", date: "2026-04-18" }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] animate-float opacity-30" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[130px] animate-float [animation-delay:3s] opacity-20" />
      </div>

      <div className="relative z-10 page-content pb-32 flex flex-col gap-10">
        {/* Header Area */}
        <section className="pt-6 flex items-center justify-between">
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
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Work Connectivity</span>
              </div>
              <h1 className="font-display text-4xl tracking-tight text-gradient">Manage Nodes</h1>
            </div>
          </div>
          
          <button 
            onClick={() => setShowConnect(true)}
            className="p-4 rounded-[1.25rem] bg-primary text-white shadow-xl shadow-primary/20 active:scale-95 hover:scale-105 transition-all group"
          >
            <Plus size={24} strokeWidth={3} className="transition-transform group-hover:rotate-90" />
          </button>
        </section>

        <p className="max-w-md text-sm font-medium text-muted-foreground leading-relaxed -mt-4 ml-2">
          Connect your gig accounts to automatically aggregate work history, earnings, and ratings into your unified Trust Score.
        </p>

        {/* --- CONNECTED NODES --- */}
        <section className="flex flex-col gap-6">
          <div className="px-2 flex items-center gap-3">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
              Active Connections
            </h2>
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-[10px] font-black text-muted-foreground/40">{connectedPlatforms.length}</span>
          </div>
          
          {connectedPlatforms.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="noise glass-card p-16 text-center flex flex-col items-center gap-6 rounded-[3rem] border-dashed border-2 border-primary/20 bg-primary/5"
            >
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary/30">
                <LayoutTemplate size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-foreground">No platforms synchronized</p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Connect your first node to build trust</p>
              </div>
              <button 
                onClick={() => setShowConnect(true)}
                className="mt-2 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-3 transition-all"
              >
                Sync Platform Now <ArrowRight size={12} />
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedPlatforms.map((platform) => (
                <motion.div 
                  key={platform.id} 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="noise glass-card p-6 flex flex-col gap-6 rounded-[2.5rem] group hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl bg-background/40 p-3 rounded-[1.25rem] border border-border group-hover:scale-110 transition-transform">
                      {platform.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-foreground tracking-tight">{platform.name}</h3>
                      <div className="flex gap-4 mt-1">
                         <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[9px] font-black uppercase">
                            ⭐ {platform.avgRating?.toFixed(1)}
                         </div>
                         <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase">
                            ₹ {formatCurrency(platform.totalEarnings || 0)}
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/40">
                     <div className="flex items-center gap-1.5 text-[9px] font-black text-accent uppercase tracking-widest">
                        <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                        Live API Link
                     </div>
                     <button className="p-2 rounded-xl glass hover:bg-muted transition-all">
                        <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                     </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* --- MANUAL EVIDENCE --- */}
        <section className="flex flex-col gap-6">
          <div className="px-2 flex items-center gap-3">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
              Manual Proofs
            </h2>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="flex flex-col gap-4">
            {manualPlatforms.map((mp) => (
              <div key={mp.name} className="noise glass-card p-6 flex items-center gap-6 rounded-[2rem] border-accent/20 bg-accent/5">
                <div className="w-12 h-12 rounded-[1.25rem] bg-accent/10 flex items-center justify-center text-accent">
                  <Clock size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-foreground tracking-tight">{mp.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-accent uppercase tracking-widest">Audit Pending</span>
                    <div className="w-1 h-1 rounded-full bg-accent/40" />
                    <span className="text-[9px] font-bold text-muted-foreground/60">{mp.date}</span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl glass text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground">
                  View Proof
                </button>
              </div>
            ))}
            
            <div className="p-6 rounded-[2rem] border border-dashed border-border flex items-start gap-4 opacity-50 bg-background/20">
              <Info size={16} className="text-primary mt-1 flex-shrink-0" />
              <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                Manual proofs are processed by our decentralized audit nodes and typically appear in your trust history within 24-48 hours.
              </p>
            </div>
          </div>
        </section>

        <ConnectPlatformDialog 
          open={showConnect} 
          onClose={() => setShowConnect(false)} 
          onConnected={() => setShowConnect(false)} 
        />
      </div>
    </main>
  );
}
