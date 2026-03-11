import { useState } from 'react'
import { Tab, ConsentResponse, HistoryEntry } from './types'
import { useConfig } from './hooks/useConfig'
import { useAuth } from './hooks/useAuth'
import { useHistory } from './hooks/useHistory'
import { ConfigPanel } from './components/ConfigPanel'
import { CreateRequestTab } from './components/CreateRequestTab'
import { ExistingLinkTab } from './components/ExistingLinkTab'
import { SendToWallet } from './components/SendToWallet'
import { ResponsePanel } from './components/ResponsePanel'
import { HistoryPanel } from './components/HistoryPanel'

const DEFAULT_CE_URL = 'https://neoke-consent-engine.fly.dev'

type FlowState = {
  sessionId?: string
  rawLink?: string
  targetWalletDid?: string
  ceUrl?: string
  ceAdminKey?: string
  ceResponse?: ConsentResponse
  credentialData?: unknown
  historyEntryId?: string
}

export default function App() {
  const { config, saveConfig } = useConfig()
  const { getToken } = useAuth(config)
  const { history, addEntry, updateEntry, clearHistory } = useHistory()
  const [tab, setTab] = useState<Tab>('create')
  const [flow, setFlow] = useState<FlowState>({})

  const resetFlow = () => setFlow({})

  const handleCreated = (sessionId: string, rawLink: string, targetWalletDid: string, ceUrl: string, ceAdminKey: string) => {
    setFlow({ sessionId, rawLink, targetWalletDid, ceUrl, ceAdminKey })
  }

  const handleLinkReady = (rawLink: string) => {
    setFlow({ rawLink, ceUrl: DEFAULT_CE_URL, ceAdminKey: '' })
  }

  const handleCeResponse = (response: ConsentResponse) => {
    const entryId = addEntry({
      targetDid: flow.targetWalletDid ?? '',
      sessionId: flow.sessionId,
      rawLink: flow.rawLink,
      outcome: response.outcome,
    })
    setFlow(f => ({ ...f, ceResponse: response, historyEntryId: entryId }))
  }

  const handleCredentialData = (data: unknown) => {
    setFlow(f => ({ ...f, credentialData: data }))
    if (flow.historyEntryId) {
      updateEntry(flow.historyEntryId, { credentialData: data })
    }
  }

  const handleRestore = (entry: HistoryEntry) => {
    setFlow({
      sessionId: entry.sessionId,
      rawLink: entry.rawLink,
      targetWalletDid: entry.targetDid,
      ceUrl: DEFAULT_CE_URL,
      ceAdminKey: '',
    })
    setTab('existing')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Neoke Test Verifier</h1>
            <p className="text-slate-500 text-xs mt-0.5">VP Request → Consent Engine → Credential Response</p>
          </div>
          <button
            onClick={resetFlow}
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-400 transition-colors"
          >
            New Request
          </button>
        </div>

        {/* Config — node ID + API key only */}
        <ConfigPanel config={config} onSave={saveConfig} />

        {/* Tabs */}
        <div className="flex flex-col gap-4">
          <div className="flex border-b border-slate-700">
            {(['create', 'existing'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); resetFlow() }}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {t === 'create' ? 'Create New Request' : 'Use Existing Link'}
              </button>
            ))}
          </div>

          <div className="border border-slate-700 rounded-xl p-5 bg-slate-900">
            {tab === 'create' ? (
              <CreateRequestTab
                nodeId={config.nodeId}
                getToken={getToken}
                onCreated={handleCreated}
              />
            ) : (
              <ExistingLinkTab onReady={handleLinkReady} />
            )}
          </div>
        </div>

        {/* Send to Wallet */}
        {flow.rawLink && !flow.ceResponse && (
          <SendToWallet
            ceUrl={flow.ceUrl ?? DEFAULT_CE_URL}
            targetWalletDid={flow.targetWalletDid ?? ''}
            rawLink={flow.rawLink}
            sessionId={flow.sessionId}
            onResponse={handleCeResponse}
          />
        )}

        {/* Response */}
        {flow.ceResponse && (
          <ResponsePanel
            nodeId={config.nodeId}
            apiKey={config.apiKey}
            getToken={getToken}
            sessionId={flow.sessionId}
            response={flow.ceResponse}
            ceUrl={flow.ceUrl ?? DEFAULT_CE_URL}
            ceAdminKey={flow.ceAdminKey ?? ''}
            onCredentialData={handleCredentialData}
          />
        )}

        {/* History */}
        <HistoryPanel
          history={history}
          onClear={clearHistory}
          onRestore={handleRestore}
        />

      </div>
    </div>
  )
}
