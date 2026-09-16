import express from 'express'
import { setConfig, getConfig, testKey } from '../llmConfig'

const router = express.Router()

router.get('/config', (req, res) => {
  res.json(getConfig())
})

router.post('/config', (req, res) => {
  const { provider, key } = req.body as { provider?: string; key?: string }
  if (!provider) return res.status(400).json({ error: 'missing provider' })
  // Do not persist user API keys on the server. Only store selected provider if needed.
  setConfig(provider as any, undefined)
  res.json({ ok: true })
})

router.post('/test', async (req, res) => {
  const { provider, key } = req.body as { provider?: string; key?: string }
  try {
    const result = await testKey(provider as any, key)
    if (!result.ok) return res.status(400).json(result)
    // do not store the user's key on the server; caller should pass key at runtime
    res.json(result)
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e?.message || String(e) })
  }
})

export default router
