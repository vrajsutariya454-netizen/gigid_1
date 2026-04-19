"use client";

import { useState } from "react";
import { 
  Plus, 
  Trash2, 
  FileText, 
  Briefcase, 
  ShieldCheck, 
  PlusCircle, 
  FilePlus, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateId } from "@/lib/utils";

/**
 * Single Source of Truth Model
 */
interface Document {
  id: string;
  type: string;
  status: "uploaded" | "pending";
}

interface Gig {
  id: string;
  platform: string;
  documents: Document[];
}

export default function SyncVaultPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [newPlatformName, setNewPlatformName] = useState("");

  // Platform Actions
  const addGig = () => {
    if (!newPlatformName.trim()) return;
    const newGig: Gig = {
      id: "gig-" + Date.now(),
      platform: newPlatformName,
      documents: []
    };
    setGigs(prev => [...prev, newGig]);
    setNewPlatformName("");
  };

  const deleteGig = (id: string) => {
    setGigs(prev => prev.filter(g => g.id !== id));
  };

  // Document Actions
  const addDocument = (gigId: string, type: string) => {
    setGigs(prev => prev.map(gig => {
      if (gig.id === gigId) {
        return {
          ...gig,
          documents: [
            ...gig.documents,
            { id: "doc-" + Date.now(), type, status: "pending" }
          ]
        };
      }
      return gig;
    }));
  };

  const deleteDocument = (gigId: string, docId: string) => {
    setGigs(prev => prev.map(gig => {
      if (gig.id === gigId) {
        return {
          ...gig,
          documents: gig.documents.filter(d => d.id !== docId)
        };
      }
      return gig;
    }));
  };

  const toggleDocStatus = (gigId: string, docId: string) => {
    setGigs(prev => prev.map(gig => {
      if (gig.id === gigId) {
        return {
          ...gig,
          documents: gig.documents.map(d => 
            d.id === docId 
              ? { ...d, status: d.status === "uploaded" ? "pending" : "uploaded" } 
              : d
          )
        };
      }
      return gig;
    }));
  };

  return (
    <div className="page-content min-h-screen pb-32">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter mb-2">Sync Vault</h1>
        <p className="text-sm text-[var(--text-tertiary)] font-bold">Single-State Identity Management</p>
      </div>

      {/* Input Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-[2rem] mb-12 shadow-xl">
        <div className="flex gap-4">
          <input 
            value={newPlatformName}
            onChange={(e) => setNewPlatformName(e.target.value)}
            placeholder="Platform Name (e.g. Uber, Swiggy)"
            className="flex-1 bg-muted/30 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-blue-500/50 transition-all"
            onKeyDown={(e) => e.key === "Enter" && addGig()}
          />
          <button 
            onClick={addGig}
            className="px-8 bg-blue-600 hover:bg-blue-500 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
          >
            <Plus size={18} />
            Connect
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 1. PLATFORM SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-3">
              <Briefcase className="text-blue-500" />
              Active Gigs
            </h2>
            <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">
              {gigs.length} Platforms
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {gigs.map(gig => (
                <motion.div 
                  key={gig.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-6 rounded-[2rem] flex items-center justify-between group hover:border-primary/30 transition-all shadow-lg bg-muted/50"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl font-bold text-blue-500">
                      {gig.platform.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[var(--text-primary)]">{gig.platform}</h3>
                      <div className="flex items-center gap-2">
                        <FileText size={12} className="text-[var(--text-tertiary)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
                          {gig.documents.length} Associated Docs
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteGig(gig.id)}
                    className="p-4 rounded-full text-red-500/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))}
              {gigs.length === 0 && (
                <motion.div className="p-20 border border-dashed border-border rounded-[3rem] text-center text-[var(--text-tertiary)] font-bold italic">
                  No platforms connected. Add one to start syncing.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 2. DOCUMENT SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-3">
              <ShieldCheck className="text-teal-500" />
              Document Vault
            </h2>
            <span className="text-[10px] font-black uppercase text-teal-500 bg-teal-500/10 px-3 py-1 rounded-full">
               Source of Truth
            </span>
          </div>

          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {gigs.map(gig => (
                <motion.div 
                  key={gig.id + "-docs"}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between px-4">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-blue-500" />
                       {gig.platform} Documents
                    </h4>
                    <button 
                      onClick={() => addDocument(gig.id, "Verification Proof")}
                      className="flex items-center gap-2 text-[10px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
                    >
                      <PlusCircle size={14} />
                      Add Document
                    </button>
                  </div>

                  <div className="space-y-3">
                    {gig.documents.map(doc => (
                      <div 
                        key={doc.id}
                        className="p-5 rounded-3xl bg-muted/30 border border-border flex items-center justify-between group hover:bg-muted/50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc.status === "uploaded" ? "bg-teal-500/10 text-teal-500" : "bg-orange-500/10 text-orange-500"}`}>
                            {doc.status === "uploaded" ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[var(--text-primary)]">{doc.type}</p>
                            <p className={`text-[9px] font-black uppercase tracking-widest ${doc.status === "uploaded" ? "text-teal-500" : "text-orange-500"}`}>
                              {doc.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 scale-0 group-hover:scale-100 transition-transform origin-right">
                           <button 
                            onClick={() => toggleDocStatus(gig.id, doc.id)}
                            className="p-3 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                           >
                             {doc.status === "uploaded" ? "Reset" : "Upload"}
                           </button>
                           <button 
                            onClick={() => deleteDocument(gig.id, doc.id)}
                            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                           >
                            <Trash2 size={18} />
                           </button>
                        </div>
                      </div>
                    ))}
                    {gig.documents.length === 0 && (
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] italic px-4">
                        No documents uploaded for this platform.
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {gigs.length === 0 && (
              <div className="p-20 rounded-[3rem] bg-muted/30 border border-dashed border-border flex flex-col items-center gap-4">
                <Database className="text-[var(--text-tertiary)]" size={48} />
                <p className="text-sm text-[var(--text-tertiary)] font-bold italic">Integrate a platform to begin your vault</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
