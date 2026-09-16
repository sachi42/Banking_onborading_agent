Multi-Agent Onboarding Case Reviewer — Architecture (concise)

Overview

A short, practical description of how this demo is structured and how the runtime LLM flow fits in.

Project layout (high level)

- backend/
  - src/
    - index.ts — Express entrypoint and route mounting
    - db.ts — DB layer: prefers `better-sqlite3` (SQLite) but falls back to a JSON-backed store when native modules can't be built
    - seed.ts — writes a synthetic sample case used by the demo
    - types.ts — shared TypeScript contracts (`OnboardingCase`, `AgentInput`, `AgentOutput`, `OrchestratorResult`)
    - orchestrator.ts — coordinates agents and builds an auditable `trace`
    - routes/
      - cases.ts — list/fetch/create case endpoints and `POST /cases/:id/review` to run a review
      - llm.ts — lightweight LLM test/config endpoints (validates runtime keys but does not persist secrets)
    - agents/* — small, single-purpose agents (DocumentCompleteness, IdentityConsistency, RiskIndicator, Recommendation)
- frontend/ — Vite + React UI in `src/App.tsx`
- FUTURE_ENHANCEMENTS.md — short next-steps summary
- README.md — quick start

Design notes (runtime behavior)

- Deterministic-first: agents are implemented as simple, deterministic heuristics by default. This keeps the demo reproducible for testing and interviews.
- Runtime LLM key flow: the UI can accept an API key (OpenAI) and validate it with `/llm/test`. The key is NOT persisted on the server. To demo agent LLM usage, the frontend can send the key with the review request as `llmKey` (the backend forwards it to agents as `AgentInput.context.llmKey`). Agents must explicitly read that field to call an external LLM.
- Mock-first policy: the project is intentionally mock-first — LLM calls are optional and must be wired per-agent. This repo keeps agents heuristic to avoid unexpected nondeterminism unless you enable LLM behavior.

Orchestration flow

1. `POST /cases/:id/review` triggers `runReview`
2. Orchestrator runs agents in order and collects each `AgentOutput` into a `trace`:
   - DocumentCompletenessAgent
   - IdentityConsistencyAgent
   - RiskIndicatorAgent
   - RecommendationAgent (consumes prior outputs)
3. Two autonomy modes are supported and passed in the review request body: `human_review_on_exception` and `human_approval_required`.
4. If a runtime `llmKey` is provided it is included in `AgentInput.context.llmKey` for agents that support LLM calls.

DB and persistence

- Local demo: SQLite is used when available. If `better-sqlite3` cannot be built, a JSON-backed fallback store keeps the app runnable without native builds.

- Note: For production you'd replace the lightweight store with a managed relational database and migrations; this repo keeps the demo simple and self-contained.

Security and secrets

- The UI validates a pasted API key but the server does not store it. For production, use a secrets manager and never store keys in plaintext or in the repo.
- Redact PII before logging or sending to external providers. Prefer strict JSON schemas for any LLM outputs before trusting them.

Run & debug notes

- Backend default: http://localhost:4000
- Frontend default: Vite dev server (e.g. http://localhost:5173)
- Frontend reads `VITE_BACKEND_URL` or falls back to `http://localhost:4000` to build API requests.
- To demo LLM validation: choose OpenAI in the UI, paste a key, click "Set API Key" — the app validates the key and keeps it in memory only for that session. Running a review will include the key in the request if provider is OpenAI.

When to enable LLM calls

- Enable a single agent first (e.g., RecommendationAgent) and validate output schemas (zod/ajv) before expanding.
- Keep deterministic fallbacks so that failures or parse errors do not block the orchestrator.

Notes

This file is intentionally concise — more detailed architecture diagrams and sequence charts belong in `ARCHITECTURE.md` expansions or `docs/` when moving toward production.
