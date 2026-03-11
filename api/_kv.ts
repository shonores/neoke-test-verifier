// Minimal Upstash Redis client using their REST API (no SDK needed).
// Requires env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
// Set via: Vercel dashboard → Storage → Upstash → Connect to project

async function redis(command: unknown[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error('Upstash env vars not set (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)')

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  const data = await res.json() as { result: unknown }
  return data.result
}

export async function kvSet(key: string, value: unknown, exSeconds = 3600) {
  await redis(['SET', key, JSON.stringify(value), 'EX', String(exSeconds)])
}

export async function kvGet(key: string): Promise<unknown> {
  const raw = await redis(['GET', key])
  if (raw == null) return null
  try { return JSON.parse(raw as string) } catch { return raw }
}
