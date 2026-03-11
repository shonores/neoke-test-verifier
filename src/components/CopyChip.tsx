import { useState } from 'react'

interface Props {
  value: string
  label?: string
}

export function CopyChip({ value, label }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-start gap-2 bg-slate-800 border border-slate-700 rounded-lg p-3">
      {label && <span className="text-slate-400 text-xs shrink-0 mt-0.5">{label}</span>}
      <span className="text-cyan-400 text-xs font-mono break-all flex-1">{value}</span>
      <button
        onClick={copy}
        className="shrink-0 text-xs px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}
