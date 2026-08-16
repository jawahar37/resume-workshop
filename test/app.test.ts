import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getDatabase, DEFAULT_DB_PATH } from "../src/db/client.js";
import { importResumeYaml } from "../src/db/seed.js";
import { loadFullResume } from "../src/loader/query.js";
import { filterResumeForProfile } from "../src/loader/filter.js";
import { renderTypstSource } from "../src/renderers/typst/renderer.js";
import { renderMarkdownSource } from "../src/renderers/markdown/renderer.js";
import * as schema from "../src/db/schema.js";
import { eq } from "drizzle-orm";

test("Resume Workshop End-to-End Test Suite", async (t) => {
  const testDbPath = ".data/test-resume.db";
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  await t.test("1. Database seeding from YAML", async () => {
    const seedFile = path.resolve(process.cwd(), "data.seed/resume.yaml");
    const res = await importResumeYaml(seedFile, { replace: true, dbPath: testDbPath });

    assert.ok(res.expCount >= 3, "Expected at least 3 experiences");
    assert.ok(res.bulletCount >= 10, "Expected at least 10 bullets");
    assert.ok(res.tagCount >= 15, "Expected at least 15 tags");
  });

  await t.test("2. Relational Query Loader", async () => {
    const resume = await loadFullResume(testDbPath);
    assert.equal(resume.personalInfo.name, "Alex Mercer");
    assert.equal(resume.experiences.length, 3);
    assert.ok(resume.targetProfiles.length >= 2);

    const staffProfile = resume.targetProfiles.find((p) => p.id === "full-stack-software-engineer");
    assert.ok(staffProfile, "Expected full-stack-software-engineer profile");
    assert.equal(staffProfile?.maxPages, 1);
  });

  await t.test("3. Profile Filtering & Page Estimation", async () => {
    const resume = await loadFullResume(testDbPath);
    const view = filterResumeForProfile(resume, "full-stack-software-engineer");

    assert.equal(view.profileId, "full-stack-software-engineer");
    assert.equal(view.maxPages, 1);
    assert.ok(view.stats.selectedBulletsCount > 0);
    assert.equal(view.stats.isOverLimit, false);
  });

  await t.test("4. Typst & Markdown Renderers", async () => {
    const resume = await loadFullResume(testDbPath);
    const view = filterResumeForProfile(resume, "full-stack-software-engineer");

    const typst = renderTypstSource(view);
    assert.ok(typst.includes("#section-heading(\"Work Experience\")"));
    assert.ok(typst.includes("Alex Mercer"));
    assert.ok(typst.includes("Nebula Labs"));

    const md = renderMarkdownSource(view);
    assert.ok(md.includes("# Alex Mercer"));
    assert.ok(md.includes("## Work Experience"));
    assert.ok(md.includes("Nebula Labs"));
  });

  await t.test("5. Bullet Activation / Deactivation", async () => {
    const { db } = getDatabase(testDbPath);
    const [bullet] = await db.select().from(schema.bullets).limit(1);
    assert.ok(bullet);

    // Deactivate
    await db.update(schema.bullets).set({ isActive: false }).where(eq(schema.bullets.id, bullet.id));
    const [updated] = await db.select().from(schema.bullets).where(eq(schema.bullets.id, bullet.id));
    assert.equal(updated.isActive, false);

    // Reactivate
    await db.update(schema.bullets).set({ isActive: true }).where(eq(schema.bullets.id, bullet.id));
    const [reactivated] = await db.select().from(schema.bullets).where(eq(schema.bullets.id, bullet.id));
    assert.equal(reactivated.isActive, true);
  });

  // Cleanup test DB
  if (fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath);
    } catch {}
  }
});
