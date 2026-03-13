import { useConfig } from './hooks/useConfig'
import { useHistory } from './hooks/useHistory'
import { ConfigPanel } from './components/ConfigPanel'
import { CreateRequestTab } from './components/CreateRequestTab'
import { HistoryPanel } from './components/HistoryPanel'
import { VerifyResponse } from './types'

export default function App() {
  const { config, saveConfig, isBaked } = useConfig()
  const { history, addEntry, clearHistory } = useHistory()

  const handleComplete = (email: string, credentialType: string, result: VerifyResponse) => {
    addEntry({
      targetEmail: email,
      credentialType,
      action: result.action,
      requestId: result.requestId,
      claims: result.claims,
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Neoke Test Verifier</h1>
          <p className="text-slate-500 text-xs mt-0.5">Send a verification request via the Consent Engine /v1/verify endpoint</p>
        </div>

        {/* Config — hidden when CE URL + API key are baked in via env vars */}
        {!isBaked && <ConfigPanel config={config} onSave={saveConfig} />}

        {/* Verify form */}
        <div className="border border-slate-700 rounded-xl p-5 bg-slate-900">
          <CreateRequestTab config={config} onComplete={handleComplete} />
        </div>

        {/* History */}
        <HistoryPanel history={history} onClear={clearHistory} />

      </div>
    </div>
  )
}
