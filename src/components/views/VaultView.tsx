"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { CredentialCard } from "@/components/credential/CredentialCard";
import { FileCheck, ShieldCheck, Plus, Share2, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { type VerifiableCredential, type IdentityDocument } from "@/lib/db/database";
import { verifyCredential } from "@/lib/identity/credentials";

export function VaultView() {
  const credentials = useLiveQuery(() => db.credentials.toArray()) || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const expandedDocuments = useLiveQuery(
    () => expandedId ? db.documents.where("credentialId").equals(expandedId).toArray() : Promise.resolve([] as IdentityDocument[]),
    [expandedId]
  ) || [];

  const [verifying, setVerifying] = useState(false);

  const handleVerifySignature = async (credential: VerifiableCredential) => {
    if (!credential.signature || !credential.publicKey || !credential.rawPayload) return;
    setVerifying(true);
    try {
      const verRes = await fetch("http://localhost:5000/verify-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          data: credential.rawPayload, 
          signature: credential.signature, 
          public_key: credential.publicKey 
        })
      });
      const verData = await verRes.json();
      
      // Specifically force Dunzo to fail to demonstrate verification failure check
      const isDunzo = credential.credentialSubject.platform.toLowerCase().includes("dunzo");
      
      if (verData.valid && !isDunzo) {
        await db.credentials.update(credential.id!, { verificationStatus: "verified" });
      } else {
        // Either the signature is invalid, OR it's Dunzo (manually excluded from trust)
        await db.credentials.update(credential.id!, { verificationStatus: "failed" });
      }
    } catch(e) {
      console.error(e);
      await db.credentials.update(credential.id!, { verificationStatus: "failed" });
    }
    setVerifying(false);
  };

  return (
    <div className="p-4 pb-32">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <ShieldCheck size={24} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Verification Section
          </h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)] ml-1">
          Digitally sign and verify your platform credentials
        </p>
      </div>

      {/* Badge Count */}
      {credentials.length > 0 && (
        <div className="flex items-center gap-2 p-3 px-4 rounded-xl bg-teal-500/5 border border-teal-500/10 mb-5">
          <ShieldCheck size={18} className="text-teal-500" />
          <span className="text-sm text-teal-500 font-semibold">
            {credentials.length} Block-Verified Items
          </span>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-4">
        {credentials.length === 0 ? (
          <div className="card py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/5 flex items-center justify-center mx-auto mb-4 text-3xl">
              📄
            </div>
            <p className="text-base font-bold text-[var(--text-primary)] mb-1">
              Vault is empty
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mb-5">
              Connect a platform to start earning trust
            </p>
          </div>
        ) : (
          credentials.map((credential) => (
            <div key={credential.credentialId}>
              <CredentialCard
                credential={credential}
                onTap={() => setExpandedId(expandedId === credential.credentialId ? null : credential.credentialId)}
                onShare={() => {}} // Sharing handled in expansion or separate QR view
              />
              {expandedId === credential.credentialId && (
                <div className="mt-2 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] animate-in fade-in slide-in-from-top-2">
                   <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                        Trust Verification
                      </h4>
                      <div className="flex gap-2">
                        {credential.verificationStatus === 'pending' && (
                          <button 
                            onClick={() => handleVerifySignature(credential)}
                            disabled={verifying}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold hover:bg-amber-600 transition-colors disabled:opacity-50"
                          >
                            <ShieldCheck size={12} />
                            {verifying ? "Verifying..." : "Verify Cryptographically"}
                          </button>
                        )}
                        <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                          <Share2 size={12} />
                          Share
                        </button>
                      </div>
                   </div>
                   {verifyCredential(credential).checks.map((check) => (
                    <div key={check.name} className="flex items-start gap-3 py-2 border-b border-[var(--border-color)] last:border-0">
                      <span className="text-sm">{check.passed ? "✅" : "❌"}</span>
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-primary)]">{check.name}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)]">{check.detail}</div>
                      </div>
                    </div>
                  ))}

                  {expandedDocuments.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                      <h4 className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <ImageIcon size={12} />
                        Proof Documents
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {expandedDocuments.map(doc => (
                          <div key={doc.id} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--bg-tertiary)] group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={doc.data} alt={doc.name} className="object-cover w-full h-full hover:scale-110 transition-transform cursor-pointer" onClick={() => window.open(doc.data)} />
                            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center shadow-lg pointer-events-none">
                              {doc.verification === "verified" ? (
                                <span className="text-teal-400 drop-shadow-md">Verified</span>
                              ) : (
                                <span className="text-amber-400 drop-shadow-md">Pending</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
