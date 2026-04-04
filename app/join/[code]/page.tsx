import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { JoinButton } from "./JoinButton";

interface Props { params: Promise<{ code: string }> }

const VIBE_LABELS: Record<string, { label: string; icon: string }> = {
  unwind: { label: "Unwind", icon: "self_improvement" },
  explore: { label: "Explore", icon: "hiking" },
  eat_well: { label: "Eat Well", icon: "restaurant" },
  party: { label: "Party", icon: "nightlife" },
  adventure: { label: "Adventure", icon: "kayaking" },
};

const STATUS_LABELS: Record<string, string> = {
  formation: "Building the group",
  alignment: "Aligning preferences",
  destination_voting: "Voting on destinations",
  date_voting: "Voting on dates",
  confirmed: "Trip confirmed",
};

export default async function PublicTripPreviewPage({ params }: Props) {
  const { code } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/preview/${code}`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="text-center">
          <span className="material-symbols-outlined text-outline mb-4 block" style={{ fontSize: "48px" }}>link_off</span>
          <h1 className="font-headline text-2xl text-on-surface italic mb-2">Link not found</h1>
          <p className="text-on-surface-variant">This invite link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const trip = await res.json();

  // If signed-in user is already a member, redirect to dashboard
  if (user) {
    const { data: membership } = await supabase
      .from("trip_members")
      .select("role, commitment_status")
      .eq("trip_id", trip.id)
      .eq("user_id", user.id)
      .single();

    if (membership) {
      redirect(membership.role === "organiser" ? `/trips/${trip.id}` : `/trips/${trip.id}/member`);
    }
  }

  const hoursLeft = trip.destinationPollDeadline
    ? Math.max(0, Math.round((new Date(trip.destinationPollDeadline).getTime() - Date.now()) / (1000 * 60 * 60)))
    : null;

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar showProfile={false} />
      <main className="pt-24 pb-16 px-6 max-w-lg mx-auto">

        {/* Hero */}
        <section className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-tertiary mb-3">You&apos;re invited</p>
          <h1 className="font-headline text-6xl italic text-primary leading-none mb-4">
            {trip.destination ?? trip.name}
          </h1>
          {trip.destination && (
            <p className="text-on-surface-variant font-medium">{trip.name}</p>
          )}
          {trip.roughWindowStart && (
            <p className="text-on-surface-variant text-sm mt-2 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>calendar_today</span>
              {new Date(trip.roughWindowStart).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </p>
          )}
        </section>

        {/* FOMO Signals */}
        <section className="space-y-3 mb-10">
          {/* Committed count */}
          <div className="bg-surface-container-low rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(0,93,167,0.1)" }}>
              <span className="material-symbols-outlined text-primary">group</span>
            </div>
            <div>
              <p className="font-headline text-3xl text-primary italic">{trip.committedCount}</p>
              <p className="text-sm text-on-surface-variant">
                of {trip.totalCount} {trip.totalCount === 1 ? "person" : "people"} already in
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-surface-container-low rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(133,79,16,0.1)" }}>
              <span className="material-symbols-outlined text-tertiary">radio_button_checked</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-on-surface">{STATUS_LABELS[trip.status] ?? "Planning in progress"}</p>
              {hoursLeft !== null && hoursLeft > 0 && (
                <p className="text-sm text-on-surface-variant">
                  Destination vote closes in{" "}
                  <span className="font-bold text-tertiary">{hoursLeft}h</span>
                </p>
              )}
            </div>
          </div>

          {/* Vibe tally */}
          {trip.topVibes.length > 0 && (
            <div className="bg-surface-container-low rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Group Vibe</p>
              <div className="flex gap-2 flex-wrap">
                {trip.topVibes.map((vibe: string) => (
                  <span
                    key={vibe}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm"
                    style={{ background: "rgba(0,93,167,0.1)", color: "#005da7" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>{VIBE_LABELS[vibe]?.icon ?? "mood"}</span>
                    {VIBE_LABELS[vibe]?.label ?? vibe}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Destination poll teaser — vote counts hidden */}
          {trip.destinationOptions.length > 0 && (
            <div className="bg-surface-container-low rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                Vote is live — join to see results
              </p>
              <div className="space-y-2">
                {trip.destinationOptions.map((name: string) => (
                  <div key={name} className="flex items-center justify-between py-2">
                    <span className="font-headline text-lg italic text-on-surface">{name}</span>
                    {/* Vote bar deliberately blurred */}
                    <div className="w-24 h-2 bg-outline-variant/30 rounded-full overflow-hidden relative flex items-center justify-center">
                      <div className="absolute inset-0" style={{ backdropFilter: "blur(4px)", background: "rgba(245,243,240,0.7)" }}></div>
                      <span className="material-symbols-outlined relative z-10" style={{ fontSize: "12px", color: "#717783" }}>lock</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant mt-3 italic">Results visible after you join</p>
            </div>
          )}
        </section>

        {/* CTA */}
        <JoinButton inviteCode={code} isSignedIn={!!user} />

        <p className="text-xs text-center text-on-surface-variant mt-6">
          By joining, you commit to participating in group decisions.
        </p>
      </main>
    </div>
  );
}
