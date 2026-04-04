"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { nanoid } from "nanoid";

export default function NewTripPage() {
  const [name, setName] = useState("");
  const [startWindow, setStartWindow] = useState("");
  const [endWindow, setEndWindow] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const inviteCode = nanoid(8).toUpperCase();

    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .insert({
        name,
        organiser_id: user.id,
        rough_window_start: startWindow ? startWindow + "-01" : null,
        rough_window_end: endWindow ? endWindow + "-01" : null,
        invite_code: inviteCode,
        status: "formation",
      })
      .select()
      .single();

    if (tripError || !trip) {
      console.error("Trip creation error:", tripError);
      setError(tripError?.message ?? "Failed to create trip. Please try again.");
      setLoading(false);
      return;
    }

    await supabase.from("trip_members").insert({
      trip_id: trip.id,
      user_id: user.id,
      role: "organiser",
      commitment_status: "in",
    });

    router.push(`/trips/${trip.id}`);
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref="/trips" title="New Trip" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        <div className="mb-10">
          <h1 className="font-headline text-4xl italic text-primary mb-2">Let&apos;s go.</h1>
          <p className="text-on-surface-variant">Name your trip and share the invite. The rest happens here.</p>
        </div>
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
              Trip Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Goa Summer '25"
              className="w-full bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-colors text-lg rounded-t-lg"
              style={{ borderBottom: "2px solid rgba(193,199,211,0.3)" }}
              onFocus={e => (e.target.style.borderBottomColor = "#005da7")}
              onBlur={e => (e.target.style.borderBottomColor = "rgba(193,199,211,0.3)")}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
              Rough Window (optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-on-surface-variant mb-1">From</p>
                <input
                  type="month"
                  value={startWindow}
                  onChange={e => setStartWindow(e.target.value)}
                  className="w-full bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-colors rounded-t-lg"
                  style={{ borderBottom: "2px solid rgba(193,199,211,0.3)" }}
                />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">To</p>
                <input
                  type="month"
                  value={endWindow}
                  onChange={e => setEndWindow(e.target.value)}
                  className="w-full bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-colors rounded-t-lg"
                  style={{ borderBottom: "2px solid rgba(193,199,211,0.3)" }}
                />
              </div>
            </div>
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full text-white py-4 rounded-full font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 mt-6"
            style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
          >
            {loading ? "Creating..." : "Create Trip & Get Invite Link"}
          </button>
        </form>
      </main>
    </div>
  );
}
