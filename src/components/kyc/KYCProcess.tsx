"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, User, Camera, FileText, 
  CheckCircle2, AlertCircle, Loader2, ArrowRight,
  Shield, Check, Fingerprint, MapPin, 
  ChevronLeft, UploadCloud, Smartphone
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

  // If already verified, show success or redirect
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
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Update local DB
    const profile = await db.profiles.toCollection().first();
    if (profile && profile.id) {
      await db.profiles.update(profile.id, {
        kycStatus: 'verified',
        kycLevel: 2,
        idVerifiedAt: new Date(),
      });
    }

    // Update global store
    setUser({
      kycStatus: 'verified',
      kycLevel: 2
    });

    setIsProcessing(false);
    setCurrentStep("success");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // --- RENDERING HELPERS ---

  const renderIntro = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col gap-8 max-w-lg mx-auto py-12 px-6"
    >
      <div className="flex flex-col items-center text-center gap-6">
        <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center border border-primary/20 relative">
          <ShieldCheck size={48} className="text-primary" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-[32px] bg-primary/20"
          />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">KYC Center</h1>
          <p className="mt-4 text-muted-foreground font-medium leading-relaxed">
            Verify your legal identity to unlock premium lending opportunities, higher trust limits, and direct platform incentives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { icon: User, label: "Identity Basics", desc: "Basic Name, DOB & Gender verification" },
          { icon: FileText, label: "Document Proof", desc: "Front/Back scan of Government ID" },
          { icon: Camera, label: "Biometric Liveness", desc: "Instant AI face verification check" }
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            className="flex items-start gap-4 p-5 rounded-2xl bg-muted/30 border border-border"
          >
            <div className="p-2 rounded-xl bg-background border border-border shadow-sm">
              <item.icon size={18} className="text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{item.label}</h4>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={() => nextStep("identity")}
        className="mt-4 w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group"
      >
        Start Verification
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
      </button>

      <div className="flex items-center justify-center gap-2 opacity-40">
        <Shield size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Military-Grade Encryption</span>
      </div>
    </motion.div>
  );

  const renderIdentity = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col gap-6 max-w-lg mx-auto py-12 px-6"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="text-[10px] font-black uppercase tracking-widest">Step 01/03</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight">Identity Details</h2>
        <p className="text-sm text-muted-foreground font-medium">Please enter your legal information exactly as it appears on your ID.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2">Full Legal Name</label>
          <input 
            type="text" 
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            className="w-full h-14 px-6 rounded-2xl bg-muted/50 border border-border outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-foreground"
            placeholder="Ex: Rajesh Kumar"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2">Date of Birth</label>
            <input 
              type="date" 
              value={formData.dob}
              onChange={(e) => setFormData({...formData, dob: e.target.value})}
              className="w-full h-14 px-5 rounded-2xl bg-muted/50 border border-border outline-none focus:border-primary/50 transition-all font-bold text-foreground text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2">Gender</label>
            <select 
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full h-14 px-5 rounded-2xl bg-muted/50 border border-border outline-none focus:border-primary/50 transition-all font-bold text-foreground text-sm appearance-none"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2">Aadhaar Card Number</label>
          <input 
            type="text" 
            maxLength={12}
            value={formData.aadhaarNumber}
            onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})}
            className="w-full h-14 px-6 rounded-2xl bg-muted/50 border border-border outline-none focus:border-primary/50 transition-all font-bold text-foreground tracking-[0.2em]"
            placeholder="0000 0000 0000"
          />
        </div>
      </div>

      <button 
        disabled={!formData.fullName || !formData.dob || !formData.aadhaarNumber}
        onClick={() => nextStep("documents")}
        className="mt-4 w-full h-16 rounded-2xl bg-foreground text-background font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-foreground/90 active:scale-95"
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : "Next Phase"}
      </button>
    </motion.div>
  );

  const renderDocuments = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col gap-6 max-w-lg mx-auto py-12 px-6"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="text-[10px] font-black uppercase tracking-widest">Step 02/03</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight">Upload ID Proof</h2>
        <p className="text-sm text-muted-foreground font-medium">Scan or upload clear images of your Aadhaar Card.</p>
      </div>

      <div className="space-y-6">
        {/* Front side */}
        <div className="group relative overflow-hidden rounded-[24px] border border-dashed border-border aspect-[1.6/1] flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-all bg-muted/10">
          {uploadedDocs.front ? (
            <div className="absolute inset-0 bg-emerald-500/5 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Check size={24} strokeWidth={3} />
              </div>
              <span className="mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-500">Front Scan Applied</span>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-full bg-background border border-border group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                <UploadCloud size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center px-4">
                <h4 className="text-xs font-bold text-foreground">Front Side</h4>
                <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-widest">Aadhaar Card with Photo</p>
              </div>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={() => setUploadedDocs({...uploadedDocs, front: true})}
              />
            </>
          )}
        </div>

        {/* Back side */}
        <div className="group relative overflow-hidden rounded-[24px] border border-dashed border-border aspect-[1.6/1] flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-all bg-muted/10">
          {uploadedDocs.back ? (
            <div className="absolute inset-0 bg-emerald-500/5 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Check size={24} strokeWidth={3} />
              </div>
              <span className="mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-500">Back Scan Applied</span>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-full bg-background border border-border group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                <UploadCloud size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center px-4">
                <h4 className="text-xs font-bold text-foreground">Back Side</h4>
                <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-widest">Address & QR Code Section</p>
              </div>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={() => setUploadedDocs({...uploadedDocs, back: true})}
              />
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
        <AlertCircle size={16} className="text-amber-500 shrink-0" />
        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest leading-relaxed">
          Ensure text is readable and no flash glare hides details.
        </p>
      </div>

      <button 
        disabled={!uploadedDocs.front || !uploadedDocs.back}
        onClick={() => nextStep("liveness")}
        className="mt-4 w-full h-16 rounded-2xl bg-foreground text-background font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-foreground/90 active:scale-95"
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : "Apply Scans"}
      </button>

      <button onClick={() => setCurrentStep("identity")} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-full text-center hover:text-foreground">
        ← Previous Step
      </button>
    </motion.div>
  );

  const renderLiveness = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center gap-8 max-w-lg mx-auto py-12 px-6"
    >
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="text-[10px] font-black uppercase tracking-widest">Final Step 03/03</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight">Biometric Liveness</h2>
        <p className="text-sm text-muted-foreground font-medium">Position your face inside the circle for AI verification.</p>
      </div>

      <div className="relative w-64 h-64">
        {/* Animated Scanner Ring */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 90, 180, 270, 360] }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute -inset-4 rounded-full border border-dashed border-primary/30"
        />
        <motion.div 
          animate={{ rotate: [0, -90, -180, -270, -360] }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          className="absolute -inset-8 rounded-full border border-dotted border-muted-foreground/20"
        />

        {/* Camera Mask */}
        <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-background shadow-2xl relative bg-black/5">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
             <Smartphone size={100} className="text-muted-foreground" />
          </div>
          
          {isProcessing && (
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex flex-col items-center justify-center">
              <Loader2 className="text-white animate-spin" size={32} />
              <span className="mt-4 text-[10px] font-black text-white uppercase tracking-widest">Scanning Faces...</span>
            </div>
          )}

          {/* Fake Scanner Line */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute left-0 right-0 h-0.5 bg-primary/50 blur-[2px] z-10"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
          <AlertCircle size={16} className="text-primary shrink-0" />
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
            Ensure good lighting and remove glasses/hats.
          </p>
        </div>

        <button 
          onClick={handleCompleteFullKYC}
          disabled={isProcessing}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {isProcessing ? "Analyzing..." : "Capture Video Liveness"}
        </button>
      </div>

      <button onClick={() => setCurrentStep("documents")} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground">
        ← Previous Step
      </button>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center gap-8 max-w-lg mx-auto py-20 px-6 text-center"
    >
      <div className="w-32 h-32 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative">
        <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/20" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
        >
          <CheckCircle2 size={64} className="text-emerald-500" />
        </motion.div>
      </div>

      <div>
        <h2 className="text-3xl font-black tracking-tight">Identity Verified!</h2>
        <p className="mt-4 text-muted-foreground font-medium">
          Congratulations, {formData.fullName || "Friend"}. Your legal identity is now cryptographically linked to your Gig DID.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="p-4 rounded-2xl bg-muted/30 border border-border">
          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">KYC Status</span>
          <p className="mt-1 text-sm font-black text-emerald-500 uppercase">Verified</p>
        </div>
        <div className="p-4 rounded-2xl bg-muted/30 border border-border">
          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Trust Multiplier</span>
          <p className="mt-1 text-sm font-black text-primary uppercase">1.25x Active</p>
        </div>
      </div>

      <button 
        onClick={() => router.push("/home")}
        className="w-full h-16 rounded-2xl bg-foreground text-background font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-foreground/90 transition-all active:scale-95"
      >
        Go to Dashboard
      </button>
    </motion.div>
  );

  return (
    <div className="w-full">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

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
