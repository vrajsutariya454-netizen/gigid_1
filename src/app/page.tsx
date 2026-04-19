"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Lock,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { seedDemoPersona } from "@/lib/scoring/demo-profiles";
import { useAppStore } from "@/lib/store/app-store";

export default function Page() {
  return (
    <main className="relative min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] animate-float opacity-40" />
        <div className="absolute -top-[5%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[130px] animate-float [animation-delay:2s] opacity-30" />
        <div className="absolute -bottom-[10%] left-[20%] w-[55%] h-[55%] rounded-full bg-accent-2/15 blur-[140px] animate-float [animation-delay:4s] opacity-25" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Nav />
        <Hero />
        <Footer />
      </div>
    </main>
  );
}

/* ---------------- NAV ---------------- */

function Nav() {
  return (
    <header className="mx-auto w-full max-w-7xl px-6 py-8 flex items-center justify-between">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 transition-all group-hover:bg-primary/20 group-hover:scale-110">
          <ShieldCheck className="w-6 h-6 text-primary" strokeWidth={2.5} />
        </div>
        <span className="font-sans font-bold text-xl tracking-tight text-foreground/90">GigID</span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">Features</a>
        <a href="#" className="hover:text-foreground transition-colors">Security</a>
        <a href="#" className="hover:text-foreground transition-colors">Enterprise</a>
        <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
      </nav>

      <button className="glass px-6 py-2.5 rounded-full text-sm font-semibold text-foreground/90 hover:bg-muted transition-all hover:scale-105 active:scale-95">
        Get access
      </button>
    </header>
  );
}

/* ---------------- HERO ---------------- */

function Hero() {
  return (
    <section className="flex-1 mx-auto w-full max-w-7xl px-6 py-12 lg:py-24">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-16 lg:gap-24 items-center">
        {/* Left Column: Editorial */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/80 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Now in private beta</span>
          </div>

          <h1 className="font-display text-[clamp(3.5rem,8vw,6.5rem)] text-gradient tracking-tight leading-[0.9] mt-2">
            Your work, <br />
            <span className="italic font-normal">your identity.</span>
          </h1>

          <p className="text-lg lg:text-xl text-muted-foreground/80 max-w-xl leading-relaxed">
            The premium digital hub for gig workers to track earnings, build verifiable trust, and showcase experience with complete privacy.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button className="group relative px-8 py-4 rounded-xl bg-primary text-white font-bold tracking-widest text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">
              <span className="flex items-center gap-2 uppercase">
                Claim your hub <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </span>
            </button>
            <button className="px-8 py-4 rounded-xl glass border-border text-foreground/70 font-bold tracking-widest text-sm transition-all hover:bg-muted hover:text-foreground uppercase">
              Watch the demo
            </button>
          </div>

          <StatsStrip />
        </motion.div>

        {/* Right Column: SignIn Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Card Halo */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-accent/20 to-accent-2/20 blur-3xl opacity-50 -z-10 animate-pulse" />
          <SignInCard />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- STATS ---------------- */

function StatsStrip() {
  const stats = [
    { value: "$2.4B", label: "Earnings tracked" },
    { value: "184k", label: "Verified workers" },
    { value: "99.9%", label: "Platform uptime" },
  ];

  return (
    <div className="grid grid-cols-3 gap-8 pt-12 border-t border-border w-full mt-8">
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col gap-1">
          <span className="text-2xl lg:text-3xl font-display font-medium text-foreground/90 uppercase">{stat.value}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- SIGN IN CARD ---------------- */

function SignInCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser, setOnboardingCompleted } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (email.toLowerCase() === "vraj" || email.toLowerCase() === "vraj@example.com") {
        await seedDemoPersona("U001");
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
        const { data: authData, error: signupError } = await supabase.auth.signUp({ email, password });
        if (signupError) throw signupError;
        if (!authData.user) throw new Error("Signup failed");

        await supabase.from("profiles").insert({
          id: authData.user.id, email: authData.user.email, full_name: fullName, username: username, role: "gig-worker",
        });
        alert("Account created! Please sign in.");
        setIsSignUp(false);
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        if (!data.user) throw new Error("Login failed");

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();

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
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="noise glass-card rounded-[2rem] p-10 lg:p-12 shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-10">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-4xl text-foreground tracking-tight">
            {isSignUp ? "Create profile" : "Welcome back"}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            {isSignUp ? "Start your professional journey" : "Sign in to manage your digital identity"}
          </p>
        </div>
        {!isSignUp && (
          <div className="p-2.5 rounded-full bg-muted border border-border backdrop-blur-sm">
            <Lock className="w-5 h-5 text-muted-foreground/50" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {isSignUp && (
          <div className="grid gap-6">
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Full Name</label>
              <input
                type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                className="w-full px-5 py-4 rounded-xl bg-muted/30 border border-border outline-none focus:border-primary/50 focus:bg-muted transition-all text-foreground text-sm"
                placeholder="John Doe"
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Username</label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                className="w-full px-5 py-4 rounded-xl bg-muted/30 border border-border outline-none focus:border-primary/50 focus:bg-muted transition-all text-foreground text-sm"
                placeholder="johndoe"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Email address</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-5 py-4 rounded-xl bg-muted/30 border border-border outline-none focus:border-primary/50 focus:bg-muted transition-all text-foreground text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Password</label>
            <button type="button" className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:text-accent transition-colors">Forgot?</button>
          </div>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-5 py-4 rounded-xl bg-muted/30 border border-border outline-none focus:border-primary/50 focus:bg-muted transition-all text-foreground text-sm"
          />
        </div>

        <button
          type="submit" disabled={isLoading}
          className="animate-shimmer w-full py-5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold tracking-[0.15em] text-xs uppercase shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] group flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Access Hub"}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-transparent px-4 text-muted-foreground/50 font-bold">or</span></div>
      </div>

      <button className="w-full py-4 rounded-xl border border-border hover:bg-muted transition-all text-xs font-bold uppercase tracking-widest text-foreground/70 flex items-center justify-center gap-3 active:scale-[0.98]">
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <div className="mt-10 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-colors hover:scale-105"
        >
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- FOOTER ---------------- */

function Footer() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border mt-auto">
      <div className="flex items-center gap-2 opacity-50">
        <ShieldCheck className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-widest">GigID © 2024</span>
      </div>
      <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
        <a href="#" className="hover:text-foreground transition-colors">Security</a>
        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
      </div>
    </footer>
  );
}