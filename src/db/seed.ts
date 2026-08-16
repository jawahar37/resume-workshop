import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { getDatabase, DEFAULT_DB_PATH } from "./client.js";
import * as schema from "./schema.js";
import { ResumeYamlSchema, ResumeYaml } from "../schema/import.schema.js";
import { runMigrations } from "./migrate.js";

export async function importResumeYaml(
  yamlFilePath: string,
  options: { replace?: boolean; dbPath?: string } = {}
) {
  const dbPath = options.dbPath || DEFAULT_DB_PATH;
  await runMigrations(dbPath);
  const { db, client } = getDatabase(dbPath);

  if (!fs.existsSync(yamlFilePath)) {
    throw new Error(`File not found: ${yamlFilePath}`);
  }

  const rawContent = fs.readFileSync(yamlFilePath, "utf8");
  const parsed = YAML.parse(rawContent);
  const data: ResumeYaml = ResumeYamlSchema.parse(parsed);

  if (options.replace) {
    // Clear tables in foreign-key safe order
    await client.execute("DELETE FROM jd_requirement_tags");
    await client.execute("DELETE FROM jd_requirements");
    await client.execute("DELETE FROM job_descriptions");
    await client.execute("DELETE FROM profile_bullets");
    await client.execute("DELETE FROM target_profiles");
    await client.execute("DELETE FROM bullet_tags");
    await client.execute("DELETE FROM bullets");
    await client.execute("DELETE FROM experiences");
    await client.execute("DELETE FROM skill_groups");
    await client.execute("DELETE FROM education");
    await client.execute("DELETE FROM personal_info");
    await client.execute("DELETE FROM tags");
  }

  // 1. Personal Info
  if (data.personalInfo) {
    await db.insert(schema.personalInfo)
      .values({
        id: "primary",
        name: data.personalInfo.name,
        title: data.personalInfo.title,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        location: data.personalInfo.location,
        website: data.personalInfo.website,
        github: data.personalInfo.github,
        linkedin: data.personalInfo.linkedin,
        summary: data.personalInfo.summary,
        notes: data.personalInfo.notes,
      })
      .onConflictDoUpdate({
        target: schema.personalInfo.id,
        set: {
          name: data.personalInfo.name,
          title: data.personalInfo.title,
          email: data.personalInfo.email,
          phone: data.personalInfo.phone,
          location: data.personalInfo.location,
          website: data.personalInfo.website,
          github: data.personalInfo.github,
          linkedin: data.personalInfo.linkedin,
          summary: data.personalInfo.summary,
          notes: data.personalInfo.notes,
        },
      });
  }

  // Helper to get or insert tag
  const tagMap = new Map<string, string>(); // name -> id
  async function getOrCreateTag(tagName: string): Promise<string> {
    const cleanName = tagName.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (tagMap.has(cleanName)) return tagMap.get(cleanName)!;

    await db.insert(schema.tags)
      .values({ id: slug, name: cleanName })
      .onConflictDoNothing();

    tagMap.set(cleanName, slug);
    return slug;
  }

  // 2. Experiences & Bullets
  for (const [expIdx, exp] of data.experiences.entries()) {
    await db.insert(schema.experiences)
      .values({
        id: exp.id,
        company: exp.company,
        roleTitle: exp.roleTitle,
        startDate: exp.startDate,
        endDate: exp.endDate,
        location: exp.location,
        summary: exp.summary || null,
        notes: exp.notes || null,
        orderIndex: exp.orderIndex ?? expIdx + 1,
      })
      .onConflictDoUpdate({
        target: schema.experiences.id,
        set: {
          company: exp.company,
          roleTitle: exp.roleTitle,
          startDate: exp.startDate,
          endDate: exp.endDate,
          location: exp.location,
          summary: exp.summary || null,
          notes: exp.notes || null,
          orderIndex: exp.orderIndex ?? expIdx + 1,
        },
      });

    for (const [bIdx, b] of exp.bullets.entries()) {
      const bulletId = b.id || `${exp.id}-b${bIdx + 1}`;
      await db.insert(schema.bullets)
        .values({
          id: bulletId,
          experienceId: exp.id,
          content: b.content,
          isActive: b.isActive ?? true,
          priority: b.priority ?? 1,
          notes: b.notes,
          orderIndex: b.orderIndex ?? bIdx + 1,
        })
        .onConflictDoUpdate({
          target: schema.bullets.id,
          set: {
            content: b.content,
            isActive: b.isActive ?? true,
            priority: b.priority ?? 1,
            notes: b.notes,
            orderIndex: b.orderIndex ?? bIdx + 1,
          },
        });

      // Bullet tags
      if (b.tags && b.tags.length > 0) {
        for (const t of b.tags) {
          const tagId = await getOrCreateTag(t);
          await db.insert(schema.bulletTags)
            .values({ bulletId, tagId })
            .onConflictDoNothing();
        }
      }
    }
  }

  // 3. Education
  if (data.education) {
    for (const [eduIdx, edu] of data.education.entries()) {
      const eduId = edu.id || `edu-${eduIdx + 1}`;
      await db.insert(schema.education)
        .values({
          id: eduId,
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.startDate,
          endDate: edu.endDate,
          location: edu.location,
          courses: edu.courses || null,
          orderIndex: edu.orderIndex ?? eduIdx + 1,
        })
        .onConflictDoUpdate({
          target: schema.education.id,
          set: {
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field,
            startDate: edu.startDate,
            endDate: edu.endDate,
            location: edu.location,
            courses: edu.courses || null,
            orderIndex: edu.orderIndex ?? eduIdx + 1,
          },
        });
    }
  }

  // 4. Projects
  if (data.projects) {
    for (const [projIdx, proj] of data.projects.entries()) {
      const projId = proj.id || `proj-${projIdx + 1}`;
      await db.insert(schema.projects)
        .values({
          id: projId,
          title: proj.title,
          description: proj.description,
          technologies: proj.technologies || null,
          url: proj.url || null,
          orderIndex: proj.orderIndex ?? projIdx + 1,
        })
        .onConflictDoUpdate({
          target: schema.projects.id,
          set: {
            title: proj.title,
            description: proj.description,
            technologies: proj.technologies || null,
            url: proj.url || null,
            orderIndex: proj.orderIndex ?? projIdx + 1,
          },
        });
    }
  }

  // 5. Skill Groups
  if (data.skillGroups) {
    for (const [idx, sg] of data.skillGroups.entries()) {
      const sgId = sg.id || `skills-${idx + 1}`;
      const itemsStr = Array.isArray(sg.items) ? sg.items.join(", ") : sg.items;
      await db.insert(schema.skillGroups)
        .values({
          id: sgId,
          category: sg.category,
          items: itemsStr,
          orderIndex: sg.orderIndex ?? idx + 1,
        })
        .onConflictDoUpdate({
          target: schema.skillGroups.id,
          set: {
            category: sg.category,
            items: itemsStr,
            orderIndex: sg.orderIndex ?? idx + 1,
          },
        });
    }
  }

  // 5. Target Profiles
  if (data.targetProfiles) {
    for (const p of data.targetProfiles) {
      await db.insert(schema.targetProfiles)
        .values({
          id: p.id,
          name: p.name,
          targetRole: p.targetRole,
          summary: p.summary,
          maxPages: p.maxPages ?? 1,
          tagWeights: p.tagWeights ? JSON.stringify(p.tagWeights) : null,
        })
        .onConflictDoUpdate({
          target: schema.targetProfiles.id,
          set: {
            name: p.name,
            targetRole: p.targetRole,
            summary: p.summary,
            maxPages: p.maxPages ?? 1,
            tagWeights: p.tagWeights ? JSON.stringify(p.tagWeights) : null,
          },
        });

      if (p.selectedBulletIds && p.selectedBulletIds.length > 0) {
        for (const [oIdx, bId] of p.selectedBulletIds.entries()) {
          await db.insert(schema.profileBullets)
            .values({
              profileId: p.id,
              bulletId: bId,
              overrideOrder: oIdx + 1,
            })
            .onConflictDoNothing();
        }
      }
    }
  }

  // 6. Job Descriptions
  if (data.jobDescriptions) {
    for (const jd of data.jobDescriptions) {
      await db.insert(schema.jobDescriptions)
        .values({
          id: jd.id,
          company: jd.company,
          roleTitle: jd.roleTitle,
          rawText: jd.rawText,
          url: jd.url,
        })
        .onConflictDoUpdate({
          target: schema.jobDescriptions.id,
          set: {
            company: jd.company,
            roleTitle: jd.roleTitle,
            rawText: jd.rawText,
            url: jd.url,
          },
        });

      if (jd.requirements) {
        for (const [rIdx, req] of jd.requirements.entries()) {
          const reqId = req.id || `${jd.id}-req-${rIdx + 1}`;
          await db.insert(schema.jdRequirements)
            .values({
              id: reqId,
              jdId: jd.id,
              text: req.text,
              weight: req.weight ?? "medium",
              orderIndex: rIdx + 1,
            })
            .onConflictDoUpdate({
              target: schema.jdRequirements.id,
              set: {
                text: req.text,
                weight: req.weight ?? "medium",
                orderIndex: rIdx + 1,
              },
            });

          if (req.tags && req.tags.length > 0) {
            for (const t of req.tags) {
              const tagId = await getOrCreateTag(t);
              await db.insert(schema.jdRequirementTags)
                .values({ requirementId: reqId, tagId })
                .onConflictDoNothing();
            }
          }
        }
      }
    }
  }

  const expCount = data.experiences.length;
  const bulletCount = data.experiences.reduce((acc, e) => acc + e.bullets.length, 0);
  const tagCount = tagMap.size;
  return { expCount, bulletCount, tagCount };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const seedFile = path.resolve(process.cwd(), "data.seed/resume.yaml");
  console.log("Seeding database from", seedFile);
  importResumeYaml(seedFile, { replace: true })
    .then((res) => {
      console.log(`✓ Seeded ${res.expCount} experiences, ${res.bulletCount} bullets, ${res.tagCount} tags.`);
    })
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    });
}
