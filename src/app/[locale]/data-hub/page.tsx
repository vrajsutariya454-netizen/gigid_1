"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, getSetting } from "@/lib/db/database";
import { 
  Database, History, Landmark, 
  Plus, TrendingUp, Calendar, 
  ShieldCheck, ArrowRight, Trash2,
  XCircle, Info, Code, Sparkles, ChevronLeft
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_PROFILES } from "@/lib/scoring/demo-profiles";
import { useRouter } from "next/navigation";

export default function DataHubPage() {
  const [activeTab, setActiveTab] = useState<'work' | 'integrations' | 'raw'>('work');
  const router = useRouter();
  
  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const workRecords = useLiveQuery(() => db.workRecords.toArray()) || [];
  const manualData = useLiveQuery(() => db.manualScoringData.toArray()) || [];
  const currentPersonaId = useLiveQuery(() => db.settings.where("key").equals("current_persona").first());

  const disconnectPlatform = async (id: number) => {
    if (confirm("Disconnect this platform? This will remove all associated work records.")) {
      const platform = platforms.find(p => p.id === id);
      if (platform) {
        await db.workRecords.where("instanceId").equals(id).delete();
        await db.workRecords.where("platformId").equals(platform.platformId.toLowerCase()).delete();
        await db.platforms.delete(id);
      }
    }
  };

  const deleteManualData = async (id: number) => {
    if (confirm("Delete this entry?")) {
      await db.manualScoringData.delete(id);
    }
  };

  const currentPersona = DEMO_PROFILES.find(p => p.user_id === currentPersonaId?.value);

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
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Data Architecture</span>
              </div>
              <h1 className="font-display text-4xl tracking-tight text-gradient">Identity Hub</h1>
            </div>
          </div>
          <p className="max-w-md text-sm font-medium text-muted-foreground leading-relaxed -mt-2 ml-2">
            Audit the raw verifiable records and linked integrations powering your trust profile.
          </p>
        </section>

        {/* Tabs */}
        <div className="flex glass p-2 rounded-[2rem] border-border shadow-inner">
          <TabButton 
            active={activeTab === 'work'} 
            onClick={() => setActiveTab('work')} 
            icon={<History size={14} />} 
            label="History" 
          />
          <TabButton 
            active={activeTab === 'integrations'} 
            onClick={() => setActiveTab('integrations')} 
            icon={<Database size={14} />} 
            label="Nodes" 
          />
          <TabButton 
            active={activeTab === 'raw'} 
            onClick={() => setActiveTab('raw')} 
            icon={<Code size={14} />} 
            label="Kernel" 
          />
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {activeTab === 'work' && (
              <motion.div 
                key="work"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <SectionHeader title="Verified Platform History" icon={<Database size={14} />} />
                <div className="flex flex-col gap-4">
                  {workRecords.length === 0 ? (
                    <EmptyState message="No verified records found in vault. Connect nodes to start syncing history." />
                  ) : (
                    workRecords.map(record => (
                      <DataCard 
                        key={record.id}
                        title={record.platformId}
                        subtitle={record.month}
                        value={formatCurrency(record.earnings)}
                        detail={`${record.trips} verified transactions`}
                        badge="Cryptic Prove"
                        badgeColor="text-accent"
                      />
                    ))
                  )}
                </div>

                <SectionHeader title="Self-Declared Proofs" icon={<Plus size={14} />} />
                <div className="flex flex-col gap-4">
                  {manualData.map(data => (
                    <DataCard 
                      key={data.id}
                      title="Manual Logic"
                      subtitle={data.month}
                      value={formatCurrency(data.income)}
                      detail={`${data.activeDays} Days Reported`}
                      badge="User Asserted"
                      badgeColor="text-red-400"
                      onDelete={() => deleteManualData(data.id!)}
                    />
                  ))}
                  {manualData.length === 0 && (
                    <p className="text-[10px] text-center text-muted-foreground/30 font-black uppercase tracking-widest py-4">Zero manual entries</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div 
                key="integrations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <SectionHeader title="Data Connectors" icon={<ShieldCheck size={14} />} />
                <div className="flex flex-col gap-4">
                  {platforms.filter(p => p.connected).map(p => (
                    <IntegrationCard 
                      key={p.id}
                      name={p.name}
                      status="Active"
                      lastSync={p.lastSynced?.toLocaleDateString() || "Just Now"}
                      onDisconnect={() => disconnectPlatform(p.id!)}
                    />
                  ))}
                  {platforms.filter(p => p.connected).length === 0 && (
                    <EmptyState message="No active data tunnels. Establish a link to begin synchronization." />
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'raw' && (
              <motion.div 
                key="raw"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <SectionHeader title="Persona Metadata (JSON)" icon={<Code size={14} />} />
                <div className="noise glass-card p-10 rounded-[3rem] border-primary/20 bg-primary/5 overflow-x-auto">
                  <pre className="text-[11px] text-primary font-mono leading-relaxed opacity-80">
                    {JSON.stringify(currentPersona || "No Persona Selected", null, 2)}
                  </pre>
                </div>
                <div className="p-6 rounded-[2rem] border border-dashed border-border/60 bg-transparent flex gap-4 items-start">
                  <Info size={16} className="text-primary mt-1 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-relaxed">
                    Kernel Warning: This is the raw JSON descriptor for your current instance. The Trust Scoring engine parses these key-pair attributes to simulate creditworthiness.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-widest ${
        active ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionHeader({ title, icon }: { title: string, icon: any }) {
  return (
    <div className="flex items-center gap-3 px-3 text-[10px] font-black text-primary uppercase tracking-[0.25em]">
      {icon}
      {title}
    </div>
  );
}

function DataCard({ title, subtitle, value, detail, badge, badgeColor, onDelete }: any) {
  return (
    <div className="noise glass-card p-6 rounded-[2rem] flex items-center justify-between group transition-all hover:border-primary/40">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{title} Node</span>
          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-background/50 border border-border/40 ${badgeColor}`}>
            {badge}
          </span>
        </div>
        <span className="text-base font-black text-foreground tracking-tight">{subtitle}</span>
        <div className="flex items-center gap-2 mt-1">
           <div className="w-1 h-1 rounded-full bg-primary/40" />
           <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{detail}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-base font-black text-foreground">{value}</span>
        {onDelete && (
          <button onClick={onDelete} className="p-2.5 rounded-xl glass hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/30 transition-all">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function IntegrationCard({ name, status, lastSync, onDisconnect }: any) {
  return (
    <div className="noise glass-card p-8 rounded-[2.5rem] border-accent/20 bg-accent/5 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
           <Database size={24} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-foreground tracking-tight">{name} Node</span>
          <span className="text-[10px] font-black text-accent uppercase tracking-widest mt-1">Synchronized Link Active</span>
        </div>
      </div>
      <button 
        onClick={onDisconnect}
        className="flex items-center gap-2.5 py-3.5 px-6 rounded-[1.25rem] glass border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10"
      >
        <XCircle size={14} strokeWidth={3} />
        Kill Socket
      </button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-10 rounded-[2.5rem] border border-dashed border-border/40 bg-white/5 text-center flex flex-col items-center gap-4">
      <Info size={24} className="text-muted-foreground/20" />
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest max-w-[200px] leading-relaxed italic">{message}</p>
    </div>
  );
}
