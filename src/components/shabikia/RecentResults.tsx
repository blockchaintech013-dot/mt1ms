import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { KSH0, multiplierTone, type RoundResult } from "@/lib/shabikia";

const TONE: Record<string, string> = {
  low: "border-border bg-secondary text-muted-foreground",
  mid: "border-primary/40 bg-primary/10 text-primary",
  high: "border-warning/50 bg-warning/10 text-warning",
  epic: "border-success/50 bg-success/15 text-success",
};

export function RecentResults({ results }: { results: RoundResult[] }) {
  const [selected, setSelected] = useState<RoundResult | null>(null);

  return (
    <section className="glass-card p-4">
      <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">Recent Results</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {results.length === 0 && (
          <p className="text-xs text-muted-foreground">Waiting for the first flight to finish…</p>
        )}
        <AnimatePresence initial={false}>
          {results.map((r) => (
            <motion.button
              key={r.id}
              layout
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelected(selected?.id === r.id ? null : r)}
              className={`rounded-full border px-3 py-1 font-display text-xs font-bold tabular-nums transition-transform hover:scale-105 ${TONE[multiplierTone(r.multiplier)]}`}
            >
              {r.multiplier.toFixed(2)}x
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-background/50 p-3 text-xs">
              <p className="text-muted-foreground">Round</p>
              <p className="text-right font-medium">{selected.id}</p>
              <p className="text-muted-foreground">Crash multiplier</p>
              <p className="text-right font-medium text-primary">{selected.multiplier.toFixed(2)}x</p>
              <p className="text-muted-foreground">Simulated players</p>
              <p className="text-right font-medium">{selected.players.toLocaleString()}</p>
              <p className="text-muted-foreground">Simulated bets</p>
              <p className="text-right font-medium">{KSH0(selected.bets)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
