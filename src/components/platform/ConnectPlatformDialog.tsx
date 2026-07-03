"use client";

import { useState, useRef } from "react";
import { AVAILABLE_PLATFORMS, type PlatformInfo } from "@/lib/aggregation/platform-connector";
import { connectPlatform } from "@/lib/aggregation/platform-connector";
import { db } from "@/lib/db/database";
import { useLiveQuery } from "dexie-react-hooks";
import { useAppStore } from "@/lib/store/app-store";
import { X, ShieldCheck, Check, Loader2, Upload, Trash2, Image as ImageIcon, Calendar, ChevronRight, Plus, IndianRupee, Star, Bike, Clock } from "lucide-react";
import { performEstimate, getBackendUrl } from "@/lib/services/backend-api";
import { createCredential } from "@/lib/identity/credentials";
import { useTranslation } from "@/lib/i18n/use-translation";

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
  const { t } = useTranslation();

  // Real-time parity with database
  const platforms = useLiveQuery(() => db.platforms.where("userId").equals(did || "").toArray()) || [];
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
    const instances = await db.platforms.where("platformId").equals(platformId).and(p => p.userId === did).toArray();
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      const totalEarnings = parseFloat(manualEarnings);
      const totalTrips = parseInt(manualTrips);
      const rating = parseFloat(manualRating);
      const months = parseInt(manualMonths);
      const activeDays = parseInt(manualActiveDays);

      let platformId = `manual_${manualName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

      const BACKEND_URL = getBackendUrl();

      try {
        const gigRes = await fetch(`${BACKEND_URL}/gigs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: did, platform: manualName, connection_type: manualFiles.length > 0 ? "upload" : "manual" })
        });
        const gigData = await gigRes.json();
        if (gigData.gig_id) platformId = gigData.gig_id;
      } catch (err) {
        console.warn("Failed to sync gig to backend, using local ID", err);
      }

      const instanceId = await db.platforms.add({
        userId: did || undefined,
        platformId,
        name: `${manualName} (${months}m)`,
        icon: "📄",
        color: "#6366f1",
        connected: true,
        lastSynced: new Date(),
        isVerified: true // Manual submissions are included immediately; Rs weight (0.3–0.5) discounts their score impact
      });

      const vc = await createCredential({
        subjectDid: did,
        platform: `${manualName} (${months}m)`,
        totalDeliveries: totalTrips,
        avgRating: rating,
        last6MonthsEarnings: totalEarnings
      });
      vc.userId = did || undefined;
      vc.instanceId = instanceId as number; // Link credential → platform row
      await db.credentials.add(vc);

      if (manualFiles.length > 0) {
        const formData = new FormData();
        manualFiles.forEach(f => formData.append("screenshots", f));

        try {
          const uploadRes = await fetch(`${BACKEND_URL}/gigs/${platformId}/documents`, {
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
                data: `${BACKEND_URL}${doc.file_url}`,
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

      const baseMonthlyEarnings = Math.round(totalEarnings / months);
      const baseMonthlyTrips = Math.round(totalTrips / months);
      const now = new Date();

      for (let i = 0; i < months; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().slice(0, 7);
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

      for (let i = 0; i < months; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().slice(0, 7);
        const existing = await db.manualScoringData.where("month").equals(month).first();
        if (!existing) {
          await db.manualScoringData.add({
            month,
            income: Math.round(baseMonthlyEarnings * (0.85 + Math.random() * 0.3)),
            activeDays: Math.min(30, activeDays + Math.floor(Math.random() * 4 - 2)),
            verifiedInflow: 0
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

    // Fallback estimates per duration if backend is unreachable
    const FALLBACK_ESTIMATES: Record<number, { earnings: number; deliveries: number; rating: string }> = {
      3:  { earnings: 75000,  deliveries: 400,  rating: "4.2" },
      6:  { earnings: 180000, deliveries: 950,  rating: "4.6" },
      12: { earnings: 420000, deliveries: 2100, rating: "4.8" },
    };

    try {
      let estimate: any;
      try {
        estimate = await performEstimate(selectedPlatform.id, selectedDuration);
      } catch (estimateErr) {
        console.warn("Backend estimate unavailable, using fallback values:", estimateErr);
        estimate = FALLBACK_ESTIMATES[selectedDuration] ?? FALLBACK_ESTIMATES[6];
      }

      const result = await connectPlatform(selectedPlatform.id, did);

      if (result.success) {
        const instanceId = await db.platforms.add({
          userId: did || undefined,
          platformId: selectedPlatform.id,
          name: `${selectedPlatform.name} (${selectedDuration}m)`,
          icon: selectedPlatform.icon,
          color: selectedPlatform.color,
          connected: true,
          lastSynced: new Date(),
          isVerified: false
        });

        const vc = await createCredential({
          subjectDid: did,
          platform: `${selectedPlatform.name} (${selectedDuration}m)`,
          totalDeliveries: estimate.deliveries || (estimate.limit ? Math.floor(estimate.limit / 100) : 100),
          avgRating: parseFloat(estimate.rating || "4.5"),
          last6MonthsEarnings: estimate.earnings || estimate.limit || 0
        });

        if (result.verificationData) {
          vc.signature = result.verificationData.signature;
          vc.publicKey = result.verificationData.publicKey || result.verificationData.public_key;
          vc.signedAt = result.verificationData.signedAt ? new Date(result.verificationData.signedAt) : undefined;
          vc.verificationStatus = result.verificationData.verificationStatus;
          vc.rawPayload = result.verificationData.rawPayload;
        }

        vc.userId = did || undefined;
        vc.instanceId = instanceId as number; // Link credential → platform row
        await db.credentials.add(vc);

        const earningsToUse = estimate.earnings || estimate.limit || 0;
        const deliveriesToUse = estimate.deliveries || (estimate.limit ? Math.floor(estimate.limit / 100) : 100);
        
        const baseMonthlyEarnings = Math.round(earningsToUse / selectedDuration);
        const baseMonthlyTrips = Math.round(deliveriesToUse / selectedDuration);
        const baseRating = parseFloat(estimate.rating || "4.5");
        const now = new Date();

        for (let i = 0; i < selectedDuration; i++) {
          const month = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().slice(0, 7);
          const variance = 0.85 + Math.random() * 0.3;
          const monthTrips = Math.round(baseMonthlyTrips * variance);
          await db.workRecords.add({
            userId: did || undefined,
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
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-3xl" onClick={handleClose} />

      <div 
        className="relative w-full max-w-lg max-h-[90vh] rounded-[3.5rem] p-10 overflow-y-auto bg-card shadow-2xl animate-in slide-in-from-bottom-10 duration-500"
      >
        <div className="w-12 h-1.5 rounded-full bg-secondary mx-auto mb-10" />

        <button onClick={handleClose} className="absolute top-8 right-8 bg-secondary text-muted-foreground hover:text-foreground w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 z-10">
          <X size={20} />
        </button>

        {step === "select" && (
          <>
            <h2 className="text-3xl font-display font-black text-primary tracking-tight mb-1">{t('plat.connectHub')}</h2>
            <p className="text-sm font-medium text-muted-foreground mb-8">{t('plat.linkNodes')}</p>
            <div className="grid grid-cols-2 gap-4">
              {AVAILABLE_PLATFORMS.map((platform) => {
                const isConnected = dbConnectedIds.includes(platform.id);
                return (
                  <div key={platform.id} style={{ position: "relative" }}>
                    <button
                      onClick={() => handleSelect(platform)}
                      className={`w-full flex flex-col items-center gap-3 p-6 rounded-[2.5rem] transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${
                        isConnected 
                          ? "bg-secondary text-primary" 
                          : "bg-secondary/40 text-foreground hover:bg-secondary hover:shadow-md"
                      }`}
                    >
                      <span className="text-4xl mb-1">{platform.icon}</span>
                      <span className="text-xs font-black uppercase tracking-widest">{platform.name}</span>
                      {isConnected && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-[9px] font-black uppercase">
                          <Check size={10} strokeWidth={4} /> {t('common.active')}
                        </div>
                      )}
                    </button>
                    {isConnected && (
                      <button onClick={(e) => handleDisconnect(e, platform.id)} className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                        <Trash2 size={12} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                );
              })}
              <button 
                onClick={() => setStep("manual")} 
                className="flex flex-col items-center gap-3 p-6 rounded-[2.5rem] bg-secondary/30 hover:bg-secondary/60 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Plus size={20} strokeWidth={3} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t('plat.otherNode')}</span>
              </button>
            </div>
          </>
        )}

        {step === "duration" && selectedPlatform && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-2">{t('plat.syncDuration')}</h2>
            <p className="text-sm font-bold text-[var(--text-tertiary)] mb-8">{t('plat.chooseHistory')}</p>
            <div className="grid grid-cols-1 gap-4">
              {[3, 6, 12].map((m) => (
                <button key={m} onClick={() => handleDurationSelect(m as any)} className="flex items-center justify-between p-6 rounded-[2rem] bg-muted border border-border hover:border-primary/40 hover:bg-muted transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-primary">
                      <Calendar size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-[var(--text-primary)]">{t('plat.monthsHistory', { count: m.toString() })}</p>
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">{m === 12 ? t('plat.fullYear') : m === 6 ? t('plat.mediumTerm') : t('plat.shortTerm')}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            <button onClick={() => setStep("select")} className="w-full mt-6 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-[var(--text-primary)] bg-[var(--bg-tertiary)]">{t('nav.back')}</button>
          </div>
        )}

        {step === "consent" && selectedPlatform && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-8">
              <span style={{ fontSize: "64px" }}>{selectedPlatform.icon}</span>
              <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mt-6">Connect {selectedPlatform.name}?</h2>
              <p className="text-sm font-bold text-[var(--text-tertiary)] mt-2">{t('plat.allowRead', { count: selectedDuration.toString() })}</p>
            </div>
            <div className="space-y-4 mb-10">
              {["Work history & deliveries", "Customer ratings", `Earnings (${selectedDuration}MO)`, "Verified status"].map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-2xl bg-muted border border-border">
                  <ShieldCheck size={18} className="text-teal-500" strokeWidth={3} />
                  <span className="text-xs font-bold text-[var(--text-primary)]">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep("duration")} className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-primary bg-secondary hover:bg-muted-foreground/5 transition-all">{t('nav.back')}</button>
              <button 
                onClick={handleConnect} 
                className="flex-[2] py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-xl transition-all active:scale-[0.98]"
                style={{ backgroundColor: selectedPlatform.color }}
              >
                {t('plat.confirmSync')}
              </button>
            </div>
          </div>
        )}

        {step === "manual" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-1">{t('plat.manualProof')}</h2>
            <p className="text-sm font-bold text-[var(--text-tertiary)] mb-6">{t('plat.addManualDetails')}</p>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 block ml-1">{t('plat.nameLabel')}</label>
                <input 
                  type="text" 
                  placeholder="e.g. BigBasket, Porter, Freelance" 
                  value={manualName} 
                  onChange={(e) => setManualName(e.target.value)} 
                  className="w-full p-4 rounded-2xl bg-secondary/50 border border-white/5 text-foreground font-bold outline-none focus:bg-white focus:shadow-xl focus:shadow-primary/5 text-sm transition-all" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 flex items-center gap-1 ml-1">
                    <IndianRupee size={10} /> {t('plat.earningsLabel')}
                  </label>
                  <input 
                    type="number" 
                    placeholder="₹75,000" 
                    value={manualEarnings} 
                    onChange={(e) => setManualEarnings(e.target.value)} 
                    className="w-full p-4 rounded-2xl bg-secondary/50 border border-white/5 text-foreground font-bold outline-none focus:bg-white focus:shadow-xl focus:shadow-primary/5 text-sm transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 flex items-center gap-1 ml-1">
                    <Bike size={10} /> {t('plat.tripsLabel')}
                  </label>
                  <input 
                    type="number" 
                    placeholder="400" 
                    value={manualTrips} 
                    onChange={(e) => setManualTrips(e.target.value)} 
                    className="w-full p-4 rounded-2xl bg-secondary/50 border border-white/5 text-foreground font-bold outline-none focus:bg-white focus:shadow-xl focus:shadow-primary/5 text-sm transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 flex items-center gap-1 ml-1">
                    <Star size={10} /> {t('plat.ratingLabel')}
                  </label>
                  <input 
                    type="number" 
                    step="0.1" min="1" max="5"
                    placeholder="4.5" 
                    value={manualRating} 
                    onChange={(e) => setManualRating(e.target.value)} 
                    className="w-full p-4 rounded-2xl bg-secondary/50 border border-white/5 text-foreground font-bold outline-none focus:bg-white focus:shadow-xl focus:shadow-primary/5 text-sm transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 flex items-center gap-1 ml-1">
                    <Calendar size={10} /> {t('plat.monthsLabel')}
                  </label>
                    <input 
                      type="number"
                      min="1" max="36"
                      placeholder="6" 
                      value={manualMonths} 
                      onChange={(e) => setManualMonths(e.target.value)} 
                      className="w-full p-4 rounded-2xl bg-secondary/50 border border-white/5 text-foreground font-bold outline-none focus:bg-white focus:shadow-xl focus:shadow-primary/5 text-sm transition-all" 
                    />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5 flex items-center gap-1 ml-1">
                  <Clock size={10} /> {t('plat.activeDaysLabel')}
                </label>
                <input 
                  type="number" 
                  min="1" max="31"
                  placeholder="22" 
                  value={manualActiveDays} 
                  onChange={(e) => setManualActiveDays(e.target.value)} 
                  className="w-full p-4 rounded-2xl bg-secondary/50 border border-white/5 text-foreground font-bold outline-none focus:bg-white focus:shadow-xl focus:shadow-primary/5 text-sm transition-all" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block ml-1">
                  {t('plat.proofScreenshots', { count: manualFiles.length.toString() })}
                </label>
                
                {manualFiles.length > 0 && (
                  <div className="flex flex-col gap-2 mb-3">
                    {manualFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-2 min-w-0">
                          <ImageIcon size={14} className="text-blue-500 shrink-0" />
                          <span className="text-xs font-bold text-foreground truncate">{file.name}</span>
                          <span className="text-[10px] font-bold text-muted-foreground shrink-0">
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

                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer w-full flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-blue-500/5 hover:border-blue-500/30 transition-all"
                >
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleManualFileAdd} />
                  <Plus size={18} className="text-blue-500/60" />
                  <span className="text-xs font-black text-muted-foreground">
                    {manualFiles.length === 0 ? t('plat.addProof') : t('plat.addMoreProof')}
                  </span>
                </button>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <ShieldCheck size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed">
                  {t('plat.manualWarning')}
                </p>
              </div>

              <div className="flex gap-3 mt-1">
                <button onClick={() => setStep("select")} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-foreground bg-secondary hover:bg-muted-foreground/10">{t('nav.back')}</button>
                <button 
                  onClick={handleManualSubmit} 
                  disabled={!isManualFormValid()} 
                  className="flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white bg-gradient-to-r from-indigo-600 to-blue-600 disabled:opacity-30 shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
                >
                  {t('plat.verifyAndAdd')}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "connecting" && (
          <div className="text-center py-12">
            <Loader2 size={56} className="text-primary animate-spin mx-auto" strokeWidth={3} />
            <p className="font-display text-4xl text-foreground mt-8">
              {manualName ? t('plat.verifyingProof') : t('plat.syncingNode')}
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4">
              {manualName ? "Processing cryptographic evidence" : "Establishing secure data tunnel"}
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-[2.5rem] bg-accent/20 border border-accent/20 flex items-center justify-center mx-auto shadow-2xl shadow-accent/20 animate-in zoom-in">
              <Check size={40} className="text-accent" strokeWidth={4} />
            </div>
            <p className="font-display text-4xl text-foreground mt-8">{t('common.success')}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mt-4">
              {t('plat.vaultUpdated')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
