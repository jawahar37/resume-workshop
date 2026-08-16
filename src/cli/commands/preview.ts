import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";
import pc from "picocolors";
import Table from "cli-table3";
import { loadFullResume } from "../../loader/query.js";
import { filterResumeForProfile, loadFullVaultResumeView } from "../../loader/filter.js";
import { compileTypstToPdf } from "../../renderers/pdf/build.js";

export async function previewCommand(options: {
  profile?: string;
  open?: boolean;
  view?: string;
  heatmap?: boolean;
  fullVault?: boolean;
}) {
  const profileId = options.profile || "full-stack-software-engineer";
  const resume = await loadFullResume();
  const filteredView = filterResumeForProfile(resume, profileId);
  const fullVaultView = loadFullVaultResumeView(resume, profileId);

  // Target profile preview directory: dist/preview/<profile-id>/
  const profileDir = path.resolve(process.cwd(), `dist/preview/${profileId}`);
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  console.log(
    pc.bold(
      `\n📁 Multi-View Previews for Profile: ${pc.cyan(filteredView.profileName)} (${profileId})\n`
    )
  );

  // 1. Primary Active Resume View
  const resumePdfPath = path.join(profileDir, "1-resume.pdf");
  const resumeTypPath = path.join(profileDir, "1-resume.typ");
  const res1 = compileTypstToPdf(filteredView, {
    outputPath: resumePdfPath,
    sourcePath: resumeTypPath,
  });

  // 2. Skill Heatmap View (LLM-assisted default)
  const heatmapPdfPath = path.join(profileDir, "2-heatmap.pdf");
  const heatmapTypPath = path.join(profileDir, "2-heatmap.typ");
  const res2 = compileTypstToPdf(filteredView, {
    outputPath: heatmapPdfPath,
    sourcePath: heatmapTypPath,
    heatmap: true,
    llm: true,
  });

  // 3. Full Career Vault View (Shaded inactive bullets)
  const fullVaultPdfPath = path.join(profileDir, "3-full-vault.pdf");
  const fullVaultTypPath = path.join(profileDir, "3-full-vault.typ");
  const res3 = compileTypstToPdf(fullVaultView, {
    outputPath: fullVaultPdfPath,
    sourcePath: fullVaultTypPath,
    fullVault: true,
  });

  // Display Table of Multi-View PDF Outputs
  const table = new Table({
    head: [
      pc.bold("View Type"),
      pc.bold("PDF File"),
      pc.bold("Description"),
      pc.bold("Status"),
    ],
  });

  table.push(
    [
      pc.bold(pc.cyan("1. Primary Resume")),
      "1-resume.pdf",
      "Publication active resume",
      res1.success ? pc.green("✓ Built") : pc.red("Failed"),
    ],
    [
      pc.bold(pc.magenta("2. Skill Heatmap")),
      "2-heatmap.pdf",
      "Color-coded skill heatmap (LLM)",
      res2.success ? pc.green("✓ Built") : pc.red("Failed"),
    ],
    [
      pc.bold(pc.yellow("3. Full Vault")),
      "3-full-vault.pdf",
      "All points (inactive shaded)",
      res3.success ? pc.green("✓ Built") : pc.red("Failed"),
    ]
  );

  console.log(table.toString());
  console.log(pc.gray(`\nView files stored in: ${profileDir}`));

  // Determine file to open if --open is passed
  if (options.open) {
    let targetPdf = resumePdfPath;
    if (options.view === "heatmap" || options.heatmap) {
      targetPdf = heatmapPdfPath;
    } else if (options.view === "full-vault" || options.fullVault) {
      targetPdf = fullVaultPdfPath;
    }

    if (fs.existsSync(targetPdf)) {
      console.log(pc.gray(`Opening in system default viewer: ${path.basename(targetPdf)}...`));
      try {
        if (process.platform === "darwin") {
          execSync(`open "${targetPdf}"`);
        } else if (process.platform === "win32") {
          execSync(`start "" "${targetPdf}"`);
        } else {
          execSync(`xdg-open "${targetPdf}"`);
        }
      } catch {
        console.log(`Open manually: ${targetPdf}`);
      }
    }
  }
}
