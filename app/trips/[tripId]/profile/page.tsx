"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopAppBar } from "@/components/layout/TopAppBar";

const AXES = [
  {
    id: "pace",
    label: "Travel Pace",
    icon: "speed",
    options: [
      { value: "relaxed", label: "Relaxed", desc: "Slow it down, soak it in" },
      { value: "moderate", label: "Moderate", desc: "A mix of both" },
      { value: "packed", label: "Packed", desc: "See everything, miss nothing" },
    ],
  },
  {
    id: "accommodation",
    label: "Stay Preference",
    icon: "hotel",
    options: [
      { value: "budget", label: "Budget", desc: "Hostels, Zostels, OYO" },
      { value: "mid", label: "Mid-Range", desc: "Comfortable hotels, Airbnb" },
      { value: "luxury", label: "Luxury", desc: "5-star, villa, resort" },
    ],
  },
  {
    id: "activity_type",
    label: "Activity Style",
    icon: "hiking",
    options: [
      { value: "outdoors", label: "Outdoors", desc: "Treks, beaches, nature" },
      { value: "culture", label: "Culture", desc: "Museums, heritage, local life" },
      { value: "food", label: "Food-first", desc: "Restaurants, markets, street food" },
      { value: "nightlife", label: "Nightlife", desc: "Bars, clubs, late nights" },
      { value: "mixed", label: "Mixed", desc: "A bit of everything" },
    ],
  },
  {
    id: "dietary",
    label: "Dietary",
    icon: "restaurant_menu",
    options: [
      { value: "no_restriction", label: "No restriction" },
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "halal", label: "Halal" },
      { value: "other", label: "Other" },
    ],
  },
];

export default function ProfilePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function select(axisId: string, value: string) {
    setSelections(prev => ({ ...prev, [axisId]: value }));
  }

  async function handleSubmit() {
    if (!AXES.every(axis => selections[axis.id])) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("member_profiles").upsert({
      trip_id: tripId,
      user_id: user!.id,
      pace: selections.pace,
      accommodation: selections.accommodation,
      activity_type: selections.activity_type,
      dietary: selections.dietary,
    }, { onConflict: "trip_id,user_id" });
    setLoading(false);
    router.push(`/trips/${tripId}/budget`);
  }

  const complete = AXES.every(axis => selections[axis.id]);

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref={`/trips/${tripId}/vibe`} title="Your Travel Style" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-4xl italic text-primary mb-2">How do you travel?</h1>
          <p className="text-on-surface-variant">Helps flag style mismatches before the trip.</p>
        </div>

        <div className="space-y-8">
          {AXES.map(axis => (
            <div key={axis.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "16px" }}>{axis.icon}</span>
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {axis.label}
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {axis.options.map(opt => {
                  const isSelected = selections[axis.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => select(axis.id, opt.value)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        isSelected
                          ? "text-white"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                      style={isSelected ? { background: "#005da7" } : undefined}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !complete}
          className="w-full text-white py-4 rounded-full font-bold text-base shadow-lg disabled:opacity-50 transition-all active:scale-95 mt-10"
          style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
        >
          {loading ? "Saving..." : "Continue to Budget →"}
        </button>
      </main>
    </div>
  );
}
