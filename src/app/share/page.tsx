"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type VerifiableCredential } from "@/lib/db/database";
import { generateProof, proofToShareableJSON, AVAILABLE_PREDICATES, type ZKPPredicate, type ZKProof } from "@/lib/identity/zkp";
import { QRCodeSVG } from "qrcode.react";
import { 
  Share2, ShieldCheck, Loader2, Copy, 
  CheckCircle2, QrCode, ChevronDown, Lock,
  Sparkles, ChevronLeft, ArrowRight
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

function SharePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedId = searchParams.get("credentialId");

  const credentials = useLiveQuery(() => db.credentials.toArray()) || [];
  const [selectedCredential, setSelectedCredential] = useState<VerifiableCredential | null>(null);
  const [selectedPredicate, setSelectedPredicate] = useState<ZKPPredicate | null>(null);
  const [proof, setProof] = useState<ZKProof | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCredentialPicker, setShowCredentialPicker] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/");
      }
    };
    checkAuth();
  }, [router]);

  // Auto-select preselected credential
  useEffect(() => {
    if (preselectedId && credentials.length > 0) {
      const found = credentials.find((c) => c.credentialId === preselectedId);
      if (found) setSelectedCredential(found);
    }
  }, [preselectedId, credentials]);

  const handleGenerateProof = async () => {
    if (!selectedCredential || !selectedPredicate) return;
    setIsGenerating(true);
    setProof(null);

    try {
      const result = await generateProof(selectedCredential, selectedPredicate);
      setProof(result);
    } catch (error) {
      console.error("Proof generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!proof) return;
    const shareData = proofToShareableJSON(proof);
    await navigator.clipboard.writeText(shareData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (credentials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8 animate-in fade-in zoom-in">
        <div className="w-24 h-24 rounded-[2.5rem] bg-muted/20 flex items-center justify-center text-4xl opacity-40">
           🔒
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-3xl tracking-tight text-foreground">Vault Isolated</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">
            Your verification hub is currently devoid of signed proof. Connect a platform first to generate shareable claims.
          </p>
        </div>
        <button
          onClick={() => router.push("/home")}
          className="h-16 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
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
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">Privacy-Preserving Proofs</span>
            </div>
            <h1 className="font-display text-4xl tracking-tight text-gradient">Share & Prove</h1>
          </div>
        </div>
        <p className="max-w-md text-sm font-medium text-muted-foreground leading-relaxed -mt-2 ml-2">
          Generate Zero-Knowledge Proofs (ZKP) to verify claims about your income or ratings without exposing raw data.
        </p>
      </section>

      {/* Step 1: Select Credential */}
      <section className="flex flex-col gap-4">
        <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] ml-2">
          01. Select Verifiable Proof
        </label>
        <div className="relative">
          <button
            onClick={() => setShowCredentialPicker(!showCredentialPicker)}
            className={`w-full noise p-6 rounded-[2rem] flex items-center justify-between transition-all group ${
              selectedCredential 
                ? "bg-primary/5 border border-primary shadow-xl shadow-primary/10" 
                : "glass border-border/60 hover:border-primary/40"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-background/40 flex items-center justify-center">
                {selectedCredential ? <ShieldCheck size={20} className="text-accent" /> : <Lock size={20} className="text-muted-foreground/30" />}
              </div>
              <div className="text-left">
                <span className={`text-sm font-black tracking-tight ${selectedCredential ? "text-foreground" : "text-muted-foreground"}`}>
                  {selectedCredential ? `${selectedCredential.credentialSubject.platform} Record` : "Select source node..."}
                </span>
                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 tracking-wider">
                  {selectedCredential ? "Cryptographic Evidence Loaded" : "Pending node selection"}
                </p>
              </div>
            </div>
            <ChevronDown size={18} className={`text-muted-foreground/40 transition-transform ${showCredentialPicker ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showCredentialPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute left-0 right-0 top-full mt-3 z-50 glass border-border/40 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden noise"
              >
                {credentials.map((cred) => (
                  <button
                    key={cred.credentialId}
                    onClick={() => {
                      setSelectedCredential(cred);
                      setShowCredentialPicker(false);
                      setProof(null);
                    }}
                    className={`w-full p-6 flex items-center gap-4 transition-all hover:bg-white/5 text-left border-b border-white/5 last:border-0 ${
                      selectedCredential?.credentialId === cred.credentialId ? "bg-primary/10" : ""
                    }`}
                  >
                    <span className="text-2xl bg-muted/20 p-2 rounded-xl">
                      {cred.credentialSubject.platform === "Zomato" ? "🍕" :
                       cred.credentialSubject.platform === "Uber" ? "🚗" :
                       cred.credentialSubject.platform === "Swiggy" ? "🛵" :
                       cred.credentialSubject.platform === "Ola" ? "🛺" : "📦"}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-foreground">{cred.credentialSubject.platform}</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Linked Node</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Step 2: Select Predicate */}
      <AnimatePresence>
        {selectedCredential && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] ml-2">
              02. Define ZK Assertion
            </label>
            <div className="grid grid-cols-1 gap-3">
              {AVAILABLE_PREDICATES.map((pred, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedPredicate(pred);
                    setProof(null);
                  }}
                  className={`noise p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${
                    selectedPredicate === pred 
                      ? "bg-accent/5 border-accent shadow-xl shadow-accent/10" 
                      : "glass border-border/40 hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-colors ${selectedPredicate === pred ? "bg-accent text-white" : "bg-muted/40 text-muted-foreground/40"}`}>
                      <Lock size={16} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <span className={`text-[11px] font-black uppercase tracking-widest ${selectedPredicate === pred ? "text-foreground" : "text-muted-foreground/60"}`}>
                        {pred.label}
                      </span>
                      <p className="text-[9px] font-medium text-muted-foreground/40 mt-1 uppercase">Prove without revealing exact numbers</p>
                    </div>
                  </div>
                  {selectedPredicate === pred && <CheckCircle2 size={16} className="text-accent" />}
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Step 3: Generate */}
      <AnimatePresence>
        {selectedCredential && selectedPredicate && !proof && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-4"
          >
            <button
              id="mint-zk-proof-btn"
              onClick={handleGenerateProof}
              disabled={isGenerating}
              className={`w-full h-20 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl transition-all ${
                isGenerating 
                  ? "bg-muted text-muted-foreground cursor-wait" 
                  : "bg-primary text-white shadow-primary/30 hover:scale-[1.02] active:scale-95"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" strokeWidth={3} />
                  Computation Syncing...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} strokeWidth={2.5} />
                  Mint ZK-Proof Hash
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proof Result */}
      <AnimatePresence mode="wait">
        {proof && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center gap-8 py-4"
          >
            {/* Status Badge */}
            <div className={`flex items-center gap-2.5 px-6 py-2 rounded-full glass border-border/40 ${proof.result ? "text-accent border-accent/20" : "text-red-500 border-red-500/20"}`}>
               <CheckCircle2 size={14} strokeWidth={3} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                 {proof.result ? "Verified Claim Hash Ready" : "Assertion Mismatch"}
               </span>
            </div>

            {/* QR Card */}
            <div className="noise glass-card p-10 rounded-[3rem] border-primary/20 bg-primary/5 flex flex-col items-center gap-6 w-full max-w-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <QrCode size={14} className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Secure Transfer QR</span>
              </div>
              
              <div className="p-8 bg-white rounded-[2.5rem] shadow-2xl relative">
                <QRCodeSVG
                  value={proofToShareableJSON(proof)}
                  size={180}
                  level="H"
                  includeMargin={false}
                  fgColor="#1a1a1a"
                />
              </div>

              <div className="mt-4 flex flex-col gap-4 w-full">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-background/40 border border-border flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Protocol</span>
                    <span className="text-xs font-black text-foreground">Groth16</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-background/40 border border-border flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Expiraton</span>
                    <span className="text-xs font-black text-accent">24:00:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 w-full pt-4">
              <button
                onClick={handleCopy}
                className={`w-full h-18 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all ${
                  copied 
                  ? "bg-accent/10 border border-accent/40 text-accent" 
                  : "glass border-border hover:bg-primary/5 hover:border-primary/40 text-foreground"
                }`}
              >
                {copied ? <><CheckCircle2 size={16} /> Hash Copied</> : <><Copy size={16} /> Copy shareable node Link</>}
              </button>
              
              <button 
                onClick={() => setProof(null)}
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-all"
              >
                ← Clear Result
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SharePage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] animate-float opacity-30" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[130px] animate-float [animation-delay:3s] opacity-20" />
      </div>

      <div className="relative z-10 page-content pb-32">
        <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
          <SharePageContent />
        </Suspense>
      </div>
    </main>
  );
}
