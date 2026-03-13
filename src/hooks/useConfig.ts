import { useState } from 'react'
import { Config } from '../types'

const STORAGE_KEY = 'neoke_verifier_config'

// Baked-in values from build-time env vars (set in Vercel or .env.local).
// When both are set, config is pre-configured and the panel is hidden.
const BAKED_URL = import.meta.env.VITE_CE_URL as string | undefined
const BAKED_KEY = import.meta.env.VITE_CE_API_KEY as string | undefined

const DEFAULTS: Config = {
  ceUrl: BAKED_URL || 'https://neoke-consent-engine.fly.dev',
  ceApiKey: BAKED_KEY || '',
}

export function useConfig() {
  // isBaked = true when both values come from env — no need to show config panel
  const isBaked = Boolean(BAKED_URL && BAKED_KEY)

  const [config, setConfig] = useState<Config>(() => {
    if (isBaked) return DEFAULTS
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

  return { config, saveConfig, isBaked }
}
