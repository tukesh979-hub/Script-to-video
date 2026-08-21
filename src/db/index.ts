import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.local.example to .env.local and fill in Supabase's " +
      "pooled connection string (Project Settings -> Database -> Connection pooling, transaction mode).",
  );
}

// Supabase's connection pooler (transaction mode, port 6543) doesn't support
// prepared statements across pooled connections -- disable them here or
// queries intermittently fail once traffic goes through the pooler.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
