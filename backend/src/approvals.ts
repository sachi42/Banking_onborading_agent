import fs from 'fs'
import path from 'path'

const dataDir = path.resolve(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const reviewsPath = path.join(dataDir, 'reviews.json')

type ReviewRecord = {
  id: string
  caseId: string
  decision: 'Approve' | 'Reject' | 'Refer'
  reviewer?: string
  comment?: string
  timestamp: string
}

function readReviews(): ReviewRecord[] {
  if (!fs.existsSync(reviewsPath)) return []
  try {
    const raw = fs.readFileSync(reviewsPath, 'utf8')
    return JSON.parse(raw || '[]') as ReviewRecord[]
  } catch (e) {
    return []
  }
}

function writeReviews(rows: ReviewRecord[]) {
  fs.writeFileSync(reviewsPath, JSON.stringify(rows, null, 2), 'utf8')
}

export function addReview(caseId: string, decision: ReviewRecord['decision'], reviewer?: string, comment?: string) {
  const rows = readReviews()
  const rec: ReviewRecord = { id: `${Date.now()}`, caseId, decision, reviewer, comment, timestamp: new Date().toISOString() }
  rows.push(rec)
  writeReviews(rows)
  return rec
}

export function getReviewsForCase(caseId: string) {
  return readReviews().filter(r => r.caseId === caseId)
}

export function getAllReviews() {
  return readReviews()
}

export type { ReviewRecord }
