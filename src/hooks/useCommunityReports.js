import { useState, useEffect, useCallback } from 'react'

const SUPABASE_URL = 'https://czqsipfjtkxmbtutkwcn.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Sg4xsK8EI7r-CSxaQSGogA_LgKj0JfB'

const SB_HEADERS = {
  'apikey':        SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type':  'application/json',
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en', { month: 'short', year: 'numeric' })
}

async function getReports(fromCode, toCode) {
  const url = `${SUPABASE_URL}/rest/v1/community_reports`
    + `?from_code=eq.${fromCode}&to_code=eq.${toCode}&flagged=eq.false`
    + `&order=created_at.desc&limit=20`
    + `&select=id,passport,report_text,tags,created_at`

  const res = await fetch(url, { headers: SB_HEADERS })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function postReport(fromCode, toCode, passport, text, tags) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/community_reports`, {
    method:  'POST',
    headers: { ...SB_HEADERS, 'Prefer': 'return=minimal' },
    body:    JSON.stringify({
      from_code:   fromCode,
      to_code:     toCode,
      passport,
      report_text: text,
      tags,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
}

export function useCommunityReports(fromCode, toCode, seedReports = []) {
  const [reports, setReports]         = useState(seedReports)
  const [loading, setLoading]         = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitOk, setSubmitOk]       = useState(false)

  // Fetch live reports on mount
  useEffect(() => {
    if (!fromCode || !toCode) return
    setLoading(true)
    getReports(fromCode, toCode)
      .then(rows => {
        if (rows.length > 0) {
          setReports(rows.map(r => ({
            id:       r.id,
            passport: r.passport,
            date:     formatDate(r.created_at),
            text:     r.report_text,
            tags:     r.tags ?? [],
          })))
        }
      })
      .catch(err => console.warn('[StateChange] Community fetch failed:', err.message))
      .finally(() => setLoading(false))
  }, [fromCode, toCode])

  // Reset form state when submit succeeds
  useEffect(() => {
    if (submitOk) {
      const t = setTimeout(() => setSubmitOk(false), 2000)
      return () => clearTimeout(t)
    }
  }, [submitOk])

  const submit = useCallback(async ({ passport, text, tags = [] }) => {
    const trimmed = text?.trim()
    if (!trimmed || trimmed.length < 20) return false
    setSubmitting(true)
    setSubmitError(null)

    // Optimistic update
    const optimistic = {
      id:       `local-${Date.now()}`,
      passport,
      date:     formatDate(new Date().toISOString()),
      text:     trimmed,
      tags:     tags.length ? tags : ['user report'],
    }
    setReports(prev => [optimistic, ...prev])

    try {
      await postReport(fromCode, toCode, passport, trimmed, optimistic.tags)
      setSubmitOk(true)
      return true
    } catch (err) {
      // Roll back optimistic update
      setReports(prev => prev.filter(r => r.id !== optimistic.id))
      setSubmitError('Failed to save. Please try again.')
      return false
    } finally {
      setSubmitting(false)
    }
  }, [fromCode, toCode])

  return { reports, loading, submit, submitting, submitError, submitOk }
}
