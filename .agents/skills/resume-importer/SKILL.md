---
name: resume-importer
description: |
  Parses raw unstructured resume text, markdown, or LinkedIn exports into validated Resume Workshop YAML structure and imports it into the SQLite career vault.
  Use when the user pastes their resume into chat, wants to import historical career data, or wants to seed/replace their vault.
---

# Resume Importer

Converts unstructured free-text resumes into structured, validated YAML matching `data.seed/resume.yaml` and executes the `rw import` command.

## Quick Start

1. When the user pastes their resume text, parse it into the standard YAML schema:
   - `personalInfo` (Name, Title, Email, Phone, Location, Links)
   - `experiences` with `id`, `company`, `roleTitle`, `startDate`, `endDate`, `location`, `bullets`
   - `education`
   - `skillGroups`
   - `targetProfiles` (at least 1 profile, e.g. `staff-eng`)
2. Write the parsed YAML to `data/imports/<YYYY-MM-DD>-<name-tag>.yaml`.
3. Present the parsed summary for the user to review.
4. Execute `rw import --yaml <filepath> [--replace]`.
5. Run `rw status` to verify the import.
6. **Run Post-Import Bar-Raiser Audit** (see below).

## Post-Import Bar-Raiser Audit

After every import, automatically run each imported bullet through the **5-Point Bar-Raiser Diagnostic** from `resume-bullet-drafter/references/bar-raiser-checklist.md`:

1. **Diagnostic Sweep**: Check every bullet for:
   - Vague adjectives without backing metrics or mechanisms
   - Technical misnomers (e.g. "latency reduction" for batch runtime)
   - Missing mechanism claims ("zero data loss" without naming the how)
   - Absent scale quantification (no QPS, no P99, no % improvement)
   - First-bullet / summary duplication
2. **Audit Summary Report**: Present results as:
   ```
   🔬 Bar-Raiser Audit: X of Y bullets flagged

   ✅ Passed: 18 bullets
   ⚠️  Flagged: 7 bullets

   Flagged Bullets:
   - gs-reg-apis: Vague Adjective ("resilient", "high-concurrency") + Missing Mechanism ("zero data loss" — how?)
   - acme-b3: Technical Misnomer ("latency reduction" used for batch runtime)
   ...
   ```
3. **Upgrade Offer**: Ask the user: *"Would you like me to upgrade the 7 flagged bullets to bar-raiser quality before finalizing?"*
4. If the user accepts, invoke `resume-bullet-drafter` Step 1.5 (Bar-Raiser Diagnostic) on each flagged bullet and present upgraded variants.

## Schema Reference

```yaml
personalInfo:
  name: "Jane Doe"
  title: "Senior Software Engineer"
  email: "jane.doe@example.com"
  phone: "+1 555-0199"
  location: "Seattle, WA"
  summary: "Experienced backend engineer..."

experiences:
  - id: "acme-senior"
    company: "Acme Corp"
    roleTitle: "Senior Software Engineer"
    startDate: "2021-04"
    endDate: "Present"
    location: "Seattle, WA"
    summary: "Led core infrastructure team of 8 engineers building distributed caching and event streaming platforms."
    bullets:
      - id: "acme-b1"
        content: "Scaled Redis caching layer to handle 100k QPS with 99.99% uptime."
        isActive: true
        priority: 1
        tags: ["Redis", "Distributed Systems", "Backend"]

targetProfiles:
  - id: "senior-swe"
    name: "Senior Software Engineer"
    targetRole: "Senior Backend Engineer"
    maxPages: 1
    selectedBulletIds: ["acme-b1"]
```

## CLI Import Commands

```bash
# Append / upsert without wiping
rw import --yaml data/imports/2026-08-15-initial-resume.yaml

# Wipe seed/example data and replace completely
rw import --yaml data/imports/2026-08-15-initial-resume.yaml --replace

# Export canonical tracked snapshot
rw export --yaml > data/resume.yaml

# Check status
rw status
```
