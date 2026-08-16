import { migrate } from "drizzle-orm/libsql/migrator";
import { getDatabase, DEFAULT_DB_PATH } from "./client.js";
import path from "node:path";
import fs from "node:fs";

export async function runMigrations(dbPath = DEFAULT_DB_PATH) {
  const { db } = getDatabase(dbPath);
  const migrationsFolder = path.resolve(process.cwd(), "drizzle");

  if (fs.existsSync(migrationsFolder)) {
    await migrate(db, { migrationsFolder });
  } else {
    console.warn("drizzle migrations folder not found at", migrationsFolder);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Running database migrations...");
  runMigrations()
    .then(() => console.log("Migrations applied successfully."))
    .catch((err) => {
      console.error("Migration error:", err);
      process.exit(1);
    });
}
