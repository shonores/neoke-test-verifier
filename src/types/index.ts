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
  outcome: 'auto_executed' | 'queued' | 'rejected'
  ruleLabel?: string
  reason?: string
  queuedItem?: {
    id: string
    issuer?: string
    credentialTypes?: string[]
    requestedClaims?: string[]
    status?: string
  }
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
