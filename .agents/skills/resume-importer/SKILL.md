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
