"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopAppBar } from "@/components/layout/TopAppBar";

interface DateOption { startDate: string; endDate: string; label: string; }

export default function ProposeDatesPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [options, setOptions] = useState<DateOption[]>([
    { startDate: "", endDate: "", label: "" },
    { startDate: "", endDate: "", label: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function updateOption(i: number, field: keyof DateOption, value: string) {
    setOptions(prev => prev.map((opt, idx) => idx === i ? { ...opt, [field]: value } : opt));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filled = options.filter(o => o.startDate && o.endDate);
    if (filled.length < 2) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("date_options").insert(
      filled.map(o => ({
        trip_id: tripId,
        start_date: o.startDate,
        end_date: o.endDate,
        label: o.label || `${o.startDate} – ${o.endDate}`,
        proposed_by: user!.id,
      }))
    );

    await supabase.from("trips").update({
      status: "date_voting",
      date_poll_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    }).eq("id", tripId);

    setLoading(false);
    router.push(`/trips/${tripId}/dates/vote`);
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref={`/trips/${tripId}`} title="Propose Dates" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-4xl italic text-primary mb-2">When are we going?</h1>
          <p className="text-on-surface-variant">Add 2–3 date options within your rough window.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {options.map((opt, i) => (
            <div key={i} className="bg-surface-container-low rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Option {i + 1}</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">From</label>
                  <input
                    type="date"
                    value={opt.startDate}
                    onChange={e => updateOption(i, "startDate", e.target.value)}
                    required={i < 2}
                    className="w-full bg-surface rounded-t-md px-3 py-2 text-on-surface outline-none transition-colors"
                    style={{ borderBottom: "2px solid rgba(193,199,211,0.3)" }}
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant mb-1 block">To</label>
                  <input
                    type="date"
                    value={opt.endDate}
                    onChange={e => updateOption(i, "endDate", e.target.value)}
                    required={i < 2}
                    className="w-full bg-surface rounded-t-md px-3 py-2 text-on-surface outline-none transition-colors"
                    style={{ borderBottom: "2px solid rgba(193,199,211,0.3)" }}
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Label (e.g. Long weekend)"
                value={opt.label}
                onChange={e => updateOption(i, "label", e.target.value)}
                className="w-full bg-surface rounded-t-md px-3 py-2 text-on-surface outline-none transition-colors"
                style={{ borderBottom: "2px solid rgba(193,199,211,0.3)" }}
              />
            </div>
          ))}

          {options.length < 3 && (
            <button
              type="button"
              onClick={() => setOptions(p => [...p, { startDate: "", endDate: "", label: "" }])}
              className="w-full py-3 rounded-2xl text-on-surface-variant font-semibold flex items-center justify-center gap-2 hover:text-primary transition-colors border-2 border-dashed border-outline-variant"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
              Add 3rd option
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-4 rounded-full font-bold shadow-lg disabled:opacity-50 transition-all active:scale-95"
            style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
          >
            {loading ? "Opening Poll..." : "Open Date Vote →"}
          </button>
        </form>
      </main>
    </div>
  );
}
