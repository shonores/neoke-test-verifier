import { useState, useEffect } from 'react'
import { ConsentResponse, GetToken, ceOutcome } from '../types'
import { fetchSessionResult } from '../api'
import { JsonPanel } from './JsonPanel'
import { PollingPanel } from './PollingPanel'

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

  const fetchCred = async () => {
    if (!sessionId) return
    setLoading(true)
    setFetchError(null)
    const { data, error, raw } = await fetchSessionResult(nodeId, apiKey, sessionId)
    setLoading(false)
    if (error) {
      setFetchError(`${error}${raw ? `\n${raw}` : ''}`)
      return
    }
    setCredData(data)
    onCredentialData(data)
  }

  // Auto-fetch session result as soon as auto_executed is received
  useEffect(() => {
    if (outcome === 'auto_executed' && sessionId) {
      fetchCred()
    }
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
            {response.result?.redirectUri && (
              <p className="text-slate-400 text-xs">Redirect: <span className="text-slate-300 font-mono break-all">{response.result.redirectUri}</span></p>
            )}
          </div>
        </div>

        {loading && (
          <p className="text-slate-400 text-xs flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Fetching disclosed claims from node…
          </p>
        )}

        {fetchError && (
          <div className="flex flex-col gap-2">
            <pre className="text-red-400 text-xs bg-red-950 border border-red-800 rounded p-3 whitespace-pre-wrap">{fetchError}</pre>
            <button
              onClick={fetchCred}
              disabled={loading}
              className="self-start px-4 py-2 bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white rounded text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {credData != null && (
          <JsonPanel label="Disclosed Claims" data={credData} />
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
          <JsonPanel label="Disclosed Claims" data={credData} />
        </div>
      )
    }

    return (
      <PollingPanel
        nodeId={nodeId}
        getToken={getToken}
        ceUrl={ceUrl}
        ceAdminKey={ceAdminKey}
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

  // Unknown outcome — show raw CE response for debugging
  return (
    <div className="flex flex-col gap-3 border border-slate-700 rounded-xl p-5 bg-slate-900">
      <p className="text-slate-400 text-xs">
        Unrecognised CE action: <span className="text-slate-200 font-mono">{outcome || '(none)'}</span>
      </p>
      <JsonPanel label="CE Response (raw)" data={response} />
    </div>
  )
}
