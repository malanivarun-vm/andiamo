import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { LockDestinationButton } from "./LockDestinationButton";

interface Props { params: Promise<{ tripId: string }> }

export default async function DestinationResultPage({ params }: Props) {
  const { tripId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: trip }, { data: options }, { data: allVotes }, { data: membership }] = await Promise.all([
    supabase.from("trips").select("*").eq("id", tripId).single(),
    supabase.from("destination_options").select("*").eq("trip_id", tripId),
    supabase.from("destination_votes").select("destination_id").eq("trip_id", tripId),
    supabase.from("trip_members").select("role").eq("trip_id", tripId).eq("user_id", user.id).single(),
  ]);

  const voteCounts: Record<string, number> = {};
  allVotes?.forEach(v => { voteCounts[v.destination_id] = (voteCounts[v.destination_id] ?? 0) + 1; });

  const sortedOptions = (options ?? []).sort((a: any, b: any) => (voteCounts[b.id] ?? 0) - (voteCounts[a.id] ?? 0));
  const winner = sortedOptions[0];
  const isOrganiser = membership?.role === "organiser";
  const isLocked = !!trip?.destination;

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref={`/trips/${tripId}`} title="Destination" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto text-center">
        {isLocked ? (
          <>
            <span className="text-6xl mb-4 block">🎉</span>
            <p className="text-xs font-bold uppercase tracking-widest text-tertiary mb-2">Confirmed Destination</p>
          </>
        ) : (
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Leading Vote</p>
        )}
        <h1 className="font-headline text-6xl italic text-primary mb-4">{trip?.destination ?? winner?.name}</h1>
        {winner?.description && (
          <p className="text-on-surface-variant mb-8 max-w-xs mx-auto">{winner.description}</p>
        )}

        <div className="space-y-3 mb-10 text-left">
          {sortedOptions.map((opt: any) => {
            const count = voteCounts[opt.id] ?? 0;
            const total = allVotes?.length ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const isWinner = opt.id === winner?.id;
            return (
              <div
                key={opt.id}
                className={`p-4 rounded-2xl ${isWinner ? "ring-1 ring-primary/30" : "bg-surface-container-low"}`}
                style={isWinner ? { background: "rgba(0,93,167,0.08)" } : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold ${isWinner ? "text-primary" : "text-on-surface"}`}>{opt.name}</span>
                  <span className={`text-sm font-bold ${isWinner ? "text-primary" : "text-on-surface-variant"}`}>
                    {count} vote{count !== 1 ? "s" : ""} · {pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: isWinner ? "linear-gradient(to right, #005da7, #2976c7)" : "#c1c7d3",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {isOrganiser && !isLocked && winner && (
          <LockDestinationButton tripId={tripId} destination={winner.name} />
        )}

        {isLocked && (
          <Link
            href={`/trips/${tripId}/dates/propose`}
            className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-full font-bold text-base shadow-lg"
            style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
          >
            Next: Pick Dates <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
          </Link>
        )}
      </main>
    </div>
  );
}
