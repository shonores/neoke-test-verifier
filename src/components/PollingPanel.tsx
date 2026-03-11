import { useState, useEffect, useRef } from 'react'
import { GetToken, QueueItem } from '../types'
import { pollQueueItem, fetchVpResponse } from '../api'
import { JsonPanel } from './JsonPanel'

interface Props {
  nodeId: string
  getToken: GetToken
  ceUrl: string
  ceAdminKey: string
  queueItemId: string
  sessionId?: string
  queuePreview?: { issuer?: string; credentialTypes?: string[]; requestedClaims?: string[] }
  onResolved: (credentialData: unknown) => void
  onRejected: (reason: string) => void
}

const POLL_INTERVAL_MS = 5000
const MAX_ATTEMPTS = 60

export function PollingPanel({ nodeId, getToken, ceUrl, ceAdminKey, queueItemId, sessionId, queuePreview, onResolved, onRejected }: Props) {
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

      const { item, error } = await pollQueueItem(ceUrl, queueItemId, ceAdminKey)

      if (error) {
        setPollError(error)
        return
      }

      if (item) {
        setLastItem(item)
        setStatus(item.status)
        attemptsRef.current += 1
        setAttempts(attemptsRef.current)

        if (item.status === 'approved') {
          clearInterval(intervalRef.current!)
          if (sessionId) {
            const { data } = await fetchVpResponse(nodeId, getToken, sessionId)
            onResolved(data)
          } else {
            onResolved(item)
          }
          return
        }

        if (item.status === 'rejected' || item.status === 'expired') {
          clearInterval(intervalRef.current!)
          onRejected(`Queue item ${item.status}`)
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
          {queuePreview.issuer && <div><span className="text-slate-500">Issuer:</span> {queuePreview.issuer}</div>}
          {queuePreview.credentialTypes?.length && (
            <div><span className="text-slate-500">Types:</span> {queuePreview.credentialTypes.join(', ')}</div>
          )}
          {queuePreview.requestedClaims?.length && (
            <div><span className="text-slate-500">Claims:</span> {queuePreview.requestedClaims.join(', ')}</div>
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
