"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopAppBar } from "@/components/layout/TopAppBar";

export default function CommitmentPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [myStatus, setMyStatus] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: tripData }, { data: mData }, { data: myM }] = await Promise.all([
        supabase.from("trips").select("*").eq("id", tripId).single(),
        supabase.from("trip_members").select("user_id, commitment_status, role").eq("trip_id", tripId),
        supabase.from("trip_members").select("commitment_status").eq("trip_id", tripId).eq("user_id", user?.id ?? "").single(),
      ]);
      setTrip(tripData);
      setMembers(mData ?? []);
      setMyStatus(myM?.commitment_status ?? null);
    }
    load();
  }, [tripId]);

  async function handleCommit(status: "in" | "out") {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("trip_members")
      .update({ commitment_status: status })
      .eq("trip_id", tripId)
      .eq("user_id", user!.id);
    setLoading(false);
    if (status === "in") router.push(`/trips/${tripId}/vibe`);
    else router.push("/trips");
  }

  const committedCount = members.filter(m => m.commitment_status === "in").length;
  const alreadyCommitted = myStatus === "in";

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref="/trips" title="Commitment" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        <div className="text-center mb-12">
          <span className="material-symbols-outlined text-primary mb-4 block" style={{ fontSize: "56px", fontVariationSettings: "'FILL' 1" }}>handshake</span>
          <h1 className="font-headline text-4xl italic text-primary mb-2">Are you in?</h1>
          <p className="text-on-surface-variant max-w-xs mx-auto">
            <strong className="text-on-surface">{trip?.name}</strong> — commit before planning begins.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-6 mb-8 text-center">
          <p className="text-4xl font-bold text-primary">{committedCount}</p>
          <p className="text-on-surface-variant text-sm mt-1">
            of {members.length} member{members.length !== 1 ? "s" : ""} committed
          </p>
        </div>

        {alreadyCommitted ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-4">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-semibold">You&apos;re in!</span>
            </div>
            <button
              onClick={() => router.push(`/trips/${tripId}/vibe`)}
              className="text-white px-8 py-3 rounded-full font-semibold"
              style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
            >
              Continue Setup →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => handleCommit("in")}
              disabled={loading}
              className="w-full text-white py-5 rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              I&apos;m In
            </button>
            <button
              onClick={() => handleCommit("out")}
              disabled={loading}
              className="w-full bg-surface-container text-on-surface-variant py-4 rounded-full font-semibold text-base transition-all disabled:opacity-50"
            >
              Can&apos;t make it this time
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
