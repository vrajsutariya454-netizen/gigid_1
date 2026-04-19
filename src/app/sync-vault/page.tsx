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
  Database,
  Sparkles,
  ChevronLeft,
  UploadCloud,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateId } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">State Management</span>
              </div>
              <h1 className="font-display text-4xl tracking-tight text-gradient">Sync Vault</h1>
            </div>
          </div>
          <p className="max-w-md text-sm font-medium text-muted-foreground leading-relaxed -mt-2 ml-2">
            Control the localized single-state vault. Link manual documents to platform instances for multi-proof verification.
          </p>
        </section>

        {/* New Connector Area */}
        <div className="noise glass-card p-10 rounded-[3rem] border-primary/20 bg-primary/5 shadow-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-4">
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">New Socket Entry</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
                placeholder="Platform Identity (e.g. Deliveroo, TaskRabbit)"
                className="flex-1 h-18 bg-background/40 border border-border/60 rounded-[1.5rem] px-8 text-sm font-black focus:outline-none focus:border-primary/40 transition-all shadow-inner"
                onKeyDown={(e) => e.key === "Enter" && addGig()}
              />
              <button 
                onClick={addGig}
                className="h-18 px-10 bg-primary text-white rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-primary/20 hover:scale-[1.02]"
              >
                <PlusCircle size={20} strokeWidth={2.5} />
                Connect Node
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Active Gigs Section */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-3">
                  Linked Ecosystems
                </h2>
              </div>
              <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                {gigs.length} Active
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {gigs.map(gig => (
                  <motion.div 
                    key={gig.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="noise glass-card p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-2xl font-black text-primary">
                        {gig.platform.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-lg font-black text-foreground tracking-tight">{gig.platform}</h3>
                        <div className="flex items-center gap-2">
                          <Database size={10} className="text-primary/40" />
                          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">
                            {gig.documents.length} Proof Objects
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteGig(gig.id)}
                      className="p-4 rounded-2xl glass text-muted-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}
                {gigs.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-16 border-2 border-dashed border-border/40 rounded-[3rem] text-center flex flex-col items-center gap-4 bg-white/5"
                  >
                    <Plus size={32} className="text-muted-foreground/20" />
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest max-w-[150px] leading-relaxed">
                      No sockets established. Initialize a connection above.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Document Vault Section */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-accent rounded-full" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-3">
                   Verification Proofs
                </h2>
              </div>
              <span className="text-[9px] font-black uppercase text-accent bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20">
                Single State
              </span>
            </div>

            <div className="flex flex-col gap-10">
              <AnimatePresence mode="popLayout">
                {gigs.map(gig => (
                  <motion.div 
                    key={gig.id + "-docs"}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex items-center justify-between px-4">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-primary" />
                         <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                           {gig.platform} Vault
                         </h4>
                      </div>
                      <button 
                        onClick={() => addDocument(gig.id, "Signed work Record")}
                        className="flex items-center gap-2 text-[9px] font-black text-primary hover:text-accent transition-all uppercase tracking-widest bg-primary/5 px-3 py-2 rounded-xl border border-primary/20"
                      >
                        <PlusCircle size={12} strokeWidth={3} />
                        Inject Doc
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 ml-2">
                      {gig.documents.map(doc => (
                        <div 
                          key={doc.id}
                          className="noise glass-card p-6 rounded-[2rem] flex items-center justify-between group transition-all"
                        >
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${doc.status === "uploaded" ? "bg-accent/10 text-accent shadow-lg shadow-accent/10" : "bg-muted/40 text-muted-foreground/30"}`}>
                              {doc.status === "uploaded" ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <UploadCloud size={24} strokeWidth={2.5} />}
                            </div>
                            <div className="flex flex-col">
                              <p className="text-sm font-black text-foreground tracking-tight">{doc.type}</p>
                              <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${doc.status === "uploaded" ? "text-accent" : "text-muted-foreground/40"}`}>
                                Status: {doc.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                             <button 
                              onClick={() => toggleDocStatus(gig.id, doc.id)}
                              className={`h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${doc.status === "uploaded" ? 'glass text-muted-foreground hover:text-foreground' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                             >
                               {doc.status === "uploaded" ? "Reset" : "Submit"}
                             </button>
                             <button 
                              onClick={() => deleteDocument(gig.id, doc.id)}
                              className="w-10 h-10 flex items-center justify-center glass text-red-500/40 hover:text-red-500 rounded-xl transition-all"
                             >
                              <Trash2 size={16} />
                             </button>
                          </div>
                        </div>
                      ))}
                      {gig.documents.length === 0 && (
                        <div className="p-10 rounded-[2rem] border-2 border-dashed border-border/40 bg-white/5 text-center flex flex-col items-center gap-2 ml-4">
                          <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest italic leading-relaxed">
                            No cryptographic evidence found for {gig.platform}.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {gigs.length === 0 && (
                <div className="p-24 rounded-[3rem] border-2 border-dashed border-border/40 bg-white/5 flex flex-col items-center gap-6 opacity-40">
                  <Database className="text-muted-foreground" size={64} strokeWidth={1} />
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] max-w-[200px] text-center leading-relaxed">
                    Ecosystem Isolated. Establish a node link to populate the vault.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
