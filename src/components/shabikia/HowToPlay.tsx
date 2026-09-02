import { Coins, PlaneTakeoff, HandCoins, AlertTriangle } from "lucide-react";

const STEPS = [
  {
    icon: Coins,
    title: "1. Place Your Bet",
    text: "Choose a demo betting amount before the round begins.",
  },
  {
    icon: PlaneTakeoff,
    title: "2. Watch The Flight",
    text: "The multiplier increases as the aircraft travels.",
  },
  {
    icon: HandCoins,
    title: "3. Cash Out",
    text: "Press CASH OUT before the flight crashes.",
  },
  {
    icon: AlertTriangle,
    title: "4. Crash",
    text: "If the flight crashes first, the simulated bet is lost.",
  },
];

export function HowToPlay() {
  return (
    <section className="glass-card p-5">
      <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">How To Play</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.title} className="rounded-xl border border-border bg-background/50 p-4">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
              <s.icon className="size-4" />
            </span>
            <p className="mt-3 font-display text-sm font-bold">{s.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-xl border border-primary/40 bg-primary/10 p-3 text-xs text-muted-foreground">
        This is a game simulation, not a real-money betting system. No deposits, withdrawals,
        accounts or payouts exist. All balances reset on refresh.
      </p>
    </section>
  );
}
