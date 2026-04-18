"use client";

import { useAppStore } from "@/lib/store/app-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateDID } from "@/lib/identity/did";
import { db } from "@/lib/db/database";

export default function LoginPage() {
  const { setOnboardingCompleted, setUser } = useAppStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // We no longer auto-redirect to /home on load because the user
  // wants to see the login page first when opening the address.

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);
    try {
      const { did } = await generateDID();
      try {
        await db.profiles.add({
          did,
          name: "Gig Worker",
          phone: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (err) {
        // Ignore if profile already exists
      }
      setUser({ did, name: "Gig Worker", isAuthenticated: true });
      setOnboardingCompleted();
      router.replace("/home");
    } catch (error) {
      console.error("Failed to login:", error);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 ease-out">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[var(--text-primary)]">
            GigID
          </h1>
          <p className="text-[var(--text-secondary)] text-sm font-medium">
            Your Work, Your Identity
          </p>
        </div>

        {/* Login Card */}
        <div 
          className="relative group rounded-2xl border p-8 shadow-2xl backdrop-blur-xl transition-all duration-300"
          style={{ 
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)"
          }}
        >
          {/* Subtle top glow line */}
          <div 
            className="absolute top-0 inset-x-0 h-px" 
            style={{ background: "linear-gradient(to right, transparent, var(--primary-500), transparent)" }}
          ></div>
          
          <form onSubmit={handleLogin} className="flex flex-col space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-tertiary)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:ring-4"
                style={{ 
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "white",
                  borderColor: "var(--border-color)"
                }}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-tertiary)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:ring-4"
                style={{ 
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "white",
                  borderColor: "var(--border-color)"
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 mt-2 text-white font-semibold rounded-xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
              style={{ 
                background: "linear-gradient(135deg, var(--primary-600), var(--success-500))",
                boxShadow: "0 4px 15px rgba(30, 58, 138, 0.3)"
              }}
            >
              {isLoggingIn ? "Signing In..." : "Sign In / Sign Up"}
            </button>
        </form>

        <div className="my-6 flex items-center justify-between">
          <hr className="w-full" style={{ borderColor: "var(--border-color)" }} />
          <span className="px-3 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-tertiary)" }}>Or</span>
          <hr className="w-full" style={{ borderColor: "var(--border-color)" }} />
        </div>

        <button
          type="button"
          onClick={() => handleLogin()}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
          style={{ 
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-color)",
            color: "var(--text-primary)"
          }}
        >
            <svg className="w-5 h-5" style={{ color: "var(--success-500)" }} viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
