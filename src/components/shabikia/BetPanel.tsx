import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus, TrendingUp, Wallet } from "lucide-react";
import { KSH, KSH0 } from "@/lib/shabikia";
import type { CrashGame } from "@/hooks/useCrashGame";

const PRESETS = [10, 50, 100, 500, 1000];

export function BetPanel({ game }: { game: CrashGame }) {
  const {
    phase,
    betAmount,
    setBetAmount,
    activeBet,
    queuedBet,
    cashedOutAt,
    lastWin,
    multiplier,
    balance,
    placeBet,
    cancelBet,
    cashOut,
  } = game;

  const hasBet = activeBet != null || queuedBet != null;
  const canCashOut = phase === "flying" && activeBet != null && cashedOutAt == null;
  const potential = activeBet != null ? activeBet * multiplier : 0;

  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Bet Amount
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wallet className="size-3.5" /> {KSH(balance)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBetAmount((a) => Math.max(10, a - 10))}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-foreground transition-colors hover:border-primary"
            >
              <Minus className="size-4" />
            </button>
            <div className="flex min-w-0 flex-1 items-center rounded-xl border border-input bg-background/70 px-3">
              <span className="shrink-0 text-sm text-muted-foreground">KSh</span>
              <input
                type="number"
                value={betAmount}
                min={10}
                onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                disabled={hasBet}
                className="w-full min-w-0 bg-transparent px-2 py-2.5 font-display text-lg font-bold tabular-nums outline-none disabled:opacity-60"
              />
            </div>
            <button
              onClick={() => setBetAmount((a) => a + 10)}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-foreground transition-colors hover:border-primary"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                disabled={hasBet}
                onClick={() => setBetAmount(p)}
                className={`rounded-lg border px-1 py-2 text-xs font-semibold tabular-nums transition-colors disabled:opacity-50 ${
                  betAmount === p
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {KSH0(p).replace("KSh ", "")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3">
          <AnimatePresence mode="wait">
            {canCashOut ? (
              <motion.button
                key="cash"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={cashOut}
                className="w-full rounded-2xl bg-success px-4 py-5 font-display text-lg font-black uppercase tracking-wider text-success-foreground shadow-[0_0_38px_-10px_oklch(0.72_0.18_150)]"
              >
                Cash Out {KSH(potential)}
              </motion.button>
            ) : hasBet ? (
              <motion.button
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={cancelBet}
                disabled={phase === "flying" && activeBet != null}
                className="w-full rounded-2xl border border-warning/60 bg-warning/10 px-4 py-5 font-display text-lg font-black uppercase tracking-wider text-warning disabled:opacity-70"
              >
                {queuedBet != null ? "Cancel — Queued Next Round" : "Cancel Bet"}
              </motion.button>
            ) : (
              <motion.button
                key="bet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={placeBet}
                disabled={betAmount <= 0 || betAmount > balance}
                className="w-full rounded-2xl bg-[image:var(--gradient-red)] px-4 py-5 font-display text-lg font-black uppercase tracking-wider text-primary-foreground red-glow transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                Bet {KSH0(betAmount)}
              </motion.button>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border border-border bg-background/50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Your wager</p>
              <p className="font-display text-sm font-bold tabular-nums">
                {hasBet ? KSH(activeBet ?? queuedBet ?? 0) : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background/50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Potential</p>
              <p className="font-display text-sm font-bold tabular-nums text-primary">
                {activeBet != null && phase === "flying" ? KSH(potential) : "—"}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {cashedOutAt != null && lastWin != null && (
              <motion.p
                initial={{ y: 10, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 rounded-xl border border-success/50 bg-success/10 px-3 py-2 font-display text-sm font-bold text-success"
              >
                <TrendingUp className="size-4" /> YOU WON {KSH(lastWin)} @ {cashedOutAt.toFixed(2)}x
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
     
    </div>
  );
}
