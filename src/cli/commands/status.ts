import Table from "cli-table3";
import pc from "picocolors";
import { loadFullResume } from "../../loader/query.js";
import { filterResumeForProfile } from "../../loader/filter.js";

export async function statusCommand(options: { profile?: string }) {
  const resume = await loadFullResume();

  if (options.profile) {
    const view = filterResumeForProfile(resume, options.profile);
    console.log(pc.bold(`\n📋 Profile Status: ${pc.cyan(view.profileName)} (${view.profileId})`));
    console.log(`Target Role: ${pc.gray(resume.targetProfiles.find(p => p.id === options.profile)?.targetRole || "")}`);
    console.log(`Pages: ${view.stats.estimatedPageCount} / ${view.maxPages} max ${view.stats.isOverLimit ? pc.red("⚠ Exceeds limit!") : pc.green("✓ Within limit")}`);
    console.log(`Selected Bullets: ${pc.green(view.stats.selectedBulletsCount)} of ${view.stats.totalMasterBullets} master bullets\n`);

    const table = new Table({
      head: [pc.bold("Role / Company"), pc.bold("Selected Bullets"), pc.bold("Tags")],
      colWidths: [30, 45, 25],
      wordWrap: true,
    });

    for (const exp of view.experiences) {
      const bulletsText = exp.bullets
        .map((b, i) => `${i + 1}. ${b.content}`)
        .join("\n\n");
      const tagsText = Array.from(new Set(exp.bullets.flatMap(b => b.tags))).join(", ");
      table.push([`${exp.roleTitle}\n${pc.gray(exp.company)}`, bulletsText, tagsText]);
    }

    console.log(table.toString());
    return;
  }

  // Global vault status
  console.log(pc.bold("\n🗄️  Career Vault Status — Master Overview\n"));
  console.log(`Professional: ${pc.bold(pc.cyan(resume.personalInfo.name))} (${resume.personalInfo.title})`);
  console.log(`Contact: ${resume.personalInfo.email} | ${resume.personalInfo.location || "Remote"}\n`);

  // Experiences & Bullets Table
  const expTable = new Table({
    head: [pc.bold("Experience ID"), pc.bold("Role & Company"), pc.bold("Dates"), pc.bold("Active"), pc.bold("Alternates"), pc.bold("Total")],
  });

  let totalActive = 0;
  let totalInactive = 0;

  for (const exp of resume.experiences) {
    const activeCount = exp.bullets.filter(b => b.isActive).length;
    const inactiveCount = exp.bullets.filter(b => !b.isActive).length;
    totalActive += activeCount;
    totalInactive += inactiveCount;

    const dates = exp.endDate ? `${exp.startDate} - ${exp.endDate}` : `${exp.startDate} - Present`;
    expTable.push([
      exp.id,
      `${exp.roleTitle} @ ${exp.company}`,
      dates,
      pc.green(activeCount.toString()),
      pc.yellow(inactiveCount.toString()),
      exp.bullets.length.toString(),
    ]);
  }

  console.log(pc.bold("Experiences & Accomplishments:"));
  console.log(expTable.toString());
  console.log(`Totals: ${pc.green(totalActive + " active")} | ${pc.yellow(totalInactive + " alternate")} | ${pc.bold((totalActive + totalInactive) + " total bullets")}\n`);

  // Profiles Table
  const profTable = new Table({
    head: [pc.bold("Profile ID"), pc.bold("Name"), pc.bold("Max Pages"), pc.bold("Selected Bullets")],
  });

  for (const p of resume.targetProfiles) {
    const view = filterResumeForProfile(resume, p.id);
    profTable.push([
      p.id,
      p.name,
      `${p.maxPages} pg`,
      `${view.stats.selectedBulletsCount} bullets (${view.stats.estimatedPageCount} est. pg)`,
    ]);
  }

  console.log(pc.bold("Target Profiles:"));
  console.log(profTable.toString());

  // Job Descriptions Table
  if (resume.jobDescriptions.length > 0) {
    const jdTable = new Table({
      head: [pc.bold("JD ID"), pc.bold("Company & Role"), pc.bold("Requirements")],
    });
    for (const jd of resume.jobDescriptions) {
      jdTable.push([jd.id, `${jd.roleTitle} @ ${jd.company}`, `${jd.requirements.length} parsed reqs`]);
    }
    console.log(pc.bold("\nStored Job Descriptions:"));
    console.log(jdTable.toString());
  }

  console.log("");
}
