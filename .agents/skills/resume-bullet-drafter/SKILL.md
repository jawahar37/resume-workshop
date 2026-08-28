---
name: resume-bullet-drafter
description: |
  Helps software engineers transform raw work notes, PR descriptions, and career accomplishments into sharp, quantified STAR bullets following the Verlyn Klinkenborg house style, 5 Strategic Positioning Guidelines, and Big-Tech Bar-Raiser standards.
  Use when the user wants to write, revise, or refine accomplishment bullets for their resume or add alternate points to an experience.
---

# Resume Bullet Drafter

Transforms messy work notes into high-impact, quantified resume bullets aligned with Klinkenborg house style, executive positioning rules, and Big-Tech bar-raiser standards.

## Modes of Operation

### Mode 1: Quick Draft Mode
Transform raw bullet notes or single project snippets directly into STAR bullets.

### Mode 2: Grill-Me Mode (Interactive Discovery Interview)
Use when expanding a key role (e.g. current SDE2/Senior role) to discover hidden accomplishments, quantify scope, and elevate technical positioning.

#### Grill-Me Interview Workflow:
1. **Target Identification**: Identify the role (e.g. target role `target-swe`) and target SDE2/Senior responsibilities.
2. **Probing Categories**: Ask 3–4 focused, leading questions covering:
   - **Systems Architecture & Scale**: High-throughput pipelines, AWS cloud infra, async I/O, database optimization, microservices.
   - **SDE2 Ownership & Rigor**: API design, fault tolerance, edge-case resilience, SDLC standards, CI/CD security.
   - **Quantified Business Impact**: Latency cuts, cost savings, risk/compliance mitigation, operational efficiency.
   - **Cross-Role Consolidation**: Identifying skills mentioned in older roles (e.g., testing, reporting, onboarding) and pulling them forward into the current role to tighten older roles.
   - **Bar-Raiser Stress Test**: Ask "How would you defend this bullet in a 45-minute behavioral interview? What follow-up questions would expose gaps?"
3. **Synthesis**: Turn raw answers into sharp, quantified STAR bullets following Klinkenborg house style.
4. **Master Record Integration**: Add new bullets to master record and adjust alternate points.

### Mode 3: JD-Driven Scope Expansion
Use when the user says "write more points," "expand," "what else," "target for X company," or "write for FinTech/B2B/Cloud." This mode creates entirely new content instead of refining existing bullets.

#### Expansion Workflow:
1. **Mine, Don't Mirror**: Read the target JD (or domain signal catalog from `references/bar-raiser-checklist.md` if no specific JD). Extract technologies, architectural patterns, and scale metrics that have **zero coverage** in the user's existing master record.
2. **Draft Net-New Bullets**: For each uncovered signal, draft a brand-new accomplishment bullet that credibly incorporates that technology into the user's actual work context. These are NOT rewrites of existing bullets.
3. **Domain Pivot on Demand**: When the user says "target for X" or "write for Y," switch to the corresponding domain signal catalog and generate bullets using that domain's specific vocabulary:
   - "Target Google/Microsoft" → QPS, P99 SLAs, gRPC/Protobuf, OpenTelemetry, canary rollouts, backward-compatible APIs
   - "Write for FinTech" → ledger reconciliation, PCI-DSS, idempotent payment processing, fraud scoring, KYC/AML
   - "Write for B2B SaaS" → multi-tenant RLS, webhook delivery, Enterprise SSO, metered billing, white-label config
   - "Target E-Commerce" → search ranking, recommendation engines, cart integrity, A/B testing infra, CDN edge caching
   - "Write for HealthTech" → HIPAA compliance, HL7/FHIR interop, PHI encryption, EHR integration, clinical pipelines
   - "Target Security roles" → zero-trust, SAST/DAST automation, secrets management, SBOM, shift-left security
   - "Write for Data Engineering" → Spark/Flink, Delta Lake/Iceberg, CDC pipelines, dbt, data quality frameworks
   - "Target Gaming" → WebSocket real-time, tick-rate optimization, ECS architecture, matchmaking, state sync
   - "Write for Consumer/EdTech" → mobile-first, push notifications, engagement funnels, accessibility, offline-first sync
   - "Target Consulting" → legacy modernization, mainframe migration, vendor API integration, SOW delivery
4. **Present as Additive Options**: Offer 6–8 net-new bullets organized by domain signal, clearly labeled as master record expansion candidates (not replacements).
5. **Master Record Integration**: Selected bullets are added as new inactive alternates in the master record, available for future profile targeting.

## Core Strategic Guidelines

Every drafted bullet must adhere to `.agents/skills/resume-bullet-drafter/references/writing-style.md`:

1. **Position as a 'Safe Pair of Hands'**: Focus on low-risk, dependable execution and clear, recent results.
2. **Translate Transferable Skills**: Mirror job description verbiage to frame achievements in terms the target industry recognizes.
3. **Use Senior-Level Power Action Verbs**: Lead with *"Led," "Spearheaded," "Drove," "Launched," "Owned," "Architected."* Avoid passive verbs (*"helped," "supported," "worked on"*).
4. **Focus Recency on Last 2–3 Years**: Spend most detail on recent roles; keep older jobs (4+ years ago) to 2-3 concise bullets.
5. **Demonstrate Balanced Range**: Every bullet pack must balance **Technical Credibility**, **Business Impact**, and **Leadership Scope**.

## Workflow

### Step 0: Role Summary Framing (4 Hiring Manager Lenses)
Before drafting accomplishment bullets for a key role, evaluate if the high-level **Role Summary** needs reframing. A strong Role Summary anchors domain, scale, stack, and operational mandate—liberating individual accomplishment bullets to evolve freely and focus on technical depth, trade-offs, and quantified impact without repeating background boilerplate.

Offer 4 varied hiring manager perspectives:
1. **Core Systems Resilience**: High availability, fault tolerance, idempotency, event-driven design, zero data loss.
2. **Security & Risk Mitigation**: Zero-trust controls, PII protection, audit trails, compliance automation (S-SDLC).
3. **API Platform Velocity**: Contract-first design (OpenAPI), OpenTelemetry observability, developer platform tools.
4. **Data Platform & Analytics**: Snowflake warehousing, Databricks ETL, real-time ledger reconciliation.

Update chosen summary:
```bash
rw experience add -i <exp-id> -c "<Company>" -t "<Title>" -s "<YYYY-MM>" --summary "<New-Summary-Text>"
```

### Step 1: Gather Raw Accomplishment Notes
Ask the user:
- What was the core problem or project?
- What specific technologies or architecture were used?
- What was the quantified outcome (latency, throughput, revenue, cost, adoption, delay reduction)?
- How long ago was this role? (If >3 years old, aim for 2-3 summary bullets).

### Step 1.5: Bar-Raiser Diagnostic

Before drafting any variant, run each raw bullet through the **5-Point Bar-Raiser Diagnostic** from `references/bar-raiser-checklist.md`:

1. **Vague Adjective Check**: Flag `resilient`, `high-concurrency`, `high-volume`, `complex`, `critical` when not backed by a named mechanism or metric.
2. **Technical Misnomer Check**: Catch misused terms (`latency reduction` for batch runtime, `scalable` without QPS).
3. **Missing Mechanism Check**: Claims like `zero data loss` or `high availability` must name the *how* (distributed locking, circuit breakers, idempotency keys, saga patterns).
4. **Scale Quantification Check**: Every systems bullet needs at least one concrete number (QPS, daily events, P99 SLA, % reduction, cost savings).
5. **Summary Duplication Check**: The first bullet must NOT rephrase the role summary — it should tell a specific technical story.

Present the diagnostic results to the user as a **🔬 Bar-Raiser Analysis** block showing what a Big Tech interviewer would flag, with a concrete fix suggestion for each flagged item.

### Step 2: Draft 2–3 Dimensional Variants (or 6 Domain-Targeted Variants)

Reference `.agents/skills/resume-bullet-drafter/references/writing-style.md`:
- Each bullet is one complete sentence.
- Eliminate filler openings ("Responsible for", "Helped with").
- Put the outcome and metric at the end.
- Each variant must pass the 5-Point Bar-Raiser Diagnostic before being presented.

**Standard 3-Variant Draft:**
- *Variant A (Technical Credibility & Scale)*: "Architected distributed tracing pipeline ingesting 2.5M spans/sec across 60 microservices, reducing MTTR by 42%."
- *Variant B (Business Impact & Cost Savings / 'Safe Pair of Hands')*: "Cut cloud operating costs by 15% in Q2 2024 by optimizing vendor API contracts and dynamic connection pooling."
- *Variant C (Leadership Scope & Transferable Skill)*: "Spearheaded high-priority operational issue resolution across 12 markets, reducing delay time by 30%."

**Expanded 6-Variant Draft** (when user asks for broader domain coverage):
- *Variant A*: Technical Credibility & Scale (generic)
- *Variant B*: Business Impact & Cost Savings
- *Variant C*: Leadership Scope
- *Variant D*: FinTech & Compliance Signals
- *Variant E*: Cloud Platform & Resilience Signals
- *Variant F*: AI/ML & Developer Productivity Signals

### Step 3: Confirm Selection & Inactive Alternates
Ask the user:
1. "Which variant best captures what you want to highlight for your target profile?"
2. "Would you like to save the alternate variant(s) as inactive bullets in your master record for other role profiles?"

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
