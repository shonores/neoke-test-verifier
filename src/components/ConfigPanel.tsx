import { useState } from 'react'
import { Config } from '../types'

interface Props {
  config: Config
  onSave: (c: Config) => void
}

export function ConfigPanel({ config, onSave }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Config>(config)

  const field = (key: keyof Config, label: string, placeholder?: string, type = 'text') => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">{label}</label>
      <input
        type={type}
        value={draft[key]}
        onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
        placeholder={placeholder}
        className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-600 placeholder:text-slate-600"
      />
    </div>
  )

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
          <span className="text-slate-500 text-xs font-mono">{config.myNodeHost}</span>
        </div>
        <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="p-5 bg-slate-900 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('myNodeId', 'My Node ID', 'sebastian')}
          {field('myNodeHost', 'My Node Host', 'b2b-poc.id-node.neoke.com')}
          {field('myApiKey', 'My API Key (Bearer)', '...', 'password')}
          {field('targetWalletDid', 'Target Wallet DID', 'did:web:...')}
          {field('targetCeUrl', 'Target CE URL', 'https://neoke-consent-engine.fly.dev')}
          {field('ceAdminKey', 'CE Admin Key (for queue polling)', '...', 'password')}

          <div className="md:col-span-2 flex gap-3 pt-2">
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
    </div>
  )
}
