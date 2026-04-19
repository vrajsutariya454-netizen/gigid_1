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
import { useTranslation } from "@/lib/i18n/use-translation";
import { DEMO_PROFILES } from "@/lib/scoring/demo-profiles";
import { useRouter } from "next/navigation";
import { getLiveTrustScore } from "@/lib/scoring/data-bridge";
import { ScoreBreakdown } from "@/lib/scoring/trust-score";
import AAStatementExplorer from "@/components/aa/AAStatementExplorer";

export default function DataHubPage() {
  const [activeTab, setActiveTab] = useState<'work' | 'integrations' | 'financial' | 'raw'>('work');
  const [scoreData, setScoreData] = useState<ScoreBreakdown | null>(null);
  const { t } = useTranslation();
  const router = useRouter();
  
  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const workRecords = useLiveQuery(() => db.workRecords.toArray()) || [];
  const manualData = useLiveQuery(() => db.manualScoringData.toArray()) || [];
  const currentPersonaId = useLiveQuery(() => db.settings.where("key").equals("current_persona").first());

  useEffect(() => {
    async function loadData() {
      const data = await getLiveTrustScore();
      setScoreData(data);
    }
    loadData();
  }, [workRecords, manualData, platforms]);

  const disconnectPlatform = async (id: number) => {
    if (confirm(t('data.confirmDisconnect'))) {
      const platform = platforms.find(p => p.id === id);
      if (platform) {
        await db.workRecords.where("instanceId").equals(id).delete();
        await db.workRecords.where("platformId").equals(platform.platformId.toLowerCase()).delete();
        await db.platforms.delete(id);
      }
    }
  };

  const deleteManualData = async (id: number) => {
    if (confirm(t('data.confirmDelete'))) {
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
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">{t('data.title')}</span>
              </div>
              <h1 className="font-display text-5xl tracking-tight text-primary">{t('nav.dataHub')}</h1>
            </div>
          </div>
          <p className="max-w-md text-sm font-medium text-muted-foreground leading-relaxed -mt-2 ml-2 font-sans">
            {t('data.subtitle')}
          </p>
        </section>

        {/* Tabs */}
        <div className="flex bg-secondary p-1.5 rounded-[2rem] shadow-sm">
          <TabButton 
            active={activeTab === 'work'} 
            onClick={() => setActiveTab('work')} 
            icon={<History size={14} />} 
            label={t('data.history')} 
          />
          <TabButton 
            active={activeTab === 'integrations'} 
            onClick={() => setActiveTab('integrations')} 
            icon={<Database size={14} />} 
            label={t('data.nodes')} 
          />
          <TabButton 
            active={activeTab === 'financial'} 
            onClick={() => setActiveTab('financial')} 
            icon={<Landmark size={14} />} 
            label={t('data.aaSection')} 
          />
          <TabButton 
            active={activeTab === 'raw'} 
            onClick={() => setActiveTab('raw')} 
            icon={<Code size={14} />} 
            label={t('data.kernel')} 
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
                <SectionHeader title={t('data.verifiedRecords')} icon={<Database size={14} />} />
                <div className="flex flex-col gap-4">
                  {workRecords.length === 0 ? (
                    <EmptyState message={t('data.emptyRecords')} />
                  ) : (
                    workRecords.map(record => (
                      <DataCard 
                        key={record.id}
                        title={record.platformId}
                        subtitle={record.month}
                        value={formatCurrency(record.earnings)}
                        detail={t('data.verifiedTx', { count: record.trips.toString() })}
                        badge={t('data.crypticProve')}
                        badgeColor="text-accent"
                      />
                    ))
                  )}
                </div>

                <SectionHeader title={t('data.selfDeclared')} icon={<Plus size={14} />} />
                <div className="flex flex-col gap-4">
                  {manualData.map(data => (
                    <DataCard 
                      key={data.id}
                      title="Manual Logic"
                      subtitle={data.month}
                      value={formatCurrency(data.income)}
                      detail={t('data.daysReported', { count: data.activeDays.toString() })}
                      badge={t('data.userAsserted')}
                      badgeColor="text-red-400"
                      onDelete={() => deleteManualData(data.id!)}
                    />
                  ))}
                  {manualData.length === 0 && (
                    <p className="text-[10px] text-center text-muted-foreground/30 font-black uppercase tracking-widest py-4">{t('data.zeroEntries')}</p>
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
                <SectionHeader title={t('data.connectors')} icon={<ShieldCheck size={14} />} />
                <div className="flex flex-col gap-4">
                  {platforms.filter(p => p.connected).map(p => (
                    <IntegrationCard 
                      key={p.id}
                      name={p.name}
                      status={t('common.active')}
                      lastSync={p.lastSynced?.toLocaleDateString() || "Just Now"}
                      onDisconnect={() => disconnectPlatform(p.id!)}
                    />
                  ))}
                  {platforms.filter(p => p.connected).length === 0 && (
                    <EmptyState message={t('data.emptyTunnels')} />
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'financial' && (
              <motion.div 
                key="financial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="noise bg-card p-6 rounded-[2rem] shadow-md shadow-primary/5 flex flex-col gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary">{t('data.coverage')}</span>
                      <span className="text-2xl font-black text-foreground">{Math.round((scoreData?.aaDetails.verifiedIncomeRatio || 0) * 100)}%</span>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round((scoreData?.aaDetails.verifiedIncomeRatio || 0) * 100)}%` }}
                          className="h-full bg-primary" 
                        />
                      </div>
                   </div>
                   <div className="noise bg-card p-6 rounded-[2rem] shadow-md shadow-primary/5 flex flex-col gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-accent">{t('data.consistency')}</span>
                      <span className="text-2xl font-black text-foreground">{Math.round((scoreData?.aaDetails.cashFlowConsistency || 0) * 100)}%</span>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round((scoreData?.aaDetails.cashFlowConsistency || 0) * 100)}%` }}
                          className="h-full bg-accent" 
                        />
                      </div>
                   </div>
                   <div className="noise bg-card p-6 rounded-[2rem] shadow-md shadow-primary/5 flex flex-col gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t('data.health')}</span>
                      <span className="text-2xl font-black text-foreground">{Math.round((scoreData?.aaDetails.balanceHealth || 0) * 100)}%</span>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round((scoreData?.aaDetails.balanceHealth || 0) * 100)}%` }}
                          className="h-full bg-muted-foreground/30" 
                        />
                      </div>
                   </div>
                </div>

                <SectionHeader title={t('data.bankExplorer')} icon={<Landmark size={14} />} />
                <AAStatementExplorer transactions={scoreData?.aaTransactions || []} />
              </motion.div>
            )}

            {activeTab === 'raw' && (
              <motion.div 
                key="raw"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <SectionHeader title={t('data.personaMetadata')} icon={<Code size={14} />} />
                <div className="noise glass-card p-10 rounded-[3rem] border-primary/20 bg-primary/5 overflow-x-auto">
                  <pre className="text-[11px] text-primary font-mono leading-relaxed opacity-80">
                    {JSON.stringify(currentPersona || "No Persona Selected", null, 2)}
                  </pre>
                </div>
                <div className="p-6 rounded-[2rem] border border-dashed border-border/60 bg-transparent flex gap-4 items-start">
                  <Info size={16} className="text-primary mt-1 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-relaxed">
                    {t('data.kernelWarning')}
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
        active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
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
  const { t } = useTranslation();
  return (
    <div className="noise bg-card p-6 rounded-[2.5rem] flex items-center justify-between group transition-all shadow-md shadow-primary/5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{title} {t('data.node')}</span>
          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary ${badgeColor}`}>
            {badge}
          </span>
        </div>
        <span className="text-lg font-black text-foreground tracking-tight font-display italic">{subtitle}</span>
        <div className="flex items-center gap-2 mt-1">
           <div className="w-1 h-1 rounded-full bg-primary/40" />
           <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{detail}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-base font-black text-foreground">{value}</span>
        {onDelete && (
          <button onClick={onDelete} className="p-2.5 rounded-xl bg-secondary hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/30 transition-all">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

 function IntegrationCard({ name, status, lastSync, onDisconnect }: any) {
  const { t } = useTranslation();
  return (
    <div className="noise bg-card p-8 rounded-[3rem] shadow-xl shadow-primary/5 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-sm">
           <Database size={24} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-foreground tracking-tight font-display">{name} {t('data.node')}</span>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{t('data.syncActive')}</span>
        </div>
      </div>
      <button 
        onClick={onDisconnect}
        className="flex items-center gap-2.5 py-3.5 px-6 rounded-[1.25rem] bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
      >
        <XCircle size={14} strokeWidth={3} />
        {t('data.killSocket')}
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
