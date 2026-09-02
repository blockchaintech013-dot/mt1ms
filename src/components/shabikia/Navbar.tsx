import { useState } from "react";
import { Menu, Plane, RotateCcw, User, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { KSH } from "@/lib/shabikia";

const LINKS = ["Home", "Aviator", "Games", "Promotions", "How to Play"];

export function Navbar({ balance, onReset }: { balance: number; onReset: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-red)] red-glow">
            <Plane className="size-5 -rotate-45 text-primary-foreground" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold tracking-wide">
              SHABIKIA <span className="text-primary text-glow">BET</span>
            </p>
            <p className="truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Virtual play only
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l}
              href="#game"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-primary/50 bg-primary/10 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:inline">
            Demo Mode
          </span>
          <div className="hidden rounded-xl border border-border bg-card/70 px-3 py-1.5 text-right sm:block">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Demo Balance
            </p>
            <p className="font-display text-sm font-bold text-success">{KSH(balance)}</p>
          </div>
          <button
            onClick={onReset}
            title="Reset demo"
            className="hidden size-9 place-items-center rounded-xl border border-border bg-card/70 text-muted-foreground transition-colors hover:text-primary sm:grid"
          >
            <RotateCcw className="size-4" />
          </button>
          <span className="hidden size-9 place-items-center rounded-xl bg-secondary text-foreground sm:grid">
            <User className="size-4" />
          </span>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="grid size-9 place-items-center rounded-xl border border-border bg-card/70 lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/70 lg:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {LINKS.map((l) => (
                <a
                  key={l}
                  href="#game"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {l}
                </a>
              ))}
              <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                <span className="text-xs text-muted-foreground">Demo Balance</span>
                <span className="font-display text-sm font-bold text-success">{KSH(balance)}</span>
              </div>
              <button
                onClick={() => {
                  onReset();
                  setOpen(false);
                }}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground"
              >
                Reset demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
