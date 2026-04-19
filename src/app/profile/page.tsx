"use client";

import { useAppStore } from "@/lib/store/app-store";
import { useState, useEffect } from "react";
import { 
  User, Phone, Save, ChevronLeft, 
  CheckCircle2, ShieldCheck, Mail, Tag, 
  Plus, IndianRupee, Calendar, History 
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
  
  // Manual Entry States
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
        verifiedInflow: parseFloat(newIncome) * 0.8 // Simulated verified ratio
      });
      setNewMonth("");
      setNewIncome("");
      setNewDays("");
      setShowFinancialForm(false);
      alert("Financial data saved locally!");
    } catch (err) {
      alert("Error saving data. Month might already exist.");
    }
  };

  const initials = formData.fullName?.split(" ").map(n => n[0]).join("").toUpperCase() || "ID";

  return (
    <div className="page-content pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-muted border border-border text-muted-foreground shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-foreground">Manage Account</h1>
      </div>

      {/* Avatar & Trusted Badge */}
      <div className="flex flex-col items-center mb-16">
        <div className="relative">
          <div className="w-32 h-32 flex items-center justify-center shadow-2xl text-4xl font-black text-white rounded-[2rem] bg-gradient-to-br from-primary to-accent border-[6px] border-background">{initials}</div>
          <div className="absolute -bottom-4 -right-4 p-2.5 rounded-2xl bg-emerald-500 border-[4px] border-background text-white shadow-xl">
            <ShieldCheck size={24} />
          </div>
        </div>
        <div className="mt-8 px-5 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-teal-500" />
          <span className="text-xs font-black text-teal-500 uppercase tracking-widest">{trustScore}% Verified Identity</span>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {/* Profile Settings */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest px-2">Identity Details</h3>
          <div className="flex flex-col gap-4">
             <InputField label="Email" value={email || ""} readOnly icon={<Mail size={18}/>} />
             <InputField label="Legal Name" value={formData.fullName} onChange={(val: string) => setFormData({...formData, fullName: val})} icon={<User size={18}/>} />
             <InputField label="Username" value={formData.username} onChange={(val: string) => setFormData({...formData, username: val})} icon={<Tag size={18}/>} />
          </div>
          <button onClick={handleSave} className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-xl h-14 flex items-center justify-center gap-2">
            {isSaving ? "Saving..." : showSuccess ? "Updated!" : <><Save size={16}/> Save Changes</>}
          </button>
        </section>

        {/* Financial Data Entry */}
        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-2">
              <History size={14}/> Financial Verification
            </h3>
            <button onClick={() => setShowFinancialForm(!showFinancialForm)} className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
              {showFinancialForm ? "Cancel" : <><Plus size={12}/> Add Month</>}
            </button>
          </div>

          <AnimatePresence>
            {showFinancialForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 mb-6 space-y-5 overflow-hidden">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-blue-500/70 uppercase tracking-widest ml-1">Month Name (e.g. 2024-03)</label>
                    <input type="text" value={newMonth} onChange={e => setNewMonth(e.target.value)} placeholder="YYYY-MM" className="w-full bg-muted border border-border p-4 rounded-xl text-sm font-bold text-foreground" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[9px] font-bold text-primary/70 uppercase tracking-widest ml-1">Income</label>
                      <input type="number" value={newIncome} onChange={e => setNewIncome(e.target.value)} placeholder="₹" className="w-full bg-muted border border-border p-4 rounded-xl text-sm font-bold text-foreground" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[9px] font-bold text-primary/70 uppercase tracking-widest ml-1">Active Days</label>
                      <input type="number" value={newDays} onChange={e => setNewDays(e.target.value)} placeholder="Max 31" className="w-full bg-muted border border-border p-4 rounded-xl text-sm font-bold text-foreground" />
                    </div>
                  </div>
                </div>
                <button onClick={handleAddFinancial} className="w-full py-3 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px]">Verify & Add to Hub</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div onClick={() => router.push('/data-hub')} className="p-6 rounded-[2rem] bg-muted border border-border flex items-center gap-4 cursor-pointer hover:border-primary/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><History size={20}/></div>
            <div className="flex-1">
               <h4 className="text-sm font-black text-foreground">Manage All Statement Data</h4>
               <p className="text-[10px] font-bold text-muted-foreground">Edit your 6-month transaction and work history</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, readOnly, icon }: any) {
  return (
    <div className={`relative group ${readOnly ? 'opacity-60' : ''}`}>
      <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2 mb-2 block">{label}</label>
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-blue-500 transition-colors">{icon}</div>
        <input 
          type="text" value={value} 
          onChange={readOnly ? undefined : (e) => onChange(e.target.value)}
          readOnly={readOnly}
          className="w-full border border-border text-foreground pr-6 py-5 rounded-2xl text-base font-bold transition-all h-14"
          style={{ backgroundColor: "var(--color-muted)", paddingLeft: "4.5rem", cursor: readOnly ? 'not-allowed' : 'text' }}
        />
      </div>
    </div>
  );
}
