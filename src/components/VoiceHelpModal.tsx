"use client";

import { X, Mic, MoveRight, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface VoiceHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMAND_CATEGORIES = [
  {
    name: "Navigation",
    icon: <MoveRight className="w-5 h-5 text-primary" />,
    commands: [
      { text: "Go home", description: "Navigate to the main landing page" },
      { text: "Dashboard", description: "View your activity and stats" },
      { text: "Wallet / Credentials", description: "View your digital identity docs" },
      { text: "Share / Share proof", description: "Go to the sharing page" },
      { text: "Settings", description: "Manage your preferences" },
      { text: "Profile", description: "View your user profile" },
    ],
  },
  {
    name: "Actions",
    icon: <Zap className="w-5 h-5 text-accent" />,
    commands: [
      { text: "Add platform", description: "Connect a new work platform" },
      { text: "Show score", description: "View your trust score summary" },
      { text: "Help", description: "Open this command guide" },
    ],
  },
];

export function VoiceHelpModal({ isOpen, onClose }: VoiceHelpModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg glass-card rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Voice Guide</h2>
              <p className="text-sm text-white/50">Try saying one of these commands</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white/70" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8 custom-scrollbar">
          {COMMAND_CATEGORIES.map((category) => (
            <div key={category.name} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                {category.icon}
                <h3 className="font-semibold text-white/90">{category.name}</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {category.commands.map((command) => (
                  <div 
                    key={command.text}
                    className="flex flex-col p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                    <span className="text-primary font-medium group-hover:translate-x-1 transition-transform">
                      &quot;{command.text}&quot;
                    </span>
                    <span className="text-xs text-white/40 mt-1">
                      {command.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-primary/5 border-t border-white/10">
          <p className="text-center text-sm text-white/60">
            Listening is continuous. Speak naturally!
          </p>
        </div>
      </div>
    </div>
  );
}
