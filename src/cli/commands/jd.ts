import pc from "picocolors";
import fs from "node:fs";
import path from "node:path";
import { getDatabase } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { eq } from "drizzle-orm";
import Table from "cli-table3";

export async function listJds() {
  const { db } = getDatabase();
  const rows = await db.select().from(schema.jobDescriptions);

  const table = new Table({
    head: [pc.bold("JD ID"), pc.bold("Company"), pc.bold("Role Title"), pc.bold("Created")],
  });

  for (const r of rows) {
    table.push([r.id, r.company, r.roleTitle, r.createdAt || ""]);
  }

  console.log(table.toString());
}

export async function addJd(options: {
  id: string;
  company: string;
  role: string;
  file?: string;
  text?: string;
  url?: string;
}) {
  if (!options.id || !options.company || !options.role) {
    console.error(pc.red("Error: --id, --company, and --role are required."));
    process.exit(1);
  }

  let rawText = options.text || "";
  if (options.file) {
    const fPath = path.resolve(process.cwd(), options.file);
    if (fs.existsSync(fPath)) {
      rawText = fs.readFileSync(fPath, "utf8");
    }
  }

  if (!rawText) {
    console.error(pc.red("Error: Job Description requires text content via --text or --file."));
    process.exit(1);
  }

  const { db } = getDatabase();
  await db.insert(schema.jobDescriptions)
    .values({
      id: options.id,
      company: options.company,
      roleTitle: options.role,
      rawText,
      url: options.url,
    })
    .onConflictDoUpdate({
      target: schema.jobDescriptions.id,
      set: {
        company: options.company,
        roleTitle: options.role,
        rawText,
        url: options.url,
      },
    });

  console.log(pc.green(`✓ Stored Job Description [${options.id}]: ${options.role} @ ${options.company}`));
  console.log(pc.gray(`Run 'rw jd add-requirement --jd ${options.id} ...' to add structured requirement snippets.`));
}

export async function addJdRequirement(options: {
  jd: string;
  id?: string;
  text: string;
  weight?: string;
  tags?: string;
}) {
  if (!options.jd || !options.text) {
    console.error(pc.red("Error: --jd <id> and --text <snippet> are required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  const reqId = options.id || `${options.jd}-req-${Date.now().toString(36)}`;
  const weight = options.weight || "medium";

  await db.insert(schema.jdRequirements)
    .values({
      id: reqId,
      jdId: options.jd,
      text: options.text,
      weight,
    })
    .onConflictDoUpdate({
      target: schema.jdRequirements.id,
      set: {
        text: options.text,
        weight,
      },
    });

  if (options.tags) {
    const tagsList = options.tags.split(",").map((t) => t.trim());
    for (const t of tagsList) {
      const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await db.insert(schema.tags).values({ id: slug, name: t }).onConflictDoNothing();
      await db.insert(schema.jdRequirementTags).values({ requirementId: reqId, tagId: slug }).onConflictDoNothing();
    }
  }

  console.log(pc.green(`✓ Added requirement [${reqId}] to JD '${options.jd}' (${weight} weight)`));
}

export async function showJd(options: { id: string }) {
  if (!options.id) {
    console.error(pc.red("Error: --id <jdId> is required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  const [jd] = await db.select().from(schema.jobDescriptions).where(eq(schema.jobDescriptions.id, options.id));
  if (!jd) {
    console.error(pc.red(`Error: Job Description '${options.id}' not found.`));
    process.exit(1);
  }

  console.log(pc.bold(`\n📄 Job Description: ${pc.cyan(jd.roleTitle)} @ ${pc.bold(jd.company)}`));
  if (jd.url) console.log(`URL: ${pc.gray(jd.url)}`);
  console.log(`Saved: ${jd.createdAt}\n`);

  const reqs = await db.select().from(schema.jdRequirements).where(eq(schema.jdRequirements.jdId, options.id));
  if (reqs.length > 0) {
    console.log(pc.bold("Parsed Requirements & Tag Mappings:"));
    const table = new Table({
      head: [pc.bold("Req ID"), pc.bold("Snippet"), pc.bold("Weight")],
      colWidths: [20, 55, 12],
      wordWrap: true,
    });
    for (const r of reqs) {
      const weightColored =
        r.weight === "high"
          ? pc.red("high")
          : r.weight === "medium"
          ? pc.yellow("medium")
          : pc.gray("low");
      table.push([r.id, r.text, weightColored]);
    }
    console.log(table.toString());
  }

  console.log(pc.bold("\nRaw Text Snippet:"));
  const previewText = jd.rawText.slice(0, 400);
  console.log(pc.gray(previewText + (jd.rawText.length > 400 ? "\n..." : "")));
  console.log("");
}
