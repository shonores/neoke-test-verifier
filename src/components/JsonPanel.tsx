import { useState } from 'react'

interface Props {
  label: string
  data: unknown
  defaultOpen?: boolean
}

function highlight(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return `<span style="color:#e2e8f0">${match}</span>`
          return `<span style="color:#4ade80">${match}</span>`
        }
        if (/true|false/.test(match)) return `<span style="color:#fbbf24">${match}</span>`
        if (/null/.test(match)) return `<span style="color:#64748b">${match}</span>`
        return `<span style="color:#22d3ee">${match}</span>`
      }
    )
}

export function JsonPanel({ label, data, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const json = JSON.stringify(data, null, 2)

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
        <pre
          className="json-panel rounded-none border-0"
          style={{ color: '#94a3b8' }}
          dangerouslySetInnerHTML={{ __html: highlight(json) }}
        />
      )}
    </div>
  )
}
