import { Activity, BarChart3, Flame, Layers, TrendingUp, Users } from "lucide-react";
import { KSH0, roundId, type Phase, type RoundResult } from "@/lib/shabikia";

export function RoundStatistics({
  results,
  players,
  potBets,
  roundNumber,
  phase,
}: {
  results: RoundResult[];
  players: number;
  potBets: number;
  roundNumber: number;
  phase: Phase;
}) {
  const highest = results.length ? Math.max(...results.map((r) => r.multiplier)) : 0;
  const avg = results.length
    ? results.reduce((s, r) => s + r.multiplier, 0) / results.length
    : 0;
  const last = results[0]?.multiplier ?? 0;

  const cards = [
    { icon: Users, label: "Players", value: players.toLocaleString() },
    { icon: Layers, label: "Demo Bets", value: KSH0(potBets) },
    { icon: Flame, label: "Highest Multiplier", value: highest ? `${highest.toFixed(2)}x` : "—" },
    { icon: BarChart3, label: "Average Multiplier", value: avg ? `${avg.toFixed(2)}x` : "—" },
    { icon: TrendingUp, label: "Last Crash", value: last ? `${last.toFixed(2)}x` : "—" },
    { icon: Activity, label: "Current Round", value: roundId(roundNumber) },
  ];

  return (
    <section className="glass-card p-4">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <h2 className="truncate font-display text-sm font-bold uppercase tracking-[0.2em]">
          Round Statistics
        </h2>
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {phase}
        </span>
      </header>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-background/50 p-3">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <c.icon className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{c.label}</span>
            </p>
            <p className="mt-1 truncate font-display text-base font-bold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
