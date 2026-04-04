"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopAppBar } from "@/components/layout/TopAppBar";

const VIBES = [
  { id: "unwind", icon: "self_improvement", label: "Unwind", desc: "Beaches, spas, slow mornings" },
  { id: "explore", icon: "hiking", label: "Explore", desc: "New places, local culture" },
  { id: "eat_well", icon: "restaurant", label: "Eat Well", desc: "Food trails, hidden gems" },
  { id: "party", icon: "nightlife", label: "Party", desc: "Nights out, music, energy" },
  { id: "adventure", icon: "kayaking", label: "Adventure", desc: "Treks, water sports, adrenaline" },
];

export default function VibeCheckPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [selected, setSelected] = useState<string[]>([]);
  const [tally, setTally] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function loadTally() {
    const { data } = await supabase
      .from("member_profiles")
      .select("vibe_selections")
      .eq("trip_id", tripId);
    const counts: Record<string, number> = {};
    data?.forEach(row => {
      (row.vibe_selections ?? []).forEach((v: string) => {
        counts[v] = (counts[v] ?? 0) + 1;
      });
    });
    setTally(counts);
  }

  useEffect(() => {
    loadTally();

    const channel = supabase
      .channel(`vibe-${tripId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "member_profiles",
        filter: `trip_id=eq.${tripId}`,
      }, loadTally)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tripId]);

  function toggleVibe(id: string) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(v => v !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  async function handleSubmit() {
    if (selected.length === 0) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("member_profiles").upsert({
      trip_id: tripId,
      user_id: user!.id,
      vibe_selections: selected,
    }, { onConflict: "trip_id,user_id" });
    setLoading(false);
    router.push(`/trips/${tripId}/profile`);
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref={`/trips/${tripId}/commitment`} title="Vibe Check" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-4xl italic text-primary mb-2">What&apos;s the vibe?</h1>
          <p className="text-on-surface-variant">Pick up to 2. The group sees the tally — not who voted what.</p>
        </div>

        <div className="space-y-3 mb-10">
          {VIBES.map(vibe => {
            const isSelected = selected.includes(vibe.id);
            const count = tally[vibe.id] ?? 0;
            return (
              <button
                key={vibe.id}
                onClick={() => toggleVibe(vibe.id)}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  isSelected ? "ring-2 ring-primary" : "bg-surface-container-low hover:bg-surface-container"
                }`}
                style={isSelected ? { background: "rgba(0,93,167,0.08)" } : undefined}
              >
                <span
                  className={`material-symbols-outlined text-3xl ${isSelected ? "text-primary" : "text-outline"}`}
                >
                  {vibe.icon}
                </span>
                <div className="flex-1">
                  <p className={`font-semibold ${isSelected ? "text-primary" : "text-on-surface"}`}>{vibe.label}</p>
                  <p className="text-sm text-on-surface-variant">{vibe.desc}</p>
                </div>
                {count > 0 && (
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: "rgba(0,93,167,0.1)", color: "#005da7" }}
                  >
                    {count} {count === 1 ? "vote" : "votes"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-on-surface-variant text-center mb-6">
          {selected.length === 0 ? "Select at least 1 vibe" : `${selected.length}/2 selected`}
        </p>

        <button
          onClick={handleSubmit}
          disabled={loading || selected.length === 0}
          className="w-full text-white py-4 rounded-full font-bold text-base shadow-lg disabled:opacity-50 transition-all active:scale-95"
          style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
        >
          {loading ? "Saving..." : "Lock In Vibe →"}
        </button>
      </main>
    </div>
  );
}
