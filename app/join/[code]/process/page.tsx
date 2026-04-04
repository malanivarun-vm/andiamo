import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface Props { params: Promise<{ code: string }> }

export default async function ProcessJoinPage({ params }: Props) {
  const { code } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/join/${code}`);

  const { data: trip } = await supabase
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
