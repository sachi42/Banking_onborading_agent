import fs from 'fs'
import path from 'path'

// Attempt to load a native SQLite binding if available; otherwise fall back
// to a lightweight JSON-backed store so `npm install` succeeds on systems
// without a native build toolchain.
const dataDir = path.resolve(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const dbPath = path.join(dataDir, 'onboarding.db')

type Stored = { [id: string]: string }
const storePath = path.join(dataDir, 'cases.json')

function readStore(): Stored {
  if (!fs.existsSync(storePath)) return {}
  try {
    const raw = fs.readFileSync(storePath, 'utf8')
    return JSON.parse(raw || '{}') as Stored
  } catch (e) {
    return {}
  }
}

function writeStore(s: Stored) {
  fs.writeFileSync(storePath, JSON.stringify(s, null, 2), 'utf8')
}

// Provide a `prepare(sql)` abstraction compatible with better-sqlite3's
// prepared statements (`.all()`, `.get()`, `.run()`). If the native driver
// is present we return it; otherwise we supply a JS fallback mapping a few
// expected SQL statements used by this project.
let dbImpl: any
try {
  // require dynamically so install doesn't fail when optional dependency missing
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Database: any = require('better-sqlite3')
  const db = new Database(dbPath)
  db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    );
  `)
  dbImpl = db
} catch (e) {
  // Fallback store: implement `prepare` with minimal SQL pattern matching
  const fallback = {
    prepare(sql: string) {
      const trimmed = sql.trim().toUpperCase()
      if (trimmed.startsWith('SELECT ID FROM CASES')) {
        return {
          all() {
            return Object.keys(readStore()).map(id => ({ id }))
          }
        }
      }
      if (trimmed.startsWith('SELECT PAYLOAD FROM CASES')) {
        return {
          get(id: string) {
            const s = readStore()
            const payload = s[id]
            return payload ? { payload } : undefined
          }
        }
      }
      if (trimmed.startsWith('INSERT OR REPLACE INTO CASES')) {
        return {
          run(id: string, payload: string) {
            const s = readStore()
            s[id] = payload
            writeStore(s)
            return { changes: 1 }
          }
        }
      }
      // Generic fallback no-op
      return {
        all() { return [] },
        get() { return undefined },
        run() { return { changes: 0 } }
      }
    }
  }
  dbImpl = fallback
}

export default dbImpl
