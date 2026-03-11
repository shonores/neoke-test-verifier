export interface Config {
  myNodeId: string
  myNodeHost: string
  myApiKey: string
  targetWalletDid: string
  targetCeUrl: string
  ceAdminKey: string
}

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
export type FlowStep = 'idle' | 'created' | 'sent' | 'polling' | 'done' | 'error'
