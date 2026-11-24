
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

type BetSlot = {
  activeBet: number | null;
  queuedBet: number | null;
  cashedOutAt: number | null;
  lastWin: number | null;
};

type BetsState = {
  slot1: BetSlot;
  slot2: BetSlot;
};

const emptySlot = (): BetSlot => ({
  activeBet: null,
  queuedBet: null,
  cashedOutAt: null,
  lastWin: null,
});

const emptyBets = (): BetsState => ({
  slot1: emptySlot(),
  slot2: emptySlot(),
});

export function useCrashGame() {
  const [phase, setPhase] = useState<Phase>("starting");
  const [multiplier, setMultiplier] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [roundNumber, setRoundNumber] = useState(48291);
  const [crashPoint, setCrashPoint] = useState(2);

  const [balance, setBalance] = useState(START_BALANCE);

  // Independent bet amount configuration
  const [bet1Amount, setBet1Amount] = useState(100);
  const [bet2Amount, setBet2Amount] = useState(100);

  // Independent betting slots
  const [bets, setBets] = useState<BetsState>(emptyBets());

  const [history, setHistory] = useState<BetRecord[]>([]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [players, setPlayers] = useState(1284);
  const [potBets, setPotBets] = useState(184500);

  // Keep refs synchronized for game-loop callbacks
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const betsRef = useRef(bets);
  betsRef.current = bets;

  const balanceRef = useRef(balance);
  balanceRef.current = balance;

  const roundRef = useRef(roundNumber);
  roundRef.current = roundNumber;

  // Update both slots safely
  const updateBets = useCallback(
    (updater: (current: BetsState) => BetsState) => {
      const next = updater(betsRef.current);
      betsRef.current = next;
      setBets(next);
    },
    []
  );

  /* Settle all remaining active bets when the round crashes */
  const settleLoss = useCallback(() => {
    const current = betsRef.current;

    const losses: BetRecord[] = [];

    (["slot1", "slot2"] as const).forEach((slot) => {
      const bet = current[slot];

      if (bet.activeBet != null) {
        losses.push({
          id: nextId(),
          round: roundId(roundRef.current),
          amount: bet.activeBet,
          cashOut: null,
          won: null,
        });
      }
    });

    if (losses.length > 0) {
      setHistory((h) => [...losses, ...h]);
    }

    updateBets((current) => ({
      ...current,
      slot1: {
        ...current.slot1,
        activeBet: null,
      },
      slot2: {
        ...current.slot2,
        activeBet: null,
      },
    }));
  }, [updateBets]);

  /* Main game loop */
  useEffect(() => {
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;
    let tick: ReturnType<typeof setInterval>;

    const startCountdown = () => {
      setPhase("starting");
      setMultiplier(1);
      setCountdown(3);

      updateBets((current) => ({
        slot1: {
          ...current.slot1,
          cashedOutAt: null,
          lastWin: null,
        },
        slot2: {
          ...current.slot2,
          cashedOutAt: null,
          lastWin: null,
        },
      }));

      const point = drawCrashPoint();
      setCrashPoint(point);

      setPlayers(900 + Math.floor(Math.random() * 900));
      setPotBets(80000 + Math.floor(Math.random() * 260000));

      let c = 3;

      tick = setInterval(() => {
        c -= 1;
        setCountdown(Math.max(c, 0));

        if (c <= 0) {
          clearInterval(tick);
        }
      }, 1000);

      timer = setTimeout(() => {
        clearInterval(tick);

        // Promote queued bets independently into the next round
        updateBets((current) => ({
          slot1: {
            ...current.slot1,
            activeBet:
              current.slot1.queuedBet ?? current.slot1.activeBet,
            queuedBet: null,
          },
          slot2: {
            ...current.slot2,
            activeBet:
              current.slot2.queuedBet ?? current.slot2.activeBet,
            queuedBet: null,
          },
        }));

        fly(point);
      }, COUNTDOWN_MS);
    };

    const fly = (point: number) => {
      setPhase("flying");

      const t0 = performance.now();

      const step = (t: number) => {
        const elapsed = (t - t0) / 1000;

        const m =
          Math.round(Math.pow(Math.E, 0.16 * elapsed) * 100) / 100;

        if (m >= point) {
          setMultiplier(point);
          setPhase("crashed");

          settleLoss();

          setResults((r) =>
            [
              {
                id: roundId(roundRef.current),
                multiplier: point,
                players: 900 + Math.floor(Math.random() * 900),
                bets: 80000 + Math.floor(Math.random() * 260000),
              },
              ...r,
            ].slice(0, 14)
          );

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
      clearInterval(tick);
    };
  }, [settleLoss, updateBets]);

  /* Simulated live player feed */
  useEffect(() => {
    const id = setInterval(() => {
      const amount =
        [10, 50, 100, 200, 500, 1000][
          Math.floor(Math.random() * 6)
        ] ?? 100;

      const roll = Math.random();

      const mult =
        Math.round((1.05 + Math.random() * 4) * 100) / 100;

      const event: FeedEvent =
        roll < 0.3
          ? {
              id: nextId(),
              name: randomName(),
              phone: maskedPhone(),
              status: "betting",
              amount,
            }
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
              : {
                  id: nextId(),
                  name: randomName(),
                  phone: maskedPhone(),
                  status: "lost",
                  amount,
                };

      setFeed((f) => [event, ...f].slice(0, 9));
    }, 1600);

    return () => clearInterval(id);
  }, []);

  /* Place a bet in a specific slot */
  const placeBetForSlot = useCallback(
    (slot: "slot1" | "slot2", amount: number) => {
      const current = betsRef.current[slot];

      if (amount <= 0 || amount > balanceRef.current) return;

      // One bet per slot at a time
      if (current.activeBet != null || current.queuedBet != null) return;

      setBalance((b) => {
        const next = b - amount;
        balanceRef.current = next;
        return next;
      });

      const bet = {
        activeBet: phaseRef.current === "flying" ? null : amount,
        queuedBet: phaseRef.current === "flying" ? amount : null,
        cashedOutAt: null,
        lastWin: null,
      };

      updateBets((current) => ({
        ...current,
        [slot]: bet,
      }));
    },
    [updateBets]
  );

  /* Bet button 1 */
  const placeBet1 = useCallback(() => {
    placeBetForSlot("slot1", bet1Amount);
  }, [placeBetForSlot, bet1Amount]);

  /* Bet button 2 */
  const placeBet2 = useCallback(() => {
    placeBetForSlot("slot2", bet2Amount);
  }, [placeBetForSlot, bet2Amount]);

  /* Cancel a bet in a specific slot */
  const cancelBetForSlot = useCallback(
    (slot: "slot1" | "slot2") => {
      const current = betsRef.current[slot];

      const amount = current.activeBet ?? current.queuedBet;

      if (amount == null) return;

      // Active bets cannot be cancelled once flying
      if (current.activeBet != null && phaseRef.current === "flying") {
        return;
      }

      updateBets((current) => ({
        ...current,
        [slot]: emptySlot(),
      }));

      setBalance((b) => {
        const next = b + amount;
        balanceRef.current = next;
        return next;
      });
    },
    [updateBets]
  );

  const cancelBet1 = useCallback(() => {
    cancelBetForSlot("slot1");
  }, [cancelBetForSlot]);

  const cancelBet2 = useCallback(() => {
    cancelBetForSlot("slot2");
  }, [cancelBetForSlot]);

  /* Cash out a specific slot independently */
  const cashOutForSlot = useCallback(
    (slot: "slot1" | "slot2") => {
      const current = betsRef.current[slot];

      if (
        phaseRef.current !== "flying" ||
        current.activeBet == null ||
        current.cashedOutAt != null
      ) {
        return;
      }

      const amount = current.activeBet;
      const cashoutMultiplier = multiplier;

      const payout =
        Math.round(amount * cashoutMultiplier * 100) / 100;

      // Mark this slot as cashed out without touching the other slot
      updateBets((current) => ({
        ...current,
        [slot]: {
          ...current[slot],
          activeBet: null,
          cashedOutAt: cashoutMultiplier,
          lastWin: payout,
        },
      }));

      setBalance((b) => {
        const next = b + payout;
        balanceRef.current = next;
        return next;
      });

      setHistory((h) => [
        {
          id: nextId(),
          round: roundId(roundRef.current),
          amount,
          cashOut: cashoutMultiplier,
          won: payout,
        },
        ...h,
      ]);
    },
    [multiplier, updateBets]
  );

  const cashOut1 = useCallback(() => {
    cashOutForSlot("slot1");
  }, [cashOutForSlot]);

  const cashOut2 = useCallback(() => {
    cashOutForSlot("slot2");
  }, [cashOutForSlot]);

  /* Reset demo */
  const resetDemo = useCallback(() => {
    balanceRef.current = START_BALANCE;

    setBalance(START_BALANCE);
    setBets(emptyBets());

    setHistory([]);
    setResults([]);

    setBet1Amount(100);
    setBet2Amount(100);
  }, []);

  // Slot 1 values
  const activeBet1 = bets.slot1.activeBet;
  const queuedBet1 = bets.slot1.queuedBet;
  const cashedOutAt1 = bets.slot1.cashedOutAt;
  const lastWin1 = bets.slot1.lastWin;

  // Slot 2 values
  const activeBet2 = bets.slot2.activeBet;
  const queuedBet2 = bets.slot2.queuedBet;
  const cashedOutAt2 = bets.slot2.cashedOutAt;
  const lastWin2 = bets.slot2.lastWin;

  return {
    phase,
    multiplier,
    countdown,
    crashPoint,
    roundNumber,
    balance,

    // Independent amount configurations
    bet1Amount,
    setBet1Amount,
    bet2Amount,
    setBet2Amount,

    // Slot 1
    activeBet1,
    queuedBet1,
    cashedOutAt1,
    lastWin1,
    placeBet1,
    cancelBet1,
    cashOut1,

    // Slot 2
    activeBet2,
    queuedBet2,
    cashedOutAt2,
    lastWin2,
    placeBet2,
    cancelBet2,
    cashOut2,

    // Shared game information
    history,
    results,
    feed,
    players,
    potBets,

    resetDemo,

    // Legacy aliases: preserve compatibility with older components
    betAmount: bet1Amount,
    setBetAmount: setBet1Amount,
    activeBet: activeBet1,
    queuedBet: queuedBet1,
    cashedOutAt: cashedOutAt1,
    lastWin: lastWin1,
    placeBet: placeBet1,
    cancelBet: cancelBet1,
    cashOut: cashOut1,
  };
}

export type CrashGame = ReturnType<typeof useCrashGame>;
