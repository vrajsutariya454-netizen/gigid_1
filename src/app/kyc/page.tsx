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
    <div className="page-content !pb-0 min-h-screen bg-[var(--bg-primary)]">
      <KYCProcess />
    </div>
  );
}
