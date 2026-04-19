import { useNavigate } from 'react-router-dom'
import { useHistory } from '../hooks/useHistory'
import VerdictPill from '../components/VerdictPill'
import { FLAGS, PASSPORTS, DESTINATIONS } from '../lib/countries'
import styles from './HistoryPage.module.css'

export default function HistoryPage() {
  const { history, clear } = useHistory()
  const navigate = useNavigate()

  const replay = (entry) => {
    navigate(`/?from=${entry.from}&to=${entry.to}`)
  }

  return (
    <main className={styles.main}>
      <div className={styles.topRow}>
        <h2 className={styles.heading}>Recent searches</h2>
        {history.length > 0 && (
          <button className={styles.clearBtn} onClick={clear}>Clear all</button>
        )}
      </div>

      {history.length === 0 ? (
        <div className={styles.empty}>
          <p>No searches yet.</p>
          <button className={styles.goCheck} onClick={() => navigate('/')}>
            Check a route →
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {history.map((h) => (
            <div key={h.key + h.ts} className={styles.item} onClick={() => replay(h)}>
              <div className={styles.left}>
                <span className={styles.flags}>
                  {FLAGS[h.from]} → {FLAGS[h.to]}
                </span>
                <div>
                  <div className={styles.route}>
                    {PASSPORTS[h.from]} → {DESTINATIONS[h.to] ?? h.to}
                  </div>
                  <div className={styles.date}>
                    {new Date(h.ts).toLocaleString('en', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <VerdictPill verdict={h.verdict} short />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
