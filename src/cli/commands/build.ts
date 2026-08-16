import path from "node:path";
import fs from "node:fs";
import pc from "picocolors";
import YAML from "yaml";
import { loadFullResume } from "../../loader/query.js";
import { filterResumeForProfile } from "../../loader/filter.js";
import { compileTypstToPdf } from "../../renderers/pdf/build.js";
import { renderMarkdownSource } from "../../renderers/markdown/renderer.js";

export async function buildCommand(options: { profile?: string; format?: string }) {
  console.log(pc.bold("\n🚀 Building Resume Workshop Outputs..."));
  const resume = await loadFullResume();

  const targets: Array<[string, string]> = [];
  for (const p of resume.targetProfiles) {
    if (options.profile && p.id !== options.profile) continue;
    const aliasName = p.outputAlias || `resume-${p.id}`;
    targets.push([aliasName, p.id]);
  }

  const formats = options.format ? options.format.split(",") : ["pdf", "md"];

  const aliasesDir = path.resolve(process.cwd(), "dist/aliases");
  const textDir = path.resolve(process.cwd(), "dist/text");
  if (!fs.existsSync(aliasesDir)) fs.mkdirSync(aliasesDir, { recursive: true });
  if (!fs.existsSync(textDir)) fs.mkdirSync(textDir, { recursive: true });

  for (const [aliasName, profileId] of targets) {
    const view = filterResumeForProfile(resume, profileId);
    console.log(pc.cyan(`\nRendering alias: ${pc.bold(aliasName)} (profile: ${profileId})`));

    if (formats.includes("pdf")) {
      const pdfPath = path.join(aliasesDir, `${aliasName}.pdf`);
      const typPath = path.join(aliasesDir, `${aliasName}.typ`);
      const res = compileTypstToPdf(view, {
        outputPath: pdfPath,
        sourcePath: typPath,
      });

      if (res.success) {
        console.log(`  ${pc.green("✓")} PDF: ${pc.bold(pdfPath)} (${view.stats.selectedBulletsCount} bullets, ~${view.stats.estimatedPageCount} pg)`);
      } else {
        console.log(`  ${pc.yellow("⚠")} ${res.message}`);
      }

      if (view.stats.isOverLimit) {
        console.log(
          `  ${pc.red(`⚠ Warning: Exceeds target ${view.maxPages} page limit (est. ${view.stats.estimatedPageCount} pages).`)}`
        );
      }
    }

    if (formats.includes("md")) {
      const mdPath = path.join(textDir, `${aliasName}.md`);
      const mdContent = renderMarkdownSource(view);
      fs.writeFileSync(mdPath, mdContent, "utf8");
      console.log(`  ${pc.green("✓")} Text: ${pc.bold(mdPath)} (ATS plain text)`);
    }
  }

  console.log(pc.bold("\n✓ Build completed.\n"));
}
