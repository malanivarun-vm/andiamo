"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopAppBar } from "@/components/layout/TopAppBar";

const ACTIVITIES = [
  { id: "beach", icon: "beach_access", label: "Beach" },
  { id: "mountains", icon: "landscape", label: "Mountains" },
  { id: "food_wine", icon: "wine_bar", label: "Food & Wine" },
  { id: "adventure", icon: "kayaking", label: "Adventure" },
  { id: "culture", icon: "museum", label: "Culture" },
  { id: "nightlife", icon: "nightlife", label: "Nightlife" },
  { id: "relaxation", icon: "spa", label: "Relaxation" },
  { id: "shopping", icon: "shopping_bag", label: "Shopping" },
];

export default function ActivitiesPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [ranked, setRanked] = useState<string[]>([]);
  const [groupOverlap, setGroupOverlap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: myPref }, { data: allPrefs }] = await Promise.all([
        supabase.from("activity_preferences").select("rankings").eq("trip_id", tripId).eq("user_id", user?.id ?? "").single(),
        supabase.from("activity_preferences").select("rankings").eq("trip_id", tripId),
      ]);

      if (myPref?.rankings?.length) setRanked(myPref.rankings);

      const scores: Record<string, number> = {};
      allPrefs?.forEach(pref => {
        (pref.rankings ?? []).forEach((activity: string, index: number) => {
          scores[activity] = (scores[activity] ?? 0) + (ACTIVITIES.length - index);
        });
      });
      setGroupOverlap(scores);
    }
    load();
  }, [tripId]);

  function toggleRank(id: string) {
    setRanked(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setRanked(prev => { const next = [...prev]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; });
  }

  function moveDown(index: number) {
    setRanked(prev => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  async function handleSubmit() {
    if (ranked.length === 0) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("activity_preferences").upsert({
      trip_id: tripId,
      user_id: user!.id,
      rankings: ranked,
    }, { onConflict: "trip_id,user_id" });
    setLoading(false);
    router.push(`/trips/${tripId}`);
  }

  const maxScore = Math.max(...Object.values(groupOverlap), 1);
  const unranked = ACTIVITIES.filter(a => !ranked.includes(a.id));

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref={`/trips/${tripId}`} title="Activity Preferences" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-4xl italic text-primary mb-2">What do you want to do?</h1>
          <p className="text-on-surface-variant">Tap to add to your list, then use arrows to rank (most excited → least).</p>
        </div>

        {/* Selection chips */}
        {unranked.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Add activities</p>
            <div className="flex flex-wrap gap-2">
              {unranked.map(activity => (
                <button
                  key={activity.id}
                  onClick={() => toggleRank(activity.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-semibold text-sm"
                >
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: "16px" }}>{activity.icon}</span>
                  {activity.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ranked list */}
        {ranked.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Your Ranking</p>
            <div className="space-y-2">
              {ranked.map((id, index) => {
                const activity = ACTIVITIES.find(a => a.id === id)!;
                const score = groupOverlap[id] ?? 0;
                return (
                  <div key={id} className="flex items-center gap-3 bg-surface-container-low rounded-2xl p-4">
                    <span className="w-6 text-center font-bold text-primary text-sm">{index + 1}</span>
                    <span className="material-symbols-outlined text-primary">{activity.icon}</span>
                    <span className="flex-1 font-semibold text-on-surface">{activity.label}</span>
                    {score > 0 && (
                      <div className="flex items-center gap-1 mr-2">
                        <div className="w-12 h-1.5 rounded-full" style={{ background: "rgba(193,199,211,0.2)" }}>
                          <div className="h-full rounded-full" style={{ width: `${(score / maxScore) * 100}%`, background: "#854f10" }} />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveUp(index)} className="text-outline hover:text-primary transition-colors p-0.5">
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>expand_less</span>
                      </button>
                      <button onClick={() => moveDown(index)} className="text-outline hover:text-primary transition-colors p-0.5">
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>expand_more</span>
                      </button>
                    </div>
                    <button onClick={() => toggleRank(id)} className="text-outline hover:text-error transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || ranked.length === 0}
          className="w-full text-white py-4 rounded-full font-bold shadow-lg disabled:opacity-50 transition-all active:scale-95"
          style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
        >
          {loading ? "Saving..." : "Save Preferences →"}
        </button>
      </main>
    </div>
  );
}
