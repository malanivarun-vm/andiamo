"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ConfirmDatesButton({ tripId, dateOption }: { tripId: string; dateOption: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function confirm() {
    setLoading(true);
    await supabase.from("trips").update({
      confirmed_start: dateOption.start_date,
      confirmed_end: dateOption.end_date,
      status: "confirmed",
    }).eq("id", tripId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={confirm}
      disabled={loading}
      className="w-full text-white py-4 rounded-full font-bold shadow-lg disabled:opacity-50 transition-all active:scale-95"
      style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
    >
      {loading ? "Confirming..." : `Confirm ${dateOption.label} ✓`}
    </button>
  );
}
