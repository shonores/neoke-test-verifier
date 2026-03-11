import { useState } from 'react'
import { HistoryEntry } from '../types'

const STORAGE_KEY = 'neoke_verifier_history'
const MAX_ENTRIES = 10

function loadHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)

  const addEntry = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }
    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES)
      saveHistory(updated)
      return updated
    })
    return newEntry.id
  }

  const updateEntry = (id: string, patch: Partial<HistoryEntry>) => {
    setHistory(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...patch } : e)
      saveHistory(updated)
      return updated
    })
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return { history, addEntry, updateEntry, clearHistory }
}
