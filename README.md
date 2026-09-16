# Multi-Agent Onboarding Case Reviewer

Minimal full-stack TypeScript project demonstrating a multi-agent workflow for reviewing synthetic banking onboarding cases.

Contents:
- backend: Node + Express + TypeScript + SQLite (mocked AI agents)
- frontend: React + Vite + TypeScript minimal UI

Run (backend):

1. cd backend
2. npm install
3. npm run seed
4. npm run dev

Note: The backend uses a native SQLite binding (`better-sqlite3`) which requires a compatible Node toolchain. The easiest way to run the project locally is to install `nvm` and use Node 18 or 20.

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

If you cannot install Homebrew or nvm, consider using Docker with a Postgres service (not included by default in this repo).
Note: the project will attempt to install `better-sqlite3` as an optional dependency. If your environment cannot build native modules, `npm install` will continue and the backend will run using a JSON-backed fallback store. For full SQLite support install `nvm` and use Node 18 as described above.

Run (frontend):

1. cd frontend
2. npm install
3. npm run dev

.env.example contains DB path and PORT.

Architecture and notes are in this README and the code. The agents are simple deterministic implementations (mock LLM). See `/backend/src/agents` and `/backend/src/orchestrator.ts` for the workflow.

AI tools used: GitHub Copilot (assistive), local TypeScript authoring.

License: synthetic sample data only.
