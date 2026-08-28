import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Personal information / Contact details
export const personalInfo = sqliteTable("personal_info", {
  id: text("id").primaryKey().default("primary"),
  name: text("name").notNull(),
  title: text("title").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  website: text("website"),
  github: text("github"),
  linkedin: text("linkedin"),
  summary: text("summary"),
  notes: text("notes"), // Freetext master record context notes
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// Work experiences / roles
export const experiences = sqliteTable("experiences", {
  id: text("id").primaryKey(), // e.g. "nebula-staff"
  company: text("company").notNull(),
  roleTitle: text("role_title").notNull(),
  startDate: text("start_date").notNull(), // e.g. "2024-03"
  endDate: text("end_date"), // e.g. "Present" or "2026-08"
  location: text("location"),
  summary: text("summary"), // Optional high-level role overview describing operational scope & context
  notes: text("notes"), // Freetext role context notes (PRs, tech details, internal team context)
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// Accomplishment bullets
export const bullets = sqliteTable("bullets", {
  id: text("id").primaryKey(), // e.g. "nebula-tracing"
  experienceId: text("experience_id")
    .notNull()
    .references(() => experiences.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  priority: integer("priority").notNull().default(1), // 1 = highest priority
  notes: text("notes"), // raw work notes / context
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// Categorization tags
export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(), // e.g. "distributed-systems"
  name: text("name").notNull().unique(), // e.g. "Distributed Systems"
  category: text("category"), // e.g. "Architecture", "Language", "Domain"
});

// Bullet <-> Tag junction
export const bulletTags = sqliteTable(
  "bullet_tags",
  {
    bulletId: text("bullet_id")
      .notNull()
      .references(() => bullets.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.bulletId, table.tagId] }),
  ]
);

// Target Profiles (e.g. staff-eng, engineering-manager)
export const targetProfiles = sqliteTable("target_profiles", {
  id: text("id").primaryKey(), // slug: "staff-eng"
  name: text("name").notNull(), // "Staff Engineer"
  targetRole: text("target_role").notNull(),
  outputAlias: text("output_alias"), // e.g. "Alex_Mercer_resume"
  summary: text("summary"), // Profile-tailored executive summary
  maxPages: integer("max_pages").notNull().default(1),
  tagWeights: text("tag_weights"), // JSON string: { "Distributed Systems": "high", "Leadership": "medium" }
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// Profile <-> Bullet cherry-picking junction
export const profileBullets = sqliteTable(
  "profile_bullets",
  {
    profileId: text("profile_id")
      .notNull()
      .references(() => targetProfiles.id, { onDelete: "cascade" }),
    bulletId: text("bullet_id")
      .notNull()
      .references(() => bullets.id, { onDelete: "cascade" }),
    textOverride: text("text_override"),
    overrideOrder: integer("override_order"),
  },
  (table) => [
    primaryKey({ columns: [table.profileId, table.bulletId] }),
  ]
);

// Stored Job Descriptions (First-class ground-truth data)
export const jobDescriptions = sqliteTable("job_descriptions", {
  id: text("id").primaryKey(), // e.g. "google-staff-infra"
  company: text("company").notNull(),
  roleTitle: text("role_title").notNull(),
  rawText: text("raw_text").notNull(),
  url: text("url"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// Parsed requirements from Job Descriptions
export const jdRequirements = sqliteTable("jd_requirements", {
  id: text("id").primaryKey(),
  jdId: text("jd_id")
    .notNull()
    .references(() => jobDescriptions.id, { onDelete: "cascade" }),
  text: text("text").notNull(), // snippet
  weight: text("weight").notNull().default("medium"), // "high" | "medium" | "low"
  orderIndex: integer("order_index").notNull().default(0),
});

// JD Requirement <-> Tag junction
export const jdRequirementTags = sqliteTable(
  "jd_requirement_tags",
  {
    requirementId: text("requirement_id")
      .notNull()
      .references(() => jdRequirements.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.requirementId, table.tagId] }),
  ]
);

// Education
export const education = sqliteTable("education", {
  id: text("id").primaryKey(),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  field: text("field"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  location: text("location"),
  courses: text("courses"),
  orderIndex: integer("order_index").notNull().default(0),
});

// Skill groups
export const skillGroups = sqliteTable("skill_groups", {
  id: text("id").primaryKey(),
  category: text("category").notNull(), // e.g. "Languages & Runtimes"
  items: text("items").notNull(), // comma-separated or list: "TypeScript, Go, Rust, Python, C++"
  orderIndex: integer("order_index").notNull().default(0),
});

// Academic & Side Projects
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  technologies: text("technologies"),
  url: text("url"),
  orderIndex: integer("order_index").notNull().default(0),
});
