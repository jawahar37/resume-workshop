import { createClient, Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.js";
import fs from "node:fs";
import path from "node:path";

export const DEFAULT_DB_DIR = ".data";
export const DEFAULT_DB_PATH = path.join(DEFAULT_DB_DIR, "resume.db");

const openDatabases = new Map<string, { db: ReturnType<typeof drizzle<typeof schema>>; client: Client }>();

export function getDatabase(dbPath = DEFAULT_DB_PATH) {
  const resolved = path.resolve(dbPath);
  if (openDatabases.has(resolved)) {
    return openDatabases.get(resolved)!;
  }

  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const normalizedPath = resolved.replace(/\\/g, "/");
  const client = createClient({
    url: `file:${normalizedPath}`,
  });

  const db = drizzle(client, { schema });
  const instance = { db, client };
  openDatabases.set(resolved, instance);
  return instance;
}

export function closeDatabases() {
  for (const [key, instance] of openDatabases.entries()) {
    try {
      instance.client.close();
    } catch {
      // ignore
    }
    openDatabases.delete(key);
  }
}
