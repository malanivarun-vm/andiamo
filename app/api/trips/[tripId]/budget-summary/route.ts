import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  const userSupabase = await createServerClient();
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await userSupabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .single();

  if (membership?.role !== "organiser") {
    return NextResponse.json({ error: "Organiser only" }, { status: 403 });
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: budgets } = await adminSupabase
    .from("member_budgets")
    .select("max_budget")
    .eq("trip_id", tripId);

  if (!budgets || budgets.length === 0) {
    return NextResponse.json({ count: 0, buckets: [] });
  }

  const amounts = budgets.map((b: { max_budget: number }) => b.max_budget).sort((a: number, b: number) => a - b);
  const buckets = [
    { label: "Under ₹15k", count: amounts.filter((a: number) => a < 15000).length },
    { label: "₹15k–₹25k", count: amounts.filter((a: number) => a >= 15000 && a < 25000).length },
    { label: "₹25k–₹40k", count: amounts.filter((a: number) => a >= 25000 && a < 40000).length },
    { label: "₹40k–₹60k", count: amounts.filter((a: number) => a >= 40000 && a < 60000).length },
    { label: "₹60k+", count: amounts.filter((a: number) => a >= 60000).length },
  ].filter(b => b.count > 0);

  return NextResponse.json({
    count: amounts.length,
    min: amounts[0],
    max: amounts[amounts.length - 1],
    median: amounts[Math.floor(amounts.length / 2)],
    buckets,
  });
}
