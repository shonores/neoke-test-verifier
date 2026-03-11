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
  dcqlQuery: object
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
      body: JSON.stringify({ dcqlQuery }),
    })
    if (status >= 200 && status < 300) {
      const d = data as Record<string, unknown>
      return {
        result: {
          sessionId: (d.sessionId ?? d.id ?? d.session_id ?? '') as string,
          requestUri: (d.requestUri ?? d.request_uri ?? d.rawLink ?? '') as string,
          rawLink: (d.rawLink ?? d.requestUri ?? d.request_uri ?? '') as string,
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
  apiKey: string,
  sessionId: string
): Promise<{ data?: unknown; error?: string; status?: number; raw?: string }> {
  const host = deriveNodeHost(nodeId)
  const headers = { 'Authorization': `ApiKey ${apiKey}` }

  // Try /session/ endpoint first
  try {
    const { data, status, raw } = await apiFetch(
      `https://${host}/:/auth/siop/session/${sessionId}`,
      { headers }
    )
    if (status !== 404) {
      if (status >= 200 && status < 300) return { data }
      return { error: `HTTP ${status}`, status, raw }
    }
  } catch (e) {
    return { error: String(e) }
  }

  // Fall back to /request/{id}/response
  try {
    const { data, status, raw } = await apiFetch(
      `https://${host}/:/auth/siop/request/${sessionId}/response`,
      { headers }
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
  ceAdminKey: string
): Promise<{ item?: QueueItem; error?: string; status?: number; raw?: string }> {
  const url = `${ceUrl}/queue/${itemId}`
  try {
    const headers: Record<string, string> = {}
    if (ceAdminKey) headers['Authorization'] = `Bearer ${ceAdminKey}`
    const { data, status, raw } = await apiFetch(url, { headers })
    if (status >= 200 && status < 300) return { item: data as QueueItem }
    return { error: `HTTP ${status}`, status, raw }
  } catch (e) {
    return { error: String(e) }
  }
}
