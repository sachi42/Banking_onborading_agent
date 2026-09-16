Multi-Agent Onboarding Case Reviewer — Architecture and Design

Overview

This document explains the project structure, agent responsibilities, orchestration approach, assumptions, completed functionality, limitations, security considerations, and a productionisation roadmap.

Files and folders

- backend/
  - src/
    - index.ts — Express app entrypoint, loads env, mounts routes
    - db.ts — lightweight SQLite connection and schema creation (uses `better-sqlite3`)
    - seed.ts — writes a synthetic sample case and inserts it into the DB
    - types.ts — TypeScript typed contracts for `OnboardingCase`, `AgentInput`, `AgentOutput`, `OrchestratorResult`, and `AutonomyMode`
    - orchestrator.ts — supervisor that coordinates agent execution and builds the execution trace
    - routes/cases.ts — API endpoints: list, fetch, and trigger review for a case
    - agents/* — specialised agents (DocumentCompletenessAgent, IdentityConsistencyAgent, RiskIndicatorAgent, RecommendationAgent)
    - tests/agent.test.ts — small integration test using the orchestrator
  - package.json, tsconfig.json — backend tooling and scripts

- frontend/
  - src/
    - App.tsx — minimal React UI to select a case, pick autonomy mode, run review, and display results
    - main.tsx, vite.config.ts, index.html — Vite + React scaffolding
  - package.json, tsconfig.json — frontend tooling

- .env.example — placeholders for runtime configuration
- README.md — quick start
- ARCHITECTURE.md — (this file)

Agent responsibilities

Each agent is an independent, typed module with a single responsibility. Agents accept an `AgentInput` containing the typed `OnboardingCase` and return an `AgentOutput<T>` describing a structured result and a short explanation.

- DocumentCompletenessAgent
  - Goal: Verify presence of required supporting documents (currently `id_document` and `proof_of_address`).
  - Input: `OnboardingCase`
  - Output: `{ missing: string[], presentCount: number }`
  - Termination: completes synchronously; non-blocking.

- IdentityConsistencyAgent
  - Goal: Check identity/profile fields against address and detect simple mismatches (e.g., nationality vs address country).
  - Input: `OnboardingCase`
  - Output: `{ consistent: boolean, mismatches: string[] }`

- RiskIndicatorAgent
  - Goal: Compute a simple numeric risk score from flags (PEP, negative news) and income bracket.
  - Input: `OnboardingCase`
  - Output: `{ score: number, flags: string[] }`

- RecommendationAgent
  - Goal: Consolidate prior agent outputs and produce a final recommendation: `Approve`, `Refer`, `Reject`, or `PendingApproval`.
  - Input: list of `AgentOutput` entries (the execution trace)
  - Output: `{ decision, reasons }`

Workflow and orchestration approach

- The orchestrator (`runReview`) coordinates execution in a linear pipeline:
  1. Run DocumentCompletenessAgent
  2. Run IdentityConsistencyAgent
  3. Run RiskIndicatorAgent
  4. Run RecommendationAgent (consumes prior outputs)

- The orchestrator collects each agent's `AgentOutput` into a `trace` array for auditability and explanation.
- Two autonomy modes are supported:
  - `human_review_on_exception`: if an agent throws or fails, the orchestrator returns `Refer` immediately.
  - `human_approval_required`: regardless of result, the orchestrator marks the outcome as `PendingApproval` and sets `requiresApproval=true`.
- Failure handling: agent exceptions are caught; the orchestrator appends a failed output to the trace and either refers or continues based on the mode.

Type safety and contracts

- All agents use `AgentInput` / `AgentOutput<T>` to enforce a consistent typed contract.
- RecommendationAgent expects prior agents to populate predictable shapes; the orchestrator enforces ordering so RecommendationAgent can find earlier outputs by `agent` field.

Assumptions

- Synthetic data only — seed writes a sample case.
- Agents are deterministic heuristic implementations for reliability in a monitored exam setting.
- Single-machine, single-process orchestration — no distributed or parallel execution required for the assignment.
- The DB is local SQLite for simplicity and reproducibility.

Completed functionality

- Full-stack scaffold (React + Node + TypeScript) with a working demo path:
  - Seed a sample case
  - List and fetch cases via API
  - Execute a multi-agent review with two autonomy modes
  - Present execution trace and final recommendation in the frontend
- Type contracts between agents and orchestrator
- Basic automated test for an approve path

Known limitations

- Agents are simplistic heuristics; not using language models.
- No persistent audit log beyond the run-time trace returned by API — runs are not stored as audit records.
- No authentication or RBAC for human approval flows.
- No schema migration tooling for the DB (e.g., knex or TypeORM).
- No validation or runtime schema enforcement (e.g., JSON schema) for agent outputs.
- Error handling is coarse-grained; more granular retry/backoff behavior is necessary for production.

Security considerations

- No secrets are stored in repo; `.env.example` contains placeholders — real keys must go into `.env` and never be committed.
- If LLM API keys are added, ensure they are loaded from environment variables and not committed.
- For production, enable TLS, authentication, input validation, rate limits, and RBAC for approval flows.
- Sanitize any external LLM responses before parsing/executing; prefer strict JSON schemas and runtime validation.

Productionisation roadmap

Short-term:
- Replace SQLite with managed RDBMS (Postgres)
- Add DB migrations and a job queue for asynchronous agent execution
- Persist review runs and provide an audit trail of decisions and human approvals
- Add authentication and authorization (OAuth / OIDC)
- Add structured logging and metrics

Medium-term:
- Introduce an LLM adapter layer with response validation and rate limiting
- Add feature flags to enable/disable autonomous steps per customer
- Introduce parallel agent execution where possible and safe

Long-term:
- Implement canary releases for autonomy increases, A/B testing with human-in-the-loop
- Add formal policies and safety checks (policy agents) that enforce compliance

How autonomy could be increased safely over time

- Start with `human_approval_required` for high-risk profile groups.
- Instrument decision outcomes, false positives/negatives, and operator overrides.
- Use conservative thresholds: only escalate to autonomous `Approve` for very low-risk buckets.
- Add monitoring dashboards and circuit breakers to revert to human review if error rates rise.
- Introduce explainability metadata from LLMs (chain-of-thought redaction) and require strict JSON outputs validated by schemas.

Appendix: How to run locally

1. Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies `/cases` to `http://localhost:4000` by default.

Contact / Notes

- All sample data is synthetic. For the interview submission, include commit history and note any AI tooling you used in the README.
