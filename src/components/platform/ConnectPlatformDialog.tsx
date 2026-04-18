"use client";

import { useState } from "react";
import { AVAILABLE_PLATFORMS, type PlatformInfo } from "@/lib/aggregation/platform-connector";
import { connectPlatform } from "@/lib/aggregation/platform-connector";
import { useAppStore } from "@/lib/store/app-store";
import { X, ShieldCheck, Check, Loader2, Upload, Trash2, Image as ImageIcon } from "lucide-react";

interface ConnectPlatformDialogProps {
  open: boolean;
  onClose: () => void;
  onConnected: (platformId: string) => void;
}

export function ConnectPlatformDialog({ open, onClose, onConnected }: ConnectPlatformDialogProps) {
  const { did, connectedPlatforms, addConnectedPlatform } = useAppStore();
  const [step, setStep] = useState<"select" | "consent" | "connecting" | "manual" | "success">("select");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformInfo | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualFile, setManualFile] = useState<File | null>(null);

  if (!open) return null;

  const handleSelect = (platform: PlatformInfo) => {
    setSelectedPlatform(platform);
    setStep("consent");
  };

  const handleManualOpen = () => {
    setStep("manual");
  };

  const handleManualSubmit = async () => {
    if (!manualName || !manualFile) return;
    setStep("connecting");
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep("success");
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleConnect = async () => {
    if (!selectedPlatform || !did) return;
    setStep("connecting");

    const result = await connectPlatform(selectedPlatform.id, did);
    if (result.success) {
      addConnectedPlatform(selectedPlatform.id);
      setStep("success");
      setTimeout(() => {
        onConnected(selectedPlatform.id);
        handleClose();
      }, 1500);
    } else {
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          padding: "24px",
          overflowY: "auto",
        }}
        className="animate-slide-up"
      >
        {/* Handle */}
        <div
          style={{
            width: "40px",
            height: "4px",
            borderRadius: "2px",
            background: "var(--border-strong)",
            margin: "0 auto 20px",
          }}
        />

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "var(--bg-tertiary)",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            zIndex: 10,
          }}
        >
          <X size={18} />
        </button>

        {/* Platform Selection */}
        {step === "select" && (
          <>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              Connect Platform
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
              Choose a platform to import your work history
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {AVAILABLE_PLATFORMS.map((platform) => {
                const isConnected = connectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => !isConnected && handleSelect(platform)}
                    disabled={isConnected}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                      padding: "20px 16px",
                      borderRadius: "var(--radius-lg)",
                      border: `2px solid ${isConnected ? "var(--success-500)" : "var(--border-color)"}`,
                      background: isConnected ? "rgba(16, 185, 129, 0.08)" : "var(--bg-secondary)",
                      cursor: isConnected ? "default" : "pointer",
                      opacity: isConnected ? 0.7 : 1,
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <span style={{ fontSize: "36px" }}>{platform.icon}</span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {platform.name}
                    </span>
                    {isConnected && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--success-500)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Check size={12} /> Connected
                      </span>
                    )}
                  </button>
                );
              })}
              
              {/* Manual Proof Option */}
              <button
                onClick={handleManualOpen}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  padding: "20px 16px",
                  borderRadius: "var(--radius-lg)",
                  border: "2px dashed var(--primary-500)",
                  background: "var(--primary-500)10",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%", 
                  background: "var(--primary-500)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white"
                }}>
                  <Upload size={24} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--primary-500)" }}>
                  Other (Manual)
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 600 }}>
                  Upload Proof
                </span>
              </button>
            </div>
          </>
        )}

        {/* Manual Step */}
        {step === "manual" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             <h2 style={{ fontSize: "20px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}>
              Manual Proof
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
              Upload a screenshot of your profile or earnings for unlisted platforms.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", display: "block" }}>
                  Platform Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Bluedart, Local Logistics"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    fontSize: "15px",
                    fontWeight: 600
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", display: "block" }}>
                  Proof Screenshot
                </label>
                {!manualFile ? (
                  <label style={{
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 20px",
                    borderRadius: "var(--radius-lg)",
                    border: "2px dashed var(--border-color)",
                    background: "var(--bg-secondary)",
                    transition: "all 0.2s"
                  }}
                  className="hover:border-blue-500 hover:bg-blue-500/5"
                  >
                    <input 
                      type="file" 
                      hidden 
                      accept="image/*"
                      onChange={(e) => setManualFile(e.target.files?.[0] || null)}
                    />
                    <ImageIcon size={32} className="text-blue-500/50 mb-3" />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)" }}>
                      Tap to select image
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                      PNG, JPG up to 10MB
                    </span>
                  </label>
                ) : (
                  <div style={{
                    padding: "16px",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--success-500)10",
                    border: "1px solid var(--success-500)30",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <div style={{ width: "48px", height: "48px", background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ImageIcon size={20} className="text-teal-500" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {manualFile.name}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--success-500)", fontWeight: 600 }}>Ready to verify</p>
                    </div>
                    <button 
                      onClick={() => setManualFile(null)}
                      style={{ padding: "8px", color: "var(--danger-500)", background: "transparent", border: "none" }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  onClick={() => setStep("select")}
                  style={{
                    flex: 1,
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    background: "transparent",
                    color: "var(--text-primary)",
                    fontSize: "15px",
                    fontWeight: 700,
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualName || !manualFile}
                  style={{
                    flex: 2,
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    background: (!manualName || !manualFile) ? "var(--border-color)" : "var(--primary-500)",
                    color: "white",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: (!manualName || !manualFile) ? "not-allowed" : "pointer"
                  }}
                >
                  Submit for Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Consent Screen */}
        {step === "consent" && selectedPlatform && (
          <>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <span style={{ fontSize: "48px" }}>{selectedPlatform.icon}</span>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginTop: "12px" }}>
                Allow GigID to access your {selectedPlatform.name} data?
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "8px" }}>
                GigID will read your work history, ratings, and earnings to create verifiable credentials.
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              {["Work history & delivery count", "Ratings & reviews", "Earnings data (last 6 months)", "Account verification status"].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <ShieldCheck size={16} color="var(--success-500)" />
                  <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setStep("select")}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Deny
              </button>
              <button
                onClick={handleConnect}
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: `linear-gradient(135deg, ${selectedPlatform.color}, ${selectedPlatform.color}cc)`,
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: `0 4px 12px ${selectedPlatform.color}44`,
                }}
              >
                Allow Access
              </button>
            </div>
          </>
        )}

        {/* Connecting */}
        {step === "connecting" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Loader2
              size={48}
              color="var(--primary-500)"
              style={{ animation: "spin 1s linear infinite", margin: "0 auto" }}
            />
            <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginTop: "20px" }}>
              {manualName ? `Uploading proof for ${manualName}...` : `Connecting to ${selectedPlatform?.name}...`}
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "8px" }}>
              {manualName ? "Uploading screenshot securely..." : "Fetching your work history and creating credential"}
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
              }}
              className="animate-scale-in"
            >
              <Check size={36} color="var(--success-500)" strokeWidth={3} />
            </div>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--success-500)", marginTop: "20px" }}>
              {manualName ? "Proof Submitted!" : "Connected!"}
            </p>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "8px" }}>
              {manualName 
                ? "Our team will verify your document shortly."
                : `Your ${selectedPlatform?.name} credential has been created`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
