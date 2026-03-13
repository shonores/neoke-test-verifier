import { useState } from 'react'

interface Props {
  onReady: (rawLink: string, targetEmail: string) => void
}

export function ExistingLinkTab({ onReady }: Props) {
  const [link, setLink] = useState('')
  const [targetEmail, setTargetEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    setError(null)
    const trimmed = link.trim()
    if (!trimmed) {
      setError('Please paste a verification link.')
      return
    }
    if (!targetEmail.trim()) {
      setError('Target Wallet Email is required.')
      return
    }
    onReady(trimmed, targetEmail.trim())
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Target Wallet Email</label>
        <input
          type="email"
          value={targetEmail}
          onChange={e => setTargetEmail(e.target.value)}
          placeholder="user@example.com"
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-600 placeholder:text-slate-600"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400">
          Verification Link (openid4vp:// or https://…/request)
        </label>
        <textarea
          value={link}
          onChange={e => setLink(e.target.value)}
          rows={4}
          placeholder="openid4vp://... or https://<node>.id-node.neoke.com/:/auth/siop/verification-link/…/request"
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-cyan-400 font-mono focus:outline-none focus:border-cyan-600 resize-y"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
      >
        Use This Link →
      </button>
    </div>
  )
}
