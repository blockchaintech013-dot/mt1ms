
import { useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import type { Phase } from "@/lib/shabikia";


/** Original Ushindi aircraft artwork. */
function Jet({ crashed }: { crashed: boolean }) {
  return (
    <img
      src="/ushindi-plane.png"
      alt="Ushindi aircraft"
      draggable={false}
      data-crashed={crashed}
      className="h-auto w-[120px] drop-shadow-[0_10px_18px_rgba(225,29,42,0.45)] sm:w-[170px]"
    />
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
  const stageRef = useRef<HTMLDivElement>(null);
  const curveRef = useRef<HTMLCanvasElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

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

  /**
   * Ushindi-style flight animation.
   *
   * Draws the flight curve on Canvas and positions
   * the plane along the curve using the multiplier.
   */
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = curveRef.current;
    const plane = planeRef.current;

    if (!stage || !canvas || !plane) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const resizeCanvas = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /**
     * Draw one animation frame.
     * The multiplier controls the plane's progress.
     */
    const drawFlight = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;

      if (!w || !h) return;

      const t = performance.now() / 1000;

      // Ushindi flight progression formula.
      const p = Math.min(Math.max((multiplier - 1) / 9, 0), 1);

      const tipx =
        0.04 * w + Math.pow(p, 0.92) * 0.88 * w;

      const tipy =
        0.92 * h -
        Math.pow(p, 0.62) * 0.80 * h +
        Math.sin(t * 2.1) * 10 * (0.4 + p);

      const x0 = 0.04 * w;
      const y0 = 0.92 * h;

      const c1x = x0 + (tipx - x0) * 0.55;
      const c1y = y0 + 8;

      const c2x = x0 + (tipx - x0) * 0.80;
      const c2y = tipy + (y0 - tipy) * 0.55;

      // Clear previous frame.
      ctx.clearRect(0, 0, w, h);

      // Draw the filled flight area.
      ctx.beginPath();
      ctx.moveTo(x0, y0);

      ctx.bezierCurveTo(
        c1x,
        c1y,
        c2x,
        c2y,
        tipx,
        tipy,
      );

      ctx.lineTo(tipx, y0);
      ctx.closePath();

      const fillGradient = ctx.createLinearGradient(
        0,
        y0,
        0,
        tipy,
      );

      fillGradient.addColorStop(
        0,
        "rgba(225,29,42,0.05)",
      );

      fillGradient.addColorStop(
        1,
        "rgba(225,29,42,0.42)",
      );

      ctx.fillStyle = fillGradient;
      ctx.fill();

      // Draw the red flight curve.
      ctx.beginPath();
      ctx.moveTo(x0, y0);

      ctx.bezierCurveTo(
        c1x,
        c1y,
        c2x,
        c2y,
        tipx,
        tipy,
      );

      ctx.lineWidth = 4;
      ctx.strokeStyle = "#e11d2a";
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(225,29,42,0.6)";
      ctx.shadowBlur = 12;

      ctx.stroke();

      ctx.shadowBlur = 0;

      // Calculate the direction of the plane.
      const angle =
        Math.atan2(tipy - c2y, tipx - c2x) *
        (180 / Math.PI);

      // Position the plane along the flight curve.
      const planeWidth = plane.offsetWidth;
      const planeHeight = plane.offsetHeight;

      plane.style.left = `${tipx - planeWidth * 0.80}px`;

      plane.style.bottom = `${
        h - tipy - planeHeight * 0.42
      }px`;

      // Rotate the plane to follow the curve.
      const rotation = Math.max(
        -20,
        Math.min(4, angle),
      );

      plane.style.transform = `rotate(${rotation}deg)`;
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      drawFlight();
    });

    resizeObserver.observe(stage);

    if (phase === "flying") {
      plane.style.opacity = "1";

      const animate = () => {
        drawFlight();
        raf = requestAnimationFrame(animate);
      };

      animate();
    } else {
      cancelAnimationFrame(raf);

      if (phase === "crashed") {
        plane.style.opacity = "0";
      } else {
        plane.style.opacity = "1";
        drawFlight();
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [phase, multiplier]);

  return (
    <div
      id="game"
      ref={stageRef}
      className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-[image:var(--gradient-sky)] sm:aspect-[16/9]"
    >
      {/* Background stars */}
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-foreground/60"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
          }}
          animate={{
            opacity: [0.15, 0.8, 0.15],
          }}
          transition={{
            duration: 3 + s.delay,
            repeat: Infinity,
            delay: s.delay,
          }}
        />
      ))}

      {/* Crash background overlay */}
      <motion.div
        className="absolute inset-0 bg-destructive/25"
        animate={{
          opacity: phase === "crashed" ? 1 : 0,
        }}
        transition={{
          duration: 0.35,
        }}
      />

      {/* Ushindi-style Canvas flight curve */}
      <canvas
        ref={curveRef}
        className="pointer-events-none absolute inset-0 size-full"
      />

      {/* Plane following the Canvas curve */}
      <div
        ref={planeRef}
        className="absolute z-[4] pointer-events-none"
        style={{
          left: "4%",
          bottom: "8%",
          opacity: phase === "crashed" ? 0 : 1,
        }}
      >
        <Jet crashed={phase === "crashed"} />
      </div>

      {/* Game status and multiplier */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">

        {phase === "starting" && (
          <motion.div
            key="start"
            initial={{
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
          >
            <p className="font-display text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Round starting
            </p>

            <motion.p
              key={countdown}
              initial={{
                scale: 1.5,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              className="font-display text-7xl font-black text-primary text-glow sm:text-8xl"
            >
              {countdown === 0 ? "GO" : countdown}
            </motion.p>
          </motion.div>
        )}

        {phase === "flying" && (
          <div>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-success">
              Flying
            </p>

            <p className="font-display text-6xl font-black tabular-nums text-foreground text-glow sm:text-8xl">
              {multiplier.toFixed(2)}x
            </p>
          </div>
        )}

        {phase === "crashed" && (
          <motion.div
            initial={{
              scale: 1.3,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
          >
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
