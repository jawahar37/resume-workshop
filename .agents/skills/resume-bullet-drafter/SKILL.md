---
name: resume-bullet-drafter
description: |
  Helps software engineers transform raw work notes, PR descriptions, and career accomplishments into sharp, quantified STAR bullets following the Verlyn Klinkenborg house style.
  Use when the user wants to write, revise, or refine accomplishment bullets for their resume or add alternate points to an experience.
---

# Resume Bullet Drafter

Transforms messy work notes into high-impact, quantified resume bullets aligned with the Klinkenborg writing philosophy.

## Quick Start

1. Ask the user for raw context about what they built, solved, or improved.
2. Draft 2–3 distinct bullet variants highlighting different dimensions (Scale/Performance, Team/Developer Experience, Cost/Reliability).
3. Present the variants to the user.
4. When the user picks a favorite, ask if they would like to save unpicked variants as inactive alternates in the vault.
5. Execute CLI commands to insert or update the bullets in the database.

## Workflow

### Step 1: Gather Raw Accomplishment Notes
Ask the user:
- What was the core problem or project?
- What specific technologies or architecture were used?
- What was the quantified outcome (latency, throughput, revenue, cost, adoption, error rate)?

### Step 2: Draft 2–3 Variants
Reference `.agents/skills/resume-bullet-drafter/references/writing-style.md`:
- Each bullet is one complete sentence.
- Eliminate filler openings ("Responsible for", "Helped with").
- Put the outcome and metric at the end.

**Example Drafts:**
- *Variant A (Scale & Metric)*: "Architected distributed tracing pipeline ingesting 2.5M spans/sec across 60 microservices, reducing MTTR by 42%."
- *Variant B (Developer Experience & Breadth)*: "Built unified telemetry platform combining logs, traces, and metrics into a single query engine used by 120+ engineers daily."

### Step 3: Confirm Selection & Inactive Alternates
Ask the user:
1. "Which variant best captures what you want to highlight?"
2. "Would you like to save the alternate variant(s) as inactive bullets in your vault for other role profiles?"

### Step 4: Run CLI Commands

**Adding a new bullet:**
```bash
# Add active chosen bullet
rw bullet add --experience <exp-id> --content "<chosen-text>" --active --tags "Distributed Systems,Go"

# Add inactive alternate bullet
rw bullet add --experience <exp-id> --content "<alternate-text>" --inactive --tags "Observability,Developer Experience"
```

**Updating an existing bullet:**
```bash
rw bullet update --id <bullet-id> --content "<revised-text>"
```

**Setting a high-level role summary:**
```bash
rw experience add -i <exp-id> -c "<Company>" -t "<Title>" -s "<YYYY-MM>" --summary "<High-level operational overview>"
```

**Verify changes:**
```bash
rw status
```
