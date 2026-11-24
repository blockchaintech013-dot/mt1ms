
import { supabase } from "@/lib/supabase";

export type BettingSlot = "slot1" | "slot2";

export async function placeCrashBet(
  slot: BettingSlot,
  amount: number
) {
  const { data, error } = await supabase.rpc(
    "place_crash_bet",
    {
      p_slot: slot,
      p_amount: amount,
    }
  );

  if (error) throw error;

  return data;
}

export async function cancelCrashBet(slot: BettingSlot) {
  const { data, error } = await supabase.rpc(
    "cancel_crash_bet",
    {
      p_slot: slot,
    }
  );

  if (error) throw error;

  return data;
}

export async function cashoutCrashBet(slot: BettingSlot) {
  const { data, error } = await supabase.rpc(
    "cashout_crash_bet",
    {
      p_slot: slot,
    }
  );

  if (error) throw error;

  return data;
}
