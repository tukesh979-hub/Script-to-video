import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Live-database RLS test -- the brief's explicit requirement: "a test that
 * tries to fetch another user's project and asserts rejection." Genuinely
 * needs a real Supabase project (auth.users, RLS enforcement) to mean
 * anything; a mock would just test the mock. Auto-skips when no live
 * credentials are configured (e.g. before .env.local exists) rather than
 * failing the whole suite -- run `npm test` again once Supabase is wired up
 * and this activates on its own.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasLiveCredentials = Boolean(url && anonKey && serviceKey);

// This project has no generated Supabase types (that needs `supabase gen
// types typescript` against a live project, which doesn't exist yet -- see
// README). Without a Database generic, .from("table") infers row shapes as
// `never`; <any> opts this test file only out of that, deliberately.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = (u: string, k: string) => createSupabaseClient<any>(u, k, { auth: { autoRefreshToken: false, persistSession: false } });

describe.skipIf(!hasLiveCredentials)("RLS: cross-user project access", () => {
  // NOT created here: describe.skipIf still runs this callback body at
  // collection time even when the suite is skipped -- only the it() blocks
  // themselves are skipped. Creating clients here would throw on the
  // missing url/key before the skip ever takes effect. beforeAll below does
  // respect the skip, so client creation lives there instead.
  let admin: ReturnType<typeof client>;
  let userAId: string;
  let userBId: string;
  let userAClient: ReturnType<typeof client>;
  let userBClient: ReturnType<typeof client>;
  let ownedProjectId: string;

  const emailA = `rls-test-a-${Date.now()}@example.com`;
  const emailB = `rls-test-b-${Date.now()}@example.com`;
  const password = "TestPassword123";

  beforeAll(async () => {
    admin = client(url!, serviceKey!);
    const { data: a } = await admin.auth.admin.createUser({ email: emailA, password, email_confirm: true });
    const { data: b } = await admin.auth.admin.createUser({ email: emailB, password, email_confirm: true });
    userAId = a.user!.id;
    userBId = b.user!.id;

    userAClient = client(url!, anonKey!);
    userBClient = client(url!, anonKey!);
    await userAClient.auth.signInWithPassword({ email: emailA, password });
    await userBClient.auth.signInWithPassword({ email: emailB, password });

    const { data: project } = await userAClient
      .from("projects")
      .insert({ user_id: userAId, name: "User A's private project", status: "in_progress" })
      .select("id")
      .single();
    ownedProjectId = project!.id;
  });

  afterAll(async () => {
    // service_role bypasses RLS -- this is the one legitimate place to use
    // it for cleanup, deleting rows regardless of owner.
    await admin.from("projects").delete().eq("id", ownedProjectId);
    await admin.auth.admin.deleteUser(userAId);
    await admin.auth.admin.deleteUser(userBId);
  });

  it("lets the owner read their own project", async () => {
    const { data, error } = await userAClient.from("projects").select("*").eq("id", ownedProjectId).single();
    expect(error).toBeNull();
    expect(data?.id).toBe(ownedProjectId);
  });

  it("returns nothing when a different user fetches it by id -- RLS filters the row out, not an error", async () => {
    const { data, error } = await userBClient.from("projects").select("*").eq("id", ownedProjectId).maybeSingle();
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it("excludes the other user's project from a full list query", async () => {
    const { data } = await userBClient.from("projects").select("id");
    expect(data?.some((p) => p.id === ownedProjectId)).toBe(false);
  });

  it("rejects a different user's attempt to update the project (0 rows affected)", async () => {
    const { data } = await userBClient
      .from("projects")
      .update({ name: "hijacked" })
      .eq("id", ownedProjectId)
      .select("id");
    expect(data).toEqual([]);

    const { data: stillOriginal } = await userAClient.from("projects").select("name").eq("id", ownedProjectId).single();
    expect(stillOriginal?.name).toBe("User A's private project");
  });

  it("rejects inserting a project with someone else's user_id (WITH CHECK)", async () => {
    const { error } = await userBClient.from("projects").insert({ user_id: userAId, name: "forged ownership", status: "in_progress" });
    expect(error).not.toBeNull();
  });

  it("rejects writing to credits_ledger directly -- no policy grants this to any client", async () => {
    const { error } = await userAClient
      .from("credits_ledger")
      .insert({ user_id: userAId, delta: 999999, reason: "manual_adjustment", balance_after: 999999 });
    expect(error).not.toBeNull();
  });

  it("rejects updating credits_balance directly even on your own profile row (column REVOKE)", async () => {
    const { error } = await userAClient.from("profiles").update({ credits_balance: 999999 }).eq("id", userAId);
    expect(error).not.toBeNull();
  });
});
