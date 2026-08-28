---
name: jd-match-analyzer
description: |
  Ingests target Job Descriptions (JDs), parses key requirements into structured snippets and tags, stores them in the master record, and analyzes match coverage, skill gaps, and bar-raiser quality against existing resume bullets.
  Use when the user pastes a Job Description, wants to optimize their resume for a specific role, or wants to find what skills their resume is missing.
---

# Job Description Match Analyzer

Internalizes Job Descriptions as the "question" that the resume is designed to answer. Operates in four complementary modes: Ingest (JD → Master Record), Gap Analysis (Master Record vs. JD), Bar-Raiser Gap Analysis, and JD-Sourced Skill Expansion.

## Core Positioning Strategy

When analyzing JDs and recommending edits:
1. **Translate Transferable Skills**: Scan JD requirements and mirror their exact verbiage to translate past experience into terms the target recruiter recognizes.
2. **Position as a 'Safe Pair of Hands'**: Recommend accomplishments that demonstrate low-risk, dependable execution and proven recent results for their specific priorities.
3. **Anti-Regurgitation Rule**: When drafting new bullets from JD signals, never rephrase text the user already has. Mine the JD for technologies and mechanisms the master record doesn't yet cover and draft entirely new content.

## Mode 1: Ingest & Store a Job Description

When the user pastes a JD:
1. Parse the JD text:
   - Identify Company, Role Title, and Seniority Level.
   - Extract 3–6 distinct requirement snippets.
   - Assign tags and importance weights (`high`, `medium`, `low`).
   - Extract **bar-raiser architectural signals**: specific technologies, scale metrics, SLA requirements, and architectural patterns mentioned in the JD.
   - Classify each extracted signal as either `covered` (exists in master record) or `uncovered` (expansion opportunity).
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

1. Inspect stored requirements and compare with current master record:
   ```bash
   rw jd show --id <jd-id>
   rw export --yaml
   ```
2. Compute coverage:
   - **Strong Matches**: Which master record bullets directly answer high-priority JD requirements?
   - **Inactive Candidates**: Are there inactive alternate bullets in the master record that should be activated for this profile?
   - **Skill Gaps**: Which requirements have 0 matching bullets in the master record?
3. Present actionable recommendations to the user:
   - Bullet activations/deactivations for target profile.
   - Suggested new accomplishment bullets to draft using `resume-bullet-drafter` (mirroring JD verbiage and leading with senior power verbs).
   - Recommended tag weight adjustments:
     ```bash
     rw profile set-tag-weight --profile <profile-id> --tag "<Tag>" --weight high
     rw profile auto-select --profile <profile-id>
     ```
4. Build a snapshot for this specific application:
   ```bash
   rw snapshot --profile <profile-id> --name "<company>-application"
   ```

## Mode 3: Bar-Raiser Gap Analysis

After standard gap analysis (Mode 2), elevate quality by running bar-raiser checks:

1. **Diagnostic Sweep**: Run each existing matched bullet through the 5-Point Bar-Raiser Diagnostic (see `resume-bullet-drafter/references/bar-raiser-checklist.md`):
   - Flag vague adjectives, technical misnomers, missing mechanisms, absent scale metrics, and summary duplication.
2. **Vocabulary Alignment Check**: For each JD requirement, verify whether the matching master record bullet uses the JD's *specific* architectural vocabulary:
   - JD says "event-driven" → bullet must name Kafka/SQS/EventBridge, not just say "event-driven"
   - JD says "microservices" → bullet should specify the service count, communication protocol (REST/gRPC), or orchestration pattern
   - JD says "cloud-native" → bullet should name specific AWS/GCP/Azure services
3. **Signal Coverage Matrix**: Present a table showing which domain signals (from `bar-raiser-checklist.md`) are covered vs. missing for this specific JD.

## Mode 4: JD-Sourced Skill Expansion

This is the core anti-regurgitation mode. Instead of rewording what the user already has, this mode creates entirely new content from JD signals:

1. **Extract Uncovered Signals**: From the parsed JD, identify every technology, architectural pattern, methodology, and scale metric that has zero matching bullets in the master record.
2. **Draft Expansion Bullets**: For each uncovered signal cluster, draft 1–2 new accomplishment bullets that credibly weave the signal into the user's work history. These must:
   - Use the JD's exact terminology (not synonyms)
   - Be plausible within the user's actual role context
   - Pass the 5-Point Bar-Raiser Diagnostic
   - NOT duplicate or rephrase any existing master record bullet
3. **Categorize by Value**: Group expansion bullets by hiring manager priority:
   - 🔴 **Must-Have Signals**: Technologies the JD lists as "required" with no master record coverage
   - 🟡 **Differentiator Signals**: "Preferred" or "nice-to-have" skills that would set the candidate apart
   - 🟢 **Domain Authority Signals**: Industry-specific vocabulary that signals insider knowledge
4. **Present with Context**: For each expansion bullet, explain *why* a hiring manager at that specific company cares about this signal.
5. **Master Record Integration**: Selected expansion bullets are added as inactive alternates:
   ```bash
   rw bullet add --experience <exp-id> --content "<expansion-text>" --inactive --tags "<Signal1,Signal2>"
   ```
