import { Config, CreateRequestResponse, ConsentResponse, QueueItem } from '../types'

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

export async function createVpRequest(
  config: Config,
  dcqlQuery: object
): Promise<{ result?: CreateRequestResponse; error?: string; status?: number; raw?: string }> {
  const url = `https://${config.myNodeHost}/:/auth/siop/request`
  try {
    const { data, status, raw } = await apiFetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.myApiKey}`,
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

export async function sendToWallet(
  config: Config,
  rawLink: string
): Promise<{ result?: ConsentResponse; error?: string; status?: number; raw?: string }> {
  const url = `${config.targetCeUrl}/consent/request`
  try {
    const { data, status, raw } = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: config.targetWalletDid, rawLink }),
    })

    if (status >= 200 && status < 300) {
      return { result: data as ConsentResponse }
    }
    return { error: `HTTP ${status}`, status, raw }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function fetchVpResponse(
  config: Config,
  sessionId: string
): Promise<{ data?: unknown; error?: string; status?: number; raw?: string }> {
  const url = `https://${config.myNodeHost}/:/auth/siop/request/${sessionId}/response`
  try {
    const { data, status, raw } = await apiFetch(url, {
      headers: { 'Authorization': `Bearer ${config.myApiKey}` },
    })
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
