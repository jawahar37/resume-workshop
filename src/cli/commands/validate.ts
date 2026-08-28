import pc from "picocolors";
import { loadFullResume } from "../../loader/query.js";

export async function validateCommand() {
  console.log(pc.bold("\n🔍 Validating Master Record Integrity...\n"));
  const resume = await loadFullResume();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check personal info
  if (!resume.personalInfo.name || resume.personalInfo.name === "Unnamed Professional") {
    errors.push("personalInfo.name is missing or default");
  }
  if (!resume.personalInfo.email) {
    errors.push("personalInfo.email is missing");
  }

  // Check experiences
  if (resume.experiences.length === 0) {
    warnings.push("Master record has 0 experiences defined.");
  }

  const allBulletIds = new Set<string>();
  for (const exp of resume.experiences) {
    if (!exp.startDate) errors.push(`Experience '${exp.id}' is missing startDate`);
    if (exp.bullets.length === 0) warnings.push(`Experience '${exp.id}' has 0 bullets`);

    for (const b of exp.bullets) {
      if (allBulletIds.has(b.id)) {
        errors.push(`Duplicate bullet ID: '${b.id}'`);
      }
      allBulletIds.add(b.id);
    }
  }

  // Check target profiles
  for (const p of resume.targetProfiles) {
    if (p.selectedBulletIds) {
      for (const bId of p.selectedBulletIds) {
        if (!allBulletIds.has(bId)) {
          errors.push(`Profile '${p.id}' references nonexistent bullet ID: '${bId}'`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.log(pc.red(`❌ Found ${errors.length} validation errors:`));
    for (const err of errors) {
      console.log(`  • ${pc.red(err)}`);
    }
  } else {
    console.log(pc.green("✓ Relational integrity check passed. No broken references."));
  }

  if (warnings.length > 0) {
    console.log(pc.yellow(`\n⚠ ${warnings.length} warnings:`));
    for (const w of warnings) {
      console.log(`  • ${pc.yellow(w)}`);
    }
  }

  console.log("");
}
