import { createDb } from "../src/db/client.js";
import { runMigrations } from "../src/db/migrate.js";

export default async function setup() {
  const url =
    process.env.TEST_DATABASE_URL ?? "postgres://atmo:atmo@localhost:5433/atmocare_test";
  const { db, pool } = createDb(url);
  try {
    await runMigrations(db);
  } catch (err) {
    throw new Error(
      `Could not migrate the test database at ${url}. Is Postgres running? (npm run db:up)\n${err}`,
    );
  } finally {
    await pool.end();
  }
}
