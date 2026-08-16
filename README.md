# Resume Workshop (`rw`) 🛠️

> **A career workshop where accomplishments are crafted, stored, and rendered into high-precision Typst resumes on demand.**

*Render* is the operative word across every layer: render master data from raw input, render across time and situation, render to context, render to target profiles, and render smart considerations into the project itself.

---

## 🌟 Key Concepts & Architecture

1. **The Career Vault**: Your career history is not a static document you constantly delete and rewrite. It is a relational vault (SQLite + Drizzle ORM). Each role holds many bullet points, both active accomplishments and alternate points highlighting different dimensions of your work.
2. **The Question & The Answer**: Job Descriptions are the *question* posed by recruiters and hiring managers; your resume is the *text that answers*. Store target JDs in the vault to analyze requirements and adapt profiles.
3. **Typst Rendering**: Ultra-fast (~50ms) compilation with readable syntax and publication-grade typography.
4. **Knowledge in the World**: Grounded in Don Norman’s design principles. Zero memorization required — the system carries the mental load with actionable feedback and clear signifiers.
5. **Klinkenborg House Style**: Writing is revision. Every accomplishment bullet is composed, revised, and edited as a single, deliberate act.

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

# Install Typst for PDF compilation (macOS)
brew install typst
```

### 2. Initialize the Vault

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

---

## 📖 CLI Command Reference

### Data & Vault Management

| Command | Description |
| :--- | :--- |
| `rw init [--force]` | Initialize `.data/resume.db` from seed and create `data/resume.yaml` |
| `rw status [--profile <id>]` | Show vault overview, active/alternate counts, and profiles |
| `rw validate` | Verify database integrity and profile bullet references |
| `rw import --yaml <file> [--replace]` | Import structured YAML into vault (`--replace` wipes seed data) |
| `rw export [--output <file>]` | Export database state as structured YAML snapshot |
| `rw diff` | Compare database state with `data/resume.yaml` |

### Bullet & Experience Crafting

| Command | Description |
| :--- | :--- |
| `rw experience list` | List all roles and companies in the vault |
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

## 🤖 Agent Skills (`.agents/skills/`)

Resume Workshop includes four instruction-only AI agent skills:

1. **`resume-bullet-drafter`**: Transforms raw work notes into quantified STAR bullets following the Verlyn Klinkenborg writing style (`references/writing-style.md`).
2. **`jd-match-analyzer`**: Ingests JDs, extracts requirements into tags and weights, and performs gap analysis against the vault.
3. **`recruiter-pitch-generator`**: Generates 30-second LinkedIn elevator pitches and cold outreach emails directly synthesized from active accomplishments.
4. **`resume-importer`**: Parses unstructured text/markdown resumes into validated YAML and executes `rw import`.

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
├── data/                              # [COMMITTED] Human-readable exports & history
│   ├── resume.yaml                    # Canonical tracked snapshot
│   └── imports/                       # Timestamped import files
│
├── .data/                             # [GITIGNORED] SQLite database
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
