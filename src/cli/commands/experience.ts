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
  summary?: string;
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
      summary: options.summary,
    })
    .onConflictDoUpdate({
      target: schema.experiences.id,
      set: {
        company: options.company,
        roleTitle: options.title,
        startDate: options.start,
        endDate: options.end || "Present",
        location: options.location,
        summary: options.summary,
      },
    });

  console.log(pc.green(`✓ Added experience [${options.id}]: ${options.title} @ ${options.company}`));
}

export async function updateExperience(options: {
  id: string;
  company?: string;
  title?: string;
  start?: string;
  end?: string;
  location?: string;
  summary?: string;
}) {
  if (!options.id) {
    console.error(pc.red("Error: --id <experienceId> is required."));
    process.exit(1);
  }

  const updateSet: Record<string, any> = {};
  if (options.company) updateSet.company = options.company;
  if (options.title) updateSet.roleTitle = options.title;
  if (options.start) updateSet.startDate = options.start;
  if (options.end) updateSet.endDate = options.end;
  if (options.location) updateSet.location = options.location;
  if (options.summary !== undefined) updateSet.summary = options.summary;

  const { db } = getDatabase();
  await db.update(schema.experiences).set(updateSet).where(eq(schema.experiences.id, options.id));
  console.log(pc.green(`✓ Updated experience [${options.id}]`));
}

export async function showExperience(options: { id: string }) {
  if (!options.id) {
    console.error(pc.red("Error: --id <experienceId> is required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  const [exp] = await db.select().from(schema.experiences).where(eq(schema.experiences.id, options.id));
  if (!exp) {
    console.error(pc.red(`Error: Experience [${options.id}] not found in vault.`));
    process.exit(1);
  }

  console.log(`\n${pc.bold(pc.cyan("=== EXPERIENCE DETAILS ==="))}`);
  console.log(`${pc.bold("ID:")} ${exp.id}`);
  console.log(`${pc.bold("Role Title:")} ${exp.roleTitle}`);
  console.log(`${pc.bold("Company:")} ${exp.company}`);
  console.log(`${pc.bold("Dates:")} ${exp.startDate} – ${exp.endDate || "Present"}`);
  if (exp.location) console.log(`${pc.bold("Location:")} ${exp.location}`);
  if (exp.summary) console.log(`${pc.bold("Summary:")} ${exp.summary}`);

  const bullets = await db.select().from(schema.bullets).where(eq(schema.bullets.experienceId, options.id));

  console.log(`\n${pc.bold(pc.cyan(`=== BULLETS (${bullets.length} Total) ===`))}`);
  const table = new Table({
    head: [pc.bold("ID"), pc.bold("Active"), pc.bold("Pri"), pc.bold("Words"), pc.bold("Content")],
    colWidths: [20, 8, 5, 7, 55],
    wordWrap: true,
  });

  for (const b of bullets) {
    const wordCount = b.content.split(/\s+/).filter(Boolean).length;
    table.push([
      b.id,
      b.isActive ? pc.green("yes") : pc.yellow("no"),
      b.priority.toString(),
      wordCount.toString(),
      b.content,
    ]);
  }

  console.log(table.toString());
}
