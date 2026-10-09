/**
 * Runs supabase/tests/rls.test.sql against a Supabase database.
 *
 *   SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres npm run test:rls
 *
 * (Dashboard → Project Settings → Database → Connection string, "Direct" or
 * "Session pooler".) The test runs in a transaction and rolls back, so it is
 * safe against production. Requires `psql` on PATH.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const dbUrl = process.env.SUPABASE_DB_URL?.trim();
if (!dbUrl) {
  console.error("SUPABASE_DB_URL is not set. Add it to .env.local or pass it inline (see README → RLS tests).");
  process.exit(1);
}

const file = fileURLToPath(new URL("../supabase/tests/rls.test.sql", import.meta.url));
const result = spawnSync("psql", [dbUrl, "-v", "ON_ERROR_STOP=1", "-q", "-f", file], { stdio: "inherit" });
if (result.error) {
  console.error("Could not run psql:", result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
