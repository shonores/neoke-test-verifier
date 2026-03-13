import { useState } from 'react'
import { Config } from '../types'

interface Props {
  config: Config
  onSave: (c: Config) => void
}

export function ConfigPanel({ config, onSave }: Props) {
  const [open, setOpen] = useState(!config.ceApiKey)
  const [draft, setDraft] = useState<Config>(config)

  const handleSave = () => {
    onSave(draft)
    setOpen(false)
  }

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-800 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">⚙</span>
          <span className="text-slate-200 text-sm font-semibold">Configuration</span>
          {config.ceApiKey ? (
            <span className="text-slate-500 text-xs font-mono">{config.ceUrl}</span>
          ) : (
            <span className="text-amber-500 text-xs">No API key configured</span>
          )}
        </div>
        <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="p-5 bg-slate-900 border-t border-slate-700 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Consent Engine URL</label>
            <input
              type="text"
              value={draft.ceUrl}
              onChange={e => setDraft(d => ({ ...d, ceUrl: e.target.value.trim() }))}
              placeholder="https://neoke-consent-engine.fly.dev"
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-600 placeholder:text-slate-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">CE API Key</label>
            <input
              type="password"
              value={draft.ceApiKey}
              onChange={e => setDraft(d => ({ ...d, ceApiKey: e.target.value.trim() }))}
              placeholder="ApiKey..."
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-600 placeholder:text-slate-600"
            />
            <p className="text-xs text-slate-600">Sent as Authorization: ApiKey header to the Consent Engine.</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setDraft(config); setOpen(false) }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!open && config.ceApiKey && (
        <div className="px-5 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-3 text-xs font-mono text-slate-600">
          <span className="text-slate-500 shrink-0">CE:</span>
          <span className="text-slate-400 truncate">{config.ceUrl}</span>
          <span className="text-slate-700">·</span>
          <span className="shrink-0 text-green-600">key saved</span>
        </div>
      )}
    </div>
  )
}
