import { useState, useEffect } from 'react'

// Read credentials directly — same values as src/lib/supabase.js
const supabaseUrl = 'https://czqsipfjtkxmbtutkwcn.supabase.co'
const supabaseKey = 'sb_publishable_Sg4xsK8EI7r-CSxaQSGogA_LgKj0JfB'

// ── Raw REST fetch — bypasses PostgREST schema cache entirely ─────
// The JS client caches the schema on init and throws if a table isn't
// in its snapshot yet. Raw fetch hits the REST endpoint directly.
async function fetchSearches() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const url = `${SUPABASE_URL}/rest/v1/searches`
    + `?created_at=gte.${thirtyDaysAgo.toISOString()}`
    + `&select=from_code,to_code,verdict,created_at`
    + `&order=created_at.asc`
    + `&limit=5000`

  const res = await fetch(url, {
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }

  return res.json()
}

// ── Data shaping helpers ──────────────────────────────────────────
function groupByDay(rows) {
  const map = {}
  rows.forEach(r => {
    const day = r.created_at.slice(0, 10)
    map[day] = (map[day] || 0) + 1
  })
  const result = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({
      date:     key,
      label:    d.toLocaleString('en', { month: 'short', day: 'numeric' }),
      searches: map[key] || 0,
    })
  }
  return result
}

function groupByVerdict(rows) {
  const counts = { free: 0, voa: 0, visa: 0, no: 0 }
  rows.forEach(r => {
    if (r.verdict in counts) counts[r.verdict]++
    else counts.visa++
  })
  const total = rows.length || 1
  return [
    { key: 'free', label: 'Visa-free',       count: counts.free, pct: Math.round(counts.free / total * 100) },
    { key: 'voa',  label: 'Visa on arrival', count: counts.voa,  pct: Math.round(counts.voa  / total * 100) },
    { key: 'visa', label: 'Visa required',   count: counts.visa, pct: Math.round(counts.visa / total * 100) },
    { key: 'no',   label: 'Entry denied',    count: counts.no,   pct: Math.round(counts.no   / total * 100) },
  ]
}

function topRoutes(rows, n = 8) {
  const map = {}
  rows.forEach(r => {
    const key = `${r.from_code}-${r.to_code}`
    if (!map[key]) map[key] = { from: r.from_code, to: r.to_code, count: 0, verdict: r.verdict }
    map[key].count++
  })
  return Object.values(map)
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

// ── Hook ──────────────────────────────────────────────────────────
export function useAnalytics() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    fetchSearches()
      .then(rows => {
        setData({
          totalSearches: rows.length,
          timeSeries:    groupByDay(rows),
          verdicts:      groupByVerdict(rows),
          routes:        topRoutes(rows),
          lastUpdated:   new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        })
      })
      .catch(err => {
        console.error('[StateChange] Analytics fetch error:', err.message)
        // On any error fall back to demo data so the page is never broken
        setData(buildDemo())
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

// ── Demo data — shown when table is empty or fetch fails ──────────
function buildDemo() {
  const now = new Date()
  const rows = []
  const routes = [
    { from_code: 'IN', to_code: 'TH', verdict: 'voa',  weight: 18 },
    { from_code: 'IN', to_code: 'GE', verdict: 'free', weight: 14 },
    { from_code: 'IN', to_code: 'PT', verdict: 'visa', weight: 10 },
    { from_code: 'IN', to_code: 'AE', verdict: 'voa',  weight: 12 },
    { from_code: 'IN', to_code: 'US', verdict: 'visa', weight: 9  },
    { from_code: 'GB', to_code: 'TH', verdict: 'free', weight: 8  },
    { from_code: 'IN', to_code: 'ID', verdict: 'free', weight: 7  },
    { from_code: 'DE', to_code: 'TH', verdict: 'free', weight: 5  },
    { from_code: 'NG', to_code: 'AE', verdict: 'visa', weight: 4  },
    { from_code: 'PK', to_code: 'TR', verdict: 'free', weight: 3  },
  ]
  for (let d = 29; d >= 0; d--) {
    const date = new Date(now)
    date.setDate(date.getDate() - d)
    const count = Math.floor(3 + (30 - d) * 0.6 + Math.random() * 4)
    for (let i = 0; i < count; i++) {
      const r = routes[weightedRandom(routes.map(r => r.weight))]
      rows.push({ ...r, created_at: date.toISOString() })
    }
  }
  return {
    totalSearches: rows.length,
    timeSeries:    groupByDay(rows),
    verdicts:      groupByVerdict(rows),
    routes:        topRoutes(rows),
    lastUpdated:   'demo data',
  }
}

function weightedRandom(weights) {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}
