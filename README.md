# Multi-Agent Onboarding Case Reviewer

Minimal full-stack TypeScript project demonstrating a multi-agent workflow for reviewing synthetic banking onboarding cases.

Contents:
- backend: Node + Express + TypeScript with a lightweight DB (SQLite or JSON fallback)
- frontend: React + Vite + TypeScript minimal UI

Run (backend):

1. cd backend
2. npm install
3. npm run seed
4. npm run dev

Note: The backend prefers `better-sqlite3` but can fall back to a JSON-backed store if your environment cannot build native modules. The easiest way to run the project locally is to install `nvm` and use Node 18 or 20 for full SQLite support.

macOS quick setup (Homebrew + nvm):

```bash
# install nvm via Homebrew
brew install nvm

# follow Homebrew's post-install message: create the nvm directory and add init to your shell rc
mkdir -p ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo 'source $(brew --prefix nvm)/nvm.sh' >> ~/.zshrc
source ~/.zshrc

# install and use Node 18
nvm install 18
nvm use 18

cd backend
npm install
npm run seed
npm run dev
```

If you cannot install Homebrew or nvm, you can still run the project; it will fall back to a simple JSON-backed store when native SQLite bindings are unavailable.

Run (frontend):

1. cd frontend
2. npm install
3. npm run dev

Frontend / backend host configuration
- The frontend uses a `BACKEND` URL to call the API. By default it calls `http://localhost:4000`. To change this, set the Vite env `VITE_BACKEND_URL` before starting the frontend dev server, for example:

```bash
export VITE_BACKEND_URL=http://localhost:4000
npm run dev
```

.env.example contains DB path and PORT.

Architecture and notes are in this README and [ARCHITECTURE.md]. Agents are deterministic heuristics by default (mock behavior). A runtime LLM key flow exists so you can paste an API key in the UI for demonstration — keys are validated but not persisted by the server. Agents will only call an LLM if explicitly wired to use a runtime key (this demo keeps agents mock-first for reproducibility).

AI tools used: GitHub Copilot (assistive), local TypeScript authoring.

Developer disclosure

- Tools used: GitHub Copilot (assistive) was used during development.
- Data & DB: sample data is synthetic. The demo uses SQLite (or a JSON fallback) for local testing.
- LLM: agents are mock-first; the UI validates an API key at runtime but keys are not persisted. Future enhancements (see `FUTURE_ENHANCEMENTS.md`) describe wiring LLM providers into agents.
- Author decisions: Enhancement choices in `FUTURE_ENHANCEMENTS.md` were made by the candidate.

See `DEVELOPER_NOTES.md` for a short summary of architectural and implementation decisions made by the developer.

License: synthetic sample data only.
