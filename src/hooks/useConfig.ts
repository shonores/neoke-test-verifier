import { useState } from 'react'
import { Config } from '../types'

const STORAGE_KEY = 'neoke_verifier_config'

const DEFAULTS: Config = {
  ceUrl: 'https://neoke-consent-engine.fly.dev',
  ceApiKey: '',
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
