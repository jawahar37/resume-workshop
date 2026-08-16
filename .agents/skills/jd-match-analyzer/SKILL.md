---
name: jd-match-analyzer
description: |
  Ingests target Job Descriptions (JDs), parses key requirements into structured snippets and tags, stores them in the vault, and analyzes match coverage and skill gaps against existing resume bullets.
  Use when the user pastes a Job Description, wants to optimize their resume for a specific role, or wants to find what skills their resume is missing.
---

# Job Description Match Analyzer

Internalizes Job Descriptions as the "question" that the resume is designed to answer. Operates in two complementary modes: Ingest (JD → Vault) and Gap Analysis (Vault vs. JD).

## Mode 1: Ingest & Store a Job Description

When the user pastes a JD:
1. Parse the JD text:
   - Identify Company, Role Title, and Seniority Level.
   - Extract 3–6 distinct requirement snippets.
   - Assign tags and importance weights (`high`, `medium`, `low`).
2. Run CLI commands to store the JD and parsed requirements:
   ```bash
   rw jd add --id <company>-<role-slug> --company "<Company>" --role "<Role Title>" --text "<pasted-raw-text>"
   
   # Add each requirement snippet
   rw jd add-requirement --jd <company>-<role-slug> \
     --text "<Requirement Snippet>" \
     --weight high \
     --tags "<Tag1,Tag2>"
   ```

## Mode 2: Gap Analysis & Profile Recommendation

1. Inspect stored requirements and compare with current vault:
   ```bash
   rw jd show --id <jd-id>
   rw export --yaml
   ```
2. Compute coverage:
   - **Strong Matches**: Which vault bullets directly answer high-priority JD requirements?
   - **Inactive Candidates**: Are there inactive alternate bullets in the vault that should be activated for this profile?
   - **Skill Gaps**: Which requirements have 0 matching bullets in the vault?
3. Present actionable recommendations to the user:
   - Bullet activations/deactivations for target profile.
   - Suggested new accomplishment bullets to draft using `resume-bullet-drafter`.
   - Recommended tag weight adjustments:
     ```bash
     rw profile set-tag-weight --profile <profile-id> --tag "<Tag>" --weight high
     rw profile auto-select --profile <profile-id>
     ```
4. Build a snapshot for this specific application:
   ```bash
   rw snapshot --profile <profile-id> --name "<company>-application"
   ```
