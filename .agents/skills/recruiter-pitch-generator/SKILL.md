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
5. **Bar-Raiser Quality**: All proof points in pitches must pass the 5-Point Bar-Raiser Diagnostic (see `resume-bullet-drafter/references/bar-raiser-checklist.md`). No vague adjectives, no missing mechanisms, no unquantified claims.

## Company Tier Adaptation

Automatically adapt pitch tone and content based on the target company tier:

### Big Tech (Google, Microsoft, Meta, Amazon, Apple)
- Lead with **scale metrics**: QPS, daily events, P99 SLAs, 5-nines availability
- Name **specific architectural mechanisms**, not adjectives (circuit breakers, distributed locking, gRPC, OpenTelemetry)
- Include the **follow-up defense**: anticipate what the bar-raiser would probe and preemptively address it
- Frame accomplishments in terms of **systems depth and cross-team impact**

### Growth-Stage / Mid-Market (Stripe, Datadog, Snowflake, Confluent)
- Lead with **velocity and ownership scope**: "Owned end-to-end from design to production"
- Emphasize **breadth across the stack** (frontend + backend + infra)
- Highlight **speed of delivery** and ability to operate with minimal guidance
- Show **product sense**: tie technical work to user-facing or revenue outcomes

### Startups (Seed through Series B)
- Lead with **business impact and resourcefulness**: cost savings, revenue, user growth
- Emphasize **generalist range** and willingness to wear multiple hats
- Show **speed**: time-to-ship, iteration velocity, MVPs launched
- Demonstrate **ownership culture fit**: "built from scratch," "sole engineer on..."

### Enterprise & Consulting (Deloitte, Accenture, McKinsey Digital)
- Lead with **stakeholder management and delivery track record**
- Emphasize **compliance and governance expertise** (SOC 2, PCI-DSS, HIPAA)
- Show **cross-functional coordination** across multiple teams, vendors, or markets
- Highlight **legacy modernization** and migration experience

## Quick Start

1. Run `rw export --yaml` or `rw status --profile <profile>` to inspect the user's current career accomplishments.
2. Ask the user for the target company, role, or hiring manager's context.
3. Identify the company tier and adapt accordingly.
4. Generate tailored pitch variants (LinkedIn InMail, Cold Email, 30-Second Elevator Pitch).

## Workflow

### Step 1: Read Current Resume Data
Run:
```bash
rw export --yaml
```
Identify the top 2–3 strongest accomplishments from the last 2-3 years, primary technologies, and leadership proof points. Verify these pass the Bar-Raiser Diagnostic before including them in pitches.

### Step 2: Generate Communication Formats

#### 1. 30-Second LinkedIn / Recruiter InMail
- Keep under 90 words.
- State current role and 1 killer metric immediately (e.g. *"Cut operating costs by 15% in Q2 2024"* or *"Reduced p99 API latency by 80%"*).
- Clearly state what level and problems you are looking to tackle next.

#### 2. Cold Email to Engineering Hiring Manager
- Subject line with specific hook (e.g. "Distributed systems engineer / Ex-Goldman Sachs infra").
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
