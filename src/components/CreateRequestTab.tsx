import { useState } from 'react'
import { Config } from '../types'
import { DCQL_PRESETS } from '../presets/dcql'
import { createVpRequest } from '../api'
import { JsonPanel } from './JsonPanel'

interface Props {
  config: Config
  onCreated: (sessionId: string, rawLink: string, requestData: object) => void
}

export function CreateRequestTab({ config, onCreated }: Props) {
  const [presetId, setPresetId] = useState(DCQL_PRESETS[0].id)
  const [customJson, setCustomJson] = useState('')
  const [showCustom, setShowCustom] = useState(false)
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

    if (!config.myNodeHost || !config.myApiKey) {
      setError('My Node Host and API Key are required. Open Configuration above.')
      return
    }

    setLoading(true)
    const { result, error: err, raw } = await createVpRequest(config, query)
    setLoading(false)

    if (err) {
      setError(`${err}${raw ? `\n${raw}` : ''}`)
      return
    }

    if (result) {
      setRawResponse(result)
      onCreated(result.sessionId, result.rawLink || result.requestUri, query)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400">Credential Type Preset</label>
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

      <button
        onClick={() => setShowCustom(o => !o)}
        className="text-xs text-slate-400 hover:text-slate-300 text-left flex items-center gap-2"
      >
        <span>{showCustom ? '▼' : '▶'}</span>
        <span>Custom DCQL JSON {showCustom ? '(overrides preset)' : ''}</span>
      </button>

      {showCustom && (
        <textarea
          value={customJson}
          onChange={e => setCustomJson(e.target.value)}
          placeholder={JSON.stringify(selectedPreset.query, null, 2)}
          rows={12}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-green-400 font-mono focus:outline-none focus:border-cyan-600 resize-y"
        />
      )}

      {!showCustom && (
        <JsonPanel label="DCQL Query Preview" data={selectedPreset.query} />
      )}

      {error && (
        <pre className="text-red-400 text-xs bg-red-950 border border-red-800 rounded p-3 whitespace-pre-wrap">{error}</pre>
      )}

      <button
        onClick={handleCreate}
        disabled={loading}
        className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? 'Creating Request...' : 'Create VP Request'}
      </button>

      {rawResponse != null && <JsonPanel label="Raw Create Response" data={rawResponse} defaultOpen />}
    </div>
  )
}
