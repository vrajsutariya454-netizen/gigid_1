"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Star,
  Mail,
  Lock,
  Fingerprint,
} from "lucide-react";
import { useState } from "react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { seedDemoPersona } from "@/lib/scoring/demo-profiles";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AuroraBackground />
      <Nav />
      <Hero />
      <StatsStrip />
      <Features />
      <Footer />
    </main>
  );
}

/* ---------------- NAV ---------------- */

function Nav() {
  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2.5">
        <ShieldCheck />
        <span className="font-display text-lg font-semibold">GigID</span>
      </div>
      <a className="glass px-4 py-2 rounded-full">Get access</a>
    </header>
  );
}

/* ---------------- HERO ---------------- */

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
          Your work,
          <br />
          <span className="text-gradient">your identity.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg">
          The premium digital hub for gig workers to track earnings, build verifiable trust, and showcase experience securely.
        </p>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-md mx-auto lg:ml-auto"
      >
        <SignInCard />
      </motion.div>
    </section>
  );
}

/* ---------------- SIGN IN ---------------- */

function SignInCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
<<<<<<< HEAD
      // VRAJ ACCOUNT SPECIAL MAPPING
      if (email.toLowerCase() === "vraj" || email.toLowerCase() === "vraj@example.com") {
        await seedDemoPersona("U001"); // Rahul Sharma
        setUser({ 
          name: "Rahul Sharma",
          email: "vraj@example.com",
          username: "vraj",
          role: "gig-worker",
          did: `did:gigid:demo:vraj`,
          isAuthenticated: true 
        });
        setOnboardingCompleted();
        router.replace("/home");
        return;
      }

      if (isSignUp) {
        const { data: authData, error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signupError) throw signupError;
        if (!authData.user) throw new Error("Signup failed - no user returned");

        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: fullName,
            username: username,
            role: "gig-worker",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;
        alert("Account created! Please sign in.");
        setIsSignUp(false);
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;
        if (!data.user) throw new Error("Login failed - no user returned");

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        setUser({ 
          name: profile?.full_name || data.user.email || "Gig Worker",
          email: data.user.email,
          username: profile?.username || null,
          role: profile?.role || "gig-worker",
          did: profile?.id ? `did:gigid:${profile.id}` : null,
          isAuthenticated: true 
        });
        
        setOnboardingCompleted();
        router.replace("/home");
      }
    } catch (err: any) {
      let message = err.message || "An unexpected error occurred";
      if (message.toLowerCase().includes("email not confirmed")) {
        message = "ACTION REQUIRED: Your email has not been confirmed. Please check your inbox or disable 'Email Confirmation' in Supabase.";
      }
      setError(message);
    } finally {
      setIsLoading(false);
=======
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Login failed");
>>>>>>> e8f94190e328f4335f925e7b5b323f58f6a9e76f
    }
  };

  return (
<<<<<<< HEAD
    <div className="w-full flex flex-col items-center justify-center p-4 min-h-[90vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[var(--text-primary)]">
            GigID
          </h1>
          <p className="text-[var(--text-secondary)] text-sm font-medium">
            {isSignUp ? "Create your professional profile" : "Your Work, Your Identity"}
          </p>
        </div>

        <div 
          className="relative group rounded-3xl p-10 shadow-2xl shadow-blue-500/10 backdrop-blur-xl"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
                {error}
              </div>
            )}

            {isSignUp && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-tertiary)" }}>Full Name</label>
                  <input
                    type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                    className="w-full px-6 py-4 rounded-2xl outline-none"
                    style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-primary)" }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-tertiary)" }}>Username</label>
                  <input
                    type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                    className="w-full px-6 py-4 rounded-2xl outline-none"
                    style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-primary)" }}
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-tertiary)" }}>Email</label>
              <input
                type="text" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-6 py-4 rounded-2xl outline-none"
                style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-primary)" }}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: "var(--text-tertiary)" }}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-6 py-4 rounded-2xl outline-none"
                style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-primary)" }}
              />
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full py-4 px-4 mt-4 text-white font-bold tracking-wider rounded-2xl transition-transform active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--primary-600), var(--primary-400))" }}
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
=======
    <div className="glass-strong p-8 rounded-3xl mt-10">
      <h2 className="text-xl font-bold">Sign in</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mt-4 bg-transparent border-b border-white/20 p-2"
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mt-4 bg-transparent border-b border-white/20 p-2"
      />

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <button 
        onClick={handleLogin}
        className="mt-6 w-full bg-white text-black p-3 rounded-xl"
      >
        Login
      </button>
>>>>>>> e8f94190e328f4335f925e7b5b323f58f6a9e76f
    </div>
  );
}

/* ---------------- STATS ---------------- */

function StatsStrip() {
  return (
    <section className="px-6">
      <div className="glass grid grid-cols-3 p-6 rounded-3xl">
        <div>$2.4B</div>
        <div>184k</div>
        <div>99.9%</div>
      </div>
    </section>
  );
}

/* ---------------- FEATURES ---------------- */

function Features() {
  return (
    <section className="px-6 py-20">
      <h2 className="text-3xl">Features</h2>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */

function Footer() {
  return (
    <footer className="px-6 py-10 text-sm text-muted-foreground">
      © GigID
    </footer>
  );
}