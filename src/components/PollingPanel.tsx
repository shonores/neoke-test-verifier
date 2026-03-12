import { useState, useEffect, useRef } from 'react'
import { QueueItem } from '../types'
import { pollQueueItem, fetchSessionResult } from '../api'
import { JsonPanel } from './JsonPanel'

interface Props {
  nodeId: string
  apiKey: string
  ceUrl: string
  queueItemId: string
  sessionId?: string
  queuePreview?: {
    credentialType?: string
    matchedCredentials?: { id: string; type: string[]; issuer: string }[]
    requestedFields?: string[]
    // legacy fallback fields
    issuer?: string
    credentialTypes?: string[]
    requestedClaims?: string[]
  }
  onResolved: (credentialData: unknown) => void
  onRejected: (reason: string) => void
}

const POLL_INTERVAL_MS = 5000
const MAX_ATTEMPTS = 60

export function PollingPanel({ nodeId, apiKey, ceUrl, queueItemId, sessionId, queuePreview, onResolved, onRejected }: Props) {
  const [attempts, setAttempts] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [status, setStatus] = useState('pending')
  const [cancelled, setCancelled] = useState(false)
  const [lastItem, setLastItem] = useState<QueueItem | null>(null)
  const [pollError, setPollError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTime = useRef(Date.now())
  const attemptsRef = useRef(0)

  useEffect(() => {
    if (cancelled) return

    const tick = async () => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000))

      const { item, error } = await pollQueueItem(ceUrl, queueItemId)

      if (error) {
        setPollError(error)
        return
      }

      if (item) {
        setLastItem(item)
        setStatus(item.status)
        attemptsRef.current += 1
        setAttempts(attemptsRef.current)

        if (item.status !== 'pending') {
          clearInterval(intervalRef.current!)
          if (item.status === 'approved') {
            if (sessionId) {
              const { data } = await fetchSessionResult(nodeId, apiKey, sessionId)
              onResolved(data)
            } else {
              onResolved(item)
            }
          } else {
            onRejected(`Queue item ${item.status}`)
          }
          return
        }
      }

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        clearInterval(intervalRef.current!)
        onRejected('Polling timed out after 5 minutes')
      }
    }

    intervalRef.current = setInterval(tick, POLL_INTERVAL_MS)
    tick()

    return () => clearInterval(intervalRef.current!)
  }, [cancelled])

  const cancel = () => {
    clearInterval(intervalRef.current!)
    setCancelled(true)
    onRejected('Cancelled by user')
  }

  return (
    <div className="flex flex-col gap-4 border border-amber-800 rounded-xl p-5 bg-amber-950/20">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⏳</span>
        <div>
          <p className="text-amber-300 font-semibold text-sm">Queued — Waiting for Wallet Holder Approval</p>
          <p className="text-slate-400 text-xs font-mono">Queue ID: {queueItemId}</p>
        </div>
      </div>

      {queuePreview && (
        <div className="text-xs text-slate-400 space-y-1">
          {(queuePreview.credentialType ?? queuePreview.credentialTypes?.[0]) && (
            <div><span className="text-slate-500">Type:</span> {queuePreview.credentialType ?? queuePreview.credentialTypes![0]}</div>
          )}
          {queuePreview.matchedCredentials?.length ? (
            queuePreview.matchedCredentials.map(c => (
              <div key={c.id}><span className="text-slate-500">Issuer:</span> {c.issuer}</div>
            ))
          ) : queuePreview.issuer ? (
            <div><span className="text-slate-500">Issuer:</span> {queuePreview.issuer}</div>
          ) : null}
          {(queuePreview.requestedFields ?? queuePreview.requestedClaims)?.length && (
            <div><span className="text-slate-500">Claims:</span> {(queuePreview.requestedFields ?? queuePreview.requestedClaims)!.join(', ')}</div>
          )}
        </div>
      )}

      <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
        <div>Elapsed: <span className="text-slate-200">{elapsed}s</span></div>
        <div>Attempts: <span className="text-slate-200">{attempts}</span></div>
        <div>Status: <span className={status === 'pending' ? 'text-amber-400' : 'text-slate-200'}>{status}</span></div>
      </div>

      {!cancelled && (
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-slate-400">Polling every 5s…</span>
          <button
            onClick={cancel}
            className="ml-auto text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {pollError && (
        <p className="text-red-400 text-xs">Poll error: {pollError}</p>
      )}

      {lastItem && <JsonPanel label="Last Queue Item" data={lastItem} />}
    </div>
  )
}
