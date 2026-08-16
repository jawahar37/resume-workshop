import { z } from "zod";

export const BulletImportSchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1, "Bullet content cannot be empty"),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(1),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  orderIndex: z.number().int().default(0),
});

export const ExperienceImportSchema = z.object({
  id: z.string().min(1, "Experience id is required"),
  company: z.string().min(1, "Company name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().default("Present"),
  location: z.string().optional(),
  summary: z.string().optional(),
  notes: z.string().optional(),
  orderIndex: z.number().int().default(0),
  bullets: z.array(BulletImportSchema).default([]),
});

export const EducationImportSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  courses: z.string().optional(),
  orderIndex: z.number().int().default(0),
});

export const ProjectImportSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(1, "Project description is required"),
  technologies: z.string().optional(),
  url: z.string().optional(),
  orderIndex: z.number().int().default(0),
});

export const SkillGroupImportSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  items: z.union([z.string(), z.array(z.string())]),
  orderIndex: z.number().int().default(0),
});

export const TargetProfileImportSchema = z.object({
  id: z.string().min(1, "Profile id is required"),
  name: z.string().min(1, "Profile name is required"),
  targetRole: z.string().min(1, "Target role is required"),
  outputAlias: z.string().optional(),
  summary: z.string().optional(),
  maxPages: z.number().int().default(1),
  tagWeights: z.record(z.string(), z.string()).optional(),
  selectedBulletIds: z.array(z.string()).optional(),
});

export const JdRequirementImportSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Requirement text snippet is required"),
  weight: z.enum(["high", "medium", "low"]).default("medium"),
  tags: z.array(z.string()).default([]),
  orderIndex: z.number().int().default(0),
});

export const JobDescriptionImportSchema = z.object({
  id: z.string().min(1, "Job description id is required"),
  company: z.string().min(1, "Company is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  rawText: z.string().min(1, "Raw text is required"),
  url: z.string().optional(),
  requirements: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().min(1, "Requirement text is required"),
        weight: z.enum(["high", "medium", "low"]).default("medium"),
        tags: z.array(z.string()).default([]),
      })
    )
    .optional()
    .default([]),
});

export const PersonalInfoImportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  summary: z.string().optional(),
  notes: z.string().optional(),
});

export const ResumeYamlSchema = z.object({
  personalInfo: PersonalInfoImportSchema.optional(),
  experiences: z.array(ExperienceImportSchema).optional().default([]),
  education: z.array(EducationImportSchema).optional().default([]),
  projects: z.array(ProjectImportSchema).optional().default([]),
  skillGroups: z.array(SkillGroupImportSchema).optional().default([]),
  targetProfiles: z.array(TargetProfileImportSchema).optional().default([]),
  jobDescriptions: z.array(JobDescriptionImportSchema).optional().default([]),
});

export type ResumeYaml = z.infer<typeof ResumeYamlSchema>;
export type ExperienceImport = z.infer<typeof ExperienceImportSchema>;
export type BulletImport = z.infer<typeof BulletImportSchema>;
export type TargetProfileImport = z.infer<typeof TargetProfileImportSchema>;
export type JobDescriptionImport = z.infer<typeof JobDescriptionImportSchema>;
