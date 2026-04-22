import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function groupByDay(rows) {
  const map = {}
  rows.forEach(r => {
    const day = r.created_at.slice(0, 10) // YYYY-MM-DD
    map[day] = (map[day] || 0) + 1
  })
  // Fill in last 30 days (including zeros)
  const result = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({
      date:    key,
      label:   d.toLocaleString('en', { month: 'short', day: 'numeric' }),
      searches: map[key] || 0,
    })
  }
  return result
}

function groupByVerdict(rows) {
  const counts = { free: 0, voa: 0, visa: 0, no: 0 }
  rows.forEach(r => {
    if (r.verdict in counts) counts[r.verdict]++
    else counts.visa++ // fallback
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

export function useAnalytics() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (!supabase) {
      // Seed with plausible demo data when Supabase not configured
      setData(buildDemo())
      setLoading(false)
      return
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    supabase
      .from('searches')
      .select('from_code, to_code, verdict, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })
      .then(({ data: rows, error: err }) => {
        if (err) {
          setError(err.message)
        } else {
          const all = rows ?? []
          setData({
            totalSearches: all.length,
            timeSeries:    groupByDay(all),
            verdicts:      groupByVerdict(all),
            routes:        topRoutes(all),
            lastUpdated:   new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
          })
        }
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}

// ── Demo data for local dev without Supabase ──────────────────────
function buildDemo() {
  const now = new Date()
  const rows = []

  // Simulate 30 days of searches with realistic distribution
  const routes = [
    { from: 'IN', to: 'TH', verdict: 'voa',  weight: 18 },
    { from: 'IN', to: 'GE', verdict: 'free',  weight: 14 },
    { from: 'IN', to: 'PT', verdict: 'visa',  weight: 10 },
    { from: 'IN', to: 'AE', verdict: 'voa',   weight: 12 },
    { from: 'IN', to: 'US', verdict: 'visa',  weight: 9  },
    { from: 'GB', to: 'TH', verdict: 'free',  weight: 8  },
    { from: 'IN', to: 'ID', verdict: 'free',  weight: 7  },
    { from: 'DE', to: 'TH', verdict: 'free',  weight: 5  },
    { from: 'NG', to: 'AE', verdict: 'visa',  weight: 4  },
    { from: 'PK', to: 'TR', verdict: 'free',  weight: 3  },
  ]

  for (let d = 29; d >= 0; d--) {
    const date = new Date(now)
    date.setDate(date.getDate() - d)
    // Volume grows slightly over time
    const dailyCount = Math.floor(3 + (30 - d) * 0.6 + Math.random() * 4)
    for (let i = 0; i < dailyCount; i++) {
      const r = routes[weightedRandom(routes.map(r => r.weight))]
      rows.push({ ...r, created_at: date.toISOString() })
    }
  }

  return {
    totalSearches: rows.length,
    timeSeries:    groupByDay(rows),
    verdicts:      groupByVerdict(rows),
    routes:        topRoutes(rows),
    lastUpdated:   'demo mode',
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
