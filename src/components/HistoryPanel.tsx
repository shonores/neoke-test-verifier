import { HistoryEntry } from '../types'

interface Props {
  history: HistoryEntry[]
  onClear: () => void
  onRestore: (entry: HistoryEntry) => void
}

const OUTCOME_STYLES: Record<string, string> = {
  auto_executed: 'bg-green-900/50 text-green-400',
  queued: 'bg-amber-900/50 text-amber-400',
  rejected: 'bg-red-900/50 text-red-400',
}

export function HistoryPanel({ history, onClear, onRestore }: Props) {
  if (history.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">History (last 10)</h3>
        <button
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {history.map(entry => (
          <button
            key={entry.id}
            onClick={() => onRestore(entry)}
            className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-lg text-left hover:border-slate-500 transition-colors group"
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {entry.outcome && (
                  <span className={`text-xs px-2 py-0.5 rounded font-mono ${OUTCOME_STYLES[entry.outcome] ?? 'bg-slate-700 text-slate-300'}`}>
                    {entry.outcome}
                  </span>
                )}
                <span className="text-slate-500 text-xs font-mono">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              <span className="text-slate-300 text-xs font-mono truncate">{entry.targetDid}</span>
              {entry.sessionId && (
                <span className="text-slate-500 text-xs font-mono">Session: {entry.sessionId}</span>
              )}
            </div>
            <span className="text-slate-600 group-hover:text-slate-400 text-xs shrink-0">Restore →</span>
          </button>
        ))}
      </div>
    </div>
  )
}
