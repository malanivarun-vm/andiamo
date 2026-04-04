"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopAppBar } from "@/components/layout/TopAppBar";

export default function ConflictPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [flags, setFlags] = useState<any[]>([]);
  const [reason, setReason] = useState("");
  const [context, setContext] = useState<"destination" | "dates">("dates");
  const [loading, setLoading] = useState(false);
  const [isOrganiser, setIsOrganiser] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    const [{ data: flagData }, { data: membership }] = await Promise.all([
      supabase.from("conflict_flags").select("*").eq("trip_id", tripId).order("created_at", { ascending: false }),
      supabase.from("trip_members").select("role").eq("trip_id", tripId).eq("user_id", user?.id ?? "").single(),
    ]);
    setFlags(flagData ?? []);
    setIsOrganiser(membership?.role === "organiser");
  }, [tripId]);

  useEffect(() => { loadData(); }, [loadData]);

  async function flagConcern() {
    if (!reason.trim() || !userId) return;
    setLoading(true);
    await supabase.from("conflict_flags").insert({
      trip_id: tripId,
      flagged_by: userId,
      context,
      reason,
      deadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      status: "open",
    });
    setReason("");
    await loadData();
    setLoading(false);
  }

  async function resolveFlag(flagId: string, resolution: "resolved" | "force_locked") {
    setLoading(true);
    await supabase.from("conflict_flags").update({ status: resolution }).eq("id", flagId);
    await loadData();
    setLoading(false);
  }

  const openFlags = flags.filter(f => f.status === "open");
  const closedFlags = flags.filter(f => f.status !== "open");

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar backHref={`/trips/${tripId}`} title="Conflict Resolution" />
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-4xl italic text-primary mb-2">Something not working?</h1>
          <p className="text-on-surface-variant">Flag a concern. You have 72 hours to discuss. The organiser can re-poll or force-lock.</p>
        </div>

        {/* Active Flags */}
        {openFlags.length > 0 && (
          <div className="space-y-4 mb-8">
            {openFlags.map(flag => {
              const deadline = new Date(flag.deadline);
              const hoursLeft = Math.max(0, Math.round((deadline.getTime() - Date.now()) / (1000 * 60 * 60)));
              return (
                <div key={flag.id} className="rounded-2xl p-5" style={{ background: "rgba(186,26,26,0.08)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-error">Open · {flag.context}</span>
                    <span className="text-xs text-on-surface-variant">{hoursLeft}h left</span>
                  </div>
                  <p className="text-on-surface mb-4">{flag.reason}</p>
                  {isOrganiser && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => resolveFlag(flag.id, "resolved")}
                        disabled={loading}
                        className="flex-1 text-white py-2 rounded-full font-semibold text-sm"
                        style={{ background: "#005da7" }}
                      >
                        Re-Poll
                      </button>
                      <button
                        onClick={() => resolveFlag(flag.id, "force_locked")}
                        disabled={loading}
                        className="flex-1 bg-surface-container text-on-surface-variant py-2 rounded-full font-semibold text-sm"
                      >
                        Force Lock
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Resolution Log */}
        {closedFlags.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Resolution Log</p>
            <div className="space-y-2">
              {closedFlags.map(flag => (
                <div key={flag.id} className="bg-surface-container-low rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface flex-1">{flag.reason}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full ml-3"
                      style={
                        flag.status === "resolved"
                          ? { background: "rgba(0,93,167,0.1)", color: "#005da7" }
                          : { background: "rgba(186,26,26,0.1)", color: "#ba1a1a" }
                      }
                    >
                      {flag.status === "force_locked" ? "Force Locked" : "Re-polled"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flag Form */}
        <div className="bg-surface-container-low rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Flag a Concern</p>
          <div className="mb-4">
            <div className="flex gap-2 mb-3">
              {(["destination", "dates"] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setContext(c)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors capitalize"
                  style={context === c ? { background: "#005da7", color: "#fff" } : { background: "rgba(193,199,211,0.2)", color: "#414751" }}
                >
                  {c}
                </button>
              ))}
            </div>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="What's your concern? Be specific."
              rows={3}
              className="w-full bg-surface rounded-t-lg px-4 py-3 text-on-surface outline-none transition-colors resize-none"
              style={{ borderBottom: "2px solid rgba(193,199,211,0.3)" }}
            />
          </div>
          <button
            onClick={flagConcern}
            disabled={loading || !reason.trim()}
            className="w-full text-white py-3 rounded-full font-bold text-sm disabled:opacity-50 transition-all active:scale-95"
            style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
          >
            {loading ? "Flagging..." : "Flag Concern — 72h Window Opens"}
          </button>
        </div>
      </main>
    </div>
  );
}
