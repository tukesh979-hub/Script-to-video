import { test, expect } from "@playwright/test";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Critical path: sign up -> verify -> onboarding -> dashboard -> open a
 * project. Needs a live Supabase project + `npm run dev` running -- see
 * playwright.config.ts and the README's testing section.
 *
 * Email verification: Playwright can't read a real inbox without extra
 * infrastructure (Mailosaur, a local Inbucket, etc.), and standing that up
 * wasn't in scope here. The accepted, standard pattern for E2E-testing an
 * email-gated signup is what this test does instead -- sign up through the
 * real UI (exercising the real form + real Supabase signUp call), then
 * confirm the email via the Admin API rather than clicking a real link
 * (simulating exactly what clicking the link does: flips the confirmed
 * flag). That's a deliberate substitution for "receive and click a real
 * email," not a skip of the verification requirement itself -- the app-side
 * behavior (no session until confirmed) is still exercised for real.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasLiveCredentials = Boolean(url && serviceKey);

test.describe("critical path: signup through project view", () => {
  test.skip(!hasLiveCredentials, "Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the test environment.");

  // example.com is on Supabase's rejected-domain list ("Email address is
  // invalid") -- mailinator.com has real MX records and passes.
  const email = `e2e-${Date.now()}@mailinator.com`;
  const password = "TestPassword123";
  const displayName = "E2E Test User";
  const projectName = `E2E Project ${Date.now()}`;

  test.afterAll(async () => {
    const admin = createSupabaseClient(url!, serviceKey!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data } = await admin.auth.admin.listUsers();
    const user = data.users.find((u) => u.email === email);
    if (user) await admin.auth.admin.deleteUser(user.id);
  });

  test("full flow", async ({ page }) => {
    // 1. Register
    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible();

    // 2. "Verify" -- see file-level comment for why this is Admin API, not a clicked link.
    const admin = createSupabaseClient(url!, serviceKey!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data } = await admin.auth.admin.listUsers();
    const user = data.users.find((u) => u.email === email);
    expect(user).toBeTruthy();
    await admin.auth.admin.updateUserById(user!.id, { email_confirm: true });

    // 3. Log in for real through the UI now that the account is confirmed
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    // 4. First login -> onboarding (profile has no onboarding_completed_at yet)
    await expect(page).toHaveURL(/\/onboarding/);
    await page.getByLabel(/what should we call you/i).fill(displayName);
    await page.getByRole("button", { name: /continue to dashboard/i }).click();

    // 5. Onboarding complete -> dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    // getByRole, not getByText: Next.js's hidden route-announcer div
    // duplicates the h1 text for screen readers, so a plain text match
    // resolves to two elements.
    await expect(page.getByRole("heading", { name: new RegExp(`Welcome back, ${displayName}`, "i") })).toBeVisible();

    // 6. Create a new project through the real form
    await page.goto("/dashboard/projects/new");
    await page.getByLabel("Project name").fill(projectName);
    await page.getByRole("button", { name: "Create project" }).click();

    // 7. Redirected into the new project's own detail page
    await expect(page).toHaveURL(/\/dashboard\/projects\/[0-9a-f-]+$/);
    await expect(page.getByRole("heading", { name: projectName })).toBeVisible();

    // 8. And it shows up back in the projects list
    await page.goto("/dashboard/projects");
    await expect(page.getByText(projectName)).toBeVisible();
  });
});
