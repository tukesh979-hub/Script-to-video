import { keysToCamel } from "./case-convert";
import type { Project, ProjectStage, ProjectAsset, Render, CreditLedgerEntry, Profile } from "@/db/schema";

/**
 * The Supabase client (PostgREST) serializes timestamp columns as ISO
 * strings, not the native Date objects Drizzle/postgres-js would give you --
 * keysToCamel alone would silently mistype these as Date while actually
 * handing back a string (its `as T` cast doesn't check). These functions fix
 * that up explicitly so the existing camelCase types from db/schema.ts (which
 * ProjectCard, StatusBadge, etc. are already built against) stay honest for
 * data that actually came from Supabase-js at runtime.
 */
function parseDates<T extends Record<string, unknown>>(obj: T, dateKeys: (keyof T)[]): T {
  const copy = { ...obj };
  for (const key of dateKeys) {
    const v = copy[key];
    if (typeof v === "string") copy[key] = new Date(v) as T[keyof T];
  }
  return copy;
}

export function rowToProject(row: unknown): Project {
  return parseDates(keysToCamel<Project>(row), ["createdAt", "updatedAt", "deletedAt"]);
}

export function rowToProjectStage(row: unknown): ProjectStage {
  return parseDates(keysToCamel<ProjectStage>(row), ["createdAt", "deletedAt"]);
}

export function rowToProjectAsset(row: unknown): ProjectAsset {
  return keysToCamel<ProjectAsset>(row);
}

export function rowToRender(row: unknown): Render {
  return parseDates(keysToCamel<Render>(row), [
    "acknowledgedAt",
    "startedAt",
    "completedAt",
    "createdAt",
    "updatedAt",
    "deletedAt",
  ]);
}

export function rowToCreditLedgerEntry(row: unknown): CreditLedgerEntry {
  return parseDates(keysToCamel<CreditLedgerEntry>(row), ["createdAt"]);
}

export function rowToProfile(row: unknown): Profile {
  return parseDates(keysToCamel<Profile>(row), ["onboardingCompletedAt", "createdAt", "updatedAt", "deletedAt"]);
}
