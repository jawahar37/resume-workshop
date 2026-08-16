import pc from "picocolors";
import { getDatabase } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { eq } from "drizzle-orm";
import Table from "cli-table3";

export async function listExperiences() {
  const { db } = getDatabase();
  const rows = await db.select().from(schema.experiences);

  const table = new Table({
    head: [pc.bold("ID"), pc.bold("Company"), pc.bold("Role Title"), pc.bold("Start"), pc.bold("End"), pc.bold("Location")],
  });

  for (const r of rows) {
    table.push([
      r.id,
      r.company,
      r.roleTitle,
      r.startDate,
      r.endDate || "Present",
      r.location || "",
    ]);
  }

  console.log(table.toString());
}

export async function addExperience(options: {
  id: string;
  company: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
}) {
  if (!options.id || !options.company || !options.title || !options.start) {
    console.error(pc.red("Error: --id, --company, --title, and --start are required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  await db.insert(schema.experiences)
    .values({
      id: options.id,
      company: options.company,
      roleTitle: options.title,
      startDate: options.start,
      endDate: options.end || "Present",
      location: options.location,
    })
    .onConflictDoUpdate({
      target: schema.experiences.id,
      set: {
        company: options.company,
        roleTitle: options.title,
        startDate: options.start,
        endDate: options.end || "Present",
        location: options.location,
      },
    });

  console.log(pc.green(`✓ Added experience [${options.id}]: ${options.title} @ ${options.company}`));
}
