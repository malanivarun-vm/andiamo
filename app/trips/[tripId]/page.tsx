import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";

interface Props { params: Promise<{ tripId: string }> }

export default async function TripDashboardPage({ params }: Props) {
  const { tripId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: trip }, { data: members }, { data: myMembership }] = await Promise.all([
    supabase.from("trips").select("*").eq("id", tripId).single(),
    supabase.from("trip_members").select("user_id, role, commitment_status").eq("trip_id", tripId),
    supabase.from("trip_members").select("role, commitment_status").eq("trip_id", tripId).eq("user_id", user.id).single(),
  ]);

  if (!trip) redirect("/trips");

  const isOrganiser = myMembership?.role === "organiser";
  if (!isOrganiser) redirect(`/trips/${tripId}/member`);

  // If organiser hasn't finished setup, redirect
  const myMember = (members ?? []).find((m: any) => m.user_id === user.id);
  if (myMember?.commitment_status === "pending") redirect(`/trips/${tripId}/commitment`);

  const committed = (members ?? []).filter((m: any) => m.commitment_status === "in");
  const total = (members ?? []).length;

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/join/${trip.invite_code}`;

  // Determine next action
  type Action = { label: string; href: string; icon: string };
  let nextAction: Action | null = null;
  if (trip.status === "formation") {
    nextAction = committed.length >= 2
      ? { label: "Propose Destinations", href: `/trips/${tripId}/destinations/propose`, icon: "explore" }
      : { label: "Waiting for Commitments", href: "#", icon: "group" };
  } else if (trip.status === "destination_voting") {
    nextAction = { label: "View Destination Vote", href: `/trips/${tripId}/destinations/vote`, icon: "how_to_vote" };
  } else if (trip.status === "date_voting") {
    nextAction = trip.destination
      ? { label: "Propose Dates", href: `/trips/${tripId}/dates/propose`, icon: "calendar_month" }
      : { label: "View Vote Results", href: `/trips/${tripId}/destinations/result`, icon: "leaderboard" };
  } else if (trip.status === "confirmed") {
    nextAction = { label: "View Style Compatibility", href: `/trips/${tripId}/compatibility`, icon: "insights" };
  }

  const budgetFetched = trip.status !== "formation";

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar />
      <main className="pt-24 pb-32 min-h-screen">
        {/* Hero */}
        <section className="px-6 mb-8">
          <div className="relative rounded-3xl overflow-hidden p-8" style={{ background: "linear-gradient(135deg, #005da7, #2976c7)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="relative z-10">
              <span className="font-label text-xs uppercase tracking-widest mb-2 block" style={{ color: "rgba(255,255,255,0.7)" }}>
                {trip.status === "confirmed" ? "Confirmed" : "Planning"}
              </span>
              <h2 className="font-headline text-5xl italic text-white leading-none mb-4">{trip.name}</h2>
              {trip.destination && <p className="font-semibold mb-1" style={{ color: "rgba(255,255,255,0.85)" }}>📍 {trip.destination}</p>}
              {trip.confirmed_start && (
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
                  📅 {trip.confirmed_start} – {trip.confirmed_end}
                </p>
              )}
              <div className="flex items-center gap-6 mt-4 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                <span>{committed.length}/{total} committed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Next Action */}
        {nextAction && nextAction.href !== "#" && (
          <section className="px-6 mb-6">
            <Link href={nextAction.href} className="block rounded-2xl p-6 relative overflow-hidden" style={{ background: "#005da7" }}>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15">
                <span className="material-symbols-outlined text-white" style={{ fontSize: "80px" }}>{nextAction.icon}</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "rgba(255,255,255,0.7)" }}>Next Step</span>
              <p className="font-headline text-2xl italic text-white mb-3">{nextAction.label}</p>
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                Go <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
              </div>
            </Link>
          </section>
        )}

        {nextAction?.href === "#" && (
          <section className="px-6 mb-6">
            <div className="bg-surface-container-low rounded-2xl p-6 flex items-center gap-4">
              <span className="material-symbols-outlined text-outline">pending</span>
              <div>
                <p className="font-semibold text-on-surface">{nextAction.label}</p>
                <p className="text-sm text-on-surface-variant">Share the invite link below to get more people in.</p>
              </div>
            </div>
          </section>
        )}

        {/* Stats Grid */}
        <section className="px-6 grid grid-cols-2 gap-4 mb-6">
          <div className="bg-surface-container-low rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Committed</p>
            <p className="font-headline text-4xl text-primary">
              {committed.length}<span className="text-on-surface-variant text-xl">/{total}</span>
            </p>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Budget Data</p>
            {budgetFetched ? (
              <Link href={`/api/trips/${tripId}/budget-summary`} className="text-primary font-semibold text-sm">View Summary →</Link>
            ) : (
              <p className="text-sm text-on-surface-variant">Collecting…</p>
            )}
          </div>
        </section>

        {/* Invite Link */}
        {trip.status === "formation" && (
          <section className="px-6 mb-6">
            <div className="bg-surface-container-low rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Invite Link</p>
              <div className="bg-surface rounded-xl p-3 flex items-center gap-3">
                <p className="text-sm text-on-surface-variant flex-1 truncate font-mono">{inviteUrl}</p>
              </div>
              <p className="text-xs text-on-surface-variant mt-2">Invite code: <span className="font-mono font-bold text-primary">{trip.invite_code}</span></p>
            </div>
          </section>
        )}

        {/* Members */}
        <section className="px-6 mb-6">
          <div className="bg-surface-container-low rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Members</p>
            <div className="space-y-3">
              {(members ?? []).map((m: any) => (
                <div key={m.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "16px" }}>person</span>
                    </div>
                    <span className="text-sm font-medium text-on-surface capitalize">{m.role}</span>
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: m.commitment_status === "in" ? "rgba(0,93,167,0.1)" : m.commitment_status === "out" ? "rgba(186,26,26,0.1)" : "rgba(113,119,131,0.1)",
                      color: m.commitment_status === "in" ? "#005da7" : m.commitment_status === "out" ? "#ba1a1a" : "#717783",
                    }}
                  >
                    {m.commitment_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="px-6 grid grid-cols-2 gap-3">
          <Link href={`/trips/${tripId}/compatibility`} className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">insights</span>
            <span className="text-sm font-semibold text-on-surface">Style Match</span>
          </Link>
          <Link href={`/trips/${tripId}/activities`} className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">hiking</span>
            <span className="text-sm font-semibold text-on-surface">Activities</span>
          </Link>
          <Link href={`/trips/${tripId}/conflict`} className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-outline">flag</span>
            <span className="text-sm font-semibold text-on-surface-variant">Conflict</span>
          </Link>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
