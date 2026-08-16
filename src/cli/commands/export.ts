import path from "node:path";
import fs from "node:fs";
import pc from "picocolors";
import { exportResumeToYaml } from "../../loader/query.js";

export async function exportCommand(options: { yaml?: boolean; output?: string }) {
  const yamlContent = await exportResumeToYaml();

  if (options.output) {
    const outPath = path.resolve(process.cwd(), options.output);
    const outDir = path.dirname(outPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(outPath, yamlContent, "utf8");
    console.log(pc.green(`✓ Exported vault snapshot to ${pc.cyan(options.output)}`));
  } else {
    // Write to stdout
    process.stdout.write(yamlContent);
  }
}
