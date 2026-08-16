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

  const configPath = path.resolve(process.cwd(), "render.config.yaml");
  let aliasesConfig: Record<string, { profile: string; description?: string }> = {};

  if (fs.existsSync(configPath)) {
    try {
      const parsed = YAML.parse(fs.readFileSync(configPath, "utf8"));
      if (parsed && parsed.aliases) {
        aliasesConfig = parsed.aliases;
      }
    } catch {}
  }

  // If no aliases configured, use profiles from database
  if (Object.keys(aliasesConfig).length === 0) {
    for (const p of resume.targetProfiles) {
      aliasesConfig[`resume-${p.id}`] = { profile: p.id };
    }
  }

  // Filter aliases if --profile specified
  let targets = Object.entries(aliasesConfig);
  if (options.profile) {
    targets = targets.filter(([_, conf]) => conf.profile === options.profile);
    if (targets.length === 0) {
      // Create a direct alias for the profile
      targets = [[`resume-${options.profile}`, { profile: options.profile }]];
    }
  }

  const formats = options.format ? options.format.split(",") : ["pdf", "md"];

  const aliasesDir = path.resolve(process.cwd(), "dist/aliases");
  const textDir = path.resolve(process.cwd(), "dist/text");
  if (!fs.existsSync(aliasesDir)) fs.mkdirSync(aliasesDir, { recursive: true });
  if (!fs.existsSync(textDir)) fs.mkdirSync(textDir, { recursive: true });

  for (const [aliasName, conf] of targets) {
    const view = filterResumeForProfile(resume, conf.profile);
    console.log(pc.cyan(`\nRendering alias: ${pc.bold(aliasName)} (profile: ${conf.profile})`));

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
