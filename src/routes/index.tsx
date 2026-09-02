import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { Navbar } from "@/components/shabikia/Navbar";
import { FlightAnimation } from "@/components/shabikia/FlightAnimation";
import { BetPanel } from "@/components/shabikia/BetPanel";
import { LivePlayers } from "@/components/shabikia/LivePlayers";
import { RecentResults } from "@/components/shabikia/RecentResults";
import { RoundStatistics } from "@/components/shabikia/RoundStatistics";
import { BetHistory } from "@/components/shabikia/BetHistory";
import { HowToPlay } from "@/components/shabikia/HowToPlay";
import { useCrashGame } from "@/hooks/useCrashGame";
import { KSH, KSH0, roundId } from "@/lib/shabikia";

const TITLE = "Shabikia Bet — Shabikia Crash Demo Game";
const DESC =
  "Shabikia Crash: a free, frontend-only crash game prototype with rising multipliers, demo cash-outs, live player feed and virtual balance. No real money.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const game = useCrashGame();

  return (
    <div className="min-h-screen">
      <Navbar balance={game.balance} onReset={game.resetDemo} />

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-5">
        <div className="grid gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <p className="text-xs text-muted-foreground">
            <span className="font-display font-bold text-primary">DEMO MODE</span> — Shabikia Bet is
            a simulation. Virtual money only; nothing here is a real wager.
          </p>
          <button
            onClick={game.resetDemo}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 font-display text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <RotateCcw className="size-3.5" /> Reset Demo
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <section className="glass-card p-4 sm:p-5">
              <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h1 className="truncate font-display text-xl font-black uppercase tracking-wide sm:text-2xl">
                    Shabikia <span className="text-primary text-glow">Crash</span>
                  </h1>
                  <p className="truncate text-xs text-muted-foreground">
                    Cash out before the flight ends
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-xs tabular-nums text-muted-foreground">
                    Round #{roundId(game.roundNumber)}
                  </p>
                  <p className="text-[11px] tabular-nums text-muted-foreground">
                    {game.players.toLocaleString()} Players · {KSH0(game.potBets)} Demo Bets
                  </p>
                </div>
              </header>

              <div className="mt-4">
                <FlightAnimation
                  phase={game.phase}
                  multiplier={game.multiplier}
                  countdown={game.countdown}
                  crashPoint={game.crashPoint}
                />
              </div>
            </section>

            <BetPanel game={game} />

            <section className="glass-card grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Player</p>
                <p className="font-display text-sm font-bold">You (Demo)</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Demo balance
                </p>
                <p className="font-display text-sm font-bold tabular-nums text-success">
                  {KSH(game.balance)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Current bet
                </p>
                <p className="font-display text-sm font-bold tabular-nums">
                  {game.activeBet ?? game.queuedBet
                    ? KSH((game.activeBet ?? game.queuedBet) as number)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
                <p className="font-display text-sm font-bold uppercase text-primary">{game.phase}</p>
              </div>
            </section>

            <BetHistory history={game.history} />
          </div>

          <div className="space-y-4">
            <LivePlayers feed={game.feed} players={game.players} />
            <RecentResults results={game.results} />
            <RoundStatistics
              results={game.results}
              players={game.players}
              potBets={game.potBets}
              roundNumber={game.roundNumber}
              phase={game.phase}
            />
          </div>
        </div>

        <HowToPlay />

        <footer className="py-6 text-center text-[11px] text-muted-foreground">
          SHABIKIA BET · Original demo prototype · Not affiliated with any real betting operator ·
          18+ themed simulation with virtual money only.
        </footer>
      </main>
    </div>
  );
}
