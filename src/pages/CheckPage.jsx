import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEntryCheck } from '../hooks/useEntryCheck'
import { useHistory } from '../hooks/useHistory'
import ResultCard from '../components/ResultCard'
import { PASSPORTS, DESTINATIONS, FLAGS } from '../lib/countries'
import styles from './CheckPage.module.css'

export default function CheckPage() {
  const [params, setParams]   = useSearchParams()
  const { result, loading, error, check } = useEntryCheck()
  const { push } = useHistory()

  const from = params.get('from') || ''
  const to   = params.get('to')   || ''

  // Auto-run if URL has params (replay from history)
  useEffect(() => {
    if (from && to) check(from, to)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setFrom = (v) => setParams(p => { p.set('from', v); return p }, { replace: true })
  const setTo   = (v) => setParams(p => { p.set('to',   v); return p }, { replace: true })

  const handleCheck = async () => {
    if (!from || !to || from === to) return
    const data = await check(from, to)
    // push to history after successful check — useEntryCheck resolves first
  }

  // Push to history when result arrives
  useEffect(() => {
    if (result) {
      push({ from, to, key: `${from}-${to}`, verdict: result.verdict, ts: Date.now() })
    }
  }, [result]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.h1}>Check entry needs for your next stop</h1>
        <p className={styles.sub}>Visa rules, gotchas, and traveler reports — synthesized by AI</p>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.selWrap}>
          <label className={styles.label}>Your passport</label>
          <select value={from} onChange={e => setFrom(e.target.value)}>
            <option value="">Select passport</option>
            {Object.entries(PASSPORTS).map(([k, v]) => (
              <option key={k} value={k}>{FLAGS[k]} {v}</option>
            ))}
          </select>
        </div>

        <span className={styles.arrowIcon}>→</span>

        <div className={styles.selWrap}>
          <label className={styles.label}>Destination</label>
          <select value={to} onChange={e => setTo(e.target.value)}>
            <option value="">Select country</option>
            {Object.entries(DESTINATIONS).map(([k, v]) => (
              <option key={k} value={k}>{FLAGS[k]} {v}</option>
            ))}
          </select>
        </div>

        <button
          className={styles.goBtn}
          onClick={handleCheck}
          disabled={loading || !from || !to || from === to}
        >
          {loading ? 'Checking...' : 'Check now'}
        </button>
      </div>

      {from === to && from && (
        <p className={styles.error}>Passport and destination cannot be the same.</p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {loading && (
        <div className={styles.thinking}>
          <span className={styles.spinner} />
          Synthesizing entry requirements...
        </div>
      )}

      {result && !loading && (
        <ResultCard from={from} to={to} data={result} />
      )}

      <p className={styles.disclaimer}>
        AI-synthesized · Always verify with the official embassy · Rules change without notice
      </p>
    </main>
  )
}
