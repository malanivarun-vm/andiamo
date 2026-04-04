"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopAppBar } from "@/components/layout/TopAppBar";

interface DestOption { name: string; description: string; }

export default function ProposeDestinationsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [options, setOptions] = useState<DestOption[]>([{ name: "", description: "" }, { name: "", description: "" }]);
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function updateOption(index: number, field: keyof DestOption, value: string) {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, [field]: value } : opt));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filled = options.filter(o => o.name.trim());
    if (filled.length < 2) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("destination_options").insert(
      filled.map(o => ({
        trip_id: tripId,
        name: o.name,
        description: o.description || null,
        proposed_by: user!.id,
      }))
    );

    const deadlineTs = deadline
      ? new Date(deadline).toISOString()
      : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    await supabase
      .from("trips")
      .update({ status: "destination_voting", destination_poll_deadline: deadlineTs })
      .eq("id", tripId);

    setLoading(false);
    router.push(`/trips/${tripId}/destinations/vote`);
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref={`/trips/${tripId}`} title="Propose Destinations" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-4xl italic text-primary mb-2">Where to?</h1>
          <p className="text-on-surface-variant">Add 2–3 options informed by your group&apos;s vibe and budget range.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {options.map((opt, index) => (
            <div key={index} className="bg-surface-container-low rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                Option {index + 1}
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Destination name (e.g. Goa)"
                  value={opt.name}
                  onChange={e => updateOption(index, "name", e.target.value)}
                  className="w-full bg-surface rounded-t-md px-3 py-2 text-on-surface outline-none transition-colors"
                  style={{ borderBottom: "2px solid rgba(193,199,211,0.3)" }}
                  required={index < 2}
                />
                <input
                  type="text"
                  placeholder="Short description (optional)"
                  value={opt.description}
                  onChange={e => updateOption(index, "description", e.target.value)}
                  className="w-full bg-surface rounded-t-md px-3 py-2 text-on-surface outline-none transition-colors"
                  style={{ borderBottom: "2px solid rgba(193,199,211,0.3)" }}
                />
              </div>
            </div>
          ))}

          {options.length < 3 && (
            <button
              type="button"
              onClick={() => setOptions(p => [...p, { name: "", description: "" }])}
              className="w-full py-3 rounded-2xl text-on-surface-variant font-semibold flex items-center justify-center gap-2 hover:text-primary transition-colors border-2 border-dashed border-outline-variant"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
              Add 3rd option
            </button>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
              Voting Deadline
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full bg-surface-container-low rounded-t-lg px-4 py-3 text-on-surface outline-none transition-colors"
              style={{ borderBottom: "2px solid rgba(193,199,211,0.3)" }}
            />
            <p className="text-xs text-on-surface-variant mt-1">Default: 48 hours from now</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-4 rounded-full font-bold text-base shadow-lg disabled:opacity-50 transition-all active:scale-95"
            style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
          >
            {loading ? "Opening Poll..." : "Open Destination Vote →"}
          </button>
        </form>
      </main>
    </div>
  );
}
