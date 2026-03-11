import { useCallback } from 'react'
import { Config, GetToken } from '../types'

export function deriveNodeHost(nodeId: string): string {
  return `${nodeId}.id-node.neoke.com`
}

export function deriveMyDid(nodeId: string): string {
  return `did:web:${nodeId}.id-node.neoke.com`
}

interface CachedToken {
  token: string
  expiresAt: number
  nodeId: string
  apiKey: string
}

// Module-level cache: survives component re-renders, cleared when credentials change
let tokenCache: CachedToken | null = null

export function useAuth(config: Config): { getToken: GetToken; clearToken: () => void } {
  const getToken: GetToken = useCallback(async () => {
    const now = Date.now()
    const BUFFER_MS = 5 * 60 * 1000 // refresh 5 min before expiry

    if (
      tokenCache &&
      tokenCache.nodeId === config.nodeId &&
      tokenCache.apiKey === config.apiKey &&
      now < tokenCache.expiresAt - BUFFER_MS
    ) {
      return { token: tokenCache.token }
    }

    if (!config.nodeId || !config.apiKey) {
      return { error: 'Node ID and API Key are required. Open Configuration above.' }
    }

    const nodeHost = deriveNodeHost(config.nodeId)
    try {
      const res = await fetch(`https://${nodeHost}/:/auth/authn`, {
        method: 'POST',
        headers: { 'Authorization': `ApiKey ${config.apiKey}` },
      })
      const raw = await res.text()
      if (!res.ok) {
        return { error: `Auth failed: HTTP ${res.status} — ${raw}` }
      }
      const data = JSON.parse(raw) as Record<string, unknown>
      const token = (data.token ?? data.access_token ?? data.accessToken ?? data.bearerToken) as string | undefined
      if (!token) {
        return { error: `Auth response missing token field. Got: ${raw}` }
      }
      const expiresIn = ((data.expiresIn ?? data.expires_in ?? 3600) as number)
      tokenCache = { token, expiresAt: now + expiresIn * 1000, nodeId: config.nodeId, apiKey: config.apiKey }
      return { token }
    } catch (e) {
      return { error: String(e) }
    }
  }, [config.nodeId, config.apiKey])

  const clearToken = useCallback(() => {
    tokenCache = null
  }, [])

  return { getToken, clearToken }
}
