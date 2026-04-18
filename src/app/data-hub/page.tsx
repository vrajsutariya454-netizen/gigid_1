"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { 
  Database, History, Landmark, 
  Plus, TrendingUp, Calendar, 
  ShieldCheck, ArrowRight, Trash2 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function DataHubPage() {
  const [activeTab, setActiveTab] = useState<'work' | 'transactions' | 'aa'>('work');
  
  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const workRecords = useLiveQuery(() => db.workRecords.toArray()) || [];
  const manualData = useLiveQuery(() => db.manualScoringData.toArray()) || [];

  const deleteWorkRecord = async (id: number) => {
    if (confirm("Delete this record?")) {
      await db.workRecords.delete(id);
    }
  };

  const deleteManualData = async (id: number) => {
    if (confirm("Delete this entry?")) {
      await db.manualScoringData.delete(id);
    }
  };

  return (
    <div className="page-content flex flex-col gap-8 pb-32">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Identity Hub</h1>
        <p className="text-sm text-[var(--text-tertiary)] font-bold mt-1">Manage the data powering your Trust Score</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 bg-[var(--bg-elevated)] border-white/5 rounded-3xl flex flex-col gap-1">
          <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Total Sources</span>
          <span className="text-xl font-black text-blue-500">{platforms.filter(p => p.connected).length + manualData.length}</span>
        </div>
        <div className="card p-5 bg-[var(--bg-elevated)] border-white/5 rounded-3xl flex flex-col gap-1">
          <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Data Health</span>
          <span className="text-xl font-black text-teal-500">Secure</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-white/5 mx-auto w-full">
        <TabButton 
          active={activeTab === 'work'} 
          onClick={() => setActiveTab('work')} 
          icon={<History size={14} />} 
          label="Work" 
        />
        <TabButton 
          active={activeTab === 'transactions'} 
          onClick={() => setActiveTab('transactions')} 
          icon={<TrendingUp size={14} />} 
          label="Txns" 
        />
        <TabButton 
          active={activeTab === 'aa'} 
          onClick={() => setActiveTab('aa')} 
          icon={<Landmark size={14} />} 
          label="Bank" 
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
              <SectionHeader title="Platform Records" icon={<Database size={16} />} />
              {workRecords.length === 0 ? (
                <EmptyState message="No platform records found. Link an account to sync history." />
              ) : (
                workRecords.map(record => (
                  <DataCard 
                    key={record.id}
                    title={record.platformId.toUpperCase()}
                    subtitle={record.month}
                    value={formatCurrency(record.earnings)}
                    detail={`${record.trips} Trips`}
                    onDelete={() => deleteWorkRecord(record.id!)}
                  />
                ))
              )}

              <SectionHeader title="Manual Statements" icon={<Plus size={16} />} />
              {manualData.map(data => (
                <DataCard 
                  key={data.id}
                  title="USER DECLARED"
                  subtitle={data.month}
                  value={formatCurrency(data.income)}
                  detail={`${data.activeDays} Days`}
                  onDelete={() => deleteManualData(data.id!)}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div 
              key="transactions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <SectionHeader title="Earnings Transactions" icon={<TrendingUp size={16} />} />
              <EmptyState message="Connect a bank account via AA to see your daily transaction feed." />
            </motion.div>
          )}

          {activeTab === 'aa' && (
            <motion.div 
              key="aa"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <SectionHeader title="Verified Bank Inflows" icon={<Landmark size={16} />} />
              <EmptyState message="No verified Account Aggregator data currently linked." />
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

function DataCard({ title, subtitle, value, detail, onDelete }: any) {
  return (
    <div className="card p-5 bg-[var(--bg-elevated)] border-white/5 rounded-3xl flex items-center justify-between group shadow-sm transition-all hover:border-white/10">
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{title}</span>
        <span className="text-sm font-black text-[var(--text-primary)] tracking-tight">{subtitle}</span>
        <span className="text-[10px] font-bold text-[var(--text-tertiary)]">{detail}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-black text-[var(--text-primary)]">{value}</span>
        <button onClick={onDelete} className="p-2 text-red-500/50 hover:text-red-500 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center">
      <p className="text-xs font-bold text-[var(--text-tertiary)] leading-relaxed italic">{message}</p>
    </div>
  );
}
