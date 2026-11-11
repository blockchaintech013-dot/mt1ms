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
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-5">
      

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
                <p className="font-display text-sm font-bold">The baddest</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Balance
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
