"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building2, 
  Calendar,
  CheckCircle2,
  FileText,
  Lock,
  Search,
  Download,
  IndianRupee,
  History
} from "lucide-react";
import { VerifiedTransaction } from "@/lib/scoring/trust-score";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/use-translation";

interface AAStatementExplorerProps {
  transactions: VerifiedTransaction[];
  bankName?: string;
}

export default function AAStatementExplorer({ transactions, bankName }: AAStatementExplorerProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col gap-6">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
          <input 
            type="text" 
            placeholder={t('data.searchRecords')} 
            className="w-full h-14 bg-secondary/50 rounded-2xl pl-14 pr-6 text-sm font-bold text-foreground outline-none focus:bg-white focus:shadow-xl focus:shadow-primary/5 transition-all placeholder:text-muted-foreground/30"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none h-14 px-8 rounded-2xl bg-secondary text-[10px] font-black uppercase tracking-widest text-primary hover:bg-muted-foreground/5 flex items-center justify-center gap-2 transition-all">
            <Calendar size={14} />
            {t('common.period')}
          </button>
          <button className="flex-1 sm:flex-none h-14 px-8 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <Download size={14} />
            {t('data.exportVault')}
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="noise bg-card rounded-[3.5rem] shadow-xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-secondary/30">
                <th className="py-6 px-10 text-left text-[9px] font-black uppercase tracking-[0.2em] text-primary">{t('common.status')}</th>
                <th className="py-6 px-6 text-left text-[9px] font-black uppercase tracking-[0.2em] text-primary">{t('data.txDesc')}</th>
                <th className="py-6 px-6 text-left text-[9px] font-black uppercase tracking-[0.2em] text-primary">{t('data.entity')}</th>
                <th className="py-6 px-6 text-left text-[9px] font-black uppercase tracking-[0.2em] text-primary">{t('data.timeline')}</th>
                <th className="py-6 px-10 text-right text-[9px] font-black uppercase tracking-[0.2em] text-primary">{t('data.quantum')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {transactions.map((tx, idx) => (
                <motion.tr 
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-primary/5 transition-colors cursor-default"
                >
                  <td className="py-6 px-10">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck size={14} strokeWidth={2.5} />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{t('common.verified')}</span>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors font-display italic">{tx.description}</p>
                      <div className="flex items-center gap-1.5 opacity-40">
                         <Lock size={10} />
                         <span className="text-[9px] font-bold uppercase tracking-widest">{t('data.protocolSigned')}: {tx.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-2 bg-secondary py-1.5 px-3 rounded-full w-fit">
                      <Building2 size={12} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">{tx.bank}</span>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-foreground opacity-80">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{t('data.financialNode')}</span>
                    </div>
                  </td>
                  <td className="py-6 px-10 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-lg font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {tx.type === 'credit' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                      <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest leading-none mt-1">{t('data.gigSettlement')}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                       <History size={48} strokeWidth={1} />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
                         {t('data.noFinancialHistory')}
                       </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Context */}
      <div className="mx-auto flex items-start gap-4 p-8 rounded-[2.5rem] border border-dashed border-primary/20 bg-primary/5 max-w-2xl mt-4">
        <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/20">
          <Lock size={20} className="text-white" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h5 className="text-[11px] font-black uppercase tracking-[0.1em] text-primary">{t('data.e2eVerification')}</h5>
          <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
            {t('data.aaDescription')}
          </p>
        </div>
      </div>
    </div>
  );
}
