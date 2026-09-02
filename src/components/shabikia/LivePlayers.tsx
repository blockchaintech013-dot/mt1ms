import { motion, AnimatePresence } from "motion/react";
import { Users } from "lucide-react";
import { KSH0, type FeedEvent } from "@/lib/shabikia";

const DOT: Record<FeedEvent["status"], string> = {
  betting: "bg-muted-foreground",
  flying: "bg-warning",
  won: "bg-success",
  lost: "bg-destructive",
};

function line(e: FeedEvent) {
  switch (e.status) {
    case "betting":
      return `Bet ${KSH0(e.amount)}`;
    case "flying":
      return `Flying @ ${e.multiplier?.toFixed(2)}x`;
    case "won":
      return `Won ${KSH0(e.payout ?? 0)} @ ${e.multiplier?.toFixed(2)}x`;
    default:
      return `Lost ${KSH0(e.amount)}`;
  }
}

export function LivePlayers({ feed, players }: { feed: FeedEvent[]; players: number }) {
  return (
    <section className="glass-card p-4">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <h2 className="truncate font-display text-sm font-bold uppercase tracking-[0.2em]">
          Live Players
        </h2>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
          <Users className="size-3.5" /> {players.toLocaleString()}
        </span>
      </header>

      <div className="mt-3 flex flex-col gap-2 overflow-hidden">
        <AnimatePresence initial={false}>
          {feed.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className={`size-2 shrink-0 rounded-full ${DOT[e.status]}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.name}</p>
                  <p className="truncate text-[11px] tabular-nums text-muted-foreground">{e.phone}</p>
                </div>
              </div>
              <p
                className={`shrink-0 text-right font-display text-xs font-bold tabular-nums ${
                  e.status === "won"
                    ? "text-success"
                    : e.status === "lost"
                      ? "text-destructive"
                      : e.status === "flying"
                        ? "text-warning"
                        : "text-muted-foreground"
                }`}
              >
                {line(e)}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
