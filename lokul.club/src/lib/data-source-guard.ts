export function hasRealDatabaseConfig(): boolean {
  const dbUrl = (process.env.DATABASE_URL ?? "").trim();

  if (!dbUrl) return false;
  if (dbUrl.includes("USER:PASSWORD")) return false;
  if (dbUrl.includes("placeholder") || dbUrl.includes("example.com")) return false;

  return true;
}

export function isE2eMode(): boolean {
  return process.env.E2E_TEST === "1";
}

export function assertRealDatabaseAvailable(context: string): void {
  if (isE2eMode()) return;

  if (!hasRealDatabaseConfig()) {
    throw new Error(`${context} requires a live DATABASE_URL. This environment is not using the real DB-backed source of truth.`);
  }
}
