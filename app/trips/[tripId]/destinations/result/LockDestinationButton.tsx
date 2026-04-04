"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LockDestinationButton({ tripId, destination }: { tripId: string; destination: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function lock() {
    setLoading(true);
    await supabase.from("trips").update({ destination, status: "date_voting" }).eq("id", tripId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={lock}
      disabled={loading}
      className="w-full text-white px-8 py-4 rounded-full font-bold text-base shadow-lg disabled:opacity-50 transition-all active:scale-95"
      style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
    >
      {loading ? "Locking..." : `Lock in ${destination} ✓`}
    </button>
  );
}
