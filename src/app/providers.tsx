"use client";

import { useEffect, type ReactNode } from "react";
import { QueryProvider } from "@/lib/query/query-provider";
import { useAppStore } from "@/lib/store/app-store";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { VoiceFAB } from "@/components/voice/VoiceFAB";
import { usePathname } from "next/navigation";

function ThemeInitializer({ children }: { children: ReactNode }) {
  const { theme, textSize, setOnline } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-text-size", textSize);
  }, [theme, textSize]);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [setOnline]);

  // Explicitly unregister any lingering service workers
  // to prevent 404s for old /sw.js or PWA icons
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
  }, []);

  return <>{children}</>;
}

function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/";

  return (
    <div 
      className="min-h-screen relative overflow-x-hidden transition-colors duration-500 selection:bg-blue-500/30"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Universal Background Glows */}
      <div 
        className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none z-0" 
        style={{ backgroundColor: "var(--primary-500)", opacity: 0.15 }}
      />
      <div 
        className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none z-0" 
        style={{ backgroundColor: "var(--success-500)", opacity: 0.1 }}
      />
      
      <div className="relative z-10">
        {!isLoginPage && <TopBar />}
        <main className={!isLoginPage ? "page-container" : "min-h-screen flex flex-col items-center justify-center"}>
          {children}
        </main>
        {!isLoginPage && <VoiceFAB />}
        {!isLoginPage && <BottomNav />}
      </div>
    </div>
  );
}

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeInitializer>
        <AppShell>{children}</AppShell>
      </ThemeInitializer>
    </QueryProvider>
  );
}
