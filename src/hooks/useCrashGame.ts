import { useCallback, useEffect, useRef, useState } from "react";
import {
  drawCrashPoint,
  maskedPhone,
  randomName,
  roundId,
  type BetRecord,
  type FeedEvent,
  type Phase,
  type RoundResult,
} from "@/lib/shabikia";

const START_BALANCE = 10000;
const COUNTDOWN_MS = 4000;
const CRASH_HOLD_MS = 3200;

let uid = 0;
const nextId = () => `e${++uid}`;

export function useCrashGame() {
  const [phase, setPhase] = useState<Phase>("starting");
  const [multiplier, setMultiplier] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [roundNumber, setRoundNumber] = useState(48291);
  const [crashPoint, setCrashPoint] = useState(2);

  const [balance, setBalance] = useState(START_BALANCE);
  const [betAmount, setBetAmount] = useState(100);
  const [activeBet, setActiveBet] = useState<number | null>(null);
  const [queuedBet, setQueuedBet] = useState<number | null>(null);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const [history, setHistory] = useState<BetRecord[]>([]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [players, setPlayers] = useState(1284);
  const [potBets, setPotBets] = useState(184500);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const activeBetRef = useRef(activeBet);
  activeBetRef.current = activeBet;
  const cashedRef = useRef(cashedOutAt);
  cashedRef.current = cashedOutAt;
  const roundRef = useRef(roundNumber);
  roundRef.current = roundNumber;

  const settleLoss = useCallback(() => {
    const amount = activeBetRef.current;
    if (amount == null || cashedRef.current != null) return;
    setHistory((h) => [
      { id: nextId(), round: roundId(roundRef.current), amount, cashOut: null, won: null },
      ...h,
    ]);
  }, []);

  /* Main game loop */
  useEffect(() => {
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;

    const startCountdown = () => {
      setPhase("starting");
      setMultiplier(1);
      setCashedOutAt(null);
      setLastWin(null);
      setCountdown(3);
      const point = drawCrashPoint();
      setCrashPoint(point);
      setPlayers(900 + Math.floor(Math.random() * 900));
      setPotBets(80000 + Math.floor(Math.random() * 260000));

      let c = 3;
      const tick = setInterval(() => {
        c -= 1;
        setCountdown(Math.max(c, 0));
        if (c <= 0) clearInterval(tick);
      }, 1000);

      timer = setTimeout(() => {
        clearInterval(tick);
        setActiveBet((prevActive) => prevActive);
        setQueuedBet((q) => {
          if (q != null) setActiveBet(q);
          return null;
        });
        fly(point);
      }, COUNTDOWN_MS);
    };

    const fly = (point: number) => {
      setPhase("flying");
      const t0 = performance.now();
      const step = (t: number) => {
        const elapsed = (t - t0) / 1000;
        const m = Math.round(Math.pow(Math.E, 0.16 * elapsed) * 100) / 100;
        if (m >= point) {
          setMultiplier(point);
          setPhase("crashed");
          settleLoss();
          setActiveBet(null);
          setResults((r) => [
            {
              id: roundId(roundRef.current),
              multiplier: point,
              players: 900 + Math.floor(Math.random() * 900),
              bets: 80000 + Math.floor(Math.random() * 260000),
            },
            ...r,
          ].slice(0, 14));
          timer = setTimeout(() => {
            setRoundNumber((n) => n + 1);
            startCountdown();
          }, CRASH_HOLD_MS);
          return;
        }
        setMultiplier(m);
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    startCountdown();
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [settleLoss]);

  /* Simulated live player feed */
  useEffect(() => {
    const id = setInterval(() => {
      const amount = [10, 50, 100, 200, 500, 1000][Math.floor(Math.random() * 6)] ?? 100;
      const roll = Math.random();
      const mult = Math.round((1.05 + Math.random() * 4) * 100) / 100;
      const event: FeedEvent =
        roll < 0.3
          ? { id: nextId(), name: randomName(), phone: maskedPhone(), status: "betting", amount }
          : roll < 0.5
            ? {
                id: nextId(),
                name: randomName(),
                phone: maskedPhone(),
                status: "flying",
                amount,
                multiplier: mult,
              }
            : roll < 0.85
              ? {
                  id: nextId(),
                  name: randomName(),
                  phone: maskedPhone(),
                  status: "won",
                  amount,
                  multiplier: mult,
                  payout: Math.round(amount * mult * 100) / 100,
                }
              : { id: nextId(), name: randomName(), phone: maskedPhone(), status: "lost", amount };
      setFeed((f) => [event, ...f].slice(0, 9));
    }, 1600);
    return () => clearInterval(id);
  }, []);

  const placeBet = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return;
    setBalance((b) => b - betAmount);
    if (phaseRef.current === "flying") setQueuedBet(betAmount);
    else setActiveBet(betAmount);
  }, [betAmount, balance]);

  const cancelBet = useCallback(() => {
    const amount = activeBet ?? queuedBet;
    if (amount == null || (activeBet != null && phase === "flying")) return;
    setBalance((b) => b + amount);
    setActiveBet(null);
    setQueuedBet(null);
  }, [activeBet, queuedBet, phase]);

  const cashOut = useCallback(() => {
    if (phase !== "flying" || activeBet == null || cashedOutAt != null) return;
    const payout = Math.round(activeBet * multiplier * 100) / 100;
    setBalance((b) => b + payout);
    setCashedOutAt(multiplier);
    setLastWin(payout);
    setHistory((h) => [
      {
        id: nextId(),
        round: roundId(roundNumber),
        amount: activeBet,
        cashOut: multiplier,
        won: payout,
      },
      ...h,
    ]);
    setActiveBet(null);
  }, [phase, activeBet, cashedOutAt, multiplier, roundNumber]);

  const resetDemo = useCallback(() => {
    setBalance(START_BALANCE);
    setHistory([]);
    setResults([]);
    setActiveBet(null);
    setQueuedBet(null);
    setCashedOutAt(null);
    setLastWin(null);
    setBetAmount(100);
  }, []);

  return {
    phase,
    multiplier,
    countdown,
    crashPoint,
    roundNumber,
    balance,
    betAmount,
    setBetAmount,
    activeBet,
    queuedBet,
    cashedOutAt,
    lastWin,
    history,
    results,
    feed,
    players,
    potBets,
    placeBet,
    cancelBet,
    cashOut,
    resetDemo,
  };
}

export type CrashGame = ReturnType<typeof useCrashGame>;
