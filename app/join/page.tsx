"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopAppBar } from "@/components/layout/TopAppBar";

export default function JoinByCodePage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length >= 6) router.push(`/join/${trimmed}`);
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref="/trips" title="Join a Trip" />
      <main className="pt-24 px-6 max-w-sm mx-auto">
        <div className="mb-8 mt-4">
          <h1 className="font-headline text-4xl italic text-primary mb-2">Got a code?</h1>
          <p className="text-on-surface-variant">Enter the 8-character invite code from your organiser.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. A1B2C3D4"
            maxLength={8}
            className="w-full bg-surface-container-low rounded-t-lg px-4 py-4 text-on-surface outline-none transition-colors text-2xl font-mono tracking-widest text-center uppercase"
            style={{ borderBottom: "2px solid rgba(193,199,211,0.3)" }}
            onFocus={e => (e.target.style.borderBottomColor = "#005da7")}
            onBlur={e => (e.target.style.borderBottomColor = "rgba(193,199,211,0.3)")}
          />
          <button
            type="submit"
            disabled={code.trim().length < 6}
            className="w-full text-white py-4 rounded-full font-bold text-base shadow-lg disabled:opacity-50 transition-all active:scale-95"
            style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
          >
            Find Trip →
          </button>
        </form>
      </main>
    </div>
  );
}
