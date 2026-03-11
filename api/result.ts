import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kvGet } from './_kv'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed')

  const sessionId = req.query.sessionId as string
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' })

  const data = await kvGet(`vp:${sessionId}`)

  if (data == null) return res.status(202).json({ pending: true })
  return res.status(200).json(data)
}
