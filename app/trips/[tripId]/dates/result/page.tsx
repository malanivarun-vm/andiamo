import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { ConfirmDatesButton } from "./ConfirmDatesButton";

interface Props { params: Promise<{ tripId: string }> }

export default async function DateResultPage({ params }: Props) {
  const { tripId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: trip }, { data: dateOptions }, { data: availability }, { data: membership }] = await Promise.all([
    supabase.from("trips").select("*").eq("id", tripId).single(),
    supabase.from("date_options").select("*").eq("trip_id", tripId),
    supabase.from("date_availability").select("*").eq("trip_id", tripId),
    supabase.from("trip_members").select("role").eq("trip_id", tripId).eq("user_id", user.id).single(),
  ]);

  const isOrganiser = membership?.role === "organiser";
  const isConfirmed = trip?.status === "confirmed";

  const scored = (dateOptions ?? []).map((opt: any) => {
    const optAvail = (availability ?? []).filter((a: any) => a.date_option_id === opt.id);
    const preferred = optAvail.filter((a: any) => a.availability === "preferred").length;
    const available = optAvail.filter((a: any) => a.availability === "available").length;
    const unavailable = optAvail.filter((a: any) => a.availability === "unavailable").length;
    const score = preferred * 2 + available * 1;
    return { ...opt, preferred, available, unavailable, score };
  }).sort((a: any, b: any) => b.score - a.score);

  const best = scored[0];

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref={`/trips/${tripId}`} title="Date Results" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        <div className="text-center mb-10">
          {isConfirmed && <span className="text-5xl mb-3 block">📅</span>}
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            {isConfirmed ? "Confirmed Dates" : "Best Available"}
          </p>
          <h1 className="font-headline text-4xl italic text-primary">
            {isConfirmed ? `${trip.confirmed_start} – ${trip.confirmed_end}` : best?.label}
          </h1>
        </div>

        <div className="space-y-4 mb-10">
          {scored.map((opt: any, i: number) => {
            const isWinner = i === 0;
            return (
              <div
                key={opt.id}
                className={`p-5 rounded-2xl ${isWinner ? "ring-1 ring-primary/30" : "bg-surface-container-low"}`}
                style={isWinner ? { background: "rgba(0,93,167,0.08)" } : undefined}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`font-semibold ${isWinner ? "text-primary" : "text-on-surface"}`}>{opt.label}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{opt.start_date} – {opt.end_date}</p>
                  </div>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      isWinner ? "text-white" : "bg-surface-container text-on-surface-variant"
                    }`}
                    style={isWinner ? { background: "#005da7" } : undefined}
                  >
                    Score: {opt.score}
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-tertiary">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>star</span>
                    {opt.preferred} preferred
                  </span>
                  <span className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {opt.available} available
                  </span>
                  <span className="flex items-center gap-1 text-error">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>cancel</span>
                    {opt.unavailable} can&apos;t make it
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {isOrganiser && !isConfirmed && best && (
          <ConfirmDatesButton tripId={tripId} dateOption={best} />
        )}

        {isConfirmed && (
          <Link
            href={`/trips/${tripId}`}
            className="w-full text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
          >
            View Trip Dashboard <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
          </Link>
        )}
      </main>
    </div>
  );
}
