#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import pc from "picocolors";

interface PiiRule {
  name: string;
  category: "Secret" | "PII" | "Cross-Pollinated Live Data" | "Restricted File";
  regex: RegExp;
  description: string;
  allowList?: RegExp[];
}

const STATIC_PII_RULES: PiiRule[] = [
  // 1. Secrets & Credentials
  {
    name: "Private Cryptographic Key",
    category: "Secret",
    regex: /-----BEGIN (?:RSA|OPENSSH|EC|DSA|PGP|ENCRYPTED|PRIVATE) KEY/i,
    description: "Unencrypted private SSH, SSL, or PGP key block",
  },
  {
    name: "AWS Access Key",
    category: "Secret",
    regex: /\b(AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b/,
    description: "AWS 20-character Access Key ID",
  },
  {
    name: "GitHub Token",
    category: "Secret",
    regex: /\b(ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z_]{82}|gho_[0-9a-zA-Z]{36}|ghs_[0-9a-zA-Z]{36})\b/,
    description: "GitHub Personal Access or OAuth Token",
  },
  {
    name: "Generic Secret / Password Assignment",
    category: "Secret",
    regex: /(?:password|api_key|apikey|secret_key|client_secret|auth_token)\s*[:=]\s*["'](?!(?:example|test|placeholder|mock|your_|changeme))[a-zA-Z0-9_\-.~!@#$%^&*]{16,}["']/i,
    description: "Hardcoded password or API secret assignment",
    allowList: [/example/i, /placeholder/i, /seed/i],
  },
  {
    name: "Anthropic / OpenAI API Key",
    category: "Secret",
    regex: /\b(sk-ant-api03-[a-zA-Z0-9\-_]{80,}|sk-[a-zA-Z0-9]{32,})\b/,
    description: "AI Provider API Key",
  },

  // 2. High-Risk PII
  {
    name: "US Social Security Number",
    category: "PII",
    regex: /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/,
    description: "Valid US Social Security Number format (XXX-XX-XXXX)",
  },
  {
    name: "Credit / Debit Card Number",
    category: "PII",
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/,
    description: "Visa, MasterCard, Amex, or Discover card number",
  },
  {
    name: "Personal Real Phone Number",
    category: "PII",
    // Matches real North American phone numbers that DO NOT use 555 fiction / example prefix
    regex: /\b(?:\+?1[-. ]?)?\(?([2-9][0-8][0-9])\)?[-. ]?(?!(?:555|000|123))([2-9][0-9]{2})[-. ]?([0-9]{4})\b/,
    description: "Real phone number detected (allowed in gitignored data/ but flagged in public/seed files)",
    allowList: [
      /555/i,
      /\+1 \(555\)/i,
      /package-lock\.json/i,
      /\.test\.ts/i,
    ],
  },
];

const RESTRICTED_FILE_PATTERNS = [
  { pattern: /\.env(\..+)?$/, desc: "Environment file containing credentials" },
  { pattern: /^data\//, desc: "Personal user data directory (should be gitignored)" },
  { pattern: /^\.data\//, desc: "Local SQLite database directory (should be gitignored)" },
  { pattern: /id_rsa|id_ed25519|id_ecdsa/, desc: "SSH Private Key file" },
  { pattern: /\.pem$|\.key$|\.pfx$|\.p12$/, desc: "Cryptographic certificate / private key file" },
];

const IGNORED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".ico",
  ".woff", ".woff2", ".ttf", ".eot", ".lock",
]);

// Known sample/seed terms to ignore from being flagged as private live data
const KNOWN_SAMPLE_VALUES = new Set([
  "alex mercer",
  "alex.mercer@example.com",
  "https://alexmercer.dev",
  "alexmercer.dev",
  "github.com/alexmercer",
  "linkedin.com/in/alex-mercer",
  "+1 (555) 234-5678",
  "san francisco, ca",
  "nebula labs",
  "apex cloud systems",
  "beacon analytics",
  "unnamed professional",
  "user@example.com",
]);

interface Finding {
  file: string;
  line: number;
  ruleName: string;
  category: string;
  description: string;
  snippet: string;
}

interface ExtractedToken {
  token: string;
  fieldDesc: string;
  type: "name" | "email" | "phone" | "linkedin" | "website" | "github";
}

/**
 * Dynamically reads local gitignored data from .data/resume.db and data/imports/*.yaml
 * to extract real candidate PII tokens (name, email, phone, linkedin, personal links).
 * These tokens are then scanned against all staged files to prevent AI/developer cross-pollination.
 */
export function extractLivePrivateTokens(): PiiRule[] {
  const dynamicRules: PiiRule[] = [];
  const extractedTokens = new Map<string, ExtractedToken>();

  function addCandidateToken(val: unknown, fieldDesc: string, type: ExtractedToken["type"]) {
    if (typeof val !== "string") return;
    const clean = val.trim();
    if (!clean || clean.length < 4) return;
    if (KNOWN_SAMPLE_VALUES.has(clean.toLowerCase())) return;

    if (!clean.includes(" ") && !clean.includes("@") && !clean.includes(".") && clean.length < 7) {
      return;
    }

    extractedTokens.set(clean, { token: clean, fieldDesc, type });
  }

  // 1. Scan .data/resume.db via sqlite3 CLI if present
  const dbPath = path.resolve(process.cwd(), ".data/resume.db");
  if (fs.existsSync(dbPath)) {
    try {
      const output = execSync(
        `sqlite3 "${dbPath}" "SELECT name, email, phone, location, website, github, linkedin FROM personal_info LIMIT 1;"`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }
      );
      if (output.trim()) {
        const [name, email, phone, location, website, github, linkedin] = output.trim().split("|");
        if (name) addCandidateToken(name, "Live Candidate Real Name", "name");
        if (email) addCandidateToken(email, "Live Candidate Real Email", "email");
        if (phone) addCandidateToken(phone, "Live Candidate Real Phone", "phone");
        if (linkedin) addCandidateToken(linkedin, "Live Candidate LinkedIn Profile", "linkedin");
        if (website) addCandidateToken(website, "Live Candidate Personal Website", "website");
        if (github && !github.includes("alexmercer")) {
          addCandidateToken(github, "Live Candidate GitHub Handle/URL", "github");
        }
      }
    } catch {
      // Ignore database query errors
    }
  }

  // 2. Scan data/imports/*.yaml and data/resume.yaml if present
  const dataDir = path.resolve(process.cwd(), "data");
  const candidatesPaths: string[] = [];

  const resumeYaml = path.join(dataDir, "resume.yaml");
  if (fs.existsSync(resumeYaml)) candidatesPaths.push(resumeYaml);

  const importsDir = path.join(dataDir, "imports");
  if (fs.existsSync(importsDir)) {
    try {
      for (const f of fs.readdirSync(importsDir)) {
        if (f.endsWith(".yaml") || f.endsWith(".yml")) {
          candidatesPaths.push(path.join(importsDir, f));
        }
      }
    } catch {}
  }

  for (const filePath of candidatesPaths) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = YAML.parse(content);
      const p = parsed?.personalInfo;
      const baseName = path.basename(filePath);
      if (p) {
        if (p.name) addCandidateToken(p.name, `Live Candidate Name (from data/${baseName})`, "name");
        if (p.email) addCandidateToken(p.email, `Live Candidate Email (from data/${baseName})`, "email");
        if (p.phone) addCandidateToken(p.phone, `Live Candidate Phone (from data/${baseName})`, "phone");
        if (p.linkedin) addCandidateToken(p.linkedin, `Live Candidate LinkedIn (from data/${baseName})`, "linkedin");
        if (p.website) addCandidateToken(p.website, `Live Candidate Website (from data/${baseName})`, "website");
        if (p.github && !p.github.includes("alexmercer")) {
          addCandidateToken(p.github, `Live Candidate GitHub (from data/${baseName})`, "github");
        }
      }
    } catch {}
  }

  // Convert tokens into regex rules with appropriate allowLists
  for (const item of extractedTokens.values()) {
    const escaped = item.token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Allow legitimate author/repo attribution in LICENSE or package repository config
    const allowList: RegExp[] = [];
    if (item.type === "name") {
      allowList.push(/^LICENSE$/i);
      allowList.push(/Copyright \(c\)/i);
    } else if (item.type === "github") {
      allowList.push(/github\.com\/[a-zA-Z0-9_\-]+\/resume-workshop/i); // Repo clone URL in README / package.json
    }

    dynamicRules.push({
      name: `Cross-Pollinated Live PII: "${item.token}"`,
      category: "Cross-Pollinated Live Data",
      regex: new RegExp(`\\b${escaped}\\b`, "i"),
      description: `${item.fieldDesc} detected in a public/tracked repository file`,
      allowList: allowList.length > 0 ? allowList : undefined,
    });
  }

  return dynamicRules;
}

export async function runPiiAndSecretCheck(checkAllTracked = false): Promise<boolean> {
  const startTime = Date.now();
  console.log(pc.bold("\n🛡️  Running Pre-Commit PII & Secret Safety Sweep..."));

  // 1. Get files to inspect
  let filesToCheck: string[] = [];
  try {
    if (checkAllTracked) {
      const output = execSync("git ls-files", { encoding: "utf8" });
      filesToCheck = output.split("\n").map(f => f.trim()).filter(Boolean);
    } else {
      // Staged files only (Added, Copied, Modified)
      const output = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" });
      filesToCheck = output.split("\n").map(f => f.trim()).filter(Boolean);
    }
  } catch (err: any) {
    console.error(pc.yellow("⚠ Could not read git index, skipping staged file check."));
    return true;
  }

  if (filesToCheck.length === 0) {
    console.log(pc.gray("  No staged files to check.\n"));
    return true;
  }

  // 2. Extract dynamic live private data tokens from .data/ and data/
  const dynamicRules = extractLivePrivateTokens();
  const allRules: PiiRule[] = [...STATIC_PII_RULES, ...dynamicRules];

  if (dynamicRules.length > 0) {
    console.log(pc.gray(`  Loaded ${dynamicRules.length} dynamic private tokens from .data/ & data/ to prevent cross-pollination.`));
  }

  const findings: Finding[] = [];

  for (const relPath of filesToCheck) {
    const ext = path.extname(relPath).toLowerCase();
    if (IGNORED_EXTENSIONS.has(ext)) {
      continue;
    }

    // Check restricted file patterns
    for (const rf of RESTRICTED_FILE_PATTERNS) {
      if (rf.pattern.test(relPath)) {
        findings.push({
          file: relPath,
          line: 1,
          ruleName: "Restricted File Pattern",
          category: "Restricted File",
          description: rf.desc,
          snippet: `Attempting to stage restricted path: ${relPath}`,
        });
      }
    }

    // Retrieve file content (staged version from git index if checking staged, or disk)
    let content = "";
    try {
      if (!checkAllTracked) {
        content = execSync(`git show :${JSON.stringify(relPath)}`, {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "ignore"],
        });
      } else {
        const fullPath = path.resolve(process.cwd(), relPath);
        if (fs.existsSync(fullPath)) {
          content = fs.readFileSync(fullPath, "utf8");
        }
      }
    } catch {
      continue;
    }

    if (!content) continue;

    // Scan lines
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];

      // Skip lines with explicit bypass comment: // pii-ignore or # pii-ignore
      if (lineText.includes("pii-ignore") || lineText.includes("secret-ignore")) {
        continue;
      }

      for (const rule of allRules) {
        // Skip rule if file path or line is in rule allowList
        if (rule.allowList && rule.allowList.some(r => r.test(relPath) || r.test(lineText))) {
          continue;
        }

        if (rule.regex.test(lineText)) {
          const maskedSnippet = lineText.trim().substring(0, 100);

          findings.push({
            file: relPath,
            line: i + 1,
            ruleName: rule.name,
            category: rule.category,
            description: rule.description,
            snippet: maskedSnippet,
          });
        }
      }
    }
  }

  const durationMs = Date.now() - startTime;

  if (findings.length > 0) {
    console.log(pc.red(`\n❌ Pre-Commit Hook Blocked: Found ${findings.length} sensitive item(s) in ${durationMs}ms:\n`));

    for (const f of findings) {
      console.log(
        `  ${pc.red("•")} [${pc.bold(f.category)}] ${pc.bold(f.ruleName)} at ${pc.cyan(`${f.file}:${f.line}`)}`
      );
      console.log(`    ${pc.gray("Reason:")} ${f.description}`);
      console.log(`    ${pc.gray("Snippet:")} ${pc.yellow(f.snippet)}`);
      console.log("");
    }

    console.log(pc.yellow("💡 How to fix:"));
    console.log("  1. Ensure personal career details remain only in the gitignored data/ and .data/ directories.");
    console.log("  2. Public seed files (data.seed/) and docs must only use synthetic sample identities (e.g. Alex Mercer).");
    console.log("  3. For intentional test values, add `// pii-ignore` or `# pii-ignore` to the line.\n");
    return false;
  }

  console.log(pc.green(`✓ PII & Secret Safety check passed (${filesToCheck.length} files scanned in ${durationMs}ms)\n`));
  return true;
}

// Execute standalone if called directly
if (process.argv[1]?.endsWith("check-staged.ts") || process.argv[1]?.endsWith("check-staged.js")) {
  const isFull = process.argv.includes("--all");
  runPiiAndSecretCheck(isFull).then((passed) => {
    if (!passed) process.exit(1);
  });
}
