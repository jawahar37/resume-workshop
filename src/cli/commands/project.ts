import pc from "picocolors";
import { getDatabase } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { eq } from "drizzle-orm";
import Table from "cli-table3";

export async function listProjects() {
  const { db } = getDatabase();
  const rows = await db.select().from(schema.projects);

  const table = new Table({
    head: [pc.bold("ID"), pc.bold("Title"), pc.bold("Description")],
    colWidths: [20, 30, 50],
    wordWrap: true,
  });

  for (const r of rows) {
    table.push([r.id, r.title, r.description]);
  }

  console.log(table.toString());
}

export async function addProject(options: {
  id?: string;
  title: string;
  description: string;
  technologies?: string;
  url?: string;
}) {
  if (!options.title || !options.description) {
    console.error(pc.red("Error: --title <text> and --description <text> are required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  const projId = options.id || `proj-${options.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  await db
    .insert(schema.projects)
    .values({
      id: projId,
      title: options.title,
      description: options.description,
      technologies: options.technologies || null,
      url: options.url || null,
    })
    .onConflictDoUpdate({
      target: schema.projects.id,
      set: {
        title: options.title,
        description: options.description,
        technologies: options.technologies || null,
        url: options.url || null,
      },
    });

  console.log(pc.green(`✓ Added academic project [${projId}]: ${options.title}`));
}
