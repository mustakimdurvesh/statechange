import { useState, useEffect } from 'react'
import { FLAGS, PASSPORTS } from '../lib/countries'
import { useCommunityReports } from '../hooks/useCommunityReports'
import styles from './CommunityTab.module.css'

const MIN_LENGTH = 20
const MAX_LENGTH = 1000

export default function CommunityTab({ reports: seedReports, from, to }) {
  const { reports, loading, submit, submitting, submitError, submitOk }
    = useCommunityReports(from, to, seedReports)

  const [open, setOpen]           = useState(false)
  const [text, setText]           = useState('')
  const [passport, setPassport]   = useState(from)
  const [tagsRaw, setTagsRaw]     = useState('')

  // Close form on successful submit
  useEffect(() => {
    if (submitOk) {
      setText('')
      setTagsRaw('')
      setOpen(false)
    }
  }, [submitOk])

  const handleSubmit = async () => {
    const tags = tagsRaw
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5)

    await submit({ passport, text, tags })
  }

  const charCount   = text.length
  const tooShort    = charCount > 0 && charCount < MIN_LENGTH
  const tooLong     = charCount > MAX_LENGTH
  const canSubmit   = charCount >= MIN_LENGTH && !tooLong && !submitting

  return (
    <>
      <div className={styles.header}>
        <div className={styles.sectionTitle}>
          Traveler reports
          {loading && <span className={styles.loadingDot} />}
        </div>
        <button className={styles.addBtn} onClick={() => setOpen(o => !o)}>
          {open ? 'Cancel' : '+ Add report'}
        </button>
      </div>

      {open && (
        <div className={styles.form}>
          <textarea
            rows={3}
            placeholder="What happened at the border? Any surprises? Tips for others... (min 20 chars)"
            value={text}
            onChange={e => setText(e.target.value)}
            className={`${styles.textarea} ${tooLong ? styles.textareaError : ''}`}
          />
          <div className={styles.charCount} style={{
            color: tooShort || tooLong ? 'var(--red-800)' : 'var(--text-tertiary)'
          }}>
            {charCount}/{MAX_LENGTH}
            {tooShort && ' — too short'}
            {tooLong  && ' — too long'}
          </div>

          <input
            className={styles.tagsInput}
            placeholder="Tags: comma-separated, e.g.  BKK, smooth, fast"
            value={tagsRaw}
            onChange={e => setTagsRaw(e.target.value)}
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
              disabled={!canSubmit}
            >
              {submitting ? 'Saving...' : 'Submit report'}
            </button>
          </div>

          {submitError && (
            <p className={styles.submitError}>{submitError}</p>
          )}
        </div>
      )}

      {reports.length === 0 && !loading ? (
        <p className={styles.empty}>No reports yet — be the first to share.</p>
      ) : (
        <div className={styles.list}>
          {reports.map((r) => (
            <div key={r.id} className={styles.item}>
              <div className={styles.meta}>
                <span className={styles.passport}>
                  {FLAGS[r.passport]} {PASSPORTS[r.passport] ?? r.passport}
                </span>
                <span className={styles.date}>· {r.date}</span>
                {r.id?.startsWith('local-') && (
                  <span className={styles.pendingBadge}>saving...</span>
                )}
              </div>
              <p className={styles.text}>{r.text}</p>
              {r.tags?.length > 0 && (
                <div className={styles.tags}>
                  {r.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
