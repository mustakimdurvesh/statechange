import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { DB } from '../lib/db'

const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_DB === 'true'
  || import.meta.env.DEV  // default to local DB in dev; switch off when running vercel dev

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
        // Phase 1 local fallback — use src/lib/db.js
        await new Promise(r => setTimeout(r, 700))
        const key = `${fromCode}-${toCode}`
        data = DB[key]
        if (!data) throw new Error(
          `No local data for this route. Deploy to Vercel and set GROQ_API_KEY to enable AI synthesis for any country pair.`
        )
      } else {
        // Phase 2 — live edge function
        const res = await fetch(`/api/check?from=${fromCode}&to=${toCode}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || `Server error ${res.status}`)
        data = json
      }

      setResult(data)

      // Analytics logging — Supabase (Phase 3)
      if (supabase && !USE_LOCAL) {
        supabase.from('searches').insert({
          from_code: fromCode,
          to_code:   toCode,
          verdict:   data.verdict,
        }).then(({ error }) => {
          if (error) console.warn('[StateChange] Supabase log failed:', error.message)
        })
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { result, loading, error, check }
}
