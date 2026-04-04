"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopAppBar } from "@/components/layout/TopAppBar";

const AVAIL_OPTIONS = [
  { value: "preferred", label: "Preferred", icon: "star", color: "text-tertiary" },
  { value: "available", label: "Available", icon: "check_circle", color: "text-primary" },
  { value: "unavailable", label: "Can't make it", icon: "cancel", color: "text-error" },
];

export default function DateVotePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [dateOptions, setDateOptions] = useState<any[]>([]);
  const [myAvailability, setMyAvailability] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      const [{ data: opts }, { data: myAvail }] = await Promise.all([
        supabase.from("date_options").select("*").eq("trip_id", tripId),
        supabase.from("date_availability").select("*").eq("trip_id", tripId).eq("user_id", user?.id ?? ""),
      ]);

      setDateOptions(opts ?? []);

      const myMap: Record<string, string> = {};
      myAvail?.forEach(a => { myMap[a.date_option_id] = a.availability; });
      setMyAvailability(myMap);
    }
    load();
  }, [tripId]);

  async function handleSubmit() {
    if (!userId || Object.keys(myAvailability).length === 0) return;
    setLoading(true);

    for (const [dateOptionId, availability] of Object.entries(myAvailability)) {
      await supabase.from("date_availability").upsert({
        trip_id: tripId,
        date_option_id: dateOptionId,
        user_id: userId,
        availability,
      }, { onConflict: "trip_id,date_option_id,user_id" });
    }

    setLoading(false);
    router.push(`/trips/${tripId}/dates/result`);
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref={`/trips/${tripId}`} title="Vote — Dates" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-4xl italic text-primary mb-2">When works for you?</h1>
          <p className="text-on-surface-variant">Mark your availability for each option.</p>
        </div>

        <div className="space-y-6 mb-10">
          {dateOptions.map(opt => {
            const start = new Date(opt.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            const end = new Date(opt.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            return (
              <div key={opt.id} className="bg-surface-container-low rounded-2xl p-5">
                <div className="mb-4">
                  <p className="font-headline text-xl italic text-on-surface">{opt.label || `${start} – ${end}`}</p>
                  <p className="text-sm text-on-surface-variant">{start} – {end}</p>
                </div>
                <div className="flex gap-2">
                  {AVAIL_OPTIONS.map(avail => {
                    const isSelected = myAvailability[opt.id] === avail.value;
                    return (
                      <button
                        key={avail.value}
                        onClick={() => setMyAvailability(prev => ({ ...prev, [opt.id]: avail.value }))}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                          isSelected ? "ring-2 ring-primary" : "bg-surface hover:bg-surface-container"
                        }`}
                        style={isSelected ? { background: "rgba(0,93,167,0.08)" } : undefined}
                      >
                        <span
                          className={`material-symbols-outlined ${isSelected ? avail.color : "text-outline"}`}
                          style={{
                            fontSize: "22px",
                            fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          {avail.icon}
                        </span>
                        <span className="text-xs font-semibold text-on-surface-variant">{avail.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || Object.keys(myAvailability).length === 0}
          className="w-full text-white py-4 rounded-full font-bold shadow-lg disabled:opacity-50 transition-all active:scale-95"
          style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
        >
          {loading ? "Saving..." : "Submit Availability →"}
        </button>
      </main>
    </div>
  );
}
