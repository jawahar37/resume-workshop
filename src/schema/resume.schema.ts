import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import * as dbSchema from "../db/schema.js";

export const insertPersonalInfoSchema = createInsertSchema(dbSchema.personalInfo);
export const selectPersonalInfoSchema = createSelectSchema(dbSchema.personalInfo);

export const insertExperienceSchema = createInsertSchema(dbSchema.experiences);
export const selectExperienceSchema = createSelectSchema(dbSchema.experiences);

export const insertBulletSchema = createInsertSchema(dbSchema.bullets);
export const selectBulletSchema = createSelectSchema(dbSchema.bullets);

export const insertTagSchema = createInsertSchema(dbSchema.tags);
export const selectTagSchema = createSelectSchema(dbSchema.tags);

export const insertTargetProfileSchema = createInsertSchema(dbSchema.targetProfiles);
export const selectTargetProfileSchema = createSelectSchema(dbSchema.targetProfiles);

export const insertJobDescriptionSchema = createInsertSchema(dbSchema.jobDescriptions);
export const selectJobDescriptionSchema = createSelectSchema(dbSchema.jobDescriptions);

export const insertJdRequirementSchema = createInsertSchema(dbSchema.jdRequirements);
export const selectJdRequirementSchema = createSelectSchema(dbSchema.jdRequirements);
