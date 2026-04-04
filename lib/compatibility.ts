interface MemberProfile {
  user_id: string;
  pace: string | null;
  accommodation: string | null;
  activity_type: string | null;
  dietary: string | null;
}

interface AxisScore {
  axis: string;
  label: string;
  icon: string;
  score: number;
  dominant: string;
  breakdown: Record<string, number>;
  hasMismatch: boolean;
}

export interface CompatibilityResult {
  overallScore: number;
  axes: AxisScore[];
  mismatches: string[];
  summary: string;
}

const AXIS_META: Record<string, { label: string; icon: string }> = {
  pace: { label: "Travel Pace", icon: "speed" },
  accommodation: { label: "Accommodation", icon: "hotel" },
  activity_type: { label: "Activity Style", icon: "hiking" },
  dietary: { label: "Dietary", icon: "restaurant" },
};

function scoreAxis(profiles: MemberProfile[], axis: keyof Omit<MemberProfile, "user_id">): AxisScore {
  const values = profiles.map(p => p[axis]).filter(Boolean) as string[];
  const meta = AXIS_META[axis];

  if (values.length === 0) {
    return { axis, label: meta.label, icon: meta.icon, score: 0, dominant: "unknown", breakdown: {}, hasMismatch: false };
  }

  const breakdown: Record<string, number> = {};
  values.forEach(v => { breakdown[v] = (breakdown[v] ?? 0) + 1; });

  const dominant = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0][0];
  const dominantCount = breakdown[dominant];
  const score = Math.round((dominantCount / values.length) * 100);
  const hasMismatch = Object.keys(breakdown).length > 1 && score < 60;

  return { axis, label: meta.label, icon: meta.icon, score, dominant, breakdown, hasMismatch };
}

export function computeCompatibility(profiles: MemberProfile[]): CompatibilityResult {
  if (profiles.length < 2) {
    return { overallScore: 0, axes: [], mismatches: [], summary: "Need at least 2 profiles to compute compatibility." };
  }

  const axes: AxisScore[] = [
    scoreAxis(profiles, "pace"),
    scoreAxis(profiles, "accommodation"),
    scoreAxis(profiles, "activity_type"),
    scoreAxis(profiles, "dietary"),
  ];

  const overallScore = Math.round(axes.reduce((sum, a) => sum + a.score, 0) / axes.length);
  const mismatches = axes.filter(a => a.hasMismatch).map(a => a.label);

  let summary: string;
  if (overallScore >= 80) summary = "Great compatibility — this group travels well together.";
  else if (overallScore >= 60) summary = "Good match with some minor style differences to discuss.";
  else if (overallScore >= 40) summary = "Notable mismatches — worth a quick group chat before booking.";
  else summary = "Significant style differences. Set clear expectations early.";

  return { overallScore, axes, mismatches, summary };
}
