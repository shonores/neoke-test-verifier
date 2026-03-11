import { useState } from 'react'

interface Props {
  label: string
  data: unknown
  defaultOpen?: boolean
}

export function JsonPanel({ label, data, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-750 transition-colors"
      >
        <span>{label}</span>
        <span className="text-slate-500">{open ? '▲ hide' : '▼ show'}</span>
      </button>
      {open && (
        <pre className="json-panel rounded-none border-0 text-green-400">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
