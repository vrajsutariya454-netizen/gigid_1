"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Mic, X, HelpCircle, AlertCircle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { VoiceHelpModal } from "./VoiceHelpModal";
import { useAppStore } from "@/lib/store/app-store";
import { SpeechEngine, type VoiceCommand } from "@/lib/voice/speech-engine";

const ROUTE_MAP: Partial<Record<VoiceCommand, string>> = {
  GO_HOME: "/home",
  SHOW_CREDENTIALS: "/credentials",
  SHARE_PROOF: "/share",
  SHOW_SETTINGS: "/settings",
  SHOW_PROFILE: "/profile",
  GO_DASHBOARD: "/dashboard",
  CONNECT_PLATFORM: "/platforms",
};

const SILENCE_TIMEOUT = 15000; // 15 seconds

export function VoiceGuideOverlay() {
  const router = useRouter();
  const { language, isVoiceActive, setVoiceActive } = useAppStore();
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<"idle" | "listening" | "success" | "error">("idle");
  const [showHelp, setShowHelp] = useState(false);
  
  const engineRef = useRef<SpeechEngine | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Recognition
  useEffect(() => {
    const engine = new SpeechEngine();
    setIsSupported(engine.isSupported);
    
    engine.setOnStateChange((listening) => {
      setVoiceActive(listening);
      if (listening) {
        setStatus("listening");
        startSilenceTimer();
      } else {
        setStatus("idle");
        setTranscript("");
        stopSilenceTimer();
      }
    });

    engine.setOnResult((text, command) => {
      setTranscript(text);
      resetSilenceTimer();
      
      if (command !== "UNKNOWN") {
        handleCommand(command);
      }
    });

    engine.setOnError(() => {
      setStatus("error");
      setTimeout(() => {
        if (engineRef.current) setStatus("listening");
      }, 2000);
    });

    engineRef.current = engine;
    return () => engine.destroy();
  }, [setVoiceActive]);

  const startSilenceTimer = useCallback(() => {
    stopSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      stopListening();
    }, SILENCE_TIMEOUT);
  }, []);

  const stopSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const resetSilenceTimer = useCallback(() => {
    startSilenceTimer();
  }, [startSilenceTimer]);

  const toggleListening = () => {
    if (isVoiceActive) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!engineRef.current) return;
    setTranscript("");
    const locale = language === "hi" ? "hi-IN" : "en-IN";
    engineRef.current.startListening(locale);
  };

  const stopListening = () => {
    if (!engineRef.current) return;
    engineRef.current.stopListening();
  };

  const handleCommand = (command: VoiceCommand) => {
    if (command === "SHOW_HELP") {
      setStatus("success");
      setShowHelp(true);
      setTimeout(() => {
        setStatus("listening");
        setTranscript("");
      }, 2000);
      return;
    }

    const route = ROUTE_MAP[command];
    if (route) {
      executeAction(route);
    } else {
      // Small feedback for noise if we want, but usually UNKNOWN is handled in silence/onresult
    }
  };

  const executeAction = (route: string) => {
    setStatus("success");
    setTimeout(() => {
      router.push(route);
      stopListening();
      setTranscript("");
      setStatus("idle");
    }, 1500);
  };

  if (!isSupported) return null;

  return (
    <>
      {/* Transcript Bubble */}
      {(transcript || status === "listening") && !showHelp && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] w-full max-w-[320px] px-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="glass-card rounded-2xl p-4 shadow-xl border-white/10 flex flex-col items-center gap-2 text-center">
            {status === "listening" && !transcript && (
              <div className="flex items-center gap-3">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1 h-2 bg-primary rounded-full animate-bounce delay-0" />
                  <div className="w-1 h-4 bg-primary rounded-full animate-bounce delay-150" />
                  <div className="w-1 h-2 bg-primary rounded-full animate-bounce delay-300" />
                </div>
                <span className="text-sm text-white/60 font-medium font-sans">
                  Listening for commands...
                </span>
              </div>
            )}
            
            {transcript && (
              <>
                <p className="text-white text-base font-medium font-sans">
                  &quot;{transcript}&quot;
                </p>
                {status === "success" && (
                  <div className="flex items-center gap-1.5 text-green-400 text-sm">
                    <Zap className="w-4 h-4 fill-green-400" />
                    <span>Executing...</span>
                  </div>
                )}
                {status === "error" && (
                  <div className="flex items-center gap-1.5 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Try again</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-3">
        {/* Help Button */}
        <button
          onClick={() => setShowHelp(true)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          aria-label="Voice Command Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Mic FAB */}
        <button
          onClick={toggleListening}
          className={`
            relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg overflow-hidden transition-all duration-500 active:scale-95
            ${isVoiceActive 
              ? 'bg-gradient-to-br from-red-500 to-red-600 scale-110' 
              : 'bg-gradient-to-br from-primary to-primary/80 hover:shadow-primary/20'
            }
          `}
          aria-label={isVoiceActive ? "Stop Voice Command" : "Start Voice Command"}
        >
          {isVoiceActive && (
            <div className="absolute inset-0">
              <span className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping duration-1000" />
              <span className="absolute inset-0 rounded-full border border-white/10 animate-pulse duration-1000 scale-150 opacity-0" />
            </div>
          )}
          
          <div className="relative z-10">
            {isVoiceActive ? (
              <X className="w-6 h-6 animate-in fade-in zoom-in duration-300" />
            ) : (
              <Mic className="w-6 h-6 animate-in fade-in zoom-in duration-300" />
            )}
          </div>
        </button>
      </div>

      {/* Help Modal */}
      <VoiceHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}
