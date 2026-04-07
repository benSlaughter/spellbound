"use client";

import { useState, useEffect, useCallback, type ComponentType } from "react";
import {
  Plant,
  MagicWand,
  Sparkle,
  Calculator,
  Star,
  Butterfly,
  Rainbow,
  Trophy,
  MusicNotes,
  Medal,
  type IconProps,
} from "@phosphor-icons/react";

const ICON_MAP: Record<string, ComponentType<IconProps>> = {
  Plant,
  MagicWand,
  Sparkle,
  Calculator,
  Star,
  Butterfly,
  Rainbow,
  Trophy,
  MusicNotes,
  Medal,
};

interface ProgressEntry {
  id: number;
  activity_type: string;
  activity_ref: string | null;
  result: string;
  created_at: string;
}

interface StatByType {
  activity_type: string;
  total: number;
  correct: number;
  helped: number;
  skipped: number;
}

interface ProgressSummary {
  totalGamesPlayed: number;
  wordsPractised: number;
  mathsPractised: number;
  recentActivity: ProgressEntry[];
  streakDays: number;
  statsByType: StatByType[];
}

interface AchievementData {
  key: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

interface ItemConfidence {
  ref: string;
  correct: number;
  helped: number;
  skipped: number;
  total: number;
  lastSeen: string | null;
  confidence: number;
}

/** Simple confidence score: weighted correct ratio with time decay. */
function computeConfidence(item: { correct: number; helped: number; total: number; lastSeen: string | null }): number {
  if (item.total === 0 || !item.lastSeen) return 0;
  const weighted = (item.correct + item.helped * 0.5) / item.total;
  const days = Math.max(0, (Date.now() - new Date(item.lastSeen).getTime()) / 86400000);
  return weighted * Math.pow(0.5, days / 14);
}

function confidenceColor(c: number): string {
  if (c >= 0.7) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (c >= 0.4) return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

function confidenceLabel(c: number): string {
  if (c >= 0.7) return 'Strong';
  if (c >= 0.4) return 'Developing';
  return 'Needs practice';
}

function ConfidencePill({ item }: { item: ItemConfidence }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${confidenceColor(item.confidence)}`}
      title={`${item.ref}: ${item.correct} correct, ${item.helped} helped, ${item.skipped} skipped — ${confidenceLabel(item.confidence)}`}
    >
      <span className="font-bold">{item.ref}</span>
      <span className="opacity-60 text-xs">({item.correct}/{item.total})</span>
    </div>
  );
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [spellingConfidence, setSpellingConfidence] = useState<ItemConfidence[]>([]);
  const [mathsConfidence, setMathsConfidence] = useState<ItemConfidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [progressRes, achievementsRes, spellingStatsRes, mathsStatsRes] = await Promise.all([
        fetch("/api/progress"),
        fetch("/api/achievements"),
        fetch("/api/progress/items?kind=spelling"),
        fetch("/api/progress/items?kind=maths"),
      ]);

      const progressData = await progressRes.json();
      const achievementsData = await achievementsRes.json();

      setProgress(progressData);
      setAchievements(achievementsData);

      if (spellingStatsRes.ok) {
        const spellingData = await spellingStatsRes.json();
        setSpellingConfidence(
          spellingData.items
            .map((item: ItemConfidence) => ({
              ...item,
              confidence: computeConfidence(item),
            }))
            .sort((a: ItemConfidence, b: ItemConfidence) => a.confidence - b.confidence)
        );
      }

      if (mathsStatsRes.ok) {
        const mathsData = await mathsStatsRes.json();
        setMathsConfidence(
          mathsData.items
            .map((item: ItemConfidence) => ({
              ...item,
              confidence: computeConfidence(item),
            }))
            .sort((a: ItemConfidence, b: ItemConfidence) => a.confidence - b.confidence)
        );
      }
    } catch {
      setError("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="text-stone-400">Loading…</div>;
  }

  if (error) {
    return (
      <div className="msg-error">
        {error}
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">
        Progress Overview
      </h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="admin-card-sm text-center">
          <div className="text-2xl font-bold text-green-700">
            {progress.totalGamesPlayed}
          </div>
          <div className="text-xs text-stone-500 mt-1">Total Games</div>
        </div>
        <div className="admin-card-sm text-center">
          <div className="text-2xl font-bold text-blue-700">
            {progress.wordsPractised}
          </div>
          <div className="text-xs text-stone-500 mt-1">Words Practised</div>
        </div>
        <div className="admin-card-sm text-center">
          <div className="text-2xl font-bold text-purple-700">
            {progress.mathsPractised}
          </div>
          <div className="text-xs text-stone-500 mt-1">Maths Practised</div>
        </div>
        <div className="admin-card-sm text-center">
          <div className="text-2xl font-bold text-amber-600">
            {progress.streakDays}
          </div>
          <div className="text-xs text-stone-500 mt-1">Day Streak</div>
        </div>
      </div>

      {/* Activity Breakdown */}
      {progress.statsByType.length > 0 && (
        <section className="admin-card mb-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Activity Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 text-stone-600 font-medium">
                    Activity
                  </th>
                  <th className="text-right py-2 text-stone-600 font-medium">
                    Total
                  </th>
                  <th className="text-right py-2 text-green-600 font-medium">
                    Correct
                  </th>
                  <th className="text-right py-2 text-amber-600 font-medium">
                    Helped
                  </th>
                  <th className="text-right py-2 text-stone-400 font-medium">
                    Skipped
                  </th>
                </tr>
              </thead>
              <tbody>
                {progress.statsByType.map((stat) => (
                  <tr
                    key={stat.activity_type}
                    className="border-b border-stone-100"
                  >
                    <td className="py-2 text-stone-800">
                      {stat.activity_type}
                    </td>
                    <td className="text-right py-2 text-stone-700">
                      {stat.total}
                    </td>
                    <td className="text-right py-2 text-green-700">
                      {stat.correct}
                    </td>
                    <td className="text-right py-2 text-amber-600">
                      {stat.helped}
                    </td>
                    <td className="text-right py-2 text-stone-400">
                      {stat.skipped}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Achievements */}
      <section className="admin-card mb-6">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">
          Achievements
        </h2>
        {achievements.length === 0 ? (
          <p className="text-sm text-stone-500">No achievements defined</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div
                key={a.key}
                className={`rounded-lg p-3 border ${
                  a.unlocked
                    ? "border-green-200 bg-green-50"
                    : "border-stone-200 bg-stone-50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {ICON_MAP[a.emoji]
                      ? (() => { const Icon = ICON_MAP[a.emoji]; return <Icon size={24} weight="duotone" />; })()
                      : a.emoji}
                  </span>
                  <div>
                    <div className="font-medium text-stone-800 text-sm">
                      {a.title}
                    </div>
                    <div className="text-xs text-stone-500">
                      {a.description}
                    </div>
                    {a.unlocked && a.unlocked_at && (
                      <div className="text-xs text-green-600 mt-0.5">
                        Unlocked{" "}
                        {new Date(a.unlocked_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Learning Confidence */}
      {(spellingConfidence.length > 0 || mathsConfidence.length > 0) && (
        <section className="admin-card">
          <h2 className="text-lg font-semibold text-stone-800 mb-2">
            Learning Confidence
          </h2>
          <p className="text-sm text-stone-500 mb-4">
            How well each item is known. Weaker items appear first in games automatically.
          </p>

          {spellingConfidence.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-stone-600 mb-2">Spelling Words</h3>
              <div className="flex flex-wrap gap-2">
                {spellingConfidence.map((item) => (
                  <ConfidencePill key={item.ref} item={item} />
                ))}
              </div>
            </div>
          )}

          {mathsConfidence.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-600 mb-2">Maths Facts</h3>
              <div className="flex flex-wrap gap-2">
                {mathsConfidence.map((item) => (
                  <ConfidencePill key={item.ref} item={item} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Recent Activity */}
      <section className="admin-card">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">
          Recent Activity
        </h2>
        {progress.recentActivity.length === 0 ? (
          <p className="text-sm text-stone-500">No activity recorded yet</p>
        ) : (
          <div className="space-y-2">
            {progress.recentActivity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      entry.result === "correct"
                        ? "bg-green-500"
                        : entry.result === "helped"
                          ? "bg-amber-400"
                          : "bg-stone-300"
                    }`}
                  />
                  <div>
                    <span className="text-sm text-stone-800">
                      {entry.activity_type}
                    </span>
                    {entry.activity_ref && (
                      <span className="text-sm text-stone-500 ml-2">
                        ({entry.activity_ref})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-stone-400">
                  {new Date(entry.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
