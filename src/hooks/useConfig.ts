import { useState, useEffect } from 'react'
import { Config } from '../types'

const STORAGE_KEY = 'neoke_verifier_config'

const DEFAULTS: Config = {
  myNodeId: 'sebastian',
  myNodeHost: 'b2b-poc.id-node.neoke.com',
  myApiKey: '',
  targetWalletDid: 'did:web:b2b-poc.id-node.neoke.com',
  targetCeUrl: 'https://neoke-consent-engine.fly.dev',
  ceAdminKey: '',
}

export function useConfig() {
  const [config, setConfig] = useState<Config>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return { ...DEFAULTS, ...JSON.parse(stored) }
    } catch {}
    return DEFAULTS
  })

  const saveConfig = (newConfig: Config) => {
    setConfig(newConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig))
  }

  return { config, saveConfig }
}
