import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";

const STATUS_LABELS: Record<string, string> = {
  formation: "Building the group",
  alignment: "Aligning preferences",
  destination_voting: "Voting on destinations",
  date_voting: "Voting on dates",
  confirmed: "Trip confirmed",
  active: "In progress",
};

export default async function TripsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: memberships } = await supabase
    .from("trip_members")
    .select("trip_id, role, trips(id, name, status, destination, created_at)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  const trips = (memberships ?? []).map((m: any) => ({ ...m.trips, role: m.role }));

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar />
      <main className="pt-24 pb-32 px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-headline text-3xl italic text-on-surface">Your Trips</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/join"
              className="border border-outline-variant/30 text-on-surface px-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>login</span>
              Join Trip
            </Link>
            <Link
              href="/trips/new"
              className="text-white px-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2"
              style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
              New Trip
            </Link>
          </div>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-outline mb-4 block" style={{ fontSize: "48px" }}>card_travel</span>
            <p className="text-on-surface-variant mb-6">No trips yet.</p>
            <Link href="/trips/new" className="text-primary font-semibold">Start planning one →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip: any) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="block bg-surface-container-low rounded-2xl p-6 hover:bg-surface-container transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-headline text-xl text-on-surface italic">{trip.name}</h2>
                    {trip.destination && (
                      <p className="text-sm text-on-surface-variant mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>location_on</span>
                        {trip.destination}
                      </p>
                    )}
                    <p className="text-sm text-on-surface-variant mt-1">
                      {STATUS_LABELS[trip.status] ?? trip.status}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ background: "rgba(0,93,167,0.1)", color: "#005da7" }}
                  >
                    {trip.role}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
