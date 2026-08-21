/**
 * The Supabase client returns raw snake_case rows (it doesn't do Drizzle's
 * camelCase column mapping); every existing component (ProjectCard,
 * StatusBadge, etc.) was built against Drizzle's inferred camelCase types.
 * Rather than rewrite those working components' prop contracts, convert at
 * the query boundary -- same shape this project's own NAMING_CONVENTIONS
 * doc uses for the frontend/API boundary elsewhere, just applied here to
 * Supabase rows instead of API responses.
 */
function toCamel(s: string): string {
  return s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

export function keysToCamel<T>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((item) => keysToCamel(item)) as T;
  }
  if (input !== null && typeof input === "object" && !(input instanceof Date)) {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>).map(([k, v]) => [toCamel(k), keysToCamel(v)]),
    ) as T;
  }
  return input as T;
}
