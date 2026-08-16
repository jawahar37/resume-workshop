---
name: resume-bullet-drafter
description: |
  Helps software engineers transform raw work notes, PR descriptions, and career accomplishments into sharp, quantified STAR bullets following the Verlyn Klinkenborg house style and 5 Strategic Positioning Guidelines.
  Use when the user wants to write, revise, or refine accomplishment bullets for their resume or add alternate points to an experience.
---

# Resume Bullet Drafter

Transforms messy work notes into high-impact, quantified resume bullets aligned with Klinkenborg house style and executive positioning rules.

## Quick Start

1. Ask the user for raw context about what they built, solved, or improved.
2. Draft 2–3 distinct bullet variants highlighting different dimensions (Technical Depth, Business Impact / Dependability, Leadership Scope).
3. Ensure bullets follow the **5 Strategic Guidelines** ('Safe Pair of Hands', Transferable Vocabulary, Senior Power Verbs, 2-3 Year Recency Focus, Balanced Range).
4. Present the variants to the user.
5. Save active selection and preserve unpicked variants as inactive alternates in the vault.

## Core Strategic Guidelines

Every drafted bullet must adhere to `.agents/skills/resume-bullet-drafter/references/writing-style.md`:

1. **Position as a 'Safe Pair of Hands'**: Focus on low-risk, dependable execution and clear, recent results.
2. **Translate Transferable Skills**: Mirror job description verbiage to frame achievements in terms the target industry recognizes.
3. **Use Senior-Level Power Action Verbs**: Lead with *"Led," "Spearheaded," "Drove," "Launched," "Owned," "Architected."* Avoid passive verbs (*"helped," "supported," "worked on"*).
4. **Focus Recency on Last 2–3 Years**: Spend most detail on recent roles; keep older jobs (4+ years ago) to 2-3 concise bullets.
5. **Demonstrate Balanced Range**: Every bullet pack must balance **Technical Credibility**, **Business Impact**, and **Leadership Scope**.

## Workflow

### Step 1: Gather Raw Accomplishment Notes
Ask the user:
- What was the core problem or project?
- What specific technologies or architecture were used?
- What was the quantified outcome (latency, throughput, revenue, cost, adoption, delay reduction)?
- How long ago was this role? (If >3 years old, aim for 2-3 summary bullets).

### Step 2: Draft 2–3 Dimensional Variants

Reference `.agents/skills/resume-bullet-drafter/references/writing-style.md`:
- Each bullet is one complete sentence.
- Eliminate filler openings ("Responsible for", "Helped with").
- Put the outcome and metric at the end.

**Example Draft Variants:**
- *Variant A (Technical Credibility & Scale)*: "Architected distributed tracing pipeline ingesting 2.5M spans/sec across 60 microservices, reducing MTTR by 42%."
- *Variant B (Business Impact & Cost Savings / 'Safe Pair of Hands')*: "Cut cloud operating costs by 15% in Q2 2024 by optimizing vendor API contracts and dynamic connection pooling."
- *Variant C (Leadership Scope & Transferable Skill)*: "Spearheaded high-priority operational issue resolution across 12 markets, reducing delay time by 30%."

### Step 3: Confirm Selection & Inactive Alternates
Ask the user:
1. "Which variant best captures what you want to highlight for your target profile?"
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
