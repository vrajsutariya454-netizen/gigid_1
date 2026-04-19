"use client";

import { useState } from "react";
import { AVAILABLE_PLATFORMS, type PlatformInfo } from "@/lib/aggregation/platform-connector";
import { connectPlatform } from "@/lib/aggregation/platform-connector";
import { db } from "@/lib/db/database";
import { useLiveQuery } from "dexie-react-hooks";
import { useAppStore } from "@/lib/store/app-store";
import { X, ShieldCheck, Check, Loader2, Upload, Trash2, Image as ImageIcon, Calendar, ChevronRight } from "lucide-react";
import { performEstimate } from "@/lib/services/backend-api";
import { createCredential } from "@/lib/identity/credentials";

interface ConnectPlatformDialogProps {
  open: boolean;
  onClose: () => void;
  onConnected: (platformId: string) => void;
}

export function ConnectPlatformDialog({ open, onClose, onConnected }: ConnectPlatformDialogProps) {
  const { did, removeConnectedPlatform } = useAppStore();
  
  // Real-time parity with database
  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const dbConnectedIds = platforms.filter(p => p.connected).map(p => p.platformId);

  const [step, setStep] = useState<"select" | "duration" | "consent" | "connecting" | "manual" | "success">("select");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformInfo | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<3 | 6 | 12>(6);
  const [manualName, setManualName] = useState("");
  const [manualFile, setManualFile] = useState<File | null>(null);

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
    // Get ALL instances for this platformId (could be multiple durations)
    const instances = await db.platforms.where("platformId").equals(platformId).toArray();
    if (instances.length === 0) return;

    const instanceNames = instances.map(p => p.name).join(", ");
    if (confirm(`Remove ${instanceNames}? This will delete all linked history for these accounts.`)) {
      for (const instance of instances) {
        // Delete ONLY the work records for this specific instance
        await db.workRecords.where("instanceId").equals(instance.id!).delete();
        await db.platforms.delete(instance.id!);
      }
      removeConnectedPlatform(platformId);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualName || !manualFile) return;
    setStep("connecting");
    // Simulate complex proof verification
    await new Promise(resolve => setTimeout(resolve, 2500));
    setStep("success");
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleConnect = async () => {
    if (!selectedPlatform || !did) return;
    setStep("connecting");

    try {
      const estimate = await performEstimate(selectedPlatform.id, selectedDuration);
      const result = await connectPlatform(selectedPlatform.id, did);
      
      if (result.success) {
        // Create a unique instance entry (multi-instance support)
        const instanceId = await db.platforms.add({
          platformId: selectedPlatform.id,
          name: `${selectedPlatform.name} (${selectedDuration}m)`,
          icon: selectedPlatform.icon,
          color: selectedPlatform.color,
          connected: true,
          lastSynced: new Date()
        });

        // Credential scoped to this instance
        const vc = await createCredential({
          subjectDid: did,
          platform: `${selectedPlatform.name} (${selectedDuration}m)`,
          totalDeliveries: estimate.deliveries,
          avgRating: parseFloat(estimate.rating),
          last6MonthsEarnings: estimate.earnings
        });
        await db.credentials.add(vc);

        // Per-month unique records tied to this specific instanceId
        // Each month gets a random variance around the backend estimate
        const baseMonthlyEarnings = Math.round(estimate.earnings / selectedDuration);
        const baseMonthlyTrips = Math.round(estimate.deliveries / selectedDuration);
        const baseRating = parseFloat(estimate.rating);
        const now = new Date();

        for (let i = 0; i < selectedDuration; i++) {
          const month = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().slice(0, 7);
          // Add natural monthly variance (+-15%)
          const variance = 0.85 + Math.random() * 0.3;
          const monthTrips = Math.round(baseMonthlyTrips * variance);
          await db.workRecords.add({
            instanceId: instanceId as number,
            platformId: selectedPlatform.id,
            month,
            earnings: Math.round(baseMonthlyEarnings * variance),
            trips: monthTrips,
            rating: Math.min(5, parseFloat((baseRating + (Math.random() * 0.4 - 0.2)).toFixed(1))),
            hoursWorked: Math.round(monthTrips * 0.35) // ~21 min per delivery
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
    setManualFile(null);
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
                <button key={m} onClick={() => handleDurationSelect(m as any)} className="flex items-center justify-between p-6 rounded-[2rem] bg-muted border border-border hover:border-primary/40 hover:bg-muted transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-primary">
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
                <div key={item} className="flex items-center gap-3 p-4 rounded-2xl bg-muted border border-border">
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

        {/* 4. MANUAL PROOF */}
        {step === "manual" && (
           <div className="animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-2">Manual Proof</h2>
              <p className="text-sm font-bold text-[var(--text-tertiary)] mb-8">Upload a screenshot to verify unlisted work.</p>
              <div className="flex flex-col gap-6">
                <input type="text" placeholder="Platform Name" value={manualName} onChange={(e) => setManualName(e.target.value)} className="w-full p-5 rounded-2xl bg-muted border border-border text-foreground font-bold outline-none focus:ring-4 ring-primary/10" />
                <label className="cursor-pointer flex flex-col items-center justify-center p-12 rounded-[2rem] border-2 border-dashed border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all">
                  <input type="file" hidden accept="image/*" onChange={(e) => setManualFile(e.target.files?.[0] || null)} />
                  <ImageIcon size={36} className="text-blue-500/50 mb-3" />
                  <span className="text-sm font-black text-[var(--text-secondary)]">{manualFile ? manualFile.name : "Select Proof Image"}</span>
                </label>
                <div className="flex gap-4">
                  <button onClick={() => setStep("select")} className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-[var(--text-primary)] bg-[var(--bg-tertiary)]">Back</button>
                  <button onClick={handleManualSubmit} disabled={!manualName || !manualFile} className="flex-[2] py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white bg-blue-600 disabled:opacity-30">Submit</button>
                </div>
              </div>
           </div>
        )}

        {/* LOADING & SUCCESS */}
        {step === "connecting" && (
          <div className="text-center py-12">
            <Loader2 size={56} className="text-blue-500 animate-spin mx-auto" strokeWidth={3} />
            <p className="text-lg font-black text-[var(--text-primary)] mt-6">Syncing API Data...</p>
            <p className="text-xs font-bold text-[var(--text-tertiary)] mt-2">Fetching {selectedDuration} months of history.</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-[2rem] bg-teal-500/20 flex items-center justify-center mx-auto">
              <Check size={40} className="text-teal-500" strokeWidth={4} />
            </div>
            <p className="text-xl font-black text-teal-500 mt-6">Success!</p>
            <p className="text-xs font-bold text-[var(--text-tertiary)] mt-2">Aggregated your verified profile.</p>
          </div>
        )}
      </div>
    </div>
  );
}
