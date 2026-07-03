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
import { useTranslation } from "@/lib/i18n/use-translation";

export default function PlatformsPage() {
  const { did } = useAppStore();
  const [showConnect, setShowConnect] = useState(false);
  const platforms = useLiveQuery(() => db.platforms.where("userId").equals(did || "").toArray(), [did]) || [];
  const connectedPlatforms = platforms.filter(p => p.connected);
  const router = useRouter();
  const { t } = useTranslation();
  
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
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">{t('plat.title')}</span>
              </div>
              <h1 className="font-display text-5xl tracking-tight text-primary">{t('plat.title')}</h1>
            </div>
          </div>
          
          <button 
            onClick={() => setShowConnect(true)}
            className="p-4 rounded-[1.25rem] bg-primary text-white shadow-xl shadow-primary/20 active:scale-95 hover:scale-105 transition-all group"
          >
            <Plus size={24} strokeWidth={3} className="transition-transform group-hover:rotate-90" />
          </button>
        </section>

        <p className="max-w-md text-sm font-medium text-muted-foreground leading-relaxed -mt-4 ml-2 font-sans">
          {t('plat.subtitle')}
        </p>

        {/* --- CONNECTED NODES --- */}
        <section className="flex flex-col gap-6">
          <div className="px-2 flex items-center gap-3">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
              {t('plat.activeConnections')}
            </h2>
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-[10px] font-black text-muted-foreground/40">{connectedPlatforms.length}</span>
          </div>
          
          {connectedPlatforms.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="noise bg-card p-16 text-center flex flex-col items-center gap-6 rounded-[3rem] shadow-xl shadow-primary/5"
            >
              <div className="w-16 h-16 rounded-[1.5rem] bg-secondary flex items-center justify-center text-primary/30">
                <LayoutTemplate size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-foreground">{t('plat.noPlatforms')}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{t('plat.connectFirst')}</p>
              </div>
              <button 
                onClick={() => setShowConnect(true)}
                className="mt-2 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-3 transition-all"
              >
                {t('plat.syncNow')} <ArrowRight size={12} />
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedPlatforms.map((platform) => (
                <motion.div 
                  key={platform.id} 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="noise bg-card p-8 flex flex-col gap-6 rounded-[3rem] group shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className="text-4xl bg-secondary p-4 rounded-[1.5rem] shadow-sm group-hover:scale-110 transition-transform duration-500">
                      {platform.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-foreground tracking-tight font-display">{platform.name} Node</h3>
                      <div className="flex gap-3 mt-1.5">
                         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-[9px] font-black uppercase tracking-wider">
                            ⭐ {platform.avgRating?.toFixed(1)}
                         </div>
                         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-primary text-[9px] font-black uppercase tracking-wider">
                            {t('plat.syncActive')}
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 mt-2 border-t border-secondary">
                     <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest opacity-40">
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        Live Security Tunnel
                     </div>
                     <button className="p-2.5 rounded-xl bg-secondary text-primary hover:bg-primary hover:text-white transition-all">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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
              {t('plat.manualProofs')}
            </h2>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="flex flex-col gap-4">
            {manualPlatforms.map((mp) => (
              <div key={mp.name} className="noise bg-card p-8 flex items-center gap-6 rounded-[2.5rem] shadow-md shadow-primary/5">
                <div className="w-14 h-14 rounded-[1.25rem] bg-secondary flex items-center justify-center text-primary">
                  <Clock size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-foreground tracking-tight font-display">{mp.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">{t('plat.processing')}</span>
                    <div className="w-1 h-1 rounded-full bg-secondary" />
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{mp.date}</span>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-secondary text-[10px] font-black text-primary uppercase tracking-widest hover:bg-muted-foreground/10 transition-all">
                  {t('plat.inspect')}
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
