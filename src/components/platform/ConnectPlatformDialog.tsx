"use client";

import { useState, useRef } from "react";
import { AVAILABLE_PLATFORMS, type PlatformInfo } from "@/lib/aggregation/platform-connector";
import { connectPlatform } from "@/lib/aggregation/platform-connector";
import { db } from "@/lib/db/database";
import { useLiveQuery } from "dexie-react-hooks";
import { useAppStore } from "@/lib/store/app-store";
import { X, ShieldCheck, Check, Loader2, Upload, Trash2, Image as ImageIcon, Calendar, ChevronRight, Plus, IndianRupee, Star, Bike, Clock } from "lucide-react";
import { performEstimate } from "@/lib/services/backend-api";
import { createCredential } from "@/lib/identity/credentials";

interface ConnectPlatformDialogProps {
  open: boolean;
  onClose: () => void;
  onConnected: (platformId: string) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export function ConnectPlatformDialog({ open, onClose, onConnected }: ConnectPlatformDialogProps) {
  const { did, removeConnectedPlatform } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Real-time parity with database
  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const dbConnectedIds = platforms.filter(p => p.connected).map(p => p.platformId);

  const [step, setStep] = useState<"select" | "duration" | "consent" | "connecting" | "manual" | "success">("select");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformInfo | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<3 | 6 | 12>(6);

  // Manual proof state
  const [manualName, setManualName] = useState("");
  const [manualFiles, setManualFiles] = useState<File[]>([]);
  const [manualEarnings, setManualEarnings] = useState("");
  const [manualTrips, setManualTrips] = useState("");
  const [manualRating, setManualRating] = useState("");
  const [manualMonths, setManualMonths] = useState("3");
  const [manualActiveDays, setManualActiveDays] = useState("");

  if (!open) return null;

  const handleSelect = (platform: PlatformInfo) => {
    setSelectedPlatform(platform);
    setStep("duration");
  };

  const handleDurationSelect = (months: 3 | 6 | 12) => {
    setSelectedDuration(months);
    setStep("consent");
  };

  const handleDisconnect = async (e: React.MouseEvent, platformId: string) => {
    e.stopPropagation();
    const instances = await db.platforms.where("platformId").equals(platformId).toArray();
    if (instances.length === 0) return;

    const instanceNames = instances.map(p => p.name).join(", ");
    if (confirm(`Remove ${instanceNames}? This will delete all linked history for these accounts.`)) {
      for (const instance of instances) {
        await db.workRecords.where("instanceId").equals(instance.id!).delete();
        await db.platforms.delete(instance.id!);
      }
      removeConnectedPlatform(platformId);
    }
  };

  // ==========================================
  //  MANUAL PROOF SUBMISSION (Full Data Entry)
  // ==========================================
  const handleManualFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setManualFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeManualFile = (index: number) => {
    setManualFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isManualFormValid = () => {
    return (
      manualName.trim().length > 0 &&
      manualFiles.length > 0 &&
      parseFloat(manualEarnings) > 0 &&
      parseInt(manualTrips) > 0 &&
      parseFloat(manualRating) > 0 &&
      parseFloat(manualRating) <= 5 &&
      parseInt(manualMonths) > 0 &&
      parseInt(manualActiveDays) > 0
    );
  };

  const handleManualSubmit = async () => {
    if (!isManualFormValid() || !did) return;
    setStep("connecting");

    try {
      // Simulate document verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const totalEarnings = parseFloat(manualEarnings);
      const totalTrips = parseInt(manualTrips);
      const rating = parseFloat(manualRating);
      const months = parseInt(manualMonths);
      const activeDays = parseInt(manualActiveDays);

      // Generate a safe platformId from the name
      let platformId = `manual_${manualName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

      // Create gig in backend
      try {
        const gigRes = await fetch("http://localhost:5000/gigs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: did, platform: manualName, connection_type: manualFiles.length > 0 ? "upload" : "manual" })
        });
        const gigData = await gigRes.json();
        if (gigData.gig_id) platformId = gigData.gig_id;
      } catch (err) {
        console.warn("Failed to sync gig to backend, using local ID", err);
      }

      // 1. Create platform entry
      const instanceId = await db.platforms.add({
        platformId,
        name: `${manualName} (${months}m)`,
        icon: "📄",
        color: "#6366f1",
        connected: true,
        lastSynced: new Date()
      });

      // 2. Create credential with proof count
      const vc = await createCredential({
        subjectDid: did,
        platform: `${manualName} (${months}m)`,
        totalDeliveries: totalTrips,
        avgRating: rating,
        last6MonthsEarnings: totalEarnings
      });
      await db.credentials.add(vc);

      // Save proof images to backend and Dexie
      if (manualFiles.length > 0) {
        const formData = new FormData();
        manualFiles.forEach(f => formData.append("screenshots", f));
        
        try {
          const uploadRes = await fetch(`http://localhost:5000/gigs/${platformId}/documents`, {
            method: "POST",
            body: formData
          });
          const uploadData = await uploadRes.json();
          
          if (uploadData.documents) {
            for (const doc of uploadData.documents) {
              await db.documents.add({
                credentialId: vc.credentialId,
                name: doc.file_url.split("/").pop() || "Screenshot",
                mimeType: "image/png",
                data: `http://localhost:5000${doc.file_url}`,
                uploadedAt: new Date(doc.uploaded_at),
                verification: doc.verification
              });
            }
          }
        } catch (e) {
          console.error("Backend upload failed, attempting fallback to local b64", e);
          for (const file of manualFiles) {
            const base64Data = await fileToBase64(file);
            await db.documents.add({
              credentialId: vc.credentialId,
              name: file.name,
              mimeType: file.type || "image/png",
              data: base64Data,
              uploadedAt: new Date(),
              verification: "pending"
            });
          }
        }
      }

      // 3. Distribute data across months as work records
      const baseMonthlyEarnings = Math.round(totalEarnings / months);
      const baseMonthlyTrips = Math.round(totalTrips / months);
      const now = new Date();

      for (let i = 0; i < months; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().slice(0, 7);
        // Add natural monthly variance (+-15%)
        const variance = 0.85 + Math.random() * 0.3;
        const monthTrips = Math.round(baseMonthlyTrips * variance);
        await db.workRecords.add({
          instanceId: instanceId as number,
          platformId,
          month,
          earnings: Math.round(baseMonthlyEarnings * variance),
          trips: monthTrips,
          rating: Math.min(5, parseFloat((rating + (Math.random() * 0.4 - 0.2)).toFixed(1))),
          hoursWorked: Math.round(monthTrips * 0.35)
        });
      }

      // 4. Store manual scoring data for each month too (used by data-bridge)
      for (let i = 0; i < months; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().slice(0, 7);
        const existing = await db.manualScoringData.where("month").equals(month).first();
        if (!existing) {
          await db.manualScoringData.add({
            month,
            income: Math.round(baseMonthlyEarnings * (0.85 + Math.random() * 0.3)),
            activeDays: Math.min(30, activeDays + Math.floor(Math.random() * 4 - 2)),
            verifiedInflow: 0 // Manual = not bank-verified
          });
        }
      }

      setStep("success");
      setTimeout(() => {
        onConnected(platformId);
        handleClose();
      }, 1500);
    } catch (err) {
      console.error("Manual submission failed:", err);
      setStep("select");
    }
  };

  const handleConnect = async () => {
    if (!selectedPlatform || !did) return;
    setStep("connecting");

    try {
      const estimate = await performEstimate(selectedPlatform.id, selectedDuration);
      const result = await connectPlatform(selectedPlatform.id, did);
      
      if (result.success) {
        const instanceId = await db.platforms.add({
          platformId: selectedPlatform.id,
          name: `${selectedPlatform.name} (${selectedDuration}m)`,
          icon: selectedPlatform.icon,
          color: selectedPlatform.color,
          connected: true,
          lastSynced: new Date()
        });

        const vc = await createCredential({
          subjectDid: did,
          platform: `${selectedPlatform.name} (${selectedDuration}m)`,
          totalDeliveries: estimate.deliveries,
          avgRating: parseFloat(estimate.rating),
          last6MonthsEarnings: estimate.earnings
        });

        if (result.verificationData) {
          vc.signature = result.verificationData.signature;
          vc.publicKey = result.verificationData.publicKey || result.verificationData.public_key;
          vc.signedAt = result.verificationData.signedAt ? new Date(result.verificationData.signedAt) : undefined;
          vc.verificationStatus = result.verificationData.verificationStatus;
          vc.rawPayload = result.verificationData.rawPayload;
        }

        await db.credentials.add(vc);

        const baseMonthlyEarnings = Math.round(estimate.earnings / selectedDuration);
        const baseMonthlyTrips = Math.round(estimate.deliveries / selectedDuration);
        const baseRating = parseFloat(estimate.rating);
        const now = new Date();

        for (let i = 0; i < selectedDuration; i++) {
          const month = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().slice(0, 7);
          const variance = 0.85 + Math.random() * 0.3;
          const monthTrips = Math.round(baseMonthlyTrips * variance);
          await db.workRecords.add({
            instanceId: instanceId as number,
            platformId: selectedPlatform.id,
            month,
            earnings: Math.round(baseMonthlyEarnings * variance),
            trips: monthTrips,
            rating: Math.min(5, parseFloat((baseRating + (Math.random() * 0.4 - 0.2)).toFixed(1))),
            hoursWorked: Math.round(monthTrips * 0.35)
          });
        }

        setStep("success");
        setTimeout(() => {
          onConnected(selectedPlatform.id);
          handleClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Connection failed:", err);
      setStep("select");
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedPlatform(null);
    setManualName("");
    setManualFiles([]);
    setManualEarnings("");
    setManualTrips("");
    setManualRating("");
    setManualMonths("3");
    setManualActiveDays("");
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={handleClose} />

      <div style={{ position: "relative", width: "100%", maxWidth: "480px", maxHeight: "90vh", background: "var(--bg-elevated)", borderRadius: "40px 40px 0 0", padding: "32px 24px 48px", overflowY: "auto" }} className="animate-slide-up">
        {/* Drag Handle */}
        <div style={{ width: "48px", height: "5px", borderRadius: "5px", background: "var(--border-strong)", margin: "0 auto 32px", opacity: 0.3 }} />

        <button onClick={handleClose} style={{ position: "absolute", top: "24px", right: "24px", background: "var(--bg-tertiary)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", zIndex: 10 }}>
          <X size={20} />
        </button>

        {/* 1. SELECT PLATFORM */}
        {step === "select" && (
          <>
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-1">Connect Work</h2>
            <p className="text-sm font-bold text-[var(--text-tertiary)] mb-8">Link your accounts to verify your history.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {AVAILABLE_PLATFORMS.map((platform) => {
                const isConnected = dbConnectedIds.includes(platform.id);
                return (
                  <div key={platform.id} style={{ position: "relative" }}>
                    <button
                      onClick={() => handleSelect(platform)}
                      style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "24px 16px", borderRadius: "24px", border: `2px solid ${isConnected ? "var(--success-500)30" : "var(--border-color)"}`, background: isConnected ? "rgba(16, 185, 129, 0.05)" : "var(--bg-secondary)", cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      className="hover:scale-[1.02] hover:border-blue-500/50"
                    >
                      <span style={{ fontSize: "40px", marginBottom: "4px" }}>{platform.icon}</span>
                      <span style={{ fontSize: "14px", fontWeight: 900, color: "var(--text-primary)" }}>{platform.name}</span>
                      {isConnected && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-500 text-[10px] font-black uppercase">
                          <Check size={12} strokeWidth={3} /> Active
                        </div>
                      )}
                    </button>
                    {isConnected && (
                      <button onClick={(e) => handleDisconnect(e, platform.id)} className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border-2 border-[var(--bg-elevated)] active:scale-90 transition-transform">
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                );
              })}
              <button onClick={() => setStep("manual")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "24px 16px", borderRadius: "24px", border: "2px dashed var(--primary-500)40", background: "var(--primary-500)10", cursor: "pointer", transition: "all 0.2s" }} className="hover:bg-blue-500/10 hover:border-blue-500/60">
                <div style={{ width: "52px", height: "52px", borderRadius: "18px", background: "var(--primary-500)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 8px 16px -4px rgba(59, 130, 246, 0.4)" }}>
                  <Upload size={24} strokeWidth={3} />
                </div>
                <span className="text-sm font-black text-blue-500">Other Method</span>
              </button>
            </div>
          </>
        )}

        {/* 2. DURATION SELECTION */}
        {step === "duration" && selectedPlatform && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-2">Sync Duration</h2>
            <p className="text-sm font-bold text-[var(--text-tertiary)] mb-8">Choose history length to verify via API.</p>
            <div className="grid grid-cols-1 gap-4">
              {[3, 6, 12].map((m) => (
                <button key={m} onClick={() => handleDurationSelect(m as any)} className="flex items-center justify-between p-6 rounded-[2rem] bg-[var(--bg-secondary)] border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Calendar size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-[var(--text-primary)]">{m} Months History</p>
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">{m === 12 ? "Full Year" : m === 6 ? "Medium Term" : "Short Term"}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            <button onClick={() => setStep("select")} className="w-full mt-6 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-[var(--text-primary)] bg-[var(--bg-tertiary)]">Back</button>
          </div>
        )}

        {/* 3. CONSENT SCREEN */}
        {step === "consent" && selectedPlatform && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-8">
              <span style={{ fontSize: "64px" }}>{selectedPlatform.icon}</span>
              <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mt-6">Connect {selectedPlatform.name}?</h2>
              <p className="text-sm font-bold text-[var(--text-tertiary)] mt-2">Allow GigID to read your verified history ({selectedDuration}mo).</p>
            </div>
            <div className="space-y-4 mb-10">
              {["Work history & deliveries", "Customer ratings", `Earnings (${selectedDuration}MO)`, "Verified status"].map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <ShieldCheck size={18} className="text-teal-500" strokeWidth={3} />
                  <span className="text-xs font-bold text-[var(--text-primary)]">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep("duration")} className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-[var(--text-primary)] bg-[var(--bg-tertiary)]">Back</button>
              <button onClick={handleConnect} style={{ background: `linear-gradient(135deg, ${selectedPlatform.color}, ${selectedPlatform.color}cc)` }} className="flex-[2] py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-2xl">Confirm Sync</button>
            </div>
          </div>
        )}

        {/* 4. MANUAL PROOF — FULL DATA ENTRY */}
        {step === "manual" && (
           <div className="animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-1">Manual Proof</h2>
              <p className="text-sm font-bold text-[var(--text-tertiary)] mb-6">Add platform details and upload proof screenshots.</p>
              
              <div className="flex flex-col gap-4">
                {/* Platform Name */}
                <div>
                  <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 block ml-1">Platform Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. BigBasket, Porter, Freelance" 
                    value={manualName} 
                    onChange={(e) => setManualName(e.target.value)} 
                    className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border border-white/5 text-[var(--text-primary)] font-bold outline-none focus:ring-2 ring-blue-500/20 text-sm" 
                  />
                </div>

                {/* Data Fields — 2-column grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 flex items-center gap-1 ml-1">
                      <IndianRupee size={10} /> Total Earnings *
                    </label>
                    <input 
                      type="number" 
                      placeholder="₹75,000" 
                      value={manualEarnings} 
                      onChange={(e) => setManualEarnings(e.target.value)} 
                      className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border border-white/5 text-[var(--text-primary)] font-bold outline-none focus:ring-2 ring-blue-500/20 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 flex items-center gap-1 ml-1">
                      <Bike size={10} /> Total Trips *
                    </label>
                    <input 
                      type="number" 
                      placeholder="400" 
                      value={manualTrips} 
                      onChange={(e) => setManualTrips(e.target.value)} 
                      className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border border-white/5 text-[var(--text-primary)] font-bold outline-none focus:ring-2 ring-blue-500/20 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 flex items-center gap-1 ml-1">
                      <Star size={10} /> Avg Rating *
                    </label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="1" max="5"
                      placeholder="4.5" 
                      value={manualRating} 
                      onChange={(e) => setManualRating(e.target.value)} 
                      className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border border-white/5 text-[var(--text-primary)] font-bold outline-none focus:ring-2 ring-blue-500/20 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 flex items-center gap-1 ml-1">
                      <Calendar size={10} /> Months Active *
                    </label>
                    <input 
                      type="number"
                      min="1" max="36"
                      placeholder="6" 
                      value={manualMonths} 
                      onChange={(e) => setManualMonths(e.target.value)} 
                      className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border border-white/5 text-[var(--text-primary)] font-bold outline-none focus:ring-2 ring-blue-500/20 text-sm" 
                    />
                  </div>
                </div>

                {/* Active Days */}
                <div>
                  <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 flex items-center gap-1 ml-1">
                    <Clock size={10} /> Avg Active Days / Month *
                  </label>
                  <input 
                    type="number" 
                    min="1" max="31"
                    placeholder="22" 
                    value={manualActiveDays} 
                    onChange={(e) => setManualActiveDays(e.target.value)} 
                    className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border border-white/5 text-[var(--text-primary)] font-bold outline-none focus:ring-2 ring-blue-500/20 text-sm" 
                  />
                </div>

                {/* Multiple Proof Images */}
                <div>
                  <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block ml-1">
                    Proof Screenshots * ({manualFiles.length} added)
                  </label>
                  
                  {/* Uploaded files list */}
                  {manualFiles.length > 0 && (
                    <div className="flex flex-col gap-2 mb-3">
                      {manualFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                          <div className="flex items-center gap-2 min-w-0">
                            <ImageIcon size={14} className="text-blue-500 shrink-0" />
                            <span className="text-xs font-bold text-[var(--text-primary)] truncate">{file.name}</span>
                            <span className="text-[10px] font-bold text-[var(--text-tertiary)] shrink-0">
                              {(file.size / 1024).toFixed(0)}KB
                            </span>
                          </div>
                          <button 
                            onClick={() => removeManualFile(idx)} 
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors shrink-0 ml-2"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add more images button */}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer w-full flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-blue-500/5 hover:border-blue-500/30 transition-all"
                  >
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleManualFileAdd} />
                    <Plus size={18} className="text-blue-500/60" />
                    <span className="text-xs font-black text-[var(--text-secondary)]">
                      {manualFiles.length === 0 ? "Add Proof Screenshots" : "Add More Screenshots"}
                    </span>
                  </button>
                </div>

                {/* Info badge */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <ShieldCheck size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed">
                    Manual entries are marked as &quot;Self-Declared&quot; in your Trust Score. API-verified platforms receive a higher reliability multiplier.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-1">
                  <button onClick={() => setStep("select")} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-[var(--text-primary)] bg-[var(--bg-tertiary)]">Back</button>
                  <button 
                    onClick={handleManualSubmit} 
                    disabled={!isManualFormValid()} 
                    className="flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white bg-gradient-to-r from-indigo-600 to-blue-600 disabled:opacity-30 shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
                  >
                    Verify & Add
                  </button>
                </div>
              </div>
           </div>
        )}

        {/* LOADING & SUCCESS */}
        {step === "connecting" && (
          <div className="text-center py-12">
            <Loader2 size={56} className="text-blue-500 animate-spin mx-auto" strokeWidth={3} />
            <p className="text-lg font-black text-[var(--text-primary)] mt-6">
              {manualName ? "Verifying Documents..." : "Syncing API Data..."}
            </p>
            <p className="text-xs font-bold text-[var(--text-tertiary)] mt-2">
              {manualName ? `Processing ${manualFiles.length} proof(s) for ${manualName}` : `Fetching ${selectedDuration} months of history.`}
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-[2rem] bg-teal-500/20 flex items-center justify-center mx-auto">
              <Check size={40} className="text-teal-500" strokeWidth={4} />
            </div>
            <p className="text-xl font-black text-teal-500 mt-6">Success!</p>
            <p className="text-xs font-bold text-[var(--text-tertiary)] mt-2">
              {manualName ? `${manualName} added to your identity vault.` : "Aggregated your verified profile."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
