"use client";

import { useAppStore } from "@/lib/store/app-store";
import { useState, useEffect } from "react";
import { 
  User, Mail, Tag, ArrowRight, CheckCircle2,
  FileCheck, ShieldCheck, Plus, Share2, 
  Image as ImageIcon, Sparkles, ChevronLeft, 
  Shield, Check, Loader2, History as HistoryIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/i18n/use-translation";
import { supabase } from "@/lib/supabaseClient";
import { db } from "@/lib/db/database";

export default function ProfilePage() {
  const { name, phone, email, username, role, did, trustScore, language, setLanguage, setUser } = useAppStore();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({ 
    fullName: name, 
    phone: phone,
    username: username || "" 
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showFinancialForm, setShowFinancialForm] = useState(false);
  const [newMonth, setNewMonth] = useState("");
  const [newIncome, setNewIncome] = useState("");
  const [newDays, setNewDays] = useState("");

  const router = useRouter();

  useEffect(() => {
    setFormData({
      fullName: name,
      phone: phone,
      username: username || ""
    });
  }, [name, phone, username]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          username: formData.username,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      setUser({ name: formData.fullName, username: formData.username });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFinancial = async () => {
    if (!newMonth || !newIncome || !newDays) return;
    try {
      await db.manualScoringData.add({
        month: newMonth,
        income: parseFloat(newIncome),
        activeDays: parseInt(newDays),
        verifiedInflow: parseFloat(newIncome) * 0.8
      });
      setNewMonth("");
      setNewIncome("");
      setNewDays("");
      setShowFinancialForm(false);
    } catch (err) {
      alert("Error saving data. Month might already exist.");
    }
  };

  const initials = formData.fullName?.split(" ").map(n => n[0]).join("").toUpperCase() || "ID";

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] animate-float opacity-30" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[130px] animate-float [animation-delay:3s] opacity-20" />
      </div>

      <div className="relative z-10 page-content pb-32 flex flex-col gap-10">
        {/* Header */}
        <section className="pt-6 flex items-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="p-3 rounded-2xl glass border-border text-muted-foreground hover:text-foreground transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={10} strokeWidth={3} />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">{t('profile.settings')}</span>
            </div>
            <h1 className="font-display text-5xl tracking-tight text-primary">{t('profile.title')}</h1>
          </div>
        </section>

        {/* Identity Hero */}
        <section className="flex flex-col items-center py-4">
          <div className="relative">
            <div className="w-36 h-36 flex items-center justify-center shadow-2xl text-4xl font-black text-white rounded-[2.5rem] bg-gradient-to-tr from-primary to-accent border-[6px] border-[#1a1a1a]/40 backdrop-blur-xl">
              {initials}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-accent border-[3px] border-[#1a1a1a] text-white flex items-center justify-center shadow-2xl">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="mt-8 px-6 py-2.5 rounded-full bg-secondary flex items-center gap-2.5 shadow-sm">
            <CheckCircle2 size={14} className="text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{trustScore}% {t('dash.trustStatus')}</span>
          </div>
        </section>

        {/* --- SETTINGS GRID --- */}
        <div className="grid lg:grid-cols-2 gap-10">
          
          {/* Section 1: Identity */}
          <section className="flex flex-col gap-6">
            <div className="px-2">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-1">{t('profile.settings')}</h3>
              <p className="text-xs text-muted-foreground font-medium">{t('data.subtitle')}</p>
            </div>
            
            <div className="noise bg-card p-10 rounded-[3rem] shadow-xl shadow-primary/5 flex flex-col gap-6">
               <InputField label={t('profile.emailLabel')} value={email || ""} readOnly icon={<Mail size={16}/>} />
               <InputField label={t('profile.nameLabel')} value={formData.fullName} onChange={(val: string) => setFormData({...formData, fullName: val})} icon={<User size={16}/>} />
               <InputField label={t('profile.handleLabel')} value={formData.username} onChange={(val: string) => setFormData({...formData, username: val})} icon={<Tag size={16}/>} />
               
               <button 
                onClick={handleSave} 
                className="w-full mt-2 h-18 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
               >
                 {isSaving ? <Loader2 className="animate-spin" size={18} /> : showSuccess ? t('common.success') : <><HistoryIcon size={16}/> {t('profile.save')}</>}
                 {!isSaving && !showSuccess && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
               </button>
            </div>

            {/* Language Switcher Section */}
            <div className="px-2 mt-4 ml-1">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-1">{t('profile.language')}</h3>
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { id: 'en', label: 'English' },
                  { id: 'hi', label: 'हिन्दी' },
                  { id: 'ta', label: 'தமிழ்' },
                  { id: 'bn', label: 'বাংলা' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id as any)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      language === lang.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-secondary text-primary hover:bg-muted-foreground/5'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2: Financial & History */}
          <section className="flex flex-col gap-6">
            <div className="px-2 flex justify-between items-end">
              <div>
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-1">{t('profile.financialHub')}</h3>
                <p className="text-xs text-muted-foreground font-medium">{t('profile.financialDesc')}</p>
              </div>
              <button 
                onClick={() => setShowFinancialForm(!showFinancialForm)} 
                className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-1.5 p-2 px-4 rounded-full glass border-accent/20 hover:bg-accent/5 transition-all"
              >
                {showFinancialForm ? t('profile.closeForm') : <><Plus size={12} strokeWidth={3}/> {t('profile.newEntry')}</>}
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <AnimatePresence>
                {showFinancialForm && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, scale: 0.95 }} 
                    animate={{ height: "auto", opacity: 1, scale: 1 }} 
                    exit={{ height: 0, opacity: 0, scale: 0.95 }} 
                    className="noise glass-card p-8 rounded-[2.5rem] border-accent/30 bg-accent/5 space-y-6 overflow-hidden"
                  >
                    <div className="space-y-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1">{t('profile.period')}</label>
                        <input type="text" value={newMonth} onChange={e => setNewMonth(e.target.value)} placeholder="2026-04" className="w-full glass bg-muted/20 border-border p-4 rounded-2xl text-sm font-bold text-foreground outline-none focus:border-accent/40" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1">{t('profile.earnings')}</label>
                          <input type="number" value={newIncome} onChange={e => setNewIncome(e.target.value)} placeholder="₹" className="w-full glass bg-muted/20 border-border p-4 rounded-2xl text-sm font-bold text-foreground outline-none focus:border-accent/40" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1">{t('profile.activeDays')}</label>
                          <input type="number" value={newDays} onChange={e => setNewDays(e.target.value)} placeholder="Days" className="w-full glass bg-muted/20 border-border p-4 rounded-2xl text-sm font-bold text-foreground outline-none focus:border-accent/40" />
                        </div>
                      </div>
                    </div>
                    <button onClick={handleAddFinancial} className="w-full h-14 rounded-2xl bg-accent text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95">
                      {t('profile.registerProof')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div 
                onClick={() => router.push('/home')} 
                className="noise bg-card p-10 rounded-[3rem] flex items-center gap-6 cursor-pointer shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all group"
              >
                <div className="w-16 h-16 rounded-[24px] bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <HistoryIcon size={24} />
                </div>
                <div className="flex-1">
                   <h4 className="text-xl font-black text-foreground tracking-tight font-display">{t('profile.historyHub')}</h4>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{t('profile.historyDesc')}</p>
                </div>
                <ChevronLeft className="rotate-180 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </div>

              <div className="p-6 rounded-[2rem] border border-dashed border-border flex items-start gap-4 opacity-50">
                 <Shield className="text-primary mt-1" size={16} />
                 <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                   {t('profile.privacyNote')}
                 </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function InputField({ label, value, onChange, readOnly, icon }: any) {
  return (
    <div className={`flex flex-col gap-2 group ${readOnly ? 'opacity-50' : ''}`}>
      <label className="text-[9px] font-black text-primary uppercase tracking-[0.25em] ml-2 block">{label}</label>
      <div className="relative">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors h-4 w-4 flex items-center justify-center">{icon}</div>
        <input 
          type="text" 
          value={value} 
          onChange={readOnly ? undefined : (e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={`Enter your ${label.toLowerCase()}`}
          className="w-full bg-secondary/50 text-foreground py-5 pl-[4.5rem] pr-6 rounded-2xl text-sm font-bold transition-all h-18 outline-none focus:bg-white focus:shadow-xl focus:shadow-primary/5 placeholder:text-muted-foreground/20"
        />
      </div>
    </div>
  );
}
