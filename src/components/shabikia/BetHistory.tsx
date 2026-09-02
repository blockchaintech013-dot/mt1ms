import { motion, AnimatePresence } from "motion/react";
import { KSH, type BetRecord } from "@/lib/shabikia";

export function BetHistory({ history }: { history: BetRecord[] }) {
  return (
    <section className="glass-card p-4">
      <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">My Demo Bets</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[380px] text-left text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 font-medium">Round</th>
              <th className="pb-2 font-medium">Bet</th>
              <th className="pb-2 font-medium">Cash Out</th>
              <th className="pb-2 text-right font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {history.slice(0, 8).map((h) => (
                <motion.tr
                  key={h.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="border-t border-border/60"
                >
                  <td className="py-2 tabular-nums text-muted-foreground">{h.round}</td>
                  <td className="py-2 tabular-nums">{KSH(h.amount)}</td>
                  <td className="py-2 tabular-nums">{h.cashOut ? `${h.cashOut.toFixed(2)}x` : "—"}</td>
                  <td
                    className={`py-2 text-right font-semibold tabular-nums ${h.won ? "text-success" : "text-destructive"}`}
                  >
                    {h.won ? `Won ${KSH(h.won)}` : "Lost"}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {history.length === 0 && (
          <p className="py-3 text-xs text-muted-foreground">
            No demo bets yet — place one to start your simulated history.
          </p>
        )}
      </div>
    </section>
  );
}
