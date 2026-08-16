import path from "node:path";
import fs from "node:fs";
import pc from "picocolors";
import { importResumeYaml } from "../../db/seed.js";
import { exportResumeToYaml } from "../../loader/query.js";
import { DEFAULT_DB_PATH } from "../../db/client.js";

export async function initCommand(options: { force?: boolean }) {
  console.log(pc.bold("\n🛠️  Initializing Resume Workshop..."));

  const seedFile = path.resolve(process.cwd(), "data.seed/resume.yaml");
  if (!fs.existsSync(seedFile)) {
    console.error(pc.red(`Seed file not found at: ${seedFile}`));
    process.exit(1);
  }

  const dbExists = fs.existsSync(DEFAULT_DB_PATH);
  if (dbExists && !options.force) {
    console.log(
      pc.yellow(
        `Database already exists at ${DEFAULT_DB_PATH}. Use --force to re-initialize and overwrite.`
      )
    );
    return;
  }

  const res = await importResumeYaml(seedFile, { replace: true });
  
  // Ensure data/ directory exists and export canonical YAML
  const dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const importsDir = path.resolve(dataDir, "imports");
  if (!fs.existsSync(importsDir)) {
    fs.mkdirSync(importsDir, { recursive: true });
  }

  const canonicalYaml = await exportResumeToYaml();
  fs.writeFileSync(path.join(dataDir, "resume.yaml"), canonicalYaml, "utf8");

  console.log(
    pc.green(
      `✓ Initialized career vault with ${res.expCount} experiences, ${res.bulletCount} bullets, and ${res.tagCount} tags.`
    )
  );
  console.log(pc.cyan(`✓ Canonical YAML snapshot saved to data/resume.yaml`));
  console.log(pc.bold("\nNext steps (Knowledge in the World):"));
  console.log(`  ${pc.magenta("rw status")}                 Show current vault breakdown & active profiles`);
  console.log(`  ${pc.magenta("rw build")}                  Compile all PDF & Markdown aliases`);
  console.log(`  ${pc.magenta("rw preview --profile staff-eng")} Compile & open resume PDF`);
  console.log(`  ${pc.magenta("rw --help")}                 View all available commands\n`);
}
