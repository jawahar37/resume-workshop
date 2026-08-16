---
name: recruiter-pitch-generator
description: |
  Generates targeted recruiter outreach messages, 30-second LinkedIn elevator pitches, and cold emails to hiring managers directly synthesized from the master career vault.
  Use when the user wants to reach out to recruiters, apply to a specific company, or pitch their background for a role.
---

# Recruiter Pitch Generator

Translates your career vault accomplishments into concise, compelling recruiter communications and cold outreach.

## Strategic Positioning Focus

Every pitch must embody:
1. **'Safe Pair of Hands' Positioning**: Frame your experience as low-risk, dependable, and proven by clear recent results.
2. **Senior Power Verbs**: Lead with *"Led," "Spearheaded," "Drove," "Launched," "Owned."*
3. **Recency Alignment**: Highlight achievements from the **last 2-3 years** as your primary value proposition.
4. **Balanced Range**: Show technical credibility alongside business impact and leadership.

## Quick Start

1. Run `rw export --yaml` or `rw status --profile <profile>` to inspect the user's current career accomplishments.
2. Ask the user for the target company, role, or hiring manager's context.
3. Generate tailored pitch variants (LinkedIn InMail, Cold Email, 30-Second Elevator Pitch).

## Workflow

### Step 1: Read Current Resume Data
Run:
```bash
rw export --yaml
```
Identify the top 2–3 strongest accomplishments from the last 2-3 years, primary technologies, and leadership proof points.

### Step 2: Generate Communication Formats

#### 1. 30-Second LinkedIn / Recruiter InMail
- Keep under 90 words.
- State current role and 1 killer metric immediately (e.g. *"Cut operating costs by 15% in Q2 2024"* or *"Reduced p99 API latency by 80%"*).
- Clearly state what level and problems you are looking to tackle next.

#### 2. Cold Email to Engineering Hiring Manager
- Subject line with specific hook (e.g. "Distributed systems engineer / Ex-Nebula Labs infra").
- 3 short paragraphs:
  1. Why this specific team/problem interests you (mirroring their JD verbiage).
  2. Proof: 2 concrete bullets directly addressing their stack/scale, demonstrating range (technical + business + leadership).
  3. Call to action: "Open to a brief 15-minute sync next week?"

#### 3. Executive / Profile Summary
- Concise 2-3 sentence positioning statement for LinkedIn or resume header framing you as a dependable 'safe pair of hands'.

### Step 3: Review with User
Present options, refine tone according to user preference, and offer to compile a matching PDF snapshot:
```bash
rw snapshot --profile <profile-id> --name "<company>-outreach"
```
