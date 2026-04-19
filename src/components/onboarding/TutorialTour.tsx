// @ts-nocheck
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Joyride, STATUS } from "react-joyride";
import { useAppStore } from "@/lib/store/app-store";
import { X, ArrowRight, Check, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Steps per route — each page gets its own mini-tour                */
/* ------------------------------------------------------------------ */
const HOME_STEPS = [
  {
    target: "body",
    placement: "center",
    content:
      "Hi! I'm Gigi! 🐘 Welcome to GigID. Let me show you around your professional digital identity!",
    disableBeacon: true,
  },
  {
    target: "#trust-score-section",
    placement: "bottom",
    content:
      "This is your Trust Score — a mathematical proof of your reliability as a gig worker!",
    disableBeacon: true,
  },
  {
    target: "#add-platform-btn",
    placement: "bottom",
    content:
      "Tap here to connect gig platforms like Swiggy, Zomato, or Uber!",
    disableBeacon: true,
  },
  {
    target: "#data-hub-section",
    placement: "top",
    content:
      "The Account Aggregator framework verifies your income from your bank — no passwords needed.",
    disableBeacon: true,
  },
  {
    target: "#platforms-section",
    placement: "top",
    content:
      "All your connected platforms appear here. Each one contributes to your trust score!",
    disableBeacon: true,
  },
];

const CREDENTIALS_STEPS = [
  {
    target: "body",
    placement: "center",
    content:
      "Welcome to your Credential Vault! 🔐 This is where your Verifiable Credentials live — cryptographic proofs of your work history.",
    disableBeacon: true,
  },
  {
    target: "#vault-list-container",
    placement: "top",
    content:
      "Each card here is a credential you OWN. No one can revoke or tamper with these — they're yours forever!",
    disableBeacon: true,
  },
];

const SETTINGS_STEPS = [
  {
    target: "body",
    placement: "center",
    content:
      "Here are your settings! 🎛️ Let me show you what you can customize.",
    disableBeacon: true,
  },
  {
    target: "#settings-theme-section",
    placement: "bottom",
    content:
      "Choose your visual style — Pristine (light), Cosmic (dark), or Onyx (high contrast). You can also adjust text size!",
    disableBeacon: true,
  },
  {
    target: "#settings-language-section",
    placement: "top",
    content:
      "GigID speaks your language! Switch between English, Hindi, Tamil, or Bengali anytime.",
    disableBeacon: true,
  },
  {
    target: "#settings-did-section",
    placement: "top",
    content:
      "Your Decentralized Identifier (DID) is your cryptographic anchor. It's unique to you and secured on-chain. 🔒",
    disableBeacon: true,
  },
];

const SHARE_STEPS = [
  {
    target: "body",
    placement: "center",
    content:
      "This is the Privacy Prover! 🛡️ Generate Zero-Knowledge Proofs to share claims without revealing private data.",
    disableBeacon: true,
  },
  {
    target: "#mint-zk-proof-btn",
    placement: "top",
    content:
      "Tap here to generate a proof like 'I earn > ₹40k/month' without showing your bank statement. Magic! ✨",
    disableBeacon: true,
  },
];

const BANK_STEPS = [
  {
    target: "body",
    placement: "center",
    content:
      "Welcome to the Capital Hub! 💰 Here your verified work history unlocks financial opportunities.",
    disableBeacon: true,
  },
  {
    target: "#financial-stats-card",
    placement: "bottom",
    content:
      "Your verified earnings are displayed here. Banks can use this to offer you better rates!",
    disableBeacon: true,
  },
  {
    target: "#bank-list-container",
    placement: "top",
    content:
      "Connect your bank account securely via Account Aggregator to verify your income.",
    disableBeacon: true,
  },
];

// Map routes to their steps
const ROUTE_STEPS = {
  "/home": HOME_STEPS,
  "/credentials": CREDENTIALS_STEPS,
  "/settings": SETTINGS_STEPS,
  "/share": SHARE_STEPS,
  "/bank": BANK_STEPS,
};

/* ------------------------------------------------------------------ */
/*  Custom Tooltip — Premium white box with Gigi mascot               */
/* ------------------------------------------------------------------ */
const CustomTooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  size,
}) => {
  return (
    <div
      {...tooltipProps}
      style={{
        maxWidth: 420,
        width: "100%",
        zIndex: 100000,
        padding: 16,
        pointerEvents: "auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Gigi Mascot */}
        <div
          className="animate-mascot"
          style={{
            position: "relative",
            width: 90,
            height: 90,
            marginLeft: 16,
            marginBottom: -8,
            zIndex: 100001,
          }}
        >
          <Image
            src="/assets/mascot/gigi.png"
            alt="Gigi the Elephant"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Speech Bubble */}
        <div
          style={{
            background: "#ffffff",
            color: "#111",
            borderRadius: 24,
            padding: 24,
            boxShadow:
              "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)",
            position: "relative",
          }}
        >
          {/* Label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
              opacity: 0.35,
            }}
          >
            <Sparkles size={12} strokeWidth={3} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.3em",
              }}
            >
              Gigi Guide
            </span>
          </div>

          {/* Content */}
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              fontWeight: 500,
              color: "#1a1a1a",
              margin: 0,
            }}
          >
            {step.content}
          </p>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            {/* Progress dots */}
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: size }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === index ? 16 : 4,
                    height: 4,
                    borderRadius: 4,
                    background:
                      i === index
                        ? "var(--primary, #6366f1)"
                        : "rgba(0,0,0,0.08)",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              {index > 0 && (
                <button
                  {...backProps}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 12,
                    border: "none",
                    background: "transparent",
                    color: "#999",
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
              )}
              <button
                {...primaryProps}
                style={{
                  padding: "10px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: "var(--primary, #6366f1)",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                }}
              >
                {isLastStep ? (
                  <>
                    Got it! <Check size={14} strokeWidth={3} />
                  </>
                ) : (
                  <>
                    Continue <ArrowRight size={14} strokeWidth={3} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Close X */}
          <button
            {...closeProps}
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1px solid rgba(0,0,0,0.06)",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              color: "#999",
            }}
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Persist in localStorage — tours show only once per signup, forever
function hasPageBeenToured(route: string): boolean {
  try {
    const pages = JSON.parse(localStorage.getItem("gigid-toured-pages") || "[]");
    return pages.includes(route);
  } catch {
    return false;
  }
}

function markPageToured(route: string) {
  try {
    const pages = JSON.parse(localStorage.getItem("gigid-toured-pages") || "[]");
    if (!pages.includes(route)) {
      pages.push(route);
      localStorage.setItem("gigid-toured-pages", JSON.stringify(pages));
    }
  } catch { }
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export const TutorialTour = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentSteps, setCurrentSteps] = useState([]);
  const { hasCompletedOnboarding } = useAppStore();

  // Only render on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset and re-check tour on every route change
  useEffect(() => {
    if (!mounted || !hasCompletedOnboarding) return;

    // Stop any currently running tour when route changes
    setRun(false);
    setCurrentSteps([]);

    // Normalise pathname
    const normPath = pathname === "/" ? "/home" : pathname;

    // Check if this page has already been toured
    if (hasPageBeenToured(normPath)) return;

    // Get steps for this route
    const steps = ROUTE_STEPS[normPath];
    if (!steps || steps.length === 0) return;

    // Delay to let the new page render its DOM elements
    const timer = setTimeout(() => {
      setCurrentSteps([...steps]);
      setRun(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [pathname, mounted, hasCompletedOnboarding]);

  const handleCallback = useCallback(
    (data) => {
      const { status } = data;

      if (status === STATUS.FINISHED || status === "finished") {
        setRun(false);
        setCurrentSteps([]);
        // Mark this page as toured
        const normPath = pathname === "/" ? "/home" : pathname;
        markPageToured(normPath);
      }

      if (status === STATUS.SKIPPED || status === "skipped") {
        setRun(false);
        setCurrentSteps([]);
        const normPath = pathname === "/" ? "/home" : pathname;
        markPageToured(normPath);
      }
    },
    [pathname]
  );

  if (!mounted || !hasCompletedOnboarding) return null;
  if (!run || currentSteps.length === 0) return null;

  return (
    <Joyride
      callback={handleCallback}
      continuous
      run={run}
      steps={currentSteps}
      scrollToFirstStep
      showSkipButton
      disableOverlayClose
      spotlightPadding={12}
      tooltipComponent={CustomTooltip}
      locale={{
        back: "Back",
        close: "Close",
        last: "Got it!",
        next: "Continue",
        skip: "Skip tour",
      }}
      styles={{
        options: {
          zIndex: 99999,
          arrowColor: "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    />
  );
};
