"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, User, Camera, FileText, 
  CheckCircle2, AlertCircle, Loader2, ArrowRight,
  Shield, Check, Fingerprint, MapPin, 
  ChevronLeft, UploadCloud, Smartphone, Sparkles
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { db } from "@/lib/db/database";
import { useRouter } from "next/navigation";

type Step = "intro" | "identity" | "documents" | "liveness" | "success" | "pending";

export function KYCProcess() {
  const router = useRouter();
  const { name, email, setUser, kycStatus } = useAppStore();
  const [currentStep, setCurrentStep] = useState<Step>("intro");
  const [formData, setFormData] = useState({
    fullName: name || "",
    dob: "",
    gender: "",
    aadhaarNumber: "",
    panNumber: "",
  });
  const [uploadedDocs, setUploadedDocs] = useState({
    front: false,
    back: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (kycStatus === 'verified' && currentStep === 'intro') {
      setCurrentStep('success');
    }
  }, [kycStatus, currentStep]);

  const nextStep = (step: Step) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(step);
    }, 800);
  };

  const handleCompleteFullKYC = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const profile = await db.profiles.toCollection().first();
    if (profile && profile.id) {
      await db.profiles.update(profile.id, {
        kycStatus: 'verified',
        kycLevel: 2,
        idVerifiedAt: new Date(),
      });
    }

    setUser({
      kycStatus: 'verified',
      kycLevel: 2
    });

    setIsProcessing(false);
    setCurrentStep("success");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // --- RENDERING HELPERS ---

  const renderIntro = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col gap-10 max-w-lg mx-auto py-12 px-6"
    >
      <div className="flex flex-col items-center text-center gap-8">
        <div className="relative">
          <div className="w-28 h-28 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 relative z-10 shadow-2xl overflow-hidden noise">
            <ShieldCheck size={48} className="text-primary" strokeWidth={1.5} />
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          </div>
          <div className="absolute -inset-4 rounded-full bg-primary/5 blur-2xl -z-10" />
        </div>
        
        <div>
          <div className="flex items-center justify-center gap-2 text-primary mb-3">
            <Sparkles size={10} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Official Protocol</span>
          </div>
          <h1 className="font-display text-5xl tracking-tight text-gradient">KYC Center</h1>
          <p className="mt-6 text-sm text-muted-foreground font-medium leading-relaxed">
            Mint your verified Gig Persona. Securely link your legal identity to unlock institutional capital and verified trust tiers.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {[
          { icon: User, label: "Identity Sync", desc: "Verifying Name, DOB & Legal standing" },
          { icon: FileText, label: "Document Proof", desc: "Government ID cryptographic scan" },
          { icon: Camera, label: "Neural Liveness", desc: "Neural face-match verification check" }
        ].map((item, idx) => (
          <div 
            key={idx}
            className="flex items-start gap-4 p-5 rounded-[1.75rem] noise glass-card border-border/40"
          >
            <div className="p-2.5 rounded-xl glass border-border/40 shadow-sm text-primary">
              <item.icon size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-sm font-black text-foreground tracking-tight">{item.label}</h4>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => nextStep("identity")}
        className="mt-4 w-full h-18 rounded-[1.5rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group"
      >
        Initiate Sequence
        <ArrowRight size={18} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
      </button>

      <div className="flex flex-col items-center gap-3 opacity-30 mt-4">
        <div className="flex items-center gap-2">
          <Shield size={10} />
          <span className="text-[8px] font-black uppercase tracking-widest font-mono">Secured by GigID Vault Protocol</span>
        </div>
      </div>
    </motion.div>
  );

  const renderIdentity = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col gap-10 max-w-lg mx-auto py-12 px-6"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-current shadow-lg shadow-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 01/03 &bull; Details</span>
        </div>
        <h2 className="font-display text-4xl tracking-tight text-gradient">Identity Profile</h2>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">Enter your legal information exactly as it appears on your government-issued ID.</p>
      </div>

      <div className="noise glass-card p-8 rounded-[2.5rem] flex flex-col gap-6">
        <InputField label="Legal Full Name" value={formData.fullName} onChange={(val) => setFormData({...formData, fullName: val})} placeholder="Rajesh Kumar" />
        
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Date of Birth" value={formData.dob} onChange={(val) => setFormData({...formData, dob: val})} type="date" />
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-2">Gender</label>
            <select 
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full h-16 px-6 rounded-2xl glass bg-muted/20 border-border text-xs font-black text-foreground outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 appearance-none uppercase tracking-[0.1em]"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <InputField label="Aadhaar ID (UID)" value={formData.aadhaarNumber} onChange={(val) => setFormData({...formData, aadhaarNumber: val})} placeholder="0000 0000 0000" maxLength={12} isMonospace />
      </div>

      <button 
        disabled={!formData.fullName || !formData.dob || !formData.aadhaarNumber}
        onClick={() => nextStep("documents")}
        className="w-full h-18 rounded-[1.5rem] bg-foreground text-background font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-foreground/90 active:scale-95"
      >
        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <>Next Phase <ArrowRight size={18} strokeWidth={3} /></>}
      </button>

      <button onClick={() => setCurrentStep("intro")} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 w-full text-center hover:text-foreground hover:opacity-100 transition-all">
        ← Abort Sequence
      </button>
    </motion.div>
  );

  const renderDocuments = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col gap-10 max-w-lg mx-auto py-12 px-6"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-current shadow-lg shadow-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 02/03 &bull; Proof</span>
        </div>
        <h2 className="font-display text-4xl tracking-tight text-gradient">ID Evidence</h2>
        <p className="text-sm text-muted-foreground font-medium">Capture or upload high-resolution scans of your identity documents.</p>
      </div>

      <div className="flex flex-col gap-6">
        <DocumentUpload 
          label="Front Perspective" 
          description="Legal Name & Photo Side" 
          isUploaded={uploadedDocs.front} 
          onUpload={() => setUploadedDocs({...uploadedDocs, front: true})} 
        />
        <DocumentUpload 
          label="Rear Perspective" 
          description="Address & Verification QR" 
          isUploaded={uploadedDocs.back} 
          onUpload={() => setUploadedDocs({...uploadedDocs, back: true})} 
        />
      </div>

      <div className="noise glass-card p-6 rounded-[2rem] border-amber-500/30 bg-amber-500/5 flex items-start gap-4">
        <AlertCircle size={20} className="text-amber-500 shrink-0" strokeWidth={2.5} />
        <p className="text-[10px] text-amber-500 font-black uppercase tracking-wider leading-relaxed">
          Ensure zero glare and deep readable contrast for neural verification nodes.
        </p>
      </div>

      <button 
        disabled={!uploadedDocs.front || !uploadedDocs.back}
        onClick={() => nextStep("liveness")}
        className="w-full h-18 rounded-[1.5rem] bg-foreground text-background font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-foreground/90 active:scale-95"
      >
        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <>Commit Proofs <ArrowRight size={18} strokeWidth={3} /></>}
      </button>

      <button onClick={() => setCurrentStep("identity")} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 w-full text-center hover:text-foreground transition-all">
        ← Reverse to Identity
      </button>
    </motion.div>
  );

  const renderLiveness = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center gap-10 max-w-lg mx-auto py-12 px-6"
    >
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3 text-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-current shadow-lg shadow-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 03/03 &bull; Biometric</span>
        </div>
        <h2 className="font-display text-4xl tracking-tight text-gradient">Neural Scan</h2>
        <p className="text-sm text-muted-foreground font-medium">Position your face within the digital capture frame.</p>
      </div>

      <div className="relative w-80 h-80">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute -inset-6 rounded-full border border-dashed border-primary/20"
        />
        <motion.div 
          animate={{ rotate: [0, -180, -360] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute -inset-12 rounded-full border border-dotted border-accent/10"
        />

        <div className="w-full h-full rounded-full overflow-hidden border-8 border-background shadow-2xl relative bg-black/20 noise">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
             <Smartphone size={120} className="text-muted-foreground" />
          </div>
          
          <AnimatePresence>
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-primary/20 backdrop-blur-md flex flex-col items-center justify-center z-50"
              >
                <div className="relative">
                  <Loader2 className="text-white animate-spin" size={48} strokeWidth={3} />
                  <div className="absolute inset-0 blur-xl bg-white/30 animate-pulse" />
                </div>
                <span className="mt-6 text-[11px] font-black text-white uppercase tracking-[0.3em] drop-shadow-md">Analyzing Persona...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute left-0 right-0 h-[2px] bg-primary blur-[2px] z-20 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full">
        <div className="noise glass-card p-6 rounded-[1.5rem] border-primary/20 bg-primary/5 flex items-start gap-4">
           <Smartphone size={20} className="text-primary mt-1" />
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider leading-relaxed">
             Ensure lighting environment is stable. Persona must be clear for neural node validation.
           </p>
        </div>

        <button 
          onClick={handleCompleteFullKYC}
          disabled={isProcessing}
          className="w-full h-20 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          {isProcessing ? "Processing Hash..." : "Initiate Biometric Capture"}
        </button>
      </div>

      <button onClick={() => setCurrentStep("documents")} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-all">
        ← Reverse to Documents
      </button>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center gap-10 max-w-lg mx-auto py-20 px-6 text-center"
    >
      <div className="relative">
        <div className="w-36 h-36 rounded-[3rem] bg-accent/10 border border-accent/20 flex items-center justify-center relative z-10 noise">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.3 }}
          >
            <CheckCircle2 size={72} className="text-accent" strokeWidth={1.5} />
          </motion.div>
        </div>
        <div className="absolute -inset-10 rounded-full bg-accent/5 blur-3xl -z-10 animate-pulse" />
        <div className="absolute -inset-2 rounded-[3.5rem] border border-accent/20 -z-0 animate-ping [animation-duration:3s]" />
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-5xl tracking-tight text-gradient">Identity Linked</h2>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto">
          Verification complete, {formData.fullName || "Friend"}. Your legal persona is now verified at Tier 2.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="noise glass-card p-6 rounded-[2rem] border-accent/20 bg-accent/5">
          <span className="text-[9px] font-black text-accent uppercase tracking-[0.2em]">Node Status</span>
          <p className="mt-2 text-base font-black text-foreground uppercase tracking-tight">Active Node</p>
        </div>
        <div className="noise glass-card p-6 rounded-[2rem] border-primary/20 bg-primary/5">
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Trust Engine</span>
          <p className="mt-2 text-base font-black text-foreground uppercase tracking-tight">1.25x Active</p>
        </div>
      </div>

      <button 
        onClick={() => router.push("/home")}
        className="w-full h-20 rounded-[2rem] bg-foreground text-background font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl hover:bg-foreground/90 transition-all active:scale-95"
      >
        Access Dashboard <ArrowRight size={20} />
      </button>
    </motion.div>
  );

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <div key={currentStep}>
          {currentStep === "intro" && renderIntro()}
          {currentStep === "identity" && renderIdentity()}
          {currentStep === "documents" && renderDocuments()}
          {currentStep === "liveness" && renderLiveness()}
          {currentStep === "success" && renderSuccess()}
        </div>
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text", maxLength, isMonospace }: any) {
  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-2">{label}</label>
      <input 
        type={type} 
        value={value} 
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-16 px-6 rounded-2xl glass bg-muted/20 border-border outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-foreground text-xs ${isMonospace ? 'font-mono tracking-[0.2em]' : ''}`}
        placeholder={placeholder}
      />
    </div>
  );
}

function DocumentUpload({ label, description, isUploaded, onUpload }: any) {
  return (
    <div className={`noise glass-card overflow-hidden rounded-[2.5rem] border-dashed border-2 aspect-[1.7/1] flex flex-col items-center justify-center transition-all relative ${isUploaded ? 'border-accent/40 bg-accent/5' : 'border-border/60 bg-muted/5 hover:border-primary/40'}`}>
      {isUploaded ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
            <Check size={28} strokeWidth={3} />
          </div>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{label} Applied</span>
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 rounded-full glass border-border/60 mb-2">
            <UploadCloud size={24} className="text-muted-foreground" />
          </div>
          <div className="text-center px-6">
            <h4 className="text-xs font-black text-foreground tracking-tight">{label}</h4>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">{description}</p>
          </div>
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={onUpload}
          />
        </>
      )}
    </div>
  );
}
