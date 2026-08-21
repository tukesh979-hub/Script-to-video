import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Needs a live Supabase project (auth, RLS) AND a running
 * `npm run dev` -- there is no meaningful mock for either. `webServer`
 * starts the dev server for you if it isn't already running; it will fail
 * fast if .env.local isn't configured, which is the honest behavior (see
 * README's testing section for current status).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // auth tests create real accounts; avoid cross-test races
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
