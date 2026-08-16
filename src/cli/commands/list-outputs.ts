import path from "node:path";
import fs from "node:fs";
import pc from "picocolors";
import Table from "cli-table3";

export async function listOutputsCommand() {
  console.log(pc.bold("\n📂 Resume Workshop Generated Outputs\n"));

  const distDir = path.resolve(process.cwd(), "dist");
  const aliasesDir = path.join(distDir, "aliases");
  const artifactsDir = path.join(distDir, "artifacts");
  const textDir = path.join(distDir, "text");

  // Aliases
  console.log(pc.bold(pc.cyan("Always-Current Aliases (dist/aliases/):")));
  if (fs.existsSync(aliasesDir)) {
    const files = fs.readdirSync(aliasesDir).filter((f) => !f.startsWith("."));
    if (files.length > 0) {
      const table = new Table({ head: [pc.bold("File"), pc.bold("Size"), pc.bold("Last Modified")] });
      for (const f of files) {
        const stat = fs.statSync(path.join(aliasesDir, f));
        table.push([f, `${(stat.size / 1024).toFixed(1)} KB`, stat.mtime.toLocaleString()]);
      }
      console.log(table.toString());
    } else {
      console.log(pc.gray("  (No aliases built yet. Run 'rw build'.)"));
    }
  } else {
    console.log(pc.gray("  (Directory not created yet.)"));
  }

  // Artifacts
  console.log(pc.bold(pc.magenta("\nNamed Artifact Snapshots (dist/artifacts/):")));
  if (fs.existsSync(artifactsDir)) {
    const files = fs.readdirSync(artifactsDir).filter((f) => !f.startsWith("."));
    if (files.length > 0) {
      const table = new Table({ head: [pc.bold("File"), pc.bold("Size"), pc.bold("Last Modified")] });
      for (const f of files) {
        const stat = fs.statSync(path.join(artifactsDir, f));
        table.push([f, `${(stat.size / 1024).toFixed(1)} KB`, stat.mtime.toLocaleString()]);
      }
      console.log(table.toString());
    } else {
      console.log(pc.gray("  (No artifacts saved yet. Run 'rw snapshot --name <name>'.)"));
    }
  } else {
    console.log(pc.gray("  (Directory not created yet.)"));
  }

  // ATS Text
  console.log(pc.bold(pc.green("\nATS Plain Text / Markdown (dist/text/):")));
  if (fs.existsSync(textDir)) {
    const files = fs.readdirSync(textDir).filter((f) => !f.startsWith("."));
    if (files.length > 0) {
      const table = new Table({ head: [pc.bold("File"), pc.bold("Size"), pc.bold("Last Modified")] });
      for (const f of files) {
        const stat = fs.statSync(path.join(textDir, f));
        table.push([f, `${(stat.size / 1024).toFixed(1)} KB`, stat.mtime.toLocaleString()]);
      }
      console.log(table.toString());
    }
  }

  console.log("");
}
