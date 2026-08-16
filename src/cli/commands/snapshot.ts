import path from "node:path";
import fs from "node:fs";
import pc from "picocolors";
import { loadFullResume } from "../../loader/query.js";
import { filterResumeForProfile } from "../../loader/filter.js";
import { compileTypstToPdf } from "../../renderers/pdf/build.js";

export async function snapshotCommand(options: { profile?: string; name: string }) {
  if (!options.name) {
    console.error(pc.red("Error: Snapshot requires --name <snapshot-name>"));
    process.exit(1);
  }

  const profileId = options.profile || "full-stack-software-engineer";
  const dateStr = new Date().toISOString().split("T")[0];
  const cleanName = options.name.toLowerCase().replace(/[^a-z0-9-_]+/g, "-");
  const artifactFileName = `${cleanName}-${dateStr}`;

  const artifactsDir = path.resolve(process.cwd(), "dist/artifacts");
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

  const resume = await loadFullResume();
  const view = filterResumeForProfile(resume, profileId);

  const pdfPath = path.join(artifactsDir, `${artifactFileName}.pdf`);
  const typPath = path.join(artifactsDir, `${artifactFileName}.typ`);

  console.log(pc.bold(`\n📸 Creating Named Artifact Snapshot: ${pc.cyan(artifactFileName)}...`));
  const res = compileTypstToPdf(view, {
    outputPath: pdfPath,
    sourcePath: typPath,
  });

  if (res.success) {
    console.log(pc.green(`✓ Artifact PDF saved to: ${pdfPath}`));
    console.log(`  Profile: ${view.profileName} | Bullets: ${view.stats.selectedBulletsCount} | Date: ${dateStr}\n`);
  } else {
    console.log(pc.yellow(`⚠ ${res.message}`));
    console.log(pc.cyan(`  Typst source saved to: ${typPath}\n`));
  }
}
