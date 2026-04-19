import { useState } from 'react'
import { FLAGS, PASSPORTS } from '../lib/countries'
import styles from './CommunityTab.module.css'

export default function CommunityTab({ reports: initialReports, from, to }) {
  const [reports, setReports] = useState(initialReports)
  const [open, setOpen]       = useState(false)
  const [text, setText]       = useState('')
  const [passport, setPassport] = useState(from)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) return
    setSubmitting(true)

    // Phase 3: supabase.from('community_reports').insert(...)
    const newReport = {
      passport,
      date: new Date().toLocaleString('en', { month: 'short', year: 'numeric' }),
      text: text.trim(),
      tags: ['user report'],
    }

    setReports(prev => [newReport, ...prev])
    setText('')
    setOpen(false)
    setSubmitting(false)
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.sectionTitle}>Traveler reports</div>
        <button className={styles.addBtn} onClick={() => setOpen(o => !o)}>
          {open ? 'Cancel' : '+ Add report'}
        </button>
      </div>

      {open && (
        <div className={styles.form}>
          <textarea
            rows={3}
            placeholder="What happened at the border? Any surprises? Tips for others..."
            value={text}
            onChange={e => setText(e.target.value)}
            className={styles.textarea}
          />
          <div className={styles.formRow}>
            <select
              value={passport}
              onChange={e => setPassport(e.target.value)}
              className={styles.select}
            >
              {Object.entries(PASSPORTS).map(([k, v]) => (
                <option key={k} value={k}>{FLAGS[k]} {v}</option>
              ))}
            </select>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <p className={styles.empty}>No reports yet — be the first to share.</p>
      ) : (
        <div className={styles.list}>
          {reports.map((r, i) => (
            <div key={i} className={styles.item}>
              <div className={styles.meta}>
                <span className={styles.passport}>
                  {FLAGS[r.passport]} {PASSPORTS[r.passport] ?? r.passport}
                </span>
                <span className={styles.date}>· {r.date}</span>
              </div>
              <p className={styles.text}>{r.text}</p>
              {r.tags?.length > 0 && (
                <div className={styles.tags}>
                  {r.tags.map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
