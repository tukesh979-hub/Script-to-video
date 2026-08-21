import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { RENDER_COST_CREDITS } from "@/lib/credits-core";

export { RENDER_COST_CREDITS, canAfford } from "@/lib/credits-core";

export type ChargeResult = { ok: true; newBalance: number } | { ok: false; reason: "insufficient_credits" };

/**
 * Atomically charges a user for a render: decrements profiles.credits_balance
 * and appends a credits_ledger row in one round trip (see the
 * charge_credits SQL function), so two concurrent render triggers can't both
 * read the same starting balance and both succeed when only one credit's
 * worth of balance actually existed -- the classic double-spend race this
 * project's "atomic SQL operations for counters" convention exists to avoid.
 *
 * Runs as service_role: there's no "signed-in user" RLS context that would
 * let a normal client both read-and-decrement atomically in one statement,
 * and the caller (the render-trigger action, not built yet) is responsible
 * for verifying project ownership with the user-scoped client BEFORE calling
 * this -- this function trusts the userId/renderId it's given.
 */
export async function chargeForRender(userId: string, renderId: string, cost: number = RENDER_COST_CREDITS): Promise<ChargeResult> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.rpc("charge_credits", {
    p_user_id: userId,
    p_render_id: renderId,
    p_amount: cost,
  });

  if (error) {
    // charge_credits raises insufficient_credits as a Postgres exception;
    // any other error is a real failure, not a declined charge.
    if (error.message.includes("insufficient_credits")) {
      return { ok: false, reason: "insufficient_credits" };
    }
    throw error;
  }

  return { ok: true, newBalance: data as number };
}

/** Refunds a failed render's charge -- same atomic pattern, positive delta. */
export async function refundRender(userId: string, renderId: string, amount: number): Promise<number> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.rpc("refund_credits", {
    p_user_id: userId,
    p_render_id: renderId,
    p_amount: amount,
  });
  if (error) throw error;
  return data as number;
}
