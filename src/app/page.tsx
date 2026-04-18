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
    }
  };

  return (
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