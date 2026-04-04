import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";

interface Props { params: Promise<{ tripId: string }> }

export default async function MemberDashboardPage({ params }: Props) {
  const { tripId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: trip }, { data: myMembership }, { data: myProfile }, { data: myBudget }, { data: allMembers }, { data: myActivity }] = await Promise.all([
    supabase.from("trips").select("*").eq("id", tripId).single(),
    supabase.from("trip_members").select("role, commitment_status").eq("trip_id", tripId).eq("user_id", user.id).single(),
    supabase.from("member_profiles").select("*").eq("trip_id", tripId).eq("user_id", user.id).single(),
    supabase.from("member_budgets").select("max_budget").eq("trip_id", tripId).eq("user_id", user.id).single(),
    supabase.from("trip_members").select("user_id, commitment_status").eq("trip_id", tripId),
    supabase.from("activity_preferences").select("rankings").eq("trip_id", tripId).eq("user_id", user.id).single(),
  ]);

  const isOrganiser = myMembership?.role === "organiser";
  if (isOrganiser) redirect(`/trips/${tripId}`);

  const pending: { label: string; href: string; icon: string }[] = [];
  if (myMembership?.commitment_status === "pending")
    pending.push({ label: "Confirm you're in", href: `/trips/${tripId}/commitment`, icon: "handshake" });
  if (!myProfile?.vibe_selections?.length)
    pending.push({ label: "Set your vibe", href: `/trips/${tripId}/vibe`, icon: "mood" });
  if (!myProfile?.pace)
    pending.push({ label: "Set travel style", href: `/trips/${tripId}/profile`, icon: "hiking" });
  if (!myBudget)
    pending.push({ label: "Add your budget", href: `/trips/${tripId}/budget`, icon: "payments" });
  if (trip?.status === "destination_voting")
    pending.push({ label: "Vote on destinations", href: `/trips/${tripId}/destinations/vote`, icon: "how_to_vote" });
  if (trip?.status === "date_voting")
    pending.push({ label: "Mark date availability", href: `/trips/${tripId}/dates/vote`, icon: "calendar_month" });
  if (!myActivity?.rankings?.length)
    pending.push({ label: "Rank activities", href: `/trips/${tripId}/activities`, icon: "hiking" });

  const committedCount = (allMembers ?? []).filter((m: any) => m.commitment_status === "in").length;
  const statusItems = [
    { label: "Committed", done: myMembership?.commitment_status === "in", value: myMembership?.commitment_status === "in" ? "In ✓" : "Pending" },
    { label: "Vibe", done: !!(myProfile?.vibe_selections?.length), value: myProfile?.vibe_selections?.length ? "Done ✓" : "Pending" },
    { label: "Budget", done: !!myBudget, value: myBudget ? "Done ✓" : "Pending" },
    { label: "Style", done: !!myProfile?.pace, value: myProfile?.pace ? "Done ✓" : "Pending" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar />
      <main className="pt-24 pb-32 px-6">
        {/* Trip Hero */}
        <section className="mb-8">
          <div className="relative rounded-3xl p-8 overflow-hidden" style={{ background: "linear-gradient(135deg, #005da7, #2976c7)" }}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-8 -mt-8" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "rgba(255,255,255,0.7)" }}>Your Trip</span>
              <h1 className="font-headline text-4xl italic text-white mb-2">{trip?.name}</h1>
              {trip?.destination && <p style={{ color: "rgba(255,255,255,0.85)" }}>📍 {trip.destination}</p>}
              {trip?.confirmed_start && (
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>📅 {trip.confirmed_start} – {trip.confirmed_end}</p>
              )}
              <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>{committedCount} members in</p>
            </div>
          </div>
        </section>

        {/* Pending Actions */}
        {pending.length > 0 && (
          <section className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Your Actions</p>
            <div className="space-y-2">
              {pending.map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-4 bg-surface-container-low rounded-2xl p-4 hover:bg-surface-container transition-colors"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(0,93,167,0.1)" }}>
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: "18px" }}>{action.icon}</span>
                  </div>
                  <span className="font-semibold text-on-surface flex-1">{action.label}</span>
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: "18px" }}>arrow_forward</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Status Grid */}
        <section className="grid grid-cols-2 gap-4 mb-6">
          {statusItems.map(item => (
            <div
              key={item.label}
              className={`rounded-2xl p-4 ${item.done ? "" : "bg-surface-container-low"}`}
              style={item.done ? { background: "rgba(0,93,167,0.08)" } : undefined}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{item.label}</p>
              <p className={`font-semibold ${item.done ? "text-primary" : "text-on-surface-variant"}`}>{item.value}</p>
            </div>
          ))}
        </section>

        {/* Destination + Dates (when revealed) */}
        {trip?.destination && (
          <section className="mb-6">
            <div className="bg-surface-container-low rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Destination</p>
              <p className="font-headline text-2xl italic text-primary">{trip.destination}</p>
              {trip.confirmed_start && (
                <p className="text-on-surface-variant text-sm mt-1">{trip.confirmed_start} – {trip.confirmed_end}</p>
              )}
            </div>
          </section>
        )}

        {pending.length === 0 && (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-primary mb-3 block" style={{ fontSize: "48px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="font-semibold text-on-surface">You&apos;re all caught up!</p>
            <p className="text-on-surface-variant text-sm mt-1">Waiting for the organiser to proceed.</p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
