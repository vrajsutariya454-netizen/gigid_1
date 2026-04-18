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
          className="p-2 rounded-full bg-[var(--bg-elevated)] border-0 text-[var(--text-secondary)] shadow-sm hover:shadow-md transition-shadow"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Manage Profile</h1>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center justify-center mb-16">
        <div className="relative">
          <div 
            className="w-32 h-32 flex items-center justify-center shadow-2xl text-4xl font-black text-white"
            style={{ 
              borderRadius: "var(--radius-xl)", 
              background: "linear-gradient(135deg, var(--primary-600), var(--primary-400))",
              boxShadow: "0 20px 30px -10px rgba(59, 130, 246, 0.5)",
              border: "6px solid var(--bg-primary)"
            }}
          >
            {initials}
          </div>
          <div className="absolute -bottom-4 -right-4 p-2.5 rounded-2xl bg-teal-500 border-[4px] border-[var(--bg-primary)] text-white shadow-xl shadow-teal-500/20">
            <ShieldCheck size={24} />
          </div>
        </div>
        <div className="mt-8 px-5 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-teal-500" />
          <span className="text-sm font-bold text-teal-500 uppercase tracking-widest">{trustScore}% Trust Verified</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
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
                className="w-full border-0 text-[var(--text-primary)] pr-6 py-5 rounded-2xl text-lg font-bold focus:outline-none focus:ring-4 transition-all"
                style={{ 
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  paddingLeft: "4.5rem"
                }}
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
                className="w-full border-0 text-[var(--text-primary)] pr-6 py-5 rounded-2xl text-lg font-bold focus:outline-none focus:ring-4 transition-all"
                style={{ 
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  paddingLeft: "4.5rem"
                }}
                placeholder="Enter your phone"
              />
            </div>
          </div>
        </div>

        {/* DID Section (Read Only) */}
        <div 
          className="p-8 rounded-3xl"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">
            Your Trust Identifier (DID)
          </p>
          <p className="text-sm text-[var(--text-secondary)] font-mono break-all leading-loose">
            {did}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-6 mb-4">
          <button
            disabled={isSaving}
            onClick={handleSave}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${
              isSaving || showSuccess
              ? "bg-teal-500 text-white"
              : "text-white shadow-xl shadow-blue-500/30 active:scale-95"
            }`}
            style={{
              background: (!isSaving && !showSuccess) ? "linear-gradient(135deg, var(--primary-600), var(--primary-400))" : undefined
            }}
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
