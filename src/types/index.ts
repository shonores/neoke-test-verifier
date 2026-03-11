export interface Config {
  nodeId: string
  apiKey: string
}

export type GetToken = () => Promise<{ token: string } | { error: string }>

export interface CreateRequestResponse {
  sessionId: string
  requestUri: string
  rawLink?: string
}

export interface ConsentResponse {
  // Real CE uses "action"; "outcome" kept for any older responses
  action?: string
  outcome?: string
  ruleLabel?: string
  reason?: string
  result?: {
    status?: string
    redirectUri?: string
  }
  queuedItem?: {
    id: string
    issuer?: string
    credentialTypes?: string[]
    requestedClaims?: string[]
    status?: string
  }
  [key: string]: unknown
}

export function ceOutcome(r: ConsentResponse): string {
  return r.action ?? r.outcome ?? ''
}

export interface QueueItem {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  issuer?: string
  credentialTypes?: string[]
  requestedClaims?: string[]
  [key: string]: unknown
}

export interface HistoryEntry {
  id: string
  timestamp: string
  targetDid: string
  sessionId?: string
  rawLink?: string
  outcome?: string
  credentialData?: unknown
}

export type Tab = 'create' | 'existing'
