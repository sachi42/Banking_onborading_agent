type Provider = 'mock' | 'openai'

let config: { provider: Provider; key?: string } = { provider: 'mock' }

export function setConfig(p: Provider, key?: string) {
  config = { provider: p, key }
}

export function getConfig() {
  return config
}

export async function testKey(p: Provider, key?: string) {
  if (p === 'mock') return { ok: true, message: 'Mock provider selected' }
  if (p === 'openai') {
    if (!key) return { ok: false, message: 'Missing key' }
    if (typeof key !== 'string') return { ok: false, message: 'Key must be a string' }
    // perform a lightweight test call to OpenAI chat completions
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: 'You are a harmless validator.' }, { role: 'user', content: 'Say OK in one word.' }], max_tokens: 3 })
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        const note = res.status === 401 ? 'Unauthorized — check the key and organization/billing' : ''
        return { ok: false, message: `OpenAI error: ${res.status} ${txt}` + (note ? ` (${note})` : '') }
      }
      const j = await res.json()
      if (j && j.choices && j.choices[0] && j.choices[0].message && typeof j.choices[0].message.content === 'string') {
        return { ok: true, message: 'Key validated via OpenAI' }
      }
      return { ok: false, message: 'Unexpected OpenAI response' }
    } catch (e: any) {
      return { ok: false, message: `Network or fetch failed: ${e?.message || String(e)}` }
    }
  }
  return { ok: false, message: 'Unknown provider' }
}
