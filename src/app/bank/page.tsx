"use client";

import { useAppStore } from "@/lib/store/app-store";
import { useState } from "react";
import {
  Zap,
  Lock,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BANKS = [
  { id: "hdfc", name: "HDFC Bank", icon: "🏦" },
  { id: "icici", name: "ICICI Bank", icon: "🏛️" },
  { id: "axis", name: "Axis Bank", icon: "🏢" },
  { id: "sbi", name: "State Bank of India", icon: "🏦" },
  { id: "kotak", name: "Kotak Mahindra Bank", icon: "🏛️" },
  { id: "indusind", name: "IndusInd Bank", icon: "🏢" },
  { id: "yes", name: "Yes Bank", icon: "🏦" },
  { id: "idfc", name: "IDFC First Bank", icon: "🏛️" },
  { id: "bob", name: "Bank of Baroda", icon: "🏢" },
  { id: "pnb", name: "Punjab National Bank", icon: "🏦" },
];

export default function BankPage() {
  const { trustScore } = useAppStore();

  const [activeTab, setActiveTab] = useState<"direct" | "private">("direct");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // 🔐 PASSWORD SCREEN
  if (selectedBank && !isAuthenticated) {
    return (
      <div className="page-content flex flex-col gap-8 pb-32 justify-center items-center">

        <h2 className="text-xl font-black text-[var(--text-primary)]">
          Enter Secure Access Code
        </h2>

        <p className="text-sm text-[var(--text-tertiary)] text-center">
          Authenticate to view your financial data
        </p>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full max-w-sm px-4 py-3 rounded-xl bg-[var(--bg-secondary)] outline-none"
        />

        <button
          onClick={() => {
            if (password === "1234") {
              setIsAuthenticated(true);
            } else {
              alert("Incorrect password");
            }
          }}
          className="px-6 py-3 rounded-xl bg-blue-500 text-white font-bold"
        >
          Unlock
        </button>

        <button
          onClick={() => {
            setSelectedBank(null);
            setPassword("");
          }}
          className="text-sm text-gray-400"
        >
          ← Cancel
        </button>
      </div>
    );
  }

  // 📊 TRANSACTION + TRUST SCREEN
  if (selectedBank && isAuthenticated) {
    return (
      <div className="page-content flex flex-col gap-8 pb-32">

        <button
          onClick={() => {
            setSelectedBank(null);
            setIsAuthenticated(false);
            setPassword("");
          }}
          className="text-sm font-bold text-blue-500"
        >
          ← Back
        </button>

        <h2 className="text-xl font-black text-[var(--text-primary)]">
          {selectedBank.toUpperCase()} Activity
        </h2>

        {/* Earnings */}
        <div className="p-6 rounded-2xl bg-[var(--bg-secondary)]">
          <p className="text-sm font-bold text-[var(--text-tertiary)]">
            Total Earnings
          </p>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-2">
            ₹48,500
          </p>
        </div>

        {/* Transactions */}
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((t) => (
            <div
              key={t}
              className="p-4 rounded-xl bg-[var(--bg-elevated)] flex justify-between"
            >
              <span className="text-sm font-bold">Ride Payment</span>
              <span className="text-sm font-bold text-green-500">+₹500</span>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] flex flex-col gap-5">
          <h3 className="text-sm font-black uppercase">
            Trust Indicators
          </h3>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <span>Income Stability</span>
              <span className="text-green-500">Strong</span>
            </div>

            <div className="flex justify-between">
              <span>Work Frequency</span>
              <span className="text-green-500">26 days/month</span>
            </div>

            <div className="flex justify-between">
              <span>Platform Rating</span>
              <span className="text-green-500">4.7 ★</span>
            </div>

            <div className="flex justify-between">
              <span>Earnings Growth</span>
              <span className="text-green-500">+18%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🏦 MAIN SCREEN
  return (
    <div className="page-content flex flex-col gap-10 pb-32">
      
      {/* Header */}
      <div className="text-left px-2">
        <h1 className="text-4xl font-black">GigID Banking</h1>
        <p className="text-base font-bold mt-3">
          Direct approval and private loans based on your work record.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--bg-secondary)] p-2 rounded-[28px]">
        <button
          onClick={() => setActiveTab("direct")}
          className="flex-1 py-4 rounded-[22px] font-black"
        >
          Direct
        </button>

        <button
          onClick={() => setActiveTab("private")}
          className="flex-1 py-4 rounded-[22px] font-black"
        >
          ZK
        </button>
      </div>

      {/* Bank List */}
      <div className="flex flex-col gap-4">
        {BANKS.map((bank) => (
          <div
            key={bank.id}
            onClick={() => setSelectedBank(bank.id)}
            className="p-6 rounded-2xl bg-[var(--bg-elevated)] cursor-pointer hover:scale-[1.02] transition"
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">{bank.icon}</div>
              <span className="font-bold">{bank.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-6 rounded-2xl bg-[var(--bg-secondary)]">
        <ShieldCheck />
        <p className="mt-2 text-sm">
          GigID provides cryptographic verification, not loans.
        </p>
      </div>
    </div>
  );
}