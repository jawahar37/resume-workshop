import path from "node:path";
import fs from "node:fs";
import pc from "picocolors";
import YAML from "yaml";
import { exportResumeToYaml } from "../../loader/query.js";

export async function diffCommand() {
  console.log(pc.bold("\n🔍 Checking Changes Against Tracked data/resume.yaml...\n"));
  const canonicalFile = path.resolve(process.cwd(), "data/resume.yaml");

  if (!fs.existsSync(canonicalFile)) {
    console.log(pc.yellow("data/resume.yaml does not exist yet. Run 'rw export --yaml > data/resume.yaml' to create it."));
    return;
  }

  const currentYaml = await exportResumeToYaml();
  const savedYaml = fs.readFileSync(canonicalFile, "utf8");

  if (currentYaml === savedYaml) {
    console.log(pc.green("✓ Database state matches data/resume.yaml exactly. No unexported changes."));
    return;
  }

  console.log(pc.yellow("⚠ Database state differs from data/resume.yaml"));
  console.log(`Run ${pc.magenta("rw export --yaml > data/resume.yaml")} to sync your tracked snapshot.\n`);
}
