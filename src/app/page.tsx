"use client";

import { useAppStore } from "@/lib/store/app-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const { setOnboardingCompleted, setUser } = useAppStore();
  const router = useRouter();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // 1. Sign Up User
        const { data: authData, error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signupError) throw signupError;
        if (!authData.user) throw new Error("Signup failed - no user returned");

        // 2. Create Profile Row
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: fullName,
            username: username,
            role: "gig-worker", // Default role
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;
        
        // Success - redirect or show message
        alert("Account created! Please sign in.");
        setIsSignUp(false);
      } else {
        // Sign In User
        console.log("Attempting login for:", email);
        
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          console.error("Login call failed:", loginError);
          throw loginError;
        }
        
        if (!data.user) throw new Error("Login failed - no user returned");

        // Fetch profile
        const { data: profile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (fetchError) console.error("Could not fetch profile:", fetchError);

        // Update Global State
        setUser({ 
          name: profile?.full_name || data.user.email || "Gig Worker",
          email: data.user.email,
          username: profile?.username || null,
          role: profile?.role || "gig-worker",
          did: profile?.id ? `did:gigid:${profile.id}` : null,
          isAuthenticated: true 
        });
        
        setOnboardingCompleted();
        router.replace("/dashboard");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      
      let message = err.message || "An unexpected error occurred";
      
      // Handle Supabase rate limit specifically
      if (message.toLowerCase().includes("rate limit")) {
        message = "Email rate limit exceeded. Supabase limits signups and emails to prevent spam. Please wait a few minutes or use a different email.";
      }

      // Handle Email Not Confirmed specifically
      if (message.toLowerCase().includes("email not confirmed")) {
        message = "Your email has not been confirmed yet. Please check your inbox for a verification link or disable 'Email Confirmation' in your Supabase Auth settings.";
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 min-h-[90vh]">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 ease-out">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[var(--text-primary)]">
            GigID
          </h1>
          <p className="text-[var(--text-secondary)] text-sm font-medium">
            {isSignUp ? "Create your professional profile" : "Your Work, Your Identity"}
          </p>
        </div>

        {/* Login Card */}
        <div 
          className="relative group rounded-3xl p-10 shadow-2xl shadow-blue-500/10 backdrop-blur-xl transition-all duration-300"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          <div 
            className="absolute top-0 inset-x-0 h-px" 
            style={{ background: "linear-gradient(to right, transparent, var(--primary-500), transparent)" }}
          ></div>
          
          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
                {error}
              </div>
            )}

            {isSignUp && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-tertiary)" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-6 py-4 rounded-2xl outline-none transition-all duration-300 focus:ring-4 font-medium"
                    style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-primary)" }}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-tertiary)" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-6 py-4 rounded-2xl outline-none transition-all duration-300 focus:ring-4 font-medium"
                    style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-primary)" }}
                    placeholder="johndoe123"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-tertiary)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-4 rounded-2xl outline-none transition-all duration-300 focus:ring-4 font-medium"
                style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-primary)" }}
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
                className="w-full px-6 py-4 rounded-2xl outline-none transition-all duration-300 focus:ring-4 font-medium"
                style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-primary)" }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 mt-4 text-white font-bold tracking-wider rounded-2xl transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
              style={{ 
                background: "linear-gradient(135deg, var(--primary-600), var(--primary-400))",
                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
              }}
            >
              {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center px-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-bold text-[var(--text-secondary)] hover:text-blue-500 transition-colors"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
