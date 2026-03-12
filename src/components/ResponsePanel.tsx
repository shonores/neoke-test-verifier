import { useState, useEffect } from 'react'
import { ConsentResponse, GetToken, ceOutcome } from '../types'
import { fetchSessionResult } from '../api'
import { JsonPanel } from './JsonPanel'
import { PollingPanel } from './PollingPanel'
import { CredentialClaimsPanel } from './CredentialClaimsPanel'

interface Props {
  nodeId: string
  apiKey: string
  getToken: GetToken
  sessionId?: string
  response: ConsentResponse
  ceUrl: string
  ceAdminKey: string
  onCredentialData: (data: unknown) => void
}

export function ResponsePanel({ nodeId, apiKey, getToken, sessionId, response, ceUrl, ceAdminKey, onCredentialData }: Props) {
  const [credData, setCredData] = useState<unknown>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rejectedReason, setRejectedReason] = useState<string | null>(null)

  const outcome = ceOutcome(response)

  const received = (data: unknown) => {
    setLoading(false)
    setCredData(data)
    onCredentialData(data)
  }

  // Fetch session result directly from node on mount
  useEffect(() => {
    if (outcome !== 'auto_executed' || !sessionId) return
    setLoading(true)
    fetchSessionResult(nodeId, apiKey, sessionId).then(({ data, error, raw }) => {
      if (error) {
        setLoading(false)
        setFetchError(`${error}${raw ? `\n${raw}` : ''}`)
        return
      }
      received(data)
    })
  }, [])

  if (outcome === 'auto_executed') {
    return (
      <div className="flex flex-col gap-4 border border-green-800 rounded-xl p-5 bg-green-950/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-green-300 font-semibold text-sm">Auto-Executed</p>
            {response.ruleLabel && (
              <p className="text-slate-400 text-xs">Rule matched: <span className="text-slate-200">{response.ruleLabel}</span></p>
            )}
            {response.result?.status && (
              <p className="text-slate-400 text-xs">Status: <span className="text-slate-200">{response.result.status}</span></p>
            )}
          </div>
        </div>

        {loading && (
          <p className="text-slate-400 text-xs flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Fetching credential data…
          </p>
        )}

        {fetchError && (
          <pre className="text-red-400 text-xs bg-red-950 border border-red-800 rounded p-3 whitespace-pre-wrap">{fetchError}</pre>
        )}

        {credData != null && (
          <div className="flex flex-col gap-2">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Disclosed Claims</p>
            <CredentialClaimsPanel data={credData} />
            <JsonPanel label="Disclosed Claims (raw)" data={credData} />
          </div>
        )}

        <JsonPanel label="CE Response" data={response} />
      </div>
    )
  }

  if (outcome === 'queued') {
    if (rejectedReason) {
      return (
        <div className="flex flex-col gap-3 border border-red-800 rounded-xl p-5 bg-red-950/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="text-red-300 font-semibold text-sm">Request Ended</p>
              <p className="text-slate-400 text-xs">{rejectedReason}</p>
            </div>
          </div>
        </div>
      )
    }

    if (credData != null) {
      return (
        <div className="flex flex-col gap-4 border border-green-800 rounded-xl p-5 bg-green-950/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="text-green-300 font-semibold text-sm">Approved — Credential Received</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Disclosed Claims</p>
            <CredentialClaimsPanel data={credData} />
            <JsonPanel label="Disclosed Claims (raw)" data={credData} />
          </div>
        </div>
      )
    }

    return (
      <PollingPanel
        nodeId={nodeId}
        apiKey={apiKey}
        ceUrl={ceUrl}
        queueItemId={response.queuedItem!.id}
        sessionId={sessionId}
        queuePreview={response.queuedItem}
        onResolved={data => { setCredData(data); onCredentialData(data) }}
        onRejected={reason => setRejectedReason(reason)}
      />
    )
  }

  if (outcome === 'rejected') {
    const reasonExplainer: Record<string, string> = {
      no_matched_credentials: "The wallet doesn't hold the requested credential type.",
      node_respond_failed: 'The node encountered an error when responding.',
    }

    return (
      <div className="flex flex-col gap-3 border border-red-800 rounded-xl p-5 bg-red-950/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="text-red-300 font-semibold text-sm">Rejected</p>
            {response.reason && (
              <>
                <p className="text-slate-400 text-xs font-mono">{response.reason}</p>
                {reasonExplainer[response.reason] && (
                  <p className="text-slate-400 text-xs mt-1">{reasonExplainer[response.reason]}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 border border-slate-700 rounded-xl p-5 bg-slate-900">
      <p className="text-slate-400 text-xs">
        Unrecognised CE action: <span className="text-slate-200 font-mono">{outcome || '(none)'}</span>
      </p>
      <JsonPanel label="CE Response (raw)" data={response} />
    </div>
  )
}
