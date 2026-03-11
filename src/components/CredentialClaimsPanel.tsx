/**
 * Generic pretty-printer for VP session result credential data.
 * Works for any docType / namespace / claim set — no hardcoding.
 *
 * Handles two shapes:
 *   A) Full session result: { result: { credentials: [{ nameSpaces, docType, ... }] } }
 *   B) Already-extracted credential array or single credential object
 *   C) Flat unknown data: falls back to raw JSON
 */

interface Claim {
  elementIdentifier: string
  elementValue: unknown
}

interface Credential {
  queryId?: string
  docType?: string
  format?: string
  deviceAuthVerified?: boolean
  signatureValid?: boolean
  statusCheck?: string
  nameSpaces?: Record<string, Claim[]>
  [key: string]: unknown
}

interface SessionResult {
  valid?: boolean
  dcqlValid?: boolean
  credentials?: Credential[]
  errors?: unknown[]
  [key: string]: unknown
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function ClaimRow({ name, value }: { name: string; value: unknown }) {
  return (
    <tr className="border-t border-slate-700/50">
      <td className="py-1.5 pr-4 text-slate-400 font-mono text-xs whitespace-nowrap align-top">{name}</td>
      <td className="py-1.5 text-slate-100 text-xs break-all">{formatValue(value)}</td>
    </tr>
  )
}

function CredentialCard({ cred, index }: { cred: Credential; index: number }) {
  const hasNameSpaces = cred.nameSpaces && Object.keys(cred.nameSpaces).length > 0

  const badges = [
    cred.deviceAuthVerified === true && { label: 'Device Auth', ok: true },
    cred.signatureValid === true && { label: 'Signature', ok: true },
    cred.statusCheck === 'valid' && { label: 'Status', ok: true },
    cred.deviceAuthVerified === false && { label: 'Device Auth', ok: false },
    cred.signatureValid === false && { label: 'Signature', ok: false },
    cred.statusCheck && cred.statusCheck !== 'valid' && { label: `Status: ${cred.statusCheck}`, ok: false },
  ].filter(Boolean) as { label: string; ok: boolean }[]

  return (
    <div className="flex flex-col gap-3 border border-slate-700 rounded-lg p-4 bg-slate-900/60">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="text-slate-200 text-xs font-semibold">{cred.docType ?? `Credential ${index + 1}`}</p>
          {cred.format && <p className="text-slate-500 text-xs">{cred.format}</p>}
          {cred.queryId && <p className="text-slate-500 text-xs">query: {cred.queryId}</p>}
        </div>
        {badges.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {badges.map(b => (
              <span
                key={b.label}
                className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                  b.ok
                    ? 'bg-green-900/60 text-green-400 border border-green-700'
                    : 'bg-red-900/60 text-red-400 border border-red-700'
                }`}
              >
                {b.ok ? '✓' : '✗'} {b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Claims per namespace */}
      {hasNameSpaces ? (
        Object.entries(cred.nameSpaces!).map(([ns, claims]) => (
          <div key={ns}>
            <p className="text-slate-500 text-xs font-mono mb-1">{ns}</p>
            <table className="w-full">
              <tbody>
                {claims.map(c => (
                  <ClaimRow key={c.elementIdentifier} name={c.elementIdentifier} value={c.elementValue} />
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p className="text-slate-500 text-xs">No decoded claims available</p>
      )}
    </div>
  )
}

interface Props {
  data: unknown
}

export function CredentialClaimsPanel({ data }: Props) {
  // Shape A: full session result
  const asSession = data as { result?: SessionResult; sessionId?: string; status?: string }
  if (asSession?.result?.credentials) {
    const { valid, dcqlValid, credentials, errors } = asSession.result
    return (
      <div className="flex flex-col gap-3">
        {/* Summary row */}
        <div className="flex gap-2 flex-wrap">
          {valid !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${valid ? 'bg-green-900/60 text-green-400 border border-green-700' : 'bg-red-900/60 text-red-400 border border-red-700'}`}>
              {valid ? '✓' : '✗'} VP Valid
            </span>
          )}
          {dcqlValid !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${dcqlValid ? 'bg-green-900/60 text-green-400 border border-green-700' : 'bg-red-900/60 text-red-400 border border-red-700'}`}>
              {dcqlValid ? '✓' : '✗'} DCQL
            </span>
          )}
          {asSession.sessionId && (
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-400 border border-slate-700">
              session: {asSession.sessionId}
            </span>
          )}
        </div>

        {/* One card per credential */}
        {credentials.map((cred, i) => (
          <CredentialCard key={cred.queryId ?? i} cred={cred} index={i} />
        ))}

        {/* Errors if any */}
        {Array.isArray(errors) && errors.length > 0 && (
          <pre className="text-red-400 text-xs bg-red-950 border border-red-800 rounded p-3 whitespace-pre-wrap">
            {JSON.stringify(errors, null, 2)}
          </pre>
        )}
      </div>
    )
  }

  // Fallback: raw JSON
  return (
    <pre className="json-panel rounded-none border-0 text-green-400">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
