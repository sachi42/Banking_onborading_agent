import express from 'express'
import db from '../db'
import { runReview } from '../orchestrator'
import { AutonomyMode } from '../types'

const router = express.Router()

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT id FROM cases').all()
  res.json(rows.map((r: any) => r.id))
})

router.get('/:id', (req, res) => {
  const raw = db.getPayload(req.params.id)
  if (!raw) return res.status(404).json({ error: 'not found' })
  res.json(JSON.parse(raw))
})

router.post('/:id/review', async (req, res) => {
  const { mode } = req.body as { mode?: AutonomyMode }
  const row = db.prepare('SELECT payload FROM cases WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'not found' })
  const payload = JSON.parse(row.payload)
  const result = await runReview(payload, mode || 'human_review_on_exception')
  res.json(result)
})

export default router
