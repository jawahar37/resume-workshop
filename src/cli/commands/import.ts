import path from "node:path";
import fs from "node:fs";
import pc from "picocolors";
import { importResumeYaml } from "../../db/seed.js";

export async function importCommand(options: { yaml: string; replace?: boolean }) {
  if (!options.yaml) {
    console.error(pc.red("Error: Missing required --yaml <file> path."));
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), options.yaml);
  if (!fs.existsSync(filePath)) {
    console.error(pc.red(`Error: File not found at ${filePath}`));
    process.exit(1);
  }

  console.log(
    pc.bold(`\n📥 Importing data from ${pc.cyan(options.yaml)}${options.replace ? pc.yellow(" (--replace mode: wiping existing data)") : ""}...`)
  );

  try {
    const res = await importResumeYaml(filePath, { replace: options.replace });
    console.log(
      pc.green(
        `✓ Successfully imported ${res.expCount} experiences, ${res.bulletCount} bullets, and ${res.tagCount} tags.`
      )
    );
    console.log(`Run ${pc.magenta("rw status")} to inspect the updated master record.\n`);
  } catch (err: any) {
    console.error(pc.red(`\n❌ Import failed: ${err.message}`));
    process.exit(1);
  }
}
