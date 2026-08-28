# Resume Workshop (`rw`) 🛠️

> **A career workshop where accomplishments are crafted, stored, and rendered into high-precision PDF resumes on demand.**

*Render* is the operative word across every layer: render master data from raw input, render across time and situation, render to context, render to target profiles, and render smart considerations into the project itself.

---

## 🌟 Key Concepts & Architecture

1. **The Master Record**: Your career history is not a static document you constantly delete and rewrite. It is a relational master record (SQLite + Drizzle ORM). Each role holds many bullet points, both active accomplishments and saved points highlighting different dimensions of your work.
2. **The Question & The Answer**: Job Descriptions are the *question* posed by recruiters and hiring managers; your resume is the *text that answers*. Store target JDs in the master record to analyze requirements and adapt profiles.
3. **Typst Rendering**: Ultra-fast (~50ms) compilation with readable syntax and publication-grade typography.
4. **Klinkenborg House Style**: Writing is revision. Every accomplishment bullet is composed, revised, and edited as a single, deliberate act.

---

## 🤖 Agent Skills (`.agents/skills/`)

Resume Workshop includes four instruction-only AI agent skills:

1. **`resume-bullet-drafter`**: Transforms raw work notes into quantified STAR bullets following the Verlyn Klinkenborg writing style (`references/writing-style.md`).
2. **`jd-match-analyzer`**: Ingests JDs, extracts requirements into tags and weights, and performs gap analysis against the master record.
3. **`recruiter-pitch-generator`**: Generates 30-second LinkedIn elevator pitches and cold outreach emails directly synthesized from active accomplishments.
4. **`resume-importer`**: Parses unstructured text/markdown resumes into validated YAML and executes `rw import`.

---
## 🚀 Quick Start

### 1. Installation

```bash
# Clone and install dependencies
git clone https://github.com/jawahar37/resume-workshop.git
cd resume-workshop
npm install

# Link CLI globally (optional, enables 'rw' and 'resume-workshop' anywhere)
npm link

# Install Typst for PDF compilation:
# macOS:   brew install typst
# Windows: winget install typst.typst
# Linux:   snap install typst (or pacman -S typst)
```

#### 🖥️ Cross-Platform OS Support

| Operating System | Typst Package Manager Command | PDF Viewer Integration (`rw preview`) |
| :--- | :--- | :--- |
| **macOS** | `brew install typst` | Native `open` |
| **Windows** | `winget install typst.typst` | Native `start` |
| **Linux** | `snap install typst` or `pacman -S typst` | Standard `xdg-open` |

*Runs headlessly in Linux CI/CD pipelines & Docker containers without requiring a display server.*

### 2. Initialize the Master Record

```bash
# Seed the database with complete example data
npm run rw -- init
# or if linked:
rw init
```

### 3. Explore & Check Status

```bash
rw status
rw status --profile staff-eng
rw validate
```

### 4. Build PDFs & Markdown

```bash
# Build all configured aliases (dist/aliases/ and dist/text/)
rw build

# Build a specific profile
rw build --profile staff-eng

# Create a named, timestamped artifact snapshot (dist/artifacts/)
rw snapshot --profile staff-eng --name "google-application"

# Preview PDF in system default viewer
rw preview --profile staff-eng

# List all built outputs
rw list-outputs
```

## 🤖 Agent-Driven Workflow & Fast-Track Guide

Resume Workshop treats **AI Agents as first-class interfaces**. You interact with specialized workflow skills in [`.agents/skills/`](file:///.agents/skills/) to import history, analyze job descriptions, draft bullets, and target profiles. The `rw` CLI provides the underlying tool grounding for deterministic database operations and PDF compilation.

---

### 1. Import Resume into Master Record
Use the **`resume-importer`** skill ([`.agents/skills/resume-importer`](file:///.agents/skills/resume-importer/SKILL.md)) to parse raw text, Markdown, or LinkedIn exports into relational SQLite entities:

```bash
# Master Record Import Grounding:
rw import --yaml data/imports/jawahar-pinnelli.yaml --replace
```

---

### 2. Analyze Target Job Descriptions & Skill Gaps
Use the **`jd-match-analyzer`** skill ([`.agents/skills/jd-match-analyzer`](file:///.agents/skills/jd-match-analyzer/SKILL.md)) to ingest job descriptions, extract key requirements, and identify missing skill tags against existing master record bullets:

```bash
# Job Description Grounding:
rw jd add --id "sams-backend-lead" --company "Sam's Club" --role "Senior Backend Engineer" --file "data/jds/sams-club.txt"
rw jd show --id "sams-backend-lead"
```

---

### 3. Draft & Revise STAR Accomplishments
Use the **`resume-bullet-drafter`** skill ([`.agents/skills/resume-bullet-drafter`](file:///.agents/skills/resume-bullet-drafter/SKILL.md)) to refine raw work notes into quantified STAR bullets following Klinkenborg house style rules:

```bash
# Bullet & Experience Grounding:
rw experience show --id "acme-cloud-swe"
rw bullet update --id "acme-kafka-pipeline" --content "Engineered a distributed event streaming pipeline in Go using Kafka and gRPC, cutting p99 API latency from 450ms to 85ms across 10M daily active users."
```

---

### 4. Generate Recruiter Pitches & Outreach
Use the **`recruiter-pitch-generator`** skill ([`.agents/skills/recruiter-pitch-generator`](file:///.agents/skills/recruiter-pitch-generator/SKILL.md)) to synthesize targeted 30-second LinkedIn elevator pitches and cold outreach messages grounded in master accomplishments.

---

### 5. Create Target Profiles & Auto-Select Optimal Bullets
Create job-specific target profiles and automatically filter the highest-scoring bullet points to fit target page budgets:

```bash
# Target Profile Grounding:
rw profile create --id "backend-lead" --name "Senior Backend Engineer"
rw profile auto-select --id "backend-lead" --max 25
```

---

### 6. Preview & Compile High-Precision PDFs
Compile publication-grade PDF and ATS plain-text outputs instantaneously:

```bash
# PDF Compilation Grounding:
rw preview --profile backend-lead
rw build
```

---

## 📖 CLI Command Reference

### Data & Master Record Management

| Command | Description |
| :--- | :--- |
| `rw init [--force]` | Initialize `.data/resume.db` from seed and create `data/resume.yaml` |
| `rw status [--profile <id>]` | Show master record overview, active/saved counts, and profiles |
| `rw validate` | Verify database integrity and profile bullet references |
| `rw import --yaml <file> [--replace]` | Import structured YAML into master record (`--replace` wipes seed data) |
| `rw export [--output <file>]` | Export database state as structured YAML snapshot |
| `rw diff` | Compare database state with `data/resume.yaml` |

### Bullet & Experience Crafting

| Command | Description |
| :--- | :--- |
| `rw experience list` | List all roles and companies in the master record |
| `rw experience add --id <id> --company <c> --title <t> --start <date>` | Add a new work experience |
| `rw bullet list [--experience <id>]` | List bullets with active/alternate status |
| `rw bullet add --experience <id> --content <text> [--active\|--inactive] [--tags <t1,t2>]` | Add bullet point |
| `rw bullet update --id <id> [--content <text>] [--priority <n>]` | Update bullet content |
| `rw bullet activate --id <id> [--profile <id>]` | Activate bullet globally or for a profile |
| `rw bullet deactivate --id <id> [--profile <id>]` | Deactivate bullet (save as alternate) |
| `rw bullet tag --id <id> --tags "Distributed Systems,Go"` | Associate tags with a bullet |

### Profiles & Job Descriptions

| Command | Description |
| :--- | :--- |
| `rw profile list` | List all target profiles (e.g. `staff-eng`, `engineering-manager`) |
| `rw profile create --id <id> --name <n> --role <r> [--max-pages <p>]` | Create a new target profile |
| `rw profile auto-select --profile <id> [--tags <tags>]` | Auto-select best-match bullets using tag scoring |
| `rw profile set-tag-weight --profile <id> --tag <t> --weight <high\|medium\|low>` | Tune profile tag priorities |
| `rw jd list` | List stored Job Descriptions |
| `rw jd add --id <id> --company <c> --role <r> --text <raw-text>` | Store a target Job Description |
| `rw jd add-requirement --jd <id> --text <snippet> --weight <w> --tags <t>` | Add parsed requirement snippet |
| `rw jd show --id <id>` | View parsed requirements and raw text of a stored JD |

---


## 📁 Directory Structure

```
resume-workshop/
├── README.md
├── package.json                       # CLI binaries: 'resume-workshop', 'rw'
├── tsconfig.json
├── drizzle.config.ts
├── render.config.yaml                 # PDF aliases & descriptions
├── .gitignore
│
├── data.seed/                         # [COMMITTED] Seed template for `rw init`
│   └── resume.yaml
│
├── data/                              # [GITIGNORED] Personal user exports, imports & JDs
│   ├── imports/                       # User YAML resume imports
│   └── jds/                           # Target Job Description text files
│
├── .data/                             # [GITIGNORED] Local database & imported resumes
│   └── resume.db
│
├── src/
│   ├── db/                            # Relational schema, client, migrations, seeder
│   ├── schema/                        # Zod import validation schemas
│   ├── loader/                        # Query engine & profile filtering
│   ├── renderers/                     # Typst, PDF compiler, and Markdown renderers
│   └── cli/                           # Complete Commander.js CLI commands
│
├── dist/                              # [GITIGNORED] Generated outputs
│   ├── aliases/                       # Always-current PDFs (resume-latest.pdf)
│   ├── artifacts/                     # Timestamped snapshots (google-2026-08-15.pdf)
│   └── text/                          # ATS plain text / markdown
│
├── drizzle/                           # [COMMITTED] Generated SQL migrations
│
└── .agents/
    └── skills/                        # AI pair-programming agent skills
```

---

## ⚖️ License
MIT
