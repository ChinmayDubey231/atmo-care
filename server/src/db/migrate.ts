import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb, type Db } from "./client.js";

const migrationsFolder = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../drizzle",
);

export async function runMigrations(db: Db) {
  await migrate(db, { migrationsFolder });
}

// `npm run db:migrate`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const { db, pool } = createDb(url);
  await runMigrations(db);
  await pool.end();
  console.log("Migrations applied");
}
