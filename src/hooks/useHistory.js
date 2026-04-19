import { useState, useEffect } from 'react'

const KEY = 'statechange:history'
const MAX = 20

export function useHistory() {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) ?? [] }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(history))
  }, [history])

  const push = (entry) => {
    setHistory(prev => [entry, ...prev.filter(h => h.key !== entry.key)].slice(0, MAX))
  }

  const clear = () => setHistory([])

  return { history, push, clear }
}
