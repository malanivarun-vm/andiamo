import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

interface Props { params: Promise<{ code: string }> }

export default async function ProcessJoinPage({ params }: Props) {
  const { code } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/join/${code}`);

  // Use admin client to look up trip by invite_code — new users aren't in
  // trip_members yet so RLS would block the regular client here
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: trip } = await admin
    .from("trips")
    .select("id, organiser_id")
    .eq("invite_code", code)
    .single();

  if (!trip) redirect("/join");

  if (trip.organiser_id !== user.id) {
    await supabase.from("trip_members").upsert({
      trip_id: trip.id,
      user_id: user.id,
      role: "member",
      commitment_status: "pending",
    }, { onConflict: "trip_id,user_id" });
  }

  redirect(`/trips/${trip.id}/commitment`);
}
