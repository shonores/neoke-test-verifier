import { VerifyResponse } from '../types'

const DEFAULT_CE_URL = 'https://neoke-consent-engine.fly.dev'

export async function verify(
  ceUrl: string,
  ceApiKey: string,
  to: string,
  credentialType: string,
  dcqlQuery?: object
): Promise<{ result?: VerifyResponse; error?: string; raw?: string }> {
  const url = `${ceUrl || DEFAULT_CE_URL}/v1/verify`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 90_000)

  try {
    const body: Record<string, unknown> = { to, credentialType }
    if (dcqlQuery) body.dcqlQuery = dcqlQuery

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `ApiKey ${ceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    const raw = await res.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = raw
    }

    if (res.ok) {
      return { result: parsed as VerifyResponse }
    }
    return { error: `HTTP ${res.status}`, raw }
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') {
      return { error: 'Request timed out after 90 seconds' }
    }
    return { error: String(e) }
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function listCredentialTypes(
  ceUrl: string
): Promise<{ id: string; label: string }[]> {
  const url = `${ceUrl || DEFAULT_CE_URL}/v1/credential-types`
  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = (await res.json()) as { credentialTypes?: { id: string; label: string }[] }
    return data.credentialTypes ?? []
  } catch {
    return []
  }
}
