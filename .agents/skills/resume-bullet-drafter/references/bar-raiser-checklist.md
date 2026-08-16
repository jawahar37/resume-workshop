# Bar-Raiser Checklist — Shared Reference Guide
*Applied automatically by all Resume Workshop skills when drafting, reviewing, or importing bullets.*

---

## 1. The 5-Point Bar-Raiser Diagnostic

Every accomplishment bullet must pass all 5 checks before being presented to the user. When a bullet fails, flag it with the specific anti-pattern and provide a concrete fix.

### ❌ Check 1: Vague Adjective Check
Flag subjective buzzwords that aren't backed by a named mechanism or metric:
- `resilient`, `high-concurrency`, `high-volume`, `complex`, `critical`, `robust`, `scalable`, `efficient`, `sophisticated`
- **Fix**: Replace each adjective with either a concrete number or the specific mechanism that delivers the claimed property.
- **Example**: ❌ *"Built scalable microservices"* → ✅ *"Built microservices processing 10,000+ QPS with auto-scaling on AWS ECS"*

### ❌ Check 2: Technical Misnomer Check
Catch misused technical terms that a bar-raiser interviewer would immediately question:
- `latency reduction` used for batch runtime improvements (latency = per-request response time; batch jobs have *runtime* or *execution time*)
- `scalable` without QPS, concurrent users, or data volume
- `real-time` for anything with >1s processing delay
- `AI-powered` for rule-based or heuristic systems
- **Fix**: Use the precise technical term for what was actually measured or achieved.

### ❌ Check 3: Missing Mechanism Check
Claims must name the *how*, not just the *what*:
- `zero data loss` → **How?** Distributed locking? Idempotency keys? Write-ahead logs? Saga patterns?
- `high availability` → **How?** Circuit breakers? Multi-region failover? Health-check probes? Blue-green deployments?
- `fault-tolerant` → **How?** Retry with exponential backoff? Dead-letter queues? Compensating transactions?
- `secure` → **How?** HashiCorp Vault? mTLS? SAST/SCA pipeline? PII tokenization?
- **Fix**: Name 1–2 specific architectural mechanisms that deliver the claimed property.

### ❌ Check 4: Scale Quantification Check
Every systems-oriented bullet needs at least one concrete number:
- Throughput: QPS, events/sec, daily transactions, rows processed
- Latency: P99 response time, SLA targets (sub-100ms, sub-200ms)
- Improvement: % reduction, X times speedup, time savings (30m → 30s)
- Scale: number of services, team size, data volume (TB), user count
- Cost: $ savings, % cost reduction, infrastructure efficiency gains
- **Fix**: If the user doesn't have exact numbers, prompt them to estimate order-of-magnitude ranges.

### ❌ Check 5: Summary Duplication Check
The first accomplishment bullet under any role must NOT rephrase the role summary:
- The role summary anchors domain, scale, stack, and operational mandate.
- Individual bullets are liberated to tell *specific technical stories* about how problems were solved.
- **Fix**: If bullet 1 overlaps with the summary, rewrite it to highlight a specific architectural decision, trade-off, or quantified outcome the summary doesn't cover.

---

## 2. Anti-Pattern → Fix Catalog

Concrete before/after rewrites for the most common anti-patterns:

| Anti-Pattern | Fix |
|:---|:---|
| `"enforcing complex business rules"` | Name the rule engine, validation layer, or business logic framework |
| `"98% latency reduction"` (for batch jobs) | `"98% runtime reduction"` or `"98% execution time reduction"` |
| `"high-volume transactions"` | `"5M+ daily transactions"` or `"10,000+ QPS"` |
| `"zero data loss"` alone | `"zero data loss via distributed locking and idempotency keys"` |
| `"improved performance"` | `"cut P99 API response latency from 450ms to 85ms"` |
| `"built scalable services"` | `"built services auto-scaling to 15,000+ QPS on AWS ECS"` |
| `"ensured security"` | `"integrated HashiCorp Vault for secrets rotation and PII tokenization"` |
| `"worked with cross-functional teams"` | `"partnered with product, security, and SRE teams to ship..."` |
| `"responsible for maintaining"` | Delete entirely; lead with what you *built* or *improved* |
| `"helped with the migration"` | `"Led"` / `"Co-led"` / `"Drove"` the migration |

---

## 3. The Anti-Regurgitation Rule

A core principle applied across all skills:

> **When improving or expanding bullets, never simply rephrase text the user already has.**

- The user's existing vault is the **starting point, not the ceiling**.
- Mine JDs, domain signal catalogs, and architectural pattern libraries for **technologies, mechanisms, and signals the vault doesn't yet mention**.
- Draft entirely new bullets that expand the user's demonstrated skill vocabulary, covering gaps that make the resume compelling for new domains.
- Only refine existing bullet wording when the user **explicitly asks** to improve a specific point.

### When to Expand vs. Refine

| User Says | Action |
|:---|:---|
| "Improve this bullet" / "Make this stronger" | **Refine**: Run Bar-Raiser Diagnostic on the specific bullet, fix anti-patterns |
| "Write more points" / "What else?" / "Expand" | **Expand**: Mine for uncovered signals, draft net-new bullets |
| "Target for Google" / "Write for FinTech" | **Expand + Pivot**: Switch to domain signal catalog, draft domain-specific net-new bullets |
| "Use the JD to write points" | **Expand from JD**: Extract uncovered JD signals, draft bullets using JD's vocabulary |

---

## 4. Domain Signal Catalogs

What hiring managers in each domain actually screen for. Use these catalogs to generate net-new expansion bullets when the user asks to target a specific domain.

### Big Tech (Google / Microsoft / Meta / Amazon)
QPS, P99 SLAs, lock-free concurrency, gRPC/Protobuf, OpenTelemetry, MTTR reduction, canary rollouts, 5-nines availability, non-blocking async I/O (epoll/Netty/asyncio), backward-compatible API evolution, distributed consensus, load shedding

### FinTech & Banking
Double-entry ledger reconciliation, PCI-DSS/SOC 2, idempotent payment processing, ACH/card network settlement, real-time fraud scoring engines, KYC/AML compliance automation, transaction audit trails, penny-accurate rounding, regulatory reporting

### B2B SaaS & Enterprise Software
Multi-tenant RLS isolation, webhook delivery with dead-letter queues, Enterprise SSO (SAML 2.0/OIDC), RBAC/ABAC authorization, usage-based metered billing, customer onboarding automation, white-label configurability, API rate limiting, tenant-scoped connection pooling

### Cloud / Platform & DevOps
Terraform/Pulumi IaC, Kubernetes canary pipelines, circuit breakers, multi-region failover, zero-downtime deployments, service mesh (Istio/Envoy), GitOps (ArgoCD/Flux), container orchestration, blue-green deployments, infrastructure drift detection

### AI/ML Platform & LLM Infrastructure
RAG vector retrieval (FAISS/ChromaDB/Pinecone), LLM agent orchestration, model serving pipelines (TorchServe/Triton), feature stores, prompt engineering frameworks, embedding pipelines, MLOps (MLflow/Kubeflow), fine-tuning workflows, guardrails and safety filters

### E-Commerce & Marketplace
Search ranking algorithms, recommendation engines, cart/checkout transaction integrity, inventory reservation (optimistic locking), A/B testing infrastructure, CDN edge caching, dynamic pricing engines, order fulfillment state machines, payment gateway integration

### HealthTech & BioTech
HIPAA compliance, HL7/FHIR interoperability, PHI encryption at rest/in transit, clinical data pipelines, EHR integration, FDA 21 CFR Part 11 audit trails, de-identification pipelines, consent management, telemedicine infrastructure

### Cybersecurity & DevSecOps
Zero-trust architecture, SAST/DAST/SCA automation, secrets management (HashiCorp Vault), SOC 2/ISO 27001 compliance, vulnerability remediation SLAs, penetration testing, shift-left security, SBOM generation, mTLS, incident response automation

### Data Engineering & Analytics
Spark/Flink stream processing, data lake architecture (Delta Lake/Iceberg), Snowflake/BigQuery warehousing, CDC pipelines (Debezium), dbt transformations, data quality frameworks (Great Expectations), real-time dashboarding, data lineage tracking, schema evolution

### Gaming & Real-Time Systems
WebSocket/UDP real-time networking, tick-rate optimization, ECS (Entity Component System) architecture, matchmaking algorithms, state synchronization, spatial partitioning, sub-16ms frame budgets, deterministic lockstep, lag compensation

### EdTech & Consumer Apps
Mobile-first responsive design, push notification pipelines, user engagement funnels, content delivery optimization, accessibility (WCAG 2.1), internationalization (i18n/l10n), offline-first sync (CRDTs), social graph queries, notification preference management

### Consulting & Enterprise IT
Legacy system modernization, mainframe-to-cloud migration, vendor API integration, enterprise middleware (MuleSoft/Kafka Connect), cross-functional stakeholder alignment, SOW delivery, compliance remediation at scale, multi-vendor coordination, RFP technical response
