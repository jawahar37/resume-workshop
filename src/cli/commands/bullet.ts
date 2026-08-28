import pc from "picocolors";
import { getDatabase } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import Table from "cli-table3";

export async function listBullets(options: { experience?: string }) {
  const { db } = getDatabase();
  let query = db.select().from(schema.bullets);
  const rows = options.experience
    ? await db.select().from(schema.bullets).where(eq(schema.bullets.experienceId, options.experience))
    : await db.select().from(schema.bullets);

  const table = new Table({
    head: [pc.bold("ID"), pc.bold("Experience"), pc.bold("Active"), pc.bold("Pri"), pc.bold("Content")],
    colWidths: [20, 16, 8, 5, 50],
    wordWrap: true,
  });

  for (const r of rows) {
    table.push([
      r.id,
      r.experienceId,
      r.isActive ? pc.green("yes") : pc.yellow("no"),
      r.priority.toString(),
      r.content,
    ]);
  }

  console.log(table.toString());
}

export async function addBullet(options: {
  id?: string;
  experience: string;
  content: string;
  active?: boolean;
  inactive?: boolean;
  priority?: string;
  notes?: string;
  tags?: string;
}) {
  if (!options.experience || !options.content) {
    console.error(pc.red("Error: --experience <id> and --content <text> are required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  const bulletId =
    options.id ||
    `${options.experience}-b-${Date.now().toString(36)}`;

  const isActive = options.inactive ? false : (options.active ?? true);
  const priority = options.priority ? parseInt(options.priority, 10) : 1;

  await db.insert(schema.bullets)
    .values({
      id: bulletId,
      experienceId: options.experience,
      content: options.content,
      isActive,
      priority,
      notes: options.notes,
    })
    .onConflictDoUpdate({
      target: schema.bullets.id,
      set: {
        content: options.content,
        isActive,
        priority,
        notes: options.notes,
      },
    });

  if (options.tags) {
    const tagsList = options.tags.split(",").map((t) => t.trim());
    for (const t of tagsList) {
      const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await db.insert(schema.tags).values({ id: slug, name: t }).onConflictDoNothing();
      await db.insert(schema.bulletTags).values({ bulletId, tagId: slug }).onConflictDoNothing();
    }
  }

  console.log(
    pc.green(
      `✓ Added bullet [${bulletId}] (${isActive ? "active" : "alternate/inactive"}) to ${options.experience}`
    )
  );
}

export async function updateBullet(options: {
  id: string;
  content?: string;
  priority?: string;
  notes?: string;
}) {
  if (!options.id) {
    console.error(pc.red("Error: --id <bulletId> is required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  const updateData: any = {};
  if (options.content !== undefined) updateData.content = options.content;
  if (options.priority !== undefined) updateData.priority = parseInt(options.priority, 10);
  if (options.notes !== undefined) updateData.notes = options.notes;

  await db.update(schema.bullets).set(updateData).where(eq(schema.bullets.id, options.id));
  console.log(pc.green(`✓ Updated bullet [${options.id}]`));
}

export async function activateBullet(options: { id: string; profile?: string }) {
  if (!options.id) {
    console.error(pc.red("Error: --id <bulletId> is required."));
    process.exit(1);
  }

  const { db } = getDatabase();

  if (options.profile) {
    // Add to profile_bullets
    await db.insert(schema.profileBullets)
      .values({ profileId: options.profile, bulletId: options.id })
      .onConflictDoNothing();
    console.log(pc.green(`✓ Activated bullet [${options.id}] for profile '${options.profile}'`));
  } else {
    // Master activate
    await db.update(schema.bullets).set({ isActive: true }).where(eq(schema.bullets.id, options.id));
    console.log(pc.green(`✓ Master-activated bullet [${options.id}]`));
  }
}

export async function deactivateBullet(options: { id: string; profile?: string }) {
  if (!options.id) {
    console.error(pc.red("Error: --id <bulletId> is required."));
    process.exit(1);
  }

  const { db } = getDatabase();

  if (options.profile) {
    // Remove from profile_bullets
    await db.delete(schema.profileBullets).where(
      and(
        eq(schema.profileBullets.profileId, options.profile),
        eq(schema.profileBullets.bulletId, options.id)
      )
    );
    console.log(pc.yellow(`✓ Deactivated bullet [${options.id}] from profile '${options.profile}'`));
  } else {
    // Master deactivate
    await db.update(schema.bullets).set({ isActive: false }).where(eq(schema.bullets.id, options.id));
    console.log(pc.yellow(`✓ Master-deactivated bullet [${options.id}] (saved as alternate)`));
  }
}

export async function tagBullet(options: { id: string; tags: string }) {
  if (!options.id || !options.tags) {
    console.error(pc.red("Error: --id <bulletId> and --tags <tag1,tag2> are required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  const tagsList = options.tags.split(",").map((t) => t.trim());
  for (const t of tagsList) {
    const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await db.insert(schema.tags).values({ id: slug, name: t }).onConflictDoNothing();
    await db.insert(schema.bulletTags).values({ bulletId: options.id, tagId: slug }).onConflictDoNothing();
  }

  console.log(pc.green(`✓ Tagged bullet [${options.id}] with: ${tagsList.join(", ")}`));
}

export async function deleteBullet(options: { id: string }) {
  if (!options.id) {
    console.error(pc.red("Error: --id <bulletId> is required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  await db.delete(schema.bullets).where(eq(schema.bullets.id, options.id));
  console.log(pc.red(`✓ Permanently deleted bullet [${options.id}] from master record`));
}
