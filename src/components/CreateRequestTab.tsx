import { useState, useEffect } from 'react'
import { Config, VerifyResponse } from '../types'
import { verify, listCredentialTypes } from '../api'
import { JsonPanel } from './JsonPanel'

const FALLBACK_TYPES = [
  { id: 'mdoc-photoid-full', label: 'mDOC Photo ID — Full Profile' },
  { id: 'mdoc-photoid-minimal', label: 'mDOC Photo ID — Minimal (name + DOB)' },
  { id: 'sdjwt-epassport-copy', label: 'ePassport Copy (SD-JWT)' },
  { id: 'mdoc-age-over-18', label: 'mDOC Photo ID — Age Over 18 Only' },
]

const ACTION_STYLES: Record<string, string> = {
  auto_executed: 'bg-green-900/60 text-green-300 border-green-700',
  approved: 'bg-green-900/60 text-green-300 border-green-700',
  rejected: 'bg-red-900/60 text-red-300 border-red-700',
  timeout: 'bg-amber-900/60 text-amber-300 border-amber-700',
  error: 'bg-red-900/60 text-red-300 border-red-700',
}

interface Props {
  config: Config
  onComplete: (email: string, credentialType: string, result: VerifyResponse) => void
}

export function CreateRequestTab({ config, onComplete }: Props) {
  const [credentialTypes, setCredentialTypes] = useState<{ id: string; label: string }[]>(FALLBACK_TYPES)
  const [credentialType, setCredentialType] = useState(FALLBACK_TYPES[0].id)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [waitingMsg, setWaitingMsg] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<VerifyResponse | null>(null)

  // Fetch credential types from CE on mount and when CE URL changes
  useEffect(() => {
    if (!config.ceUrl) return
    listCredentialTypes(config.ceUrl).then(types => {
      if (types.length > 0) {
        setCredentialTypes(types)
        setCredentialType(types[0].id)
      }
    })
  }, [config.ceUrl])

  const handleVerify = async () => {
    setError(null)
    setResult(null)
    setWaitingMsg(false)

    if (!email.trim() || !email.includes('@')) {
      setError('A valid email address is required.')
      return
    }
    if (!config.ceApiKey) {
      setError('CE API Key is required. Open Configuration above.')
      return
    }

    setLoading(true)

    // Show "waiting" message after 3 seconds
    const waitTimer = setTimeout(() => setWaitingMsg(true), 3000)

    const { result: res, error: err, raw } = await verify(
      config.ceUrl,
      config.ceApiKey,
      email.trim(),
      credentialType
    )

    clearTimeout(waitTimer)
    setLoading(false)
    setWaitingMsg(false)

    if (err) {
      setError(`${err}${raw ? `\n${raw}` : ''}`)
      return
    }

    if (res) {
      setResult(res)
      onComplete(email.trim(), credentialType, res)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Target email */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Target Wallet Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-600 placeholder:text-slate-600"
        />
      </div>

      {/* Credential type dropdown */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Credential Type</label>
        <select
          value={credentialType}
          onChange={e => setCredentialType(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-600"
        >
          {credentialTypes.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <pre className="text-red-400 text-xs bg-red-950 border border-red-800 rounded p-3 whitespace-pre-wrap">{error}</pre>
      )}

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? 'Verifying...' : 'Verify'}
      </button>

      {/* Loading status */}
      {loading && waitingMsg && (
        <p className="text-amber-400 text-xs text-center animate-pulse">
          Waiting for wallet approval... (this can take up to 60 s)
        </p>
      )}

      {/* Result */}
      {result && (
        <div className={`border rounded-lg p-4 flex flex-col gap-3 ${ACTION_STYLES[result.action] ?? 'bg-slate-800 text-slate-200 border-slate-600'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wide">{result.action}</span>
            {result.requestId && (
              <span className="text-xs font-mono opacity-60 truncate">id: {result.requestId}</span>
            )}
          </div>
          {result.reason && (
            <p className="text-xs opacity-80">Reason: {result.reason}</p>
          )}
          {result.nodeId && (
            <p className="text-xs opacity-60 font-mono">Node: {result.nodeId}</p>
          )}
        </div>
      )}

      {/* Claims JSON */}
      {result?.claims !== undefined && (
        <JsonPanel label="Claims" data={result.claims} defaultOpen />
      )}
    </div>
  )
}
