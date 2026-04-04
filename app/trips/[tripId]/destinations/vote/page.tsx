"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopAppBar } from "@/components/layout/TopAppBar";

export default function DestinationVotePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [options, setOptions] = useState<any[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [myVote, setMyVote] = useState<string | null>(null);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);

    const [{ data: tripData }, { data: optData }, { data: voteData }, { data: myVoteData }] = await Promise.all([
      supabase.from("trips").select("*").eq("id", tripId).single(),
      supabase.from("destination_options").select("*").eq("trip_id", tripId),
      supabase.from("destination_votes").select("destination_id").eq("trip_id", tripId),
      supabase.from("destination_votes").select("destination_id").eq("trip_id", tripId).eq("user_id", user?.id ?? ""),
    ]);

    setTrip(tripData);
    setOptions(optData ?? []);

    const counts: Record<string, number> = {};
    voteData?.forEach(v => { counts[v.destination_id] = (counts[v.destination_id] ?? 0) + 1; });
    setVotes(counts);
    setMyVote(myVoteData?.[0]?.destination_id ?? null);
  }, [tripId, supabase]);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel(`dest-votes-${tripId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "destination_votes",
        filter: `trip_id=eq.${tripId}`,
      }, loadData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tripId, loadData]);

  async function castVote(destinationId: string) {
    if (myVote || !userId) return;
    setLoading(true);
    await supabase.from("destination_votes").insert({
      trip_id: tripId,
      destination_id: destinationId,
      user_id: userId,
    });
    setMyVote(destinationId);
    setLoading(false);
  }

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const deadline = trip?.destination_poll_deadline
    ? new Date(trip.destination_poll_deadline).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref={`/trips/${tripId}`} title="Vote — Destination" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-4xl italic text-primary mb-2">Where are we going?</h1>
          {deadline && (
            <p className="text-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span>
              Poll closes {deadline} · No response = abstain
            </p>
          )}
        </div>

        <div className="space-y-4 mb-10">
          {options.map(opt => {
            const voteCount = votes[opt.id] ?? 0;
            const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            const isMyVote = myVote === opt.id;
            const hasVoted = !!myVote;

            return (
              <button
                key={opt.id}
                onClick={() => castVote(opt.id)}
                disabled={hasVoted || loading}
                className={`w-full text-left rounded-2xl overflow-hidden transition-all ${
                  isMyVote ? "ring-2 ring-primary shadow-lg" : hasVoted ? "opacity-60" : "hover:shadow-md active:scale-[0.99]"
                }`}
              >
                <div className="bg-surface-container-low p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-headline text-xl italic text-on-surface">{opt.name}</h3>
                      {opt.description && (
                        <p className="text-sm text-on-surface-variant mt-1">{opt.description}</p>
                      )}
                    </div>
                    {isMyVote && (
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "22px" }}>
                        check_circle
                      </span>
                    )}
                  </div>
                  {hasVoted && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-on-surface-variant">{voteCount} vote{voteCount !== 1 ? "s" : ""}</span>
                        <span className="text-xs font-bold text-primary">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: "linear-gradient(to right, #005da7, #2976c7)" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {!myVote && (
          <p className="text-center text-sm text-on-surface-variant">Tap a destination to cast your vote</p>
        )}

        {myVote && (
          <div className="text-center">
            <p className="text-sm text-on-surface-variant mb-4">Voted! Results update in real time.</p>
            <button
              onClick={() => router.push(`/trips/${tripId}/destinations/result`)}
              className="text-primary font-semibold text-sm flex items-center gap-1 mx-auto"
            >
              View current results <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
