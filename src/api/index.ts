import { GetToken, CreateRequestResponse, ConsentResponse, QueueItem } from '../types'
import { deriveNodeHost } from '../hooks/useAuth'

async function apiFetch(url: string, options: RequestInit = {}): Promise<{ data: unknown; status: number; raw: string }> {
  const res = await fetch(url, options)
  const raw = await res.text()
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    data = raw
  }
  return { data, status: res.status, raw }
}

async function resolveToken(getToken: GetToken): Promise<{ token: string } | { error: string }> {
  return getToken()
}

export async function createVpRequest(
  nodeId: string,
  getToken: GetToken,
  dcqlQuery: object,
  callbackUrl: string
): Promise<{ result?: CreateRequestResponse; error?: string; status?: number; raw?: string }> {
  const tokenResult = await resolveToken(getToken)
  if ('error' in tokenResult) return { error: tokenResult.error }

  const url = `https://${deriveNodeHost(nodeId)}/:/auth/siop/request`
  try {
    const { data, status, raw } = await apiFetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'reference',
        responseType: 'vp_token',
        responseMode: 'direct_post',
        dcqlQuery,
        trustProfiles: ['EU Trust Framework'],
        onComplete: {
          url: callbackUrl,
          dataMode: 'full',
          mode: 'async',
          retry: { maxAttempts: 3, delayMs: 1000 },
        },
      }),
    })
    if (status >= 200 && status < 300) {
      const d = data as Record<string, unknown>
      return {
        result: {
          sessionId: (d.sessionId ?? d.id ?? d.session_id ?? '') as string,
          requestUri: (d.requestUri ?? d.request_uri ?? '') as string,
          // invocationUrl is the openid4vp:// link the wallet app handles
          rawLink: (d.invocationUrl ?? d.rawLink ?? d.requestUri ?? d.request_uri ?? '') as string,
        },
      }
    }
    return { error: `HTTP ${status}`, status, raw }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function fetchVpResponse(
  nodeId: string,
  getToken: GetToken,
  sessionId: string
): Promise<{ data?: unknown; error?: string; status?: number; raw?: string }> {
  const tokenResult = await resolveToken(getToken)
  if ('error' in tokenResult) return { error: tokenResult.error }

  const url = `https://${deriveNodeHost(nodeId)}/:/auth/siop/request/${sessionId}/response`
  try {
    const { data, status, raw } = await apiFetch(url, {
      headers: { 'Authorization': `Bearer ${tokenResult.token}` },
    })
    if (status >= 200 && status < 300) return { data }
    return { error: `HTTP ${status}`, status, raw }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function sendToWallet(
  ceUrl: string,
  targetWalletDid: string,
  rawLink: string
): Promise<{ result?: ConsentResponse; error?: string; status?: number; raw?: string }> {
  const url = `${ceUrl}/consent/request`
  try {
    const { data, status, raw } = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: targetWalletDid, rawLink }),
    })
    if (status >= 200 && status < 300) return { result: data as ConsentResponse }
    return { error: `HTTP ${status}`, status, raw }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function fetchSessionResult(
  nodeId: string,
  getToken: GetToken,
  sessionId: string
): Promise<{ data?: unknown; error?: string; status?: number; raw?: string }> {
  const tokenResult = await resolveToken(getToken)
  if ('error' in tokenResult) return { error: tokenResult.error }

  const host = deriveNodeHost(nodeId)
  try {
    const { data, status, raw } = await apiFetch(
      `https://${host}/:/auth/siop/session/${sessionId}`,
      { headers: { 'Authorization': `Bearer ${tokenResult.token}` } }
    )
    if (status >= 200 && status < 300) return { data }
    return { error: `HTTP ${status}`, status, raw }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function pollQueueItem(
  ceUrl: string,
  itemId: string,
): Promise<{ item?: QueueItem; error?: string; status?: number; raw?: string }> {
  const url = `${ceUrl}/queue/${itemId}/status`
  try {
    const { data, status, raw } = await apiFetch(url)
    if (status >= 200 && status < 300) return { item: data as QueueItem }
    return { error: `HTTP ${status}`, status, raw }
  } catch (e) {
    return { error: String(e) }
  }
}
