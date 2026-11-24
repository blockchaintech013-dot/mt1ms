
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { drawCrashPoint } from "./crashPoint";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const ENGINE_INSTANCE_ID =
  process.env.ENGINE_INSTANCE_ID || randomUUID();

const LEASE_SECONDS = Number(process.env.ENGINE_LEASE_SECONDS || 15);
const LEASE_RENEW_INTERVAL_MS = 5000;

const ROUND_START_DELAY_MS = Number(
  process.env.ROUND_START_DELAY_MS || 4000
);

const CRASH_HOLD_MS = Number(
  process.env.CRASH_HOLD_MS || 3200
);

const ENGINE_TICK_MS = Number(
  process.env.ENGINE_TICK_MS || 100
);

const SNAPSHOT_INTERVAL_MS = Number(
  process.env.SNAPSHOT_INTERVAL_MS || 250
);

const MULTIPLIER_GROWTH_RATE = 0.16;

type GameState = {
  current_round_id: string | null;
  engine_instance_id: string | null;
  lease_expires_at: string | null;
};

type CrashRound = {
  id: string;
  round_number: number;
  phase: "starting" | "flying" | "crashed";
  created_at: string;
  started_at: string | null;
  crashed_at: string | null;
  crash_point: number;
  multiplier: number;
};

let shuttingDown = false;
let lastLeaseRenewal = 0;
let lastSnapshotUpdate = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(message: string, data?: unknown) {
  console.log(
    `[Crash Engine ${ENGINE_INSTANCE_ID.slice(0, 8)}] ${message}`,
    data ?? ""
  );
}

function calculateMultiplier(elapsedSeconds: number): number {
  const raw = Math.exp(
    MULTIPLIER_GROWTH_RATE * Math.max(elapsedSeconds, 0)
  );

  return Math.floor(raw * 100) / 100;
}

async function renewLease(): Promise<void> {
  const { data, error } = await supabase.rpc("claim_crash_engine", {
    p_instance_id: ENGINE_INSTANCE_ID,
    p_lease_seconds: LEASE_SECONDS,
  });

  if (error) {
    throw new Error(`Could not renew engine lease: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(
      data?.message || "This engine instance does not own the lease."
    );
  }

  lastLeaseRenewal = Date.now();
}

async function ensureLease(): Promise<void> {
  if (
    Date.now() - lastLeaseRenewal >= LEASE_RENEW_INTERVAL_MS
  ) {
    await renewLease();
  }
}

async function getGameState(): Promise<GameState> {
  const { data, error } = await supabase
    .from("crash_game_state")
    .select(
      "current_round_id, engine_instance_id, lease_expires_at"
    )
    .eq("singleton", true)
    .single();

  if (error) {
    throw new Error(`Could not read game state: ${error.message}`);
  }

  if (data.engine_instance_id !== ENGINE_INSTANCE_ID) {
    throw new Error("Engine lease ownership was lost.");
  }

  return data as GameState;
}

async function getCurrentRound(
  roundId: string
): Promise<CrashRound> {
  const { data, error } = await supabase
    .from("crash_rounds")
    .select(
      "id, round_number, phase, created_at, started_at, crashed_at, crash_point, multiplier"
    )
    .eq("id", roundId)
    .single();

  if (error) {
    throw new Error(`Could not read current round: ${error.message}`);
  }

  return data as CrashRound;
}

async function createRound(): Promise<void> {
  const crashPoint = drawCrashPoint();

  const { data, error } = await supabase.rpc(
    "engine_create_crash_round",
    {
      p_instance_id: ENGINE_INSTANCE_ID,
      p_crash_point: crashPoint,
    }
  );

  if (error) {
    throw new Error(`Could not create round: ${error.message}`);
  }

  log("New round created", data);
}

async function startRound(roundId: string): Promise<void> {
  const { data, error } = await supabase.rpc(
    "engine_start_crash_round",
    {
      p_instance_id: ENGINE_INSTANCE_ID,
      p_round_id: roundId,
    }
  );

  if (error) {
    throw new Error(`Could not start round: ${error.message}`);
  }

  log("Round started", data);
  lastSnapshotUpdate = 0;
}

async function updateSnapshot(
  roundId: string,
  multiplier: number
): Promise<void> {
  const { error } = await supabase.rpc(
    "engine_update_crash_snapshot",
    {
      p_instance_id: ENGINE_INSTANCE_ID,
      p_round_id: roundId,
      p_multiplier: multiplier,
    }
  );

  if (error) {
    throw new Error(`Snapshot update failed: ${error.message}`);
  }
}

async function crashRound(roundId: string): Promise<void> {
  const { data, error } = await supabase.rpc(
    "engine_crash_round",
    {
      p_instance_id: ENGINE_INSTANCE_ID,
      p_round_id: roundId,
    }
  );

  if (error) {
    throw new Error(`Could not crash round: ${error.message}`);
  }

  log("Round crashed", data);
}

async function processRound(round: CrashRound): Promise<void> {
  const now = Date.now();

  // ---------------------------------------------
  // STARTING PHASE
  // ---------------------------------------------
  if (round.phase === "starting") {
    const createdAt = new Date(round.created_at).getTime();
    const elapsed = now - createdAt;

    if (elapsed >= ROUND_START_DELAY_MS) {
      await startRound(round.id);
    }

    return;
  }

  // ---------------------------------------------
  // CRASHED PHASE
  // ---------------------------------------------
  if (round.phase === "crashed") {
    if (!round.crashed_at) return;

    const crashedAt = new Date(round.crashed_at).getTime();

    if (now - crashedAt >= CRASH_HOLD_MS) {
      await createRound();
    }

    return;
  }

  // ---------------------------------------------
  // FLYING PHASE
  // ---------------------------------------------
  if (round.phase === "flying") {
    if (!round.started_at) {
      throw new Error("Flying round has no started_at timestamp.");
    }

    const startedAt = new Date(round.started_at).getTime();
    const elapsedSeconds = (now - startedAt) / 1000;

    const multiplier = calculateMultiplier(elapsedSeconds);
    const crashPoint = Number(round.crash_point);

    // The server decides when the round crashes.
    if (multiplier >= crashPoint) {
      await crashRound(round.id);
      return;
    }

    // Persist snapshots at a controlled frequency.
    if (now - lastSnapshotUpdate >= SNAPSHOT_INTERVAL_MS) {
      await updateSnapshot(round.id, multiplier);
      lastSnapshotUpdate = now;
    }
  }
}

async function engineLoop(): Promise<void> {
  log("Engine starting...");

  await renewLease();

  log("Engine lease acquired.");

  while (!shuttingDown) {
    try {
      await ensureLease();

      const state = await getGameState();

      if (!state.current_round_id) {
        await createRound();
        await sleep(ENGINE_TICK_MS);
        continue;
      }

      const round = await getCurrentRound(state.current_round_id);

      await processRound(round);
    } catch (error) {
      log(
        "Engine loop error",
        error instanceof Error ? error.message : error
      );

      // If the lease was lost, do not continue controlling the game.
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("lease")
      ) {
        throw error;
      }

      await sleep(1000);
    }

    await sleep(ENGINE_TICK_MS);
  }
}

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;

  shuttingDown = true;
  log(`Received ${signal}. Releasing engine lease...`);

  try {
    const { error } = await supabase.rpc("release_crash_engine", {
      p_instance_id: ENGINE_INSTANCE_ID,
    });

    if (error) {
      log("Could not release lease", error.message);
    }
  } finally {
    process.exit(0);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

engineLoop().catch((error) => {
  log(
    "Fatal engine error",
    error instanceof Error ? error.message : error
  );

  process.exit(1);
});
