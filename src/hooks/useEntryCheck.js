import { useState, useCallback } from 'react'
import { DB } from '../lib/db'

// In dev without vercel dev running, fall back to local DB
// In production (or with `vercel dev`), always hit the edge function
//const USE_LOCAL = import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_DB !== 'false'
const USE_LOCAL = false


export function useEntryCheck() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const check = useCallback(async (fromCode, toCode) => {
    if (!fromCode || !toCode) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let data

      if (USE_LOCAL) {
        await new Promise(r => setTimeout(r, 650))
        const key = `${fromCode}-${toCode}`
        data = DB[key]
        if (!data) throw new Error(
          'No local data for this route. Run `vercel dev` to enable live AI synthesis for all country pairs.'
        )
      } else {
        const res  = await fetch(`/api/check?from=${fromCode}&to=${toCode}`)
        const body = await res.json()
        if (!res.ok) throw new Error(body.error || `Server error ${res.status}`)
        data = body
      }

      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { result, loading, error, check }
}
