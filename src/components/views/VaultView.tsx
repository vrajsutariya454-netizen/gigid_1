"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { CredentialCard } from "@/components/credential/CredentialCard";
import { FileCheck, ShieldCheck, Plus, Share2, Image as ImageIcon, Sparkles, ChevronLeft, Shield, Check } from "lucide-react";
import { useState } from "react";
import { type VerifiableCredential, type IdentityDocument } from "@/lib/db/database";
import { verifyCredential } from "@/lib/identity/credentials";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function VaultView() {
  const credentials = useLiveQuery(() => db.credentials.toArray()) || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();
  
  const expandedDocuments = useLiveQuery(
    () => expandedId ? db.documents.where("credentialId").equals(expandedId).toArray() : Promise.resolve([] as IdentityDocument[]),
    [expandedId]
  ) || [];

  const [verifying, setVerifying] = useState(false);

  const handleVerifySignature = async (credential: VerifiableCredential) => {
    if (!credential.signature || !credential.publicKey || !credential.rawPayload) return;
    setVerifying(true);
    try {
      const verRes = await fetch("http://localhost:5000/verify-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          data: credential.rawPayload, 
          signature: credential.signature, 
          public_key: credential.publicKey 
        })
      });
      const verData = await verRes.json();
      
      const isDunzo = credential.credentialSubject.platform.toLowerCase().includes("dunzo");
      
      if (verData.valid && !isDunzo) {
        await db.credentials.update(credential.id!, { verificationStatus: "verified" });
      } else {
        await db.credentials.update(credential.id!, { verificationStatus: "failed" });
      }
    } catch(e) {
      console.error(e);
      await db.credentials.update(credential.id!, { verificationStatus: "failed" });
    }
    setVerifying(false);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header Area */}
      <section className="pt-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-3 rounded-2xl glass border-border text-muted-foreground hover:text-foreground transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={10} strokeWidth={3} />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">Identity Trust Vault</span>
            </div>
            <h1 className="font-display text-4xl tracking-tight text-gradient">Verification Hub</h1>
          </div>
        </div>
        
        <p className="max-w-md text-sm font-medium text-muted-foreground leading-relaxed">
          Manage your cryptographically signed credentials and digital proofs. Your vault is secured by end-to-end encryption.
        </p>
      </section>

      {/* Trust Badge Strip */}
      {credentials.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 px-6 rounded-2xl glass border-accent/20 bg-accent/5"
        >
          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
            <ShieldCheck size={16} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] text-accent font-black uppercase tracking-[0.2em]">
            {credentials.length} Cryptographic Proofs Active
          </span>
        </motion.div>
      )}

      {/* Credentials List */}
      <div className="grid grid-cols-1 gap-6">
        {credentials.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="noise glass-card py-20 text-center flex flex-col items-center gap-6 rounded-[3rem]"
          >
            <div className="w-20 h-20 rounded-[2.5rem] bg-muted/20 flex items-center justify-center text-4xl opacity-40">
              📄
            </div>
            <div>
              <p className="text-base font-black text-foreground">Vault is Empty</p>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Connect a platform to mint trust</p>
            </div>
            <button 
              onClick={() => router.push("/home")}
              className="px-8 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              Start Syncing
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">
            {credentials.map((credential) => (
              <motion.div 
                layoutId={`cv-${credential.credentialId}`}
                key={credential.credentialId} 
                className="flex flex-col gap-3"
              >
                <div 
                   className={`transition-all ${expandedId === credential.credentialId ? "ring-2 ring-primary/40 rounded-[2.5rem]" : ""}`}
                >
                  <CredentialCard
                    credential={credential}
                    onTap={() => setExpandedId(expandedId === credential.credentialId ? null : credential.credentialId)}
                    onShare={() => {}}
                  />
                </div>

                <AnimatePresence>
                  {expandedId === credential.credentialId && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="noise glass-card p-8 rounded-[2.5rem] border-primary/20 bg-primary/5 overflow-hidden"
                    >
                       <div className="flex items-center justify-between mb-8">
                          <div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-1">Audit Trail</h4>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Digital Signature Verification</p>
                          </div>
                          <div className="flex gap-3">
                            {credential.verificationStatus === 'pending' && (
                              <button 
                                onClick={() => handleVerifySignature(credential)}
                                disabled={verifying}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                              >
                                {verifying ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} strokeWidth={3} />}
                                {verifying ? "Verifying..." : "Validate Proof"}
                              </button>
                            )}
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full glass border-border text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all">
                              <Share2 size={12} />
                              Share DID
                            </button>
                          </div>
                       </div>

                       <div className="space-y-4">
                         {verifyCredential(credential).checks.map((check) => (
                           <div key={check.name} className="flex items-start gap-4 p-4 rounded-2xl bg-background/40 border border-border">
                             <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${check.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                               {check.passed ? <Check size={12} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                             </div>
                             <div className="flex-1">
                               <div className="text-xs font-black text-foreground tracking-tight">{check.name}</div>
                               <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{check.detail}</div>
                             </div>
                           </div>
                         ))}
                       </div>

                       {expandedDocuments.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-border">
                          <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                            <ImageIcon size={14} />
                            Source Evidence
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            {expandedDocuments.map(doc => (
                              <div key={doc.id} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-muted/40 group">
                                <img src={doc.data} alt={doc.name} className="object-cover w-full h-full hover:scale-110 transition-transform cursor-pointer" onClick={() => window.open(doc.data)} />
                                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest glass backdrop-blur-xl border border-white/10 text-white flex items-center shadow-2xl pointer-events-none">
                                  <div className={`w-1 h-1 rounded-full mr-1.5 ${doc.verification === 'verified' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                  {doc.verification === "verified" ? "Verified" : "Pending"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
