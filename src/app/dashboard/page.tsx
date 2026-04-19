"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserProfile } from "@/lib/auth/profile";
import { 
  User, Mail, ShieldCheck, LogOut, 
  LayoutDashboard, Loader2, AlertCircle 
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await getCurrentUserProfile();
        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        console.error("Dashboard load error:", err);
        setError("Please sign in to view your dashboard");
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="mt-4 text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
          Loading Profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2">Access Denied</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{error}</p>
          <button 
            onClick={() => router.replace("/")}
            className="px-8 py-3 rounded-xl bg-white text-black font-bold uppercase text-xs tracking-widest"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] font-bold mt-1">
            Welcome back, {profile?.username || 'User'}
          </p>
        </div>
        <button 
          onClick={handleSignOut}
          className="p-3 rounded-2xl bg-muted border border-border text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 bg-gradient-to-br from-primary/5 to-accent/5"
        >
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-500/30">
              {profile?.full_name?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">{profile?.full_name}</h2>
              <p className="text-sm text-[var(--text-tertiary)] font-bold">@{profile?.username}</p>
              <div className="mt-2 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 w-fit">
                <ShieldCheck size={14} className="text-blue-400" />
                <span className="text-[10px] uppercase font-black text-blue-400 tracking-widest">
                  {profile?.role || 'User'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
              <Mail className="text-muted-foreground" size={18} />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</span>
                <span className="text-sm font-bold text-foreground">{profile?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
              <LayoutDashboard className="text-muted-foreground" size={18} />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account Status</span>
                <span className="text-sm font-bold text-emerald-500">Verified Secure</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => router.push('/profile')}
            className="p-6 rounded-3xl bg-muted border border-border text-center group active:scale-95 transition-all"
          >
            <User className="mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Edit Profile</span>
          </button>
          <button 
            onClick={() => router.push('/home')}
            className="p-6 rounded-3xl bg-muted border border-border text-center group active:scale-95 transition-all"
          >
            <ShieldCheck className="mx-auto mb-3 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Identity Score</span>
          </button>
        </div>
      </div>
    </div>
  );
}
