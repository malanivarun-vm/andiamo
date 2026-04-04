"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopAppBar } from "@/components/layout/TopAppBar";

const BUDGET_PRESETS = [
  { label: "Under ₹15k", value: 15000 },
  { label: "₹15k–₹25k", value: 25000 },
  { label: "₹25k–₹40k", value: 40000 },
  { label: "₹40k–₹60k", value: 60000 },
  { label: "₹60k+", value: 80000 },
];

export default function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [budget, setBudget] = useState<number | null>(null);
  const [customBudget, setCustomBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit() {
    const finalBudget = budget ?? parseInt(customBudget);
    if (!finalBudget) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("member_budgets").upsert({
      trip_id: tripId,
      user_id: user!.id,
      max_budget: finalBudget,
    }, { onConflict: "trip_id,user_id" });
    setLoading(false);
    router.push(`/trips/${tripId}`);
  }

  const hasValue = !!(budget || customBudget);

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref={`/trips/${tripId}/profile`} title="Your Budget" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-4xl italic text-primary mb-2">What&apos;s your max?</h1>
          <p className="text-on-surface-variant">Per person, all-in. This is private.</p>
        </div>

        <div className="bg-secondary-container/40 rounded-2xl p-4 flex items-start gap-3 mb-8">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "18px", marginTop: "2px" }}>lock</span>
          <p className="text-sm text-on-surface">
            Your exact amount is never shared. Only the spread (e.g. &ldquo;3 under ₹25k, 2 up to ₹40k&rdquo;) is shown to the organiser.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {BUDGET_PRESETS.map(preset => (
            <button
              key={preset.value}
              onClick={() => { setBudget(preset.value); setCustomBudget(""); }}
              className={`py-4 px-3 rounded-2xl font-semibold text-sm transition-all ${
                budget === preset.value
                  ? "text-white ring-2 ring-primary"
                  : "bg-surface-container-low text-on-surface hover:bg-surface-container"
              }`}
              style={budget === preset.value ? { background: "#005da7" } : undefined}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mb-8">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
            Or enter exact amount (₹)
          </label>
          <input
            type="number"
            value={customBudget}
            onChange={e => { setCustomBudget(e.target.value); setBudget(null); }}
            placeholder="e.g. 35000"
            className="w-full bg-surface-container-low rounded-t-lg px-4 py-3 text-on-surface outline-none transition-colors"
            style={{ borderBottom: "2px solid rgba(193,199,211,0.3)" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !hasValue}
          className="w-full text-white py-4 rounded-full font-bold text-base shadow-lg disabled:opacity-50 transition-all active:scale-95"
          style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
        >
          {loading ? "Saving..." : "Done — View Trip →"}
        </button>
      </main>
    </div>
  );
}
