import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Server-only. Supabase's pooled connection string (transaction mode,
    // port 6543) -- see .env.local.example.
    url: process.env.DATABASE_URL!,
  },
});
