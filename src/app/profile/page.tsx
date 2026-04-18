"use client";

import { useAppStore } from "@/lib/store/app-store";
import { useState } from "react";
import { User, Phone, Save, ChevronLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { name, phone, did, trustScore, setUser } = useAppStore();
  const [formData, setFormData] = useState({ name, phone });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setUser(formData);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const initials = formData.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "ID";

  return (
    <div className="page-content pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)]"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Manage Profile</h1>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/40 border-4 border-[var(--bg-primary)] text-3xl font-black text-white">
            {initials}
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-teal-500 border-4 border-[var(--bg-primary)] text-white shadow-xl shadow-teal-500/20">
            <ShieldCheck size={20} />
          </div>
        </div>
        <div className="mt-4 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-teal-500" />
          <span className="text-xs font-bold text-teal-500 uppercase tracking-widest">{trustScore}% Trust Verified</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <div className="relative group">
            <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2 mb-2 block">
              Full Legal Name
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-blue-500 transition-colors">
                <User size={20} />
              </div>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] pl-12 pr-4 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div className="relative group">
            <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] ml-2 mb-2 block">
              Phone Number / VPA
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-blue-500 transition-colors">
                <Phone size={20} />
              </div>
              <input 
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] pl-12 pr-4 py-4 rounded-2xl font-bold focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                placeholder="Enter your phone"
              />
            </div>
          </div>
        </div>

        {/* DID Section (Read Only) */}
        <div className="p-5 rounded-2xl bg-black/20 border border-white/5 opacity-80">
          <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-3">
            Your Trust Identifier (DID)
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] font-mono break-all leading-relaxed">
            {did}
          </p>
        </div>

        {/* Action Button */}
        <div className="fixed bottom-8 left-4 right-4 z-50">
          <button
            disabled={isSaving}
            onClick={handleSave}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${
              isSaving || showSuccess
              ? "bg-teal-500 text-white"
              : "bg-blue-600 text-white shadow-xl shadow-blue-500/20 active:scale-95"
            }`}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : showSuccess ? (
              <CheckCircle2 size={20} className="animate-in zoom-in-50" />
            ) : (
              <Save size={20} />
            )}
            {isSaving ? "Saving..." : showSuccess ? "Account Updated" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
