import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    upstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    nodeEnv: process.env.NODE_ENV,
  })
}
