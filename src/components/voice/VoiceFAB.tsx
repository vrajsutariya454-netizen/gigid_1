"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";

// Simple keyword → route mapping (works with partial matches too)
const VOICE_ROUTES: { keywords: string[]; route: string; label: string }[] = [
  { keywords: ["home", "go home", "home page", "take me home", "main page", "go back", "होम", "घर", "முகப்பு", "হোম"],  route: "/home", label: "Home" },
  { keywords: ["dashboard", "dash board", "open dashboard", "show dashboard", "डैशबोर्ड", "டாஷ்போர்டு", "ড্যাশবোর্ড"], route: "/dashboard", label: "Dashboard" },
  { keywords: ["platform", "platforms", "nodes", "प्लेटफॉर्म", "தளங்கள்", "প্ল্যাটফর্ম"], route: "/platforms", label: "Platforms" },
  { keywords: ["data hub", "data", "vault", "records", "डेटा", "தரவு", "ডেটা"], route: "/data-hub", label: "Data Hub" },
  { keywords: ["bank", "banking", "wallet", "gig wallet", "बैंक", "வங்கி", "ব্যাংক"], route: "/bank", label: "Bank" },
  { keywords: ["kyc", "verification", "verify", "verify identity", "केवाईसी", "சரிபார்ப்பு", "যাচাই"], route: "/kyc", label: "KYC" },
  { keywords: ["credential", "credentials", "documents", "certificates", "दस्तावेज", "சான்றிதழ்", "নথিপত্র"], route: "/credentials", label: "Credentials" },
  { keywords: ["share", "share proof", "send proof", "साझा", "பகிர்", "শেয়ার"], route: "/share", label: "Share" },
  { keywords: ["setting", "settings", "preferences", "सेटिंग", "அமைப்பு", "সেটিংস"], route: "/settings", label: "Settings" },
  { keywords: ["profile", "my profile", "account", "प्रोफाइल", "சுயவிவரம்", "প্রোফাইল"], route: "/profile", label: "Profile" },
];

function matchVoiceCommand(transcript: string): { route: string; label: string } | null {
  const text = transcript.toLowerCase().trim();
  if (!text) return null;

  // 1. Try exact match first
  for (const entry of VOICE_ROUTES) {
    for (const keyword of entry.keywords) {
      if (text === keyword.toLowerCase()) {
        return { route: entry.route, label: entry.label };
      }
    }
  }

  // 2. Try "contains" match (e.g., "go to home page" contains "home page")
  for (const entry of VOICE_ROUTES) {
    for (const keyword of entry.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return { route: entry.route, label: entry.label };
      }
    }
  }

  // 3. Try reverse contains (e.g., keyword "home" is in "take me to home")
  for (const entry of VOICE_ROUTES) {
    for (const keyword of entry.keywords) {
      if (keyword.toLowerCase().includes(text) && text.length >= 3) {
        return { route: entry.route, label: entry.label };
      }
    }
  }

  return null;
}

export function VoiceFAB() {
  const router = useRouter();
  const pathname = usePathname();
  const { isVoiceActive, setVoiceActive, language } = useAppStore();
  const [transcript, setTranscript] = useState("");
  const [matchedLabel, setMatchedLabel] = useState("");
  const [status, setStatus] = useState<"idle" | "listening" | "success" | "error">("idle");
  const recognitionRef = useRef<any>(null);
  const statusRef = useRef(status);

  // Keep statusRef in sync with status state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Extract locale from current URL path
  const getLocale = useCallback(() => {
    const segments = pathname?.split("/") || [];
    return segments[1] || "en";
  }, [pathname]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    // Create a fresh recognition instance each time
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    // Set language based on app language
    const langMap: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      ta: "ta-IN",
      bn: "bn-IN",
    };
    recognition.lang = langMap[language] || "en-IN";

    recognition.onresult = (event: any) => {
      // Get the latest transcript (including interim results)
      let finalTranscript = "";
      let interimTranscript = "";
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const displayText = finalTranscript || interimTranscript;
      setTranscript(displayText);

      // Only process final results for navigation
      if (finalTranscript) {
        console.log("[Voice] Final transcript:", finalTranscript);
        const match = matchVoiceCommand(finalTranscript);
        
        if (match) {
          console.log("[Voice] Matched:", match.label, "→", match.route);
          setStatus("success");
          setMatchedLabel(match.label);

          const locale = getLocale();
          const fullRoute = `/${locale}${match.route}`;
          
          setTimeout(() => {
            router.push(fullRoute);
            // Reset after navigation
            setTimeout(() => {
              setStatus("idle");
              setVoiceActive(false);
              setTranscript("");
              setMatchedLabel("");
            }, 500);
          }, 800);
        } else {
          console.log("[Voice] No match for:", finalTranscript);
          setStatus("error");
          setTimeout(() => {
            setStatus("idle");
            setTranscript("");
          }, 2500);
        }
      }
    };

    recognition.onstart = () => {
      setVoiceActive(true);
      setStatus("listening");
      setTranscript("");
      setMatchedLabel("");
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      // Use the ref to read the *current* status, not the stale closure value
      if (statusRef.current === "listening") {
        // Recognition ended without a match (silence / no speech)
        setVoiceActive(false);
        setStatus("idle");
      }
    };

    recognition.onerror = (event: any) => {
      console.log("[Voice] Error:", event.error);
      recognitionRef.current = null;
      setVoiceActive(false);
      setStatus("idle");
      setTranscript("");
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.log("[Voice] Failed to start:", e);
    }
  }, [language, getLocale, router, setVoiceActive]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setVoiceActive(false);
    setStatus("idle");
    setTranscript("");
    setMatchedLabel("");
  }, [setVoiceActive]);

  const toggleListening = useCallback(() => {
    if (isVoiceActive) {
      stopListening();
    } else {
      startListening();
    }
  }, [isVoiceActive, stopListening, startListening]);

  // Don't render if speech not supported
  if (typeof window !== "undefined" && !(window as any).SpeechRecognition && !(window as any).webkitSpeechRecognition) {
    return null;
  }

  return (
    <>
      {/* Transcript Bubble */}
      {(transcript || status === "listening") && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(var(--nav-height, 72px) + 80px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15, 15, 25, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "14px 24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            zIndex: 60,
            maxWidth: "320px",
            minWidth: "200px",
            textAlign: "center",
            backdropFilter: "blur(20px)",
          }}
        >
          {status === "listening" && !transcript && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <div className="voice-wave">
                <span /><span /><span /><span /><span />
              </div>
              <span style={{ color: "#a0a0b0", fontSize: "14px", fontWeight: 500 }}>
                Listening...
              </span>
            </div>
          )}
          {transcript && (
            <div>
              <p style={{ color: "#ffffff", fontSize: "15px", fontWeight: 600 }}>
                &quot;{transcript}&quot;
              </p>
              {status === "success" && (
                <p style={{ color: "#22c55e", fontSize: "13px", marginTop: "6px", fontWeight: 600 }}>
                  ✓ Navigating to {matchedLabel}...
                </p>
              )}
              {status === "error" && (
                <p style={{ color: "#f59e0b", fontSize: "13px", marginTop: "6px", fontWeight: 500 }}>
                  Didn&apos;t recognize that. Try saying &quot;home&quot; or &quot;dashboard&quot;.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* FAB Button */}
      <button
        id="voice-fab"
        onClick={toggleListening}
        style={{
          position: "fixed",
          bottom: "calc(var(--nav-height, 72px) + 32px)",
          right: "32px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          background: isVoiceActive
            ? "linear-gradient(135deg, #ef4444, #b91c1c)"
            : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isVoiceActive
            ? "0 4px 30px rgba(239, 68, 68, 0.5)"
            : "0 4px 30px rgba(59, 130, 246, 0.5)",
          zIndex: 60,
          transition: "all 0.3s ease",
          transform: isVoiceActive ? "scale(1.1)" : "scale(1)",
        }}
        aria-label={isVoiceActive ? "Stop listening" : "Start voice command"}
      >
        {/* Pulse rings when active */}
        {isVoiceActive && (
          <>
            <span
              style={{
                position: "absolute",
                inset: "-4px",
                borderRadius: "50%",
                border: "2px solid rgba(239, 68, 68, 0.6)",
                animation: "pulse-ring 1.5s ease-out infinite",
              }}
            />
            <span
              style={{
                position: "absolute",
                inset: "-10px",
                borderRadius: "50%",
                border: "2px solid rgba(239, 68, 68, 0.3)",
                animation: "pulse-ring 1.5s ease-out infinite 0.3s",
              }}
            />
          </>
        )}
        {isVoiceActive ? (
          <X size={24} strokeWidth={2.5} color="white" />
        ) : (
          <Mic size={24} strokeWidth={2.5} color="white" />
        )}
      </button>

      {/* Inline keyframe for pulse animation */}
      <style jsx global>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </>
  );
}
