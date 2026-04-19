"use client";

import { useAppStore } from "@/lib/store/app-store";
import { Globe, Fingerprint, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { Sidebar } from "./Sidebar";

export function TopBar() {
  const { isOnline, setOnline, name } = useAppStore();
  const { t } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnline]);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "var(--top-bar-height)",
          background: "var(--bg-elevated)", // Solid background
          backgroundColor: "var(--bg-elevated)", // Fallback for some browsers
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 40, // Reduced to be safely behind sidebar backdrop (100)
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Hamburger Menu Trigger */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Open global menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo & Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-sm)",
                background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              <Fingerprint size={18} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                GigID
              </h1>
              {name && (
                <p style={{ fontSize: "11px", color: "var(--text-tertiary)", lineHeight: 1 }}>
                  {name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Online/Offline Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              background: mounted && isOnline ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${mounted && isOnline ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            }}
          >
            <div className={mounted && isOnline ? "status-online" : "status-offline"} />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: mounted && isOnline ? "var(--success-500)" : "var(--danger-500)",
              }}
            >
              {!mounted ? "---" : isOnline ? t('common.online') : t('common.offline')}
            </span>
          </div>

          {/* Language Toggle */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="touch-target"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-sm)",
                padding: "6px",
              }}
              aria-label="Change language"
              id="language-toggle"
            >
              <Globe size={20} />
            </button>
            {showLangMenu && <LanguageMenu onClose={() => setShowLangMenu(false)} />}
          </div>
        </div>
      </header>

      {/* Global Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </>
  );
}

function LanguageMenu({ onClose }: { onClose: () => void }) {
  const { language, setLanguage } = useAppStore();
  const languages = [
    { code: "en" as const, label: "English", flag: "🇬🇧" },
    { code: "hi" as const, label: "हिंदी", flag: "🇮🇳" },
    { code: "ta" as const, label: "தமிழ்", flag: "🇮🇳" },
    { code: "bn" as const, label: "বাংলা", flag: "🇮🇳" },
  ];

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 40 }}
        onClick={onClose}
      />
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-lg)",
          padding: "4px",
          zIndex: 50,
          minWidth: "160px",
        }}
        className="animate-scale-in"
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code);
              onClose();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "10px 14px",
              border: "none",
              background: language === lang.code ? "var(--primary-500)" : "transparent",
              color: language === lang.code ? "white" : "var(--text-primary)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: language === lang.code ? 600 : 400,
              transition: "all var(--transition-fast)",
            }}
          >
            <span style={{ fontSize: "18px" }}>{lang.flag}</span>
            {lang.label}
          </button>
        ))}
      </div>
    </>
  );
}
