import pc from "picocolors";
import fs from "node:fs";
import path from "node:path";
import { getDatabase } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { eq } from "drizzle-orm";
import Table from "cli-table3";

export async function showSummary() {
  const { db } = getDatabase();
  const rows = await db.select().from(schema.personalInfo);
  const p = rows[0];

  if (!p) {
    console.error(pc.red("Error: Personal info not found in master record."));
    process.exit(1);
  }

  console.log(`\n${pc.bold(pc.cyan("=== CANDIDATE PROFILE & HEADER ==="))}`);
  console.log(`${pc.bold("Name:")} ${p.name}`);
  console.log(`${pc.bold("Title:")} ${p.title}`);
  console.log(`${pc.bold("Email:")} ${p.email}`);
  if (p.phone) console.log(`${pc.bold("Phone:")} ${p.phone}`);
  if (p.location) console.log(`${pc.bold("Location:")} ${p.location}`);
  if (p.linkedin) console.log(`${pc.bold("LinkedIn:")} ${p.linkedin}`);
  if (p.github) console.log(`${pc.bold("GitHub:")} ${p.github}`);

  const summaryText = p.summary || "";
  const lines = summaryText
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`\n${pc.bold(pc.cyan(`=== PROFESSIONAL SUMMARY (${lines.length} Lines) ===`))}`);
  if (lines.length === 0) {
    console.log(pc.yellow("No professional summary set. Run 'rw summary update --text \"...\"' to add one."));
    return;
  }

  const table = new Table({
    head: [pc.bold("#"), pc.bold("Words"), pc.bold("Chars"), pc.bold("Summary Line Content")],
    colWidths: [5, 7, 7, 70],
    wordWrap: true,
  });

  for (const [idx, line] of lines.entries()) {
    const wordCount = line.split(/\s+/).filter(Boolean).length;
    table.push([(idx + 1).toString(), wordCount.toString(), line.length.toString(), line]);
  }

  console.log(table.toString());
}

export async function updateSummary(options: { text?: string; file?: string }) {
  let text = options.text || "";
  if (options.file) {
    const fPath = path.resolve(process.cwd(), options.file);
    if (fs.existsSync(fPath)) {
      text = fs.readFileSync(fPath, "utf8");
    }
  }

  if (!text) {
    console.error(pc.red("Error: --text <string> or --file <path> is required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  const rows = await db.select().from(schema.personalInfo);
  if (rows.length > 0) {
    await db.update(schema.personalInfo).set({ summary: text }).where(eq(schema.personalInfo.id, rows[0].id));
  }

  console.log(pc.green("✓ Updated professional summary in master record."));
}

export async function addSummaryLine(options: { line: string }) {
  if (!options.line) {
    console.error(pc.red("Error: --line <text> is required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  const rows = await db.select().from(schema.personalInfo);
  if (rows.length === 0) {
    console.error(pc.red("Error: Personal info not found in master record."));
    process.exit(1);
  }

  const currentSummary = rows[0].summary || "";
  const updatedSummary = currentSummary ? `${currentSummary.trim()}\n${options.line.trim()}` : options.line.trim();

  await db.update(schema.personalInfo).set({ summary: updatedSummary }).where(eq(schema.personalInfo.id, rows[0].id));
  console.log(pc.green("✓ Appended new bullet line to professional summary."));
}

export async function removeSummaryLine(options: { index: string }) {
  const lineIdx = parseInt(options.index, 10) - 1;
  if (isNaN(lineIdx) || lineIdx < 0) {
    console.error(pc.red("Error: Valid 1-indexed --index <n> is required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  const rows = await db.select().from(schema.personalInfo);
  if (rows.length === 0) {
    console.error(pc.red("Error: Personal info not found in master record."));
    process.exit(1);
  }

  const currentSummary = rows[0].summary || "";
  const lines = currentSummary
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (lineIdx >= lines.length) {
    console.error(pc.red(`Error: Line index ${lineIdx + 1} out of bounds (total lines: ${lines.length}).`));
    process.exit(1);
  }

  lines.splice(lineIdx, 1);
  const updatedSummary = lines.join("\n");

  await db.update(schema.personalInfo).set({ summary: updatedSummary }).where(eq(schema.personalInfo.id, rows[0].id));
  console.log(pc.green(`✓ Removed line ${lineIdx + 1} from professional summary.`));
}
