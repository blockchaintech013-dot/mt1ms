export const KSH = (n: number) =>
  "KSh " +
  n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const KSH0 = (n: number) =>
  "KSh " + Math.round(n).toLocaleString("en-KE");

export type Phase = "starting" | "flying" | "crashed";

export type RoundResult = {
  id: string;
  multiplier: number;
  players: number;
  bets: number;
};

export type BetRecord = {
  id: string;
  round: string;
  amount: number;
  cashOut: number | null;
  won: number | null;
};

export type FeedEvent = {
  id: string;
  name: string;
  phone: string;
  status: "betting" | "flying" | "won" | "lost";
  amount: number;
  multiplier?: number;
  payout?: number;
};

const FIRST = [
  "Brian",
  "Kevin",
  "Sarah",
  "Daniel",
  "Mercy",
  "John",
  "Achieng",
  "Peter",
  "Faith",
  "Otieno",
  "Njeri",
  "Wanjiku",
  "Collins",
  "Amina",
  "Dennis",
  "Grace",
];
const LAST = "MKTWSJANOPBLCDEG".split("");

export const randomName = () =>
  `${FIRST[Math.floor(Math.random() * FIRST.length)]} ${LAST[Math.floor(Math.random() * LAST.length)]}.`;

export const maskedPhone = () => {
  const a = Math.floor(Math.random() * 90 + 10);
  const b = Math.floor(Math.random() * 90 + 10);
  return `07${a}****${b}`;
};

/** House-edge style crash distribution, purely simulated. */
export const drawCrashPoint = () => {
  const r = Math.random();
  if (r < 0.04) return 1.0;
  const value = 0.98 / (1 - r);
  return Math.min(Math.round(value * 100) / 100, 42);
};

export const roundId = (n: number) => `SHB-${n}`;

export const multiplierTone = (m: number) =>
  m < 1.5 ? "low" : m < 3 ? "mid" : m < 10 ? "high" : "epic";
