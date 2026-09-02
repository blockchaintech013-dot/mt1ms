import { useMemo } from "react";
import { motion } from "motion/react";
import type { Phase } from "@/lib/shabikia";

/** Original stylized delta-jet emblem drawn as SVG for SHABIKIA CRASH. */
function Jet({ crashed }: { crashed: boolean }) {
  return (
    <svg viewBox="0 0 64 40" className="size-14 drop-shadow-[0_0_16px_rgba(255,60,60,0.7)]">
      <defs>
        <linearGradient id="jetBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff5a5a" />
          <stop offset="100%" stopColor="#9b0f19" />
        </linearGradient>
      </defs>
      <path d="M2 26 L26 22 L44 6 L54 8 L44 24 L60 22 L60 27 L44 29 L52 38 L44 38 L30 29 L4 30 Z" fill="url(#jetBody)" />
      <path d="M26 22 L44 24 L44 29 L30 29 Z" fill="#2a0a0d" opacity="0.5" />
      <circle cx="47" cy="26" r="1.8" fill={crashed ? "#ffbf47" : "#ffe3e3"} />
    </svg>
  );
}

export function FlightAnimation({
  phase,
  multiplier,
  countdown,
  crashPoint,
}: {
  phase: Phase;
  multiplier: number;
  countdown: number;
  crashPoint: number;
}) {
  const progress = Math.min((multiplier - 1) / 6, 1);
  const x = 6 + progress * 66;
  const y = 62 - progress * 46;

  const stars = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        top: (i * 53) % 100,
        size: (i % 3) + 1,
        delay: (i % 7) * 0.4,
      })),
    [],
  );

  const path = `M 2 96 Q ${x * 0.7} ${96 - (96 - y) * 0.35} ${x} ${y}`;

  return (
    <div
      id="game"
      className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-[image:var(--gradient-sky)] sm:aspect-[16/9]"
    >
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-foreground/60"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.15, 0.8, 0.15] }}
          transition={{ duration: 3 + s.delay, repeat: Infinity, delay: s.delay }}
        />
      ))}

      <motion.div
        className="absolute inset-0 bg-destructive/25"
        animate={{ opacity: phase === "crashed" ? 1 : 0 }}
        transition={{ duration: 0.35 }}
      />

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="trail" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,60,60,0)" />
            <stop offset="100%" stopColor="rgba(255,80,80,0.95)" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${x} 96 L 2 96 Z`} fill="rgba(220,38,38,0.16)" />
        <path d={path} fill="none" stroke="url(#trail)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
      </svg>

      <motion.div
        className="absolute"
        style={{ left: `${x}%`, top: `${y}%` }}
        animate={
          phase === "crashed"
            ? { x: 140, y: -160, opacity: 0, rotate: 35 }
            : { x: 0, y: [0, -4, 0], opacity: 1, rotate: 0 }
        }
        transition={
          phase === "crashed"
            ? { duration: 0.9, ease: "easeIn" }
            : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <Jet crashed={phase === "crashed"} />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        {phase === "starting" && (
          <motion.div key="start" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Round starting
            </p>
            <motion.p
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-7xl font-black text-primary text-glow sm:text-8xl"
            >
              {countdown === 0 ? "GO" : countdown}
            </motion.p>
          </motion.div>
        )}

        {phase === "flying" && (
          <div>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-success">Flying</p>
            <p className="font-display text-6xl font-black tabular-nums text-foreground text-glow sm:text-8xl">
              {multiplier.toFixed(2)}x
            </p>
          </div>
        )}

        {phase === "crashed" && (
          <motion.div initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <p className="font-display text-3xl font-black uppercase tracking-widest text-destructive sm:text-5xl">
              Flight Crashed
            </p>
            <p className="mt-1 font-display text-5xl font-black tabular-nums text-primary text-glow sm:text-7xl">
              {crashPoint.toFixed(2)}x
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
