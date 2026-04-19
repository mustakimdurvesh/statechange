import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function formatDate(iso) {
  return new Date(iso).toLocaleString('en', { month: 'short', year: 'numeric' })
}

function shapeReport(r) {
  return {
    id:       r.id,
    passport: r.passport,
    date:     formatDate(r.created_at),
    text:     r.report_text,
    tags:     r.tags ?? [],
  }
}

export function useCommunityReports(fromCode, toCode, seedReports = []) {
  // Seed with local db data first, then hydrate from Supabase if available
  const [reports, setReports]     = useState(seedReports)
  const [loading, setLoading]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitOk, setSubmitOk]   = useState(false)

  // Fetch live reports from Supabase on mount
  useEffect(() => {
    if (!supabase || !fromCode || !toCode) return
    setLoading(true)

    supabase
      .from('community_reports')
      .select('id, passport, report_text, tags, created_at')
      .eq('from_code', fromCode)
      .eq('to_code', toCode)
      .eq('flagged', false)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error) {
          console.warn('[StateChange] Failed to load community reports:', error.message)
        } else if (data?.length) {
          setReports(data.map(shapeReport))
        }
        setLoading(false)
      })
  }, [fromCode, toCode])

  // Submit a new report
  const submit = useCallback(async ({ passport, text, tags = [] }) => {
    if (!text?.trim() || text.trim().length < 20) return
    setSubmitting(true)
    setSubmitError(null)
    setSubmitOk(false)

    // Optimistic update — show immediately
    const optimistic = {
      id:       `local-${Date.now()}`,
      passport,
      date:     formatDate(new Date().toISOString()),
      text:     text.trim(),
      tags:     tags.length ? tags : ['user report'],
    }
    setReports(prev => [optimistic, ...prev])

    if (supabase) {
      const { error } = await supabase.from('community_reports').insert({
        from_code:   fromCode,
        to_code:     toCode,
        passport,
        report_text: text.trim(),
        tags:        optimistic.tags,
      })

      if (error) {
        // Roll back optimistic update
        setReports(prev => prev.filter(r => r.id !== optimistic.id))
        setSubmitError('Failed to save report. Please try again.')
        setSubmitting(false)
        return false
      }
    }

    setSubmitOk(true)
    setSubmitting(false)
    return true
  }, [fromCode, toCode])

  return { reports, loading, submit, submitting, submitError, submitOk }
}
