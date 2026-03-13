export interface Config {
  ceUrl: string
  ceApiKey: string
}

export interface VerifyResponse {
  action: 'auto_executed' | 'approved' | 'rejected' | 'timeout' | 'error'
  claims?: unknown
  reason?: string
  requestId?: string
  nodeId?: string
}

export interface HistoryEntry {
  id: string
  timestamp: string
  targetEmail: string
  credentialType: string
  action?: string
  requestId?: string
  claims?: unknown
}

export type Tab = 'create'
