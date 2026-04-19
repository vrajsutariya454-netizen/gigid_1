"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, getSetting } from "@/lib/db/database";
import { 
  Database, History, Landmark, 
  Plus, TrendingUp, Calendar, 
  ShieldCheck, ArrowRight, Trash2,
  XCircle, Info, Code
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_PROFILES } from "@/lib/scoring/demo-profiles";

export default function DataHubPage() {
  const [activeTab, setActiveTab] = useState<'work' | 'integrations' | 'raw'>('work');
  
  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const workRecords = useLiveQuery(() => db.workRecords.toArray()) || [];
  const manualData = useLiveQuery(() => db.manualScoringData.toArray()) || [];
  const currentPersonaId = useLiveQuery(() => db.settings.where("key").equals("current_persona").first());

  const disconnectPlatform = async (id: number) => {
    if (confirm("Disconnect this platform? This will remove all associated work records.")) {
      const platform = platforms.find(p => p.id === id);
      if (platform) {
        // 1. Delete work records by instanceId (multi-instance aware)
        await db.workRecords.where("instanceId").equals(id).delete();
        // 2. Also delete any legacy records matched by platformId + this instance
        await db.workRecords.where("platformId").equals(platform.platformId.toLowerCase()).delete();
        // 3. Remove the platform entry entirely
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
    <div className="page-content flex flex-col gap-8 pb-32">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Identity Hub</h1>
        <p className="text-sm text-[var(--text-tertiary)] font-bold mt-1">Manage the data powering your Trust Score</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-muted border border-border mx-auto w-full">
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
          label="Links" 
        />
        <TabButton 
          active={activeTab === 'raw'} 
          onClick={() => setActiveTab('raw')} 
          icon={<Code size={14} />} 
          label="Backend" 
        />
      </div>

      {/* Content Area */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {activeTab === 'work' && (
            <motion.div 
              key="work"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <SectionHeader title="Verified Platform History" icon={<Database size={16} />} />
              {workRecords.length === 0 ? (
                <EmptyState message="No verified records found. Disconnect and reconnect to sync." />
              ) : (
                workRecords.map(record => (
                  <DataCard 
                    key={record.id}
                    title={record.platformId.toUpperCase()}
                    subtitle={record.month}
                    value={formatCurrency(record.earnings)}
                    detail={`${record.trips} Trips Fetched via API`}
                    badge="Provider Verified"
                    badgeColor="text-blue-500"
                    onDelete={() => {}} // History tied to platform
                  />
                ))
              )}

              <SectionHeader title="Self-Declared Data" icon={<Plus size={16} />} />
              {manualData.map(data => (
                <DataCard 
                  key={data.id}
                  title="Manual Entry"
                  subtitle={data.month}
                  value={formatCurrency(data.income)}
                  detail={`${data.activeDays} Days Reported by User`}
                  badge="Self-Verified"
                  badgeColor="text-amber-500"
                  onDelete={() => deleteManualData(data.id!)}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'integrations' && (
            <motion.div 
              key="integrations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <SectionHeader title="Connected Integrations" icon={<ShieldCheck size={16} />} />
              {platforms.filter(p => p.connected).map(p => (
                <IntegrationCard 
                  key={p.id}
                  name={p.name}
                  status="Active"
                  lastSync={p.lastSynced?.toLocaleDateString() || "Today"}
                  onDisconnect={() => disconnectPlatform(p.id!)}
                />
              ))}
              {platforms.filter(p => p.connected).length === 0 && (
                <EmptyState message="No active integrations. Data is currently manual or mock." />
              )}
            </motion.div>
          )}

          {activeTab === 'raw' && (
            <motion.div 
              key="raw"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <SectionHeader title="Backend Source (JSON)" icon={<Code size={14} />} />
              <div className="p-6 rounded-[2.5rem] bg-muted/30 border border-border overflow-x-auto">
                <pre className="text-[10px] text-blue-400 font-mono leading-relaxed">
                  {JSON.stringify(currentPersona || "No Persona Selected", null, 2)}
                </pre>
              </div>
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] px-4 leading-relaxed">
                <Info size={12} className="inline mr-1" />
                This is the raw &quot;Backend Database&quot; for the current persona. The Trust Score engine consumes these values directly to calculate your credibility.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${
        active ? 'bg-blue-600 text-white shadow-lg' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionHeader({ title, icon }: { title: string, icon: any }) {
  return (
    <div className="flex items-center gap-2 px-2 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">
      {icon}
      {title}
    </div>
  );
}

function DataCard({ title, subtitle, value, detail, badge, badgeColor, onDelete }: any) {
  return (
    <div className="glass-card p-5 bg-muted/50 rounded-3xl flex items-center justify-between group shadow-sm transition-all hover:border-primary/20">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{title}</span>
          <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-muted/50 ${badgeColor}`}>
            {badge}
          </span>
        </div>
        <span className="text-sm font-black text-[var(--text-primary)] tracking-tight">{subtitle}</span>
        <div className="flex items-center gap-1.5 opacity-60">
           <Info size={10} className="text-blue-500" />
           <span className="text-[10px] font-bold text-[var(--text-tertiary)]">{detail}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-black text-[var(--text-primary)]">{value}</span>
        {onDelete && (
          <button onClick={onDelete} className="p-2 text-red-500/50 hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function IntegrationCard({ name, status, lastSync, onDisconnect }: any) {
  return (
    <div className="card p-5 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
           <Database size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black text-[var(--text-primary)]">{name}</span>
          <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Connected</span>
        </div>
      </div>
      <button 
        onClick={onDisconnect}
        className="flex items-center gap-2 py-2 px-4 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
      >
        <XCircle size={14} />
        Disconnect
      </button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-8 rounded-3xl bg-muted/30 border border-dashed border-border text-center">
      <p className="text-xs font-bold text-[var(--text-tertiary)] leading-relaxed italic">{message}</p>
    </div>
  );
}
