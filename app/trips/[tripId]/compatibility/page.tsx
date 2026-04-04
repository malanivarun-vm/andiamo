import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { computeCompatibility } from "@/lib/compatibility";

interface Props { params: Promise<{ tripId: string }> }

const VALUE_LABELS: Record<string, string> = {
  relaxed: "Relaxed", moderate: "Moderate", packed: "Packed",
  budget: "Budget", mid: "Mid-Range", luxury: "Luxury",
  outdoors: "Outdoors", culture: "Culture", food: "Food-First", nightlife: "Nightlife", mixed: "Mixed",
  no_restriction: "No Restriction", vegetarian: "Vegetarian", vegan: "Vegan", halal: "Halal", other: "Other",
};

const VIBE_LABELS: Record<string, string> = {
  unwind: "Unwind", explore: "Explore", eat_well: "Eat Well", party: "Party", adventure: "Adventure",
};

export default async function CompatibilityPage({ params }: Props) {
  const { tripId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: membership }, { data: profiles }] = await Promise.all([
    supabase.from("trip_members").select("role").eq("trip_id", tripId).eq("user_id", user.id).single(),
    supabase.from("member_profiles").select("user_id, pace, accommodation, activity_type, dietary, vibe_selections").eq("trip_id", tripId),
  ]);

  if (membership?.role !== "organiser") redirect(`/trips/${tripId}/member`);

  const result = computeCompatibility(profiles ?? []);

  // Vibe tally
  const vibeCount: Record<string, number> = {};
  (profiles ?? []).forEach((p: any) => {
    (p.vibe_selections ?? []).forEach((v: string) => { vibeCount[v] = (vibeCount[v] ?? 0) + 1; });
  });
  const topVibes = Object.entries(vibeCount).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref={`/trips/${tripId}`} title="Style Compatibility" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        {/* Overall Score */}
        <section className="mb-8 text-center">
          <div className="relative rounded-3xl p-8 overflow-hidden" style={{ background: "linear-gradient(135deg, #005da7, #2976c7)" }}>
            <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Compatibility Score</p>
              <p className="font-headline text-8xl text-white font-light">
                {result.overallScore}<span className="text-3xl">%</span>
              </p>
              <p className="text-sm mt-3 max-w-xs mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>{result.summary}</p>
            </div>
          </div>
        </section>

        {/* Mismatches Alert */}
        {result.mismatches.length > 0 && (
          <div className="rounded-2xl p-4 mb-6 flex items-start gap-3" style={{ background: "rgba(186,26,26,0.08)" }}>
            <span className="material-symbols-outlined text-error" style={{ fontSize: "20px", marginTop: "2px" }}>warning</span>
            <div>
              <p className="font-semibold text-error text-sm">Mismatches to discuss</p>
              <p className="text-sm text-on-surface mt-1">{result.mismatches.join(" · ")}</p>
            </div>
          </div>
        )}

        {/* Axis Breakdown */}
        <section className="space-y-4 mb-8">
          {result.axes.map(axis => (
            <div
              key={axis.axis}
              className={`bg-surface-container-low rounded-2xl p-5 ${axis.hasMismatch ? "ring-1 ring-error/30" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined ${axis.hasMismatch ? "text-error" : "text-primary"}`} style={{ fontSize: "20px" }}>{axis.icon}</span>
                  <span className="font-semibold text-on-surface">{axis.label}</span>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: axis.score >= 70 ? "#005da7" : axis.score >= 50 ? "#854f10" : "#ba1a1a" }}
                >
                  {axis.score}%
                </span>
              </div>
              <div className="h-2 rounded-full mb-3" style={{ background: "rgba(193,199,211,0.2)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${axis.score}%`,
                    background: axis.score >= 70 ? "linear-gradient(to right, #005da7, #2976c7)" : axis.score >= 50 ? "#854f10" : "#ba1a1a",
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(axis.breakdown).map(([value, count]) => (
                  <span
                    key={value}
                    className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={value === axis.dominant ? { background: "#005da7", color: "#fff" } : { background: "rgba(193,199,211,0.25)", color: "#414751" }}
                  >
                    {VALUE_LABELS[value] ?? value}: {count}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Vibe Tally */}
        {topVibes.length > 0 && (
          <section className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Group Vibe</p>
            <div className="space-y-2">
              {topVibes.map(([vibe, count]) => {
                const maxCount = topVibes[0][1];
                return (
                  <div key={vibe} className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-on-surface w-24">{VIBE_LABELS[vibe] ?? vibe}</span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(193,199,211,0.2)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(count / maxCount) * 100}%`, background: "linear-gradient(to right, #854f10, #ffb872)" }}
                      />
                    </div>
                    <span className="text-sm text-on-surface-variant">{count}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {(profiles ?? []).length < 2 && (
          <p className="text-center text-on-surface-variant text-sm">Waiting for more members to complete their profiles.</p>
        )}
      </main>
    </div>
  );
}
