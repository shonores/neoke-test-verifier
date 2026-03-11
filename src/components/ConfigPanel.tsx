import { useState } from 'react'
import { Config } from '../types'
import { deriveNodeHost, deriveMyDid } from '../hooks/useAuth'

interface Props {
  config: Config
  onSave: (c: Config) => void
}

export function ConfigPanel({ config, onSave }: Props) {
  const [open, setOpen] = useState(!config.nodeId)
  const [draft, setDraft] = useState<Config>(config)

  const nodeHost = config.nodeId ? deriveNodeHost(config.nodeId) : '—'
  const myDid = config.nodeId ? deriveMyDid(config.nodeId) : '—'

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
          {config.nodeId ? (
            <span className="text-slate-500 text-xs font-mono">{nodeHost}</span>
          ) : (
            <span className="text-amber-500 text-xs">No node configured</span>
          )}
        </div>
        <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="p-5 bg-slate-900 border-t border-slate-700 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Node ID</label>
            <input
              type="text"
              value={draft.nodeId}
              onChange={e => setDraft(d => ({ ...d, nodeId: e.target.value.trim() }))}
              placeholder="e.g. sebastian"
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-600 placeholder:text-slate-600"
            />
            {draft.nodeId && (
              <div className="flex flex-col gap-0.5 mt-1">
                <p className="text-xs text-slate-500 font-mono">Host → <span className="text-slate-400">{deriveNodeHost(draft.nodeId)}</span></p>
                <p className="text-xs text-slate-500 font-mono">DID &nbsp;→ <span className="text-slate-400">{deriveMyDid(draft.nodeId)}</span></p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">API Key <span className="text-slate-600">(dk_... format)</span></label>
            <input
              type="password"
              value={draft.apiKey}
              onChange={e => setDraft(d => ({ ...d, apiKey: e.target.value.trim() }))}
              placeholder="dk_..."
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-600 placeholder:text-slate-600"
            />
            <p className="text-xs text-slate-600">Exchanged for a Bearer token via /:/auth/authn — cached for ~1 hour.</p>
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

      {!open && config.nodeId && (
        <div className="px-5 py-2 bg-slate-900 border-t border-slate-800 flex gap-4 text-xs font-mono text-slate-600">
          <span>DID: <span className="text-slate-500">{myDid}</span></span>
          <span className="text-slate-700">·</span>
          <span>{config.apiKey ? '🔑 key saved' : <span className="text-amber-600">no key</span>}</span>
        </div>
      )}
    </div>
  )
}
