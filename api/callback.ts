import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kvSet } from './_kv'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const body = req.body as Record<string, unknown>
  const sessionId = (body?.sessionId ?? body?.state ?? body?.nonce) as string | undefined

  if (!sessionId) {
    console.error('[callback] No sessionId in payload:', body)
    return res.status(400).json({ error: 'Missing sessionId in payload' })
  }

  await kvSet(`vp:${sessionId}`, body)
  console.log('[callback] Stored result for session:', sessionId)
  return res.status(200).json({ ok: true })
}
