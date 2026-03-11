import { Config, ConsentResponse } from '../types'
import { fetchVpResponse } from '../api'
import { useState } from 'react'
import { JsonPanel } from './JsonPanel'
import { PollingPanel } from './PollingPanel'

interface Props {
  config: Config
  sessionId?: string
  response: ConsentResponse
  onCredentialData: (data: unknown) => void
}

export function ResponsePanel({ config, sessionId, response, onCredentialData }: Props) {
  const [credData, setCredData] = useState<unknown>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rejectedReason, setRejectedReason] = useState<string | null>(null)

  const fetchCred = async () => {
    if (!sessionId) return
    setLoading(true)
    setFetchError(null)
    const { data, error, raw } = await fetchVpResponse(config, sessionId)
    setLoading(false)
    if (error) {
      setFetchError(`${error}${raw ? `\n${raw}` : ''}`)
      return
    }
    setCredData(data)
    onCredentialData(data)
  }

  if (response.outcome === 'auto_executed') {
    return (
      <div className="flex flex-col gap-4 border border-green-800 rounded-xl p-5 bg-green-950/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-green-300 font-semibold text-sm">Auto-Executed</p>
            {response.ruleLabel && (
              <p className="text-slate-400 text-xs">Rule matched: <span className="text-slate-200">{response.ruleLabel}</span></p>
            )}
          </div>
        </div>

        {credData == null && sessionId && (
          <button
            onClick={fetchCred}
            disabled={loading}
            className="px-4 py-2 bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white rounded text-sm transition-colors"
          >
            {loading ? 'Fetching credential data...' : 'Fetch VP Response from Node'}
          </button>
        )}

        {fetchError && (
          <pre className="text-red-400 text-xs bg-red-950 border border-red-800 rounded p-3 whitespace-pre-wrap">{fetchError}</pre>
        )}

        {credData != null && (
          <JsonPanel label="VP Response / Credential Claims" data={credData} defaultOpen />
        )}
      </div>
    )
  }

  if (response.outcome === 'queued') {
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
          <JsonPanel label="VP Response / Credential Claims" data={credData} defaultOpen />
        </div>
      )
    }

    return (
      <PollingPanel
        config={config}
        queueItemId={response.queuedItem!.id}
        sessionId={sessionId}
        queuePreview={response.queuedItem}
        onResolved={data => { setCredData(data); onCredentialData(data) }}
        onRejected={reason => setRejectedReason(reason)}
      />
    )
  }

  if (response.outcome === 'rejected') {
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
    <JsonPanel label="Unknown CE Response" data={response} defaultOpen />
  )
}
