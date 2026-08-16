import pc from "picocolors";
import { getDatabase } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { eq } from "drizzle-orm";
import Table from "cli-table3";
import { loadFullResume } from "../../loader/query.js";

export async function listProfiles() {
  const { db } = getDatabase();
  const rows = await db.select().from(schema.targetProfiles);

  const table = new Table({
    head: [pc.bold("Profile ID"), pc.bold("Name"), pc.bold("Target Role"), pc.bold("Max Pages")],
  });

  for (const r of rows) {
    table.push([r.id, r.name, r.targetRole, r.maxPages.toString()]);
  }

  console.log(table.toString());
}

export async function createProfile(options: {
  id: string;
  name: string;
  role: string;
  maxPages?: string;
  summary?: string;
}) {
  if (!options.id || !options.name || !options.role) {
    console.error(pc.red("Error: --id, --name, and --role are required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  const maxPages = options.maxPages ? parseInt(options.maxPages, 10) : 1;

  await db.insert(schema.targetProfiles)
    .values({
      id: options.id,
      name: options.name,
      targetRole: options.role,
      summary: options.summary,
      maxPages,
    })
    .onConflictDoUpdate({
      target: schema.targetProfiles.id,
      set: {
        name: options.name,
        targetRole: options.role,
        summary: options.summary,
        maxPages,
      },
    });

  console.log(pc.green(`✓ Created profile [${options.id}]: ${options.name} (${maxPages} pg max)`));
}

export async function autoSelectProfileBullets(options: { profile: string; tags?: string }) {
  if (!options.profile) {
    console.error(pc.red("Error: --profile <id> is required."));
    process.exit(1);
  }

  const resume = await loadFullResume();
  const profile = resume.targetProfiles.find((p) => p.id === options.profile);
  if (!profile) {
    console.error(pc.red(`Error: Profile '${options.profile}' not found.`));
    process.exit(1);
  }

  const { db } = getDatabase();

  // Clear existing profile selections
  await db.delete(schema.profileBullets).where(eq(schema.profileBullets.profileId, options.profile));

  const targetTags = options.tags
    ? options.tags.split(",").map((t) => t.trim().toLowerCase())
    : Object.keys(profile.tagWeights).map((t) => t.toLowerCase());

  let selectedCount = 0;
  const allBullets = resume.experiences.flatMap((e) => e.bullets);

  // Score each active bullet
  const scored = allBullets
    .filter((b) => b.isActive)
    .map((b) => {
      const matchCount = b.tags.filter((t) =>
        targetTags.includes(t.toLowerCase())
      ).length;
      return { bullet: b, score: matchCount * 10 + (5 - b.priority) };
    })
    .sort((a, b) => b.score - a.score);

  // Take top bullets fitting profile max pages (e.g. ~14 for 1 pg, ~24 for 2 pg)
  const limit = profile.maxPages * 12;
  const topBullets = scored.slice(0, limit);

  for (const [idx, item] of topBullets.entries()) {
    await db.insert(schema.profileBullets)
      .values({
        profileId: options.profile,
        bulletId: item.bullet.id,
        overrideOrder: idx + 1,
      })
      .onConflictDoNothing();
    selectedCount++;
  }

  console.log(
    pc.green(
      `✓ Auto-selected ${selectedCount} best-match bullets for profile '${options.profile}' based on tags [${targetTags.join(", ")}]`
    )
  );
}

export async function setProfileTagWeight(options: { profile: string; tag: string; weight: string }) {
  if (!options.profile || !options.tag || !options.weight) {
    console.error(pc.red("Error: --profile, --tag, and --weight (high/medium/low) are required."));
    process.exit(1);
  }

  const { db } = getDatabase();
  const [profile] = await db.select().from(schema.targetProfiles).where(eq(schema.targetProfiles.id, options.profile));
  if (!profile) {
    console.error(pc.red(`Error: Profile '${options.profile}' not found.`));
    process.exit(1);
  }

  let weights: Record<string, string> = {};
  if (profile.tagWeights) {
    try {
      weights = JSON.parse(profile.tagWeights);
    } catch {}
  }

  weights[options.tag] = options.weight;

  await db.update(schema.targetProfiles)
    .set({ tagWeights: JSON.stringify(weights) })
    .where(eq(schema.targetProfiles.id, options.profile));

  console.log(pc.green(`✓ Set tag weight for '${options.tag}' = ${options.weight} in profile '${options.profile}'`));
}
