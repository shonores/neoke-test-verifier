import { useState } from 'react'
import { GetToken } from '../types'
import { DCQL_PRESETS } from '../presets/dcql'
import { createVpRequest } from '../api'
import { JsonPanel } from './JsonPanel'

const DEFAULT_CE_URL = 'https://neoke-consent-engine.fly.dev'

interface Props {
  nodeId: string
  getToken: GetToken
  onCreated: (sessionId: string, rawLink: string, targetWalletDid: string, ceUrl: string, ceAdminKey: string) => void
}

export function CreateRequestTab({ nodeId, getToken, onCreated }: Props) {
  const [presetId, setPresetId] = useState(DCQL_PRESETS[0].id)
  const [customJson, setCustomJson] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [targetWalletDid, setTargetWalletDid] = useState('')
  const [showCeSettings, setShowCeSettings] = useState(false)
  const [ceUrl, setCeUrl] = useState(DEFAULT_CE_URL)
  const [ceAdminKey, setCeAdminKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<unknown>(null)

  const selectedPreset = DCQL_PRESETS.find(p => p.id === presetId)!

  const getDcqlQuery = (): object | null => {
    if (showCustom && customJson.trim()) {
      try {
        return JSON.parse(customJson)
      } catch {
        setError('Invalid JSON in custom DCQL field')
        return null
      }
    }
    return selectedPreset.query
  }

  const handleCreate = async () => {
    setError(null)
    const query = getDcqlQuery()
    if (!query) return

    if (!nodeId) {
      setError('Node ID is required. Open Configuration above.')
      return
    }
    if (!targetWalletDid.trim()) {
      setError('Target Wallet DID is required.')
      return
    }

    setLoading(true)
    const { result, error: err, raw } = await createVpRequest(nodeId, getToken, query)
    setLoading(false)

    if (err) {
      setError(`${err}${raw ? `\n${raw}` : ''}`)
      return
    }

    if (result) {
      setRawResponse(result)
      onCreated(result.sessionId, result.rawLink || result.requestUri, targetWalletDid.trim(), ceUrl, ceAdminKey)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Target wallet DID */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Target Wallet DID</label>
        <input
          type="text"
          value={targetWalletDid}
          onChange={e => setTargetWalletDid(e.target.value)}
          placeholder="did:web:someone.id-node.neoke.com"
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-600 placeholder:text-slate-600"
        />
      </div>

      {/* Credential preset */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400">Credential Type</label>
        <select
          value={presetId}
          onChange={e => setPresetId(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-600"
        >
          {DCQL_PRESETS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Custom DCQL */}
      <button
        onClick={() => setShowCustom(o => !o)}
        className="text-xs text-slate-500 hover:text-slate-400 text-left flex items-center gap-2"
      >
        <span>{showCustom ? '▼' : '▶'}</span>
        <span>Custom DCQL JSON {showCustom ? '(overrides preset)' : ''}</span>
      </button>

      {showCustom ? (
        <textarea
          value={customJson}
          onChange={e => setCustomJson(e.target.value)}
          placeholder={JSON.stringify(selectedPreset.query, null, 2)}
          rows={12}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-green-400 font-mono focus:outline-none focus:border-cyan-600 resize-y"
        />
      ) : (
        <JsonPanel label="DCQL Query Preview" data={selectedPreset.query} />
      )}

      {/* CE settings (collapsed) */}
      <button
        onClick={() => setShowCeSettings(o => !o)}
        className="text-xs text-slate-600 hover:text-slate-500 text-left flex items-center gap-2"
      >
        <span>{showCeSettings ? '▼' : '▶'}</span>
        <span>Consent Engine settings</span>
        {!showCeSettings && <span className="text-slate-700 font-mono">{ceUrl}</span>}
      </button>

      {showCeSettings && (
        <div className="flex flex-col gap-3 border border-slate-800 rounded-lg p-4 bg-slate-950">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">CE URL</label>
            <input
              type="text"
              value={ceUrl}
              onChange={e => setCeUrl(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-600"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">CE Admin Key <span className="text-slate-700">(for queue polling)</span></label>
            <input
              type="password"
              value={ceAdminKey}
              onChange={e => setCeAdminKey(e.target.value)}
              placeholder="optional"
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-600 placeholder:text-slate-700"
            />
          </div>
        </div>
      )}

      {error && (
        <pre className="text-red-400 text-xs bg-red-950 border border-red-800 rounded p-3 whitespace-pre-wrap">{error}</pre>
      )}

      <button
        onClick={handleCreate}
        disabled={loading}
        className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? 'Authenticating & Creating Request...' : 'Create VP Request'}
      </button>

      {rawResponse != null && <JsonPanel label="Raw Create Response" data={rawResponse} defaultOpen />}
    </div>
  )
}
