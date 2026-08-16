import { getDatabase, DEFAULT_DB_PATH } from "../db/client.js";
import * as schema from "../db/schema.js";
import { eq, asc, desc, inArray } from "drizzle-orm";
import type { ResumeYaml } from "../schema/import.schema.js";

export interface LoadedBullet {
  id: string;
  experienceId: string;
  content: string;
  isActive: boolean;
  priority: number;
  notes: string | null;
  orderIndex: number;
  tags: string[];
}

export interface LoadedExperience {
  id: string;
  company: string;
  roleTitle: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  orderIndex: number;
  bullets: LoadedBullet[];
}

export interface LoadedProfile {
  id: string;
  name: string;
  targetRole: string;
  summary: string | null;
  maxPages: number;
  tagWeights: Record<string, string>;
  selectedBulletIds: string[];
}

export interface LoadedResume {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone?: string | null;
    location?: string | null;
    website?: string | null;
    github?: string | null;
    linkedin?: string | null;
    summary?: string | null;
  };
  experiences: LoadedExperience[];
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    location?: string | null;
  }>;
  skillGroups: Array<{
    id: string;
    category: string;
    items: string;
  }>;
  targetProfiles: LoadedProfile[];
  jobDescriptions: Array<{
    id: string;
    company: string;
    roleTitle: string;
    rawText: string;
    url?: string | null;
    requirements: Array<{
      id: string;
      text: string;
      weight: string;
      tags: string[];
    }>;
  }>;
}

export async function loadFullResume(dbPath = DEFAULT_DB_PATH): Promise<LoadedResume> {
  const { db } = getDatabase(dbPath);

  // 1. Personal Info
  const [pInfo] = await db.select().from(schema.personalInfo).limit(1);
  const personalInfo = pInfo || {
    name: "Unnamed Professional",
    title: "Software Engineer",
    email: "user@example.com",
    phone: null,
    location: null,
    website: null,
    github: null,
    linkedin: null,
    summary: null,
  };

  // 2. Experiences
  const allExperiences = await db
    .select()
    .from(schema.experiences)
    .orderBy(asc(schema.experiences.orderIndex));

  // 3. Bullets
  const allBullets = await db
    .select()
    .from(schema.bullets)
    .orderBy(asc(schema.bullets.orderIndex), asc(schema.bullets.priority));

  // 4. Bullet Tags
  const allBulletTags = await db
    .select({
      bulletId: schema.bulletTags.bulletId,
      tagName: schema.tags.name,
    })
    .from(schema.bulletTags)
    .innerJoin(schema.tags, eq(schema.bulletTags.tagId, schema.tags.id));

  const bulletTagsMap = new Map<string, string[]>();
  for (const bt of allBulletTags) {
    const list = bulletTagsMap.get(bt.bulletId) || [];
    list.push(bt.tagName);
    bulletTagsMap.set(bt.bulletId, list);
  }

  // 5. Structure experiences with bullets
  const expBulletMap = new Map<string, LoadedBullet[]>();
  for (const b of allBullets) {
    const list = expBulletMap.get(b.experienceId) || [];
    list.push({
      id: b.id,
      experienceId: b.experienceId,
      content: b.content,
      isActive: b.isActive,
      priority: b.priority,
      notes: b.notes,
      orderIndex: b.orderIndex,
      tags: bulletTagsMap.get(b.id) || [],
    });
    expBulletMap.set(b.experienceId, list);
  }

  const loadedExperiences: LoadedExperience[] = allExperiences.map((e) => ({
    id: e.id,
    company: e.company,
    roleTitle: e.roleTitle,
    startDate: e.startDate,
    endDate: e.endDate,
    location: e.location,
    orderIndex: e.orderIndex,
    bullets: expBulletMap.get(e.id) || [],
  }));

  // 6. Education
  const allEducation = await db
    .select()
    .from(schema.education)
    .orderBy(asc(schema.education.orderIndex));

  // 7. Skill groups
  const allSkills = await db
    .select()
    .from(schema.skillGroups)
    .orderBy(asc(schema.skillGroups.orderIndex));

  // 8. Profiles & Profile Bullets
  const allProfiles = await db.select().from(schema.targetProfiles);
  const allProfileBullets = await db.select().from(schema.profileBullets);

  const profileBulletsMap = new Map<string, string[]>();
  for (const pb of allProfileBullets) {
    const list = profileBulletsMap.get(pb.profileId) || [];
    list.push(pb.bulletId);
    profileBulletsMap.set(pb.profileId, list);
  }

  const loadedProfiles: LoadedProfile[] = allProfiles.map((p) => {
    let tagWeights: Record<string, string> = {};
    if (p.tagWeights) {
      try {
        tagWeights = JSON.parse(p.tagWeights);
      } catch {}
    }
    return {
      id: p.id,
      name: p.name,
      targetRole: p.targetRole,
      summary: p.summary,
      maxPages: p.maxPages,
      tagWeights,
      selectedBulletIds: profileBulletsMap.get(p.id) || [],
    };
  });

  // 9. Job Descriptions & Requirements
  const allJds = await db.select().from(schema.jobDescriptions);
  const allReqs = await db.select().from(schema.jdRequirements).orderBy(asc(schema.jdRequirements.orderIndex));
  const allReqTags = await db
    .select({
      requirementId: schema.jdRequirementTags.requirementId,
      tagName: schema.tags.name,
    })
    .from(schema.jdRequirementTags)
    .innerJoin(schema.tags, eq(schema.jdRequirementTags.tagId, schema.tags.id));

  const reqTagsMap = new Map<string, string[]>();
  for (const rt of allReqTags) {
    const list = reqTagsMap.get(rt.requirementId) || [];
    list.push(rt.tagName);
    reqTagsMap.set(rt.requirementId, list);
  }

  const jdReqMap = new Map<string, any[]>();
  for (const r of allReqs) {
    const list = jdReqMap.get(r.jdId) || [];
    list.push({
      id: r.id,
      text: r.text,
      weight: r.weight,
      tags: reqTagsMap.get(r.id) || [],
    });
    jdReqMap.set(r.jdId, list);
  }

  const loadedJds = allJds.map((jd) => ({
    id: jd.id,
    company: jd.company,
    roleTitle: jd.roleTitle,
    rawText: jd.rawText,
    url: jd.url,
    requirements: jdReqMap.get(jd.id) || [],
  }));

  return {
    personalInfo,
    experiences: loadedExperiences,
    education: allEducation,
    skillGroups: allSkills,
    targetProfiles: loadedProfiles,
    jobDescriptions: loadedJds,
  };
}

export async function exportResumeToYaml(dbPath = DEFAULT_DB_PATH): Promise<string> {
  const full = await loadFullResume(dbPath);
  const YAML = await import("yaml");
  return YAML.stringify(full);
}
