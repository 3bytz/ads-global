#!/usr/bin/env bash
# Runs migrations + seed (twice, to prove idempotency) + RLS tests on a plain
# PostgreSQL ≥ 15 without Docker or the Supabase CLI, using a small shim for
# the Supabase auth schema and API roles. Useful in CI.
#
#   PGURL=postgresql://postgres@localhost:5432/postgres ./scripts/test-rls-local.sh
set -euo pipefail
cd "$(dirname "$0")/.."

PGURL="${PGURL:-postgresql://postgres@localhost:5432/postgres}"
DB="ads_rls_$$"
psql "$PGURL" -q -v ON_ERROR_STOP=1 -c "create database $DB"
trap 'psql "$PGURL" -q -c "drop database if exists $DB" >/dev/null' EXIT

TARGET="${PGURL%/*}/$DB"
run() { psql "$TARGET" -q -v ON_ERROR_STOP=1 -f "$1"; }

run supabase/tests/local-shim.sql
for f in supabase/migrations/*.sql; do run "$f"; done
run supabase/seed.sql
run supabase/seed.sql
echo "Seed applied twice without errors."
run supabase/tests/rls.test.sql
