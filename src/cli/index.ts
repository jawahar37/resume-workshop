#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { statusCommand } from "./commands/status.js";
import { validateCommand } from "./commands/validate.js";
import { importCommand } from "./commands/import.js";
import { exportCommand } from "./commands/export.js";
import { buildCommand } from "./commands/build.js";
import { snapshotCommand } from "./commands/snapshot.js";
import { previewCommand } from "./commands/preview.js";
import { diffCommand } from "./commands/diff.js";
import { listOutputsCommand } from "./commands/list-outputs.js";
import {
  listBullets,
  addBullet,
  updateBullet,
  activateBullet,
  deactivateBullet,
  tagBullet,
} from "./commands/bullet.js";
import { listExperiences, addExperience } from "./commands/experience.js";
import {
  listProfiles,
  createProfile,
  autoSelectProfileBullets,
  setProfileTagWeight,
} from "./commands/profile.js";
import { listJds, addJd, addJdRequirement, showJd } from "./commands/jd.js";

const program = new Command();

program
  .name("rw")
  .description("Resume Workshop (rw) — Career vault & high-precision Typst resume renderer")
  .version("0.1.0");

// 1. init
program
  .command("init")
  .description("Initialize .data/resume.db from seed examples and create data/resume.yaml")
  .option("-f, --force", "Force re-initialization and overwrite existing database")
  .action(initCommand);

// 2. status
program
  .command("status")
  .description("Show summary of master career vault, active bullets per role, and target profiles")
  .option("-p, --profile <profile>", "Show detailed breakdown for a specific profile")
  .action(statusCommand);

// 3. validate
program
  .command("validate")
  .description("Validate database integrity, foreign keys, and profile bullet references")
  .action(validateCommand);

// 4. import
program
  .command("import")
  .description("Import resume data from a structured YAML file")
  .requiredOption("-y, --yaml <file>", "Path to YAML file to import")
  .option("-r, --replace", "Wipe existing database and replace completely")
  .action(importCommand);

// 5. export
program
  .command("export")
  .description("Export master database to YAML snapshot")
  .option("-o, --output <file>", "Output file path (default stdout)")
  .action(exportCommand);

// 6. build
program
  .command("build")
  .description("Compile all PDF & Markdown aliases from master vault")
  .option("-p, --profile <profile>", "Build a specific profile alias")
  .option("-f, --format <formats>", "Comma-separated output formats: pdf,md (default: pdf,md)")
  .action(buildCommand);

// 7. snapshot
program
  .command("snapshot")
  .description("Create a named, timestamped artifact snapshot in dist/artifacts/")
  .requiredOption("-n, --name <name>", "Snapshot name (e.g. google-staff-infra)")
  .option("-p, --profile <profile>", "Target profile to render (default: staff-eng)")
  .action(snapshotCommand);

// 8. preview
program
  .command("preview")
  .description("Compile single-profile preview PDF in dist/preview/")
  .option("-p, --profile <profile>", "Target profile to preview (default: staff-eng)")
  .option("-o, --open", "Open PDF in OS system default viewer")
  .action(previewCommand);

// 9. diff
program
  .command("diff")
  .description("Check if database state has unexported changes compared to data/resume.yaml")
  .action(diffCommand);

// 10. list-outputs
program
  .command("list-outputs")
  .description("List all generated aliases, snapshots, and text files in dist/")
  .action(listOutputsCommand);

// 11. bullet subcommands
const bulletCmd = program.command("bullet").description("Manage accomplishment bullets");

bulletCmd
  .command("list")
  .description("List all bullets in the vault")
  .option("-e, --experience <id>", "Filter by experience ID")
  .action(listBullets);

bulletCmd
  .command("add")
  .description("Add a new bullet to an experience")
  .requiredOption("-e, --experience <id>", "Experience ID")
  .requiredOption("-c, --content <text>", "Accomplishment bullet text")
  .option("--id <id>", "Custom bullet ID")
  .option("--active", "Set bullet active (default true)")
  .option("--inactive", "Set bullet inactive / alternate")
  .option("--priority <n>", "Priority score (1 = highest)")
  .option("--notes <text>", "Raw notes / context")
  .option("--tags <tags>", "Comma-separated tags")
  .action(addBullet);

bulletCmd
  .command("update")
  .description("Update an existing bullet")
  .requiredOption("-i, --id <id>", "Bullet ID")
  .option("-c, --content <text>", "New bullet text")
  .option("--priority <n>", "New priority score")
  .option("--notes <text>", "Updated notes")
  .action(updateBullet);

bulletCmd
  .command("activate")
  .description("Activate a bullet globally or for a specific profile")
  .requiredOption("-i, --id <id>", "Bullet ID")
  .option("-p, --profile <profile>", "Profile ID to activate for")
  .action(activateBullet);

bulletCmd
  .command("deactivate")
  .description("Deactivate a bullet globally or remove from a specific profile")
  .requiredOption("-i, --id <id>", "Bullet ID")
  .option("-p, --profile <profile>", "Profile ID to deactivate for")
  .action(deactivateBullet);

bulletCmd
  .command("tag")
  .description("Add tags to a bullet")
  .requiredOption("-i, --id <id>", "Bullet ID")
  .requiredOption("-t, --tags <tags>", "Comma-separated tags")
  .action(tagBullet);

// 12. experience subcommands
const expCmd = program.command("experience").description("Manage work experiences");

expCmd
  .command("list")
  .description("List all work experiences")
  .action(listExperiences);

expCmd
  .command("add")
  .description("Add a new work experience")
  .requiredOption("-i, --id <id>", "Experience ID (e.g. nebula-staff)")
  .requiredOption("-c, --company <name>", "Company name")
  .requiredOption("-t, --title <title>", "Role title")
  .requiredOption("-s, --start <date>", "Start date (YYYY-MM)")
  .option("-e, --end <date>", "End date (YYYY-MM or Present)")
  .option("-l, --location <loc>", "Location")
  .action(addExperience);

// 13. profile subcommands
const profCmd = program.command("profile").description("Manage target resume profiles");

profCmd
  .command("list")
  .description("List all target profiles")
  .action(listProfiles);

profCmd
  .command("create")
  .description("Create a new target profile")
  .requiredOption("-i, --id <id>", "Profile slug (e.g. principal-eng)")
  .requiredOption("-n, --name <name>", "Display name")
  .requiredOption("-r, --role <role>", "Target role headline")
  .option("-p, --max-pages <n>", "Page limit constraint (1 or 2)")
  .option("-s, --summary <text>", "Profile-tailored summary")
  .action(createProfile);

profCmd
  .command("auto-select")
  .description("Auto-select best-matching bullets for a profile based on tag matching")
  .requiredOption("-p, --profile <id>", "Target profile ID")
  .option("-t, --tags <tags>", "Target tags (default: profile's weighted tags)")
  .action(autoSelectProfileBullets);

profCmd
  .command("set-tag-weight")
  .description("Set tag weight for a profile")
  .requiredOption("-p, --profile <id>", "Profile ID")
  .requiredOption("-t, --tag <tag>", "Tag name")
  .requiredOption("-w, --weight <weight>", "Weight: high | medium | low")
  .action(setProfileTagWeight);

// 14. jd subcommands
const jdCmd = program.command("jd").description("Manage stored Job Descriptions (ground-truth question text)");

jdCmd
  .command("list")
  .description("List all stored Job Descriptions")
  .action(listJds);

jdCmd
  .command("add")
  .description("Add a new Job Description")
  .requiredOption("-i, --id <id>", "JD ID (e.g. google-staff-infra)")
  .requiredOption("-c, --company <name>", "Company name")
  .requiredOption("-r, --role <title>", "Role title")
  .option("-f, --file <path>", "File containing JD text")
  .option("-t, --text <text>", "Raw JD text")
  .option("-u, --url <url>", "Job posting URL")
  .action(addJd);

jdCmd
  .command("add-requirement")
  .description("Add a parsed requirement snippet to a Job Description")
  .requiredOption("-j, --jd <id>", "JD ID")
  .requiredOption("-t, --text <snippet>", "Requirement snippet text")
  .option("-i, --id <id>", "Requirement ID")
  .option("-w, --weight <weight>", "Importance: high | medium | low")
  .option("--tags <tags>", "Comma-separated tag associations")
  .action(addJdRequirement);

jdCmd
  .command("show")
  .description("Show a stored Job Description with parsed requirements")
  .requiredOption("-i, --id <id>", "JD ID")
  .action(showJd);

program.parse(process.argv);
