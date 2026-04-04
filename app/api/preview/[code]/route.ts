import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: trip } = await admin
    .from("trips")
    .select("id, name, status, rough_window_start, rough_window_end, destination, destination_poll_deadline, date_poll_deadline")
    .eq("invite_code", code)
    .single();

  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [
    { count: committedCount },
    { count: totalCount },
    { data: profiles },
    { data: destinations },
  ] = await Promise.all([
    admin.from("trip_members").select("*", { count: "exact", head: true }).eq("trip_id", trip.id).eq("commitment_status", "in"),
    admin.from("trip_members").select("*", { count: "exact", head: true }).eq("trip_id", trip.id),
    admin.from("member_profiles").select("vibe_selections").eq("trip_id", trip.id),
    admin.from("destination_options").select("name").eq("trip_id", trip.id),
  ]);

  const vibeTally: Record<string, number> = {};
  profiles?.forEach(p => {
    (p.vibe_selections ?? []).forEach((v: string) => {
      vibeTally[v] = (vibeTally[v] ?? 0) + 1;
    });
  });
  const topVibes = Object.entries(vibeTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([vibe]) => vibe);

  return NextResponse.json({
    id: trip.id,
    name: trip.name,
    status: trip.status,
    roughWindowStart: trip.rough_window_start,
    roughWindowEnd: trip.rough_window_end,
    destination: trip.destination,
    destinationPollDeadline: trip.destination_poll_deadline,
    datePollDeadline: trip.date_poll_deadline,
    committedCount: committedCount ?? 0,
    totalCount: totalCount ?? 0,
    topVibes,
    destinationOptions: destinations?.map(d => d.name) ?? [],
  });
}
