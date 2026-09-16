Future enhancements -

This project is a demo scaffold for a multi-agent onboarding reviewer. Below are a few small, practical next steps you can add later.

- LLM provider: UI supports pasting an API key at runtime and validating it. We do not persist keys. Future enhancement: add an `LLMClient` adapter and switch agents to call configured LLMs with schema validation and safe fallbacks.
- Database & Docker: the demo uses a lightweight local store; for production add Postgres + `docker-compose.yml` and simple migrations to persist cases and review audits.
- Observability: add structured logs and basic metrics (correlation IDs, Prometheus) so runs are auditable.
- Safety & testing: validate LLM outputs (zod/ajv), keep deterministic heuristics as fallback, and add unit/integration tests and CI.