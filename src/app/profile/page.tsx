"use client";

import { useAppStore } from "@/lib/store/app-store";
import { useState, useEffect } from "react";
import { 
  User, Phone, Save, ChevronLeft, 
  CheckCircle2, ShieldCheck, Shield, Mail, Tag, 
  Plus, IndianRupee, Calendar, History,
  Sparkles, ArrowRight, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { db } from "@/lib/db/database";

export default function ProfilePage() {
  const { name, phone, email, username, role, did, trustScore, setUser } = useAppStore();
  
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
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">Account Control</span>
            </div>
            <h1 className="font-display text-4xl tracking-tight text-gradient">Manage Profile</h1>
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
          
          <div className="mt-8 px-6 py-2.5 rounded-full glass border-accent/20 flex items-center gap-2.5">
            <CheckCircle2 size={14} className="text-accent" />
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{trustScore}% Integrity Verified</span>
          </div>
        </section>

        {/* --- SETTINGS GRID --- */}
        <div className="grid lg:grid-cols-2 gap-10">
          
          {/* Section 1: Identity */}
          <section className="flex flex-col gap-6">
            <div className="px-2">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-1">Identity Details</h3>
              <p className="text-xs text-muted-foreground font-medium">Your verifiable legal identity information.</p>
            </div>
            
            <div className="noise glass-card p-8 rounded-[2.5rem] flex flex-col gap-6">
               <InputField label="Gig Email" value={email || ""} readOnly icon={<Mail size={16}/>} />
               <InputField label="Legal Full Name" value={formData.fullName} onChange={(val: string) => setFormData({...formData, fullName: val})} icon={<User size={16}/>} />
               <InputField label="Handle / Username" value={formData.username} onChange={(val: string) => setFormData({...formData, username: val})} icon={<Tag size={16}/>} />
               
               <button 
                onClick={handleSave} 
                className="w-full mt-2 h-16 rounded-[1.25rem] bg-primary text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
               >
                 {isSaving ? <Loader2 className="animate-spin" size={18} /> : showSuccess ? "Account Synchronized" : <><History size={16}/> Push Changes</>}
                 {!isSaving && !showSuccess && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
               </button>
            </div>
          </section>

          {/* Section 2: Financial & History */}
          <section className="flex flex-col gap-6">
            <div className="px-2 flex justify-between items-end">
              <div>
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-1">Financial Data Hub</h3>
                <p className="text-xs text-muted-foreground font-medium">Add or audit your verifiable income history.</p>
              </div>
              <button 
                onClick={() => setShowFinancialForm(!showFinancialForm)} 
                className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-1.5 p-2 px-4 rounded-full glass border-accent/20 hover:bg-accent/5 transition-all"
              >
                {showFinancialForm ? "Close Form" : <><Plus size={12} strokeWidth={3}/> New Entry</>}
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
                        <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1">Period (YYYY-MM)</label>
                        <input type="text" value={newMonth} onChange={e => setNewMonth(e.target.value)} placeholder="2026-04" className="w-full glass bg-muted/20 border-border p-4 rounded-2xl text-sm font-bold text-foreground outline-none focus:border-accent/40" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1">Net Earnings</label>
                          <input type="number" value={newIncome} onChange={e => setNewIncome(e.target.value)} placeholder="₹" className="w-full glass bg-muted/20 border-border p-4 rounded-2xl text-sm font-bold text-foreground outline-none focus:border-accent/40" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1">Actv Days</label>
                          <input type="number" value={newDays} onChange={e => setNewDays(e.target.value)} placeholder="Days" className="w-full glass bg-muted/20 border-border p-4 rounded-2xl text-sm font-bold text-foreground outline-none focus:border-accent/40" />
                        </div>
                      </div>
                    </div>
                    <button onClick={handleAddFinancial} className="w-full h-14 rounded-2xl bg-accent text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95">
                      Register Income Proof
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div 
                onClick={() => router.push('/home')} 
                className="noise glass-card p-8 rounded-[2.5rem] flex items-center gap-6 cursor-pointer hover:border-primary/40 transition-all group"
              >
                <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <History size={24} />
                </div>
                <div className="flex-1">
                   <h4 className="text-base font-black text-foreground tracking-tight">Statement History Hub</h4>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Audit and export your data records</p>
                </div>
                <ChevronLeft className="rotate-180 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </div>

              <div className="p-6 rounded-[2rem] border border-dashed border-border flex items-start gap-4 opacity-50">
                 <Shield className="text-primary mt-1" size={16} />
                 <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                   Privacy Note: Your financial data is encrypted and stored locally in your Gig DID vault. It is only shared during loan verification audits with your explicit consent.
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
          className="w-full glass bg-muted/20 border-border text-foreground py-5 pl-[4.5rem] pr-6 rounded-2xl text-sm font-bold transition-all h-16 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 placeholder:text-muted-foreground/20"
        />
      </div>
    </div>
  );
}
