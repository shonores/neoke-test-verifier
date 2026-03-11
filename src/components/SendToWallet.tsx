import { useState } from 'react'
import { ConsentResponse } from '../types'
import { sendToWallet } from '../api'
import { CopyChip } from './CopyChip'
import { JsonPanel } from './JsonPanel'

interface Props {
  ceUrl: string
  targetWalletDid: string
  rawLink: string
  sessionId?: string
  onResponse: (response: ConsentResponse) => void
}

export function SendToWallet({ ceUrl, targetWalletDid, rawLink, sessionId, onResponse }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawRes, setRawRes] = useState<unknown>(null)
  const [showRawLink, setShowRawLink] = useState(false)

  const handleSend = async () => {
    setError(null)
    setRawRes(null)
    setLoading(true)
    const { result, error: err, raw } = await sendToWallet(ceUrl, targetWalletDid, rawLink)
    setLoading(false)

    if (err) {
      setError(`${err}${raw ? `\n${raw}` : ''}`)
      return
    }

    if (result) {
      setRawRes(result)
      onResponse(result)
    }
  }

  return (
    <div className="flex flex-col gap-4 border border-slate-700 rounded-xl p-5 bg-slate-900">
      <h3 className="text-slate-200 text-sm font-semibold">Send to Wallet</h3>

      <div className="flex flex-col gap-1 text-xs text-slate-400 font-mono">
        <div className="flex gap-2">
          <span className="text-slate-500 w-24 shrink-0">Sending to:</span>
          <span className="text-slate-300">{targetWalletDid}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-500 w-24 shrink-0">Via CE:</span>
          <span className="text-slate-300">{ceUrl}/consent/request</span>
        </div>
        {sessionId && (
          <div className="flex gap-2">
            <span className="text-slate-500 w-24 shrink-0">Session ID:</span>
            <span className="text-cyan-400">{sessionId}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowRawLink(o => !o)}
        className="text-xs text-slate-500 hover:text-slate-400 text-left flex items-center gap-2"
      >
        <span>{showRawLink ? '▼' : '▶'}</span>
        <span>Raw Link</span>
      </button>
      {showRawLink && <CopyChip value={rawLink} />}

      {error && (
        <pre className="text-red-400 text-xs bg-red-950 border border-red-800 rounded p-3 whitespace-pre-wrap">{error}</pre>
      )}

      <button
        onClick={handleSend}
        disabled={loading}
        className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? 'Sending...' : 'Send to Wallet via CE'}
      </button>

      {rawRes != null && <JsonPanel label="CE Response" data={rawRes} />}
    </div>
  )
}
