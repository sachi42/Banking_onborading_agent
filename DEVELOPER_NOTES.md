Developer Notes — Author & Implementation Summary

Authorship

- The enhancement decisions recorded in `FUTURE_ENHANCEMENTS.md` (prioritization and scope) were made by the candidate.

Tools

- GitHub Copilot: used as an assistive coding tool during development.

High-level implementation decisions made by the developer

- Mock-first approach: Agents are deterministic heuristics by default to keep the demo predictable and easy to test. This minimizes flakiness during demonstrations and interviews.

- Typed contracts: Introduced `AgentInput` and `AgentOutput<T>` in `backend/src/types.ts` to enforce consistent, strongly-typed interfaces between the orchestrator and agents.

- Simple orchestrator: Implemented `runReview` as a linear, auditable pipeline that collects each agent's `AgentOutput` into a `trace` array for explanation and replay.

- Two autonomy modes: Implemented `human_review_on_exception` and `human_approval_required` to demonstrate safe human-in-the-loop options.

- Runtime LLM flow (non-persistent): Added a lightweight `llm/test` route and a UI flow to validate an API key at runtime; keys are not persisted by the server. The runtime key can be forwarded to agents as `llmKey` in the review request for future LLM-driven behavior.

- DB fallback: Prefer `better-sqlite3` where available; include a JSON fallback store to avoid native build failures and keep the demo runnable in varied environments.

- Minimal external surface: Kept the demo self-contained (no external queues or managed services) to simplify local testing and evaluation.

- Safety-first posture: Agents have deterministic fallbacks; plan to validate LLM outputs with schema validators (zod/ajv) before trusting them.

Testing and reproducibility

- Included a small integration test for the orchestrator behavior. Emphasized type-safety and small, focused tests to ensure reliability.

How to present these in an interview

- Explain the trade-offs: reproducibility and testability vs. richer LLM-driven outputs.
- Highlight the incremental path: validated runtime LLM flow today, adapter + schema validation and one-agent LLM usage next, then gradual roll-out with monitoring.

Contact

- The code and decisions are authored by the candidate. For questions about design choices, refer to `FUTURE_ENHANCEMENTS.md` and `ARCHITECTURE.md`.
