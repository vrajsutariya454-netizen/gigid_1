"use client";

import { KYCProcess } from "@/components/kyc/KYCProcess";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function KYCPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/");
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) return null;

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] animate-float opacity-30" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[130px] animate-float [animation-delay:3s] opacity-20" />
      </div>

      <div className="relative z-10 page-content !pb-0 min-h-screen">
        <KYCProcess />
      </div>
    </main>
  );
}
