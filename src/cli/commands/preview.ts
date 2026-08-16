import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";
import pc from "picocolors";
import { loadFullResume } from "../../loader/query.js";
import { filterResumeForProfile } from "../../loader/filter.js";
import { compileTypstToPdf, isTypstInstalled } from "../../renderers/pdf/build.js";

export async function previewCommand(options: { profile?: string; open?: boolean }) {
  const profileId = options.profile || "staff-eng";
  const resume = await loadFullResume();
  const view = filterResumeForProfile(resume, profileId);

  const previewDir = path.resolve(process.cwd(), "dist/preview");
  if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });

  const pdfPath = path.join(previewDir, `preview-${profileId}.pdf`);
  const typPath = path.join(previewDir, `preview-${profileId}.typ`);

  console.log(pc.bold(`\n👁️  Generating Preview for Profile: ${pc.cyan(view.profileName)}...`));
  const res = compileTypstToPdf(view, {
    outputPath: pdfPath,
    sourcePath: typPath,
  });

  if (res.success && fs.existsSync(pdfPath)) {
    console.log(pc.green(`✓ Compiled preview PDF at: ${pdfPath}`));
    if (options.open) {
      console.log(pc.gray("Opening in system default viewer..."));
      try {
        if (process.platform === "darwin") {
          execSync(`open "${pdfPath}"`);
        } else if (process.platform === "win32") {
          execSync(`start "" "${pdfPath}"`);
        } else {
          execSync(`xdg-open "${pdfPath}"`);
        }
      } catch {
        console.log(`Open manually: ${pdfPath}`);
      }
    }
  } else {
    console.log(pc.yellow(`⚠ ${res.message}`));
    console.log(`Typst source viewable at: ${typPath}\n`);
  }
}
