import { useState } from 'react'
import VerdictPill from './VerdictPill'
import CommunityTab from './CommunityTab'
import { FLAGS, PASSPORTS, DESTINATIONS } from '../lib/countries'
import styles from './ResultCard.module.css'

const TABS = ['Briefing', 'Gotchas', 'Details', 'Community']

const DOT_COLOR = { warn: '#EF9F27', danger: '#E24B4A', ok: '#1D9E75' }

export default function ResultCard({ from, to, data }) {
  const [tab, setTab] = useState(0)

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div>
          <div className={styles.flags}>
            <span className={styles.flag}>{FLAGS[from]}</span>
            <span className={styles.arrow}>→</span>
            <span className={styles.flag}>{FLAGS[to]}</span>
          </div>
          <div className={styles.title}>
            {PASSPORTS[from]} → {DESTINATIONS[to] ?? to}
          </div>
          <div className={styles.sub}>{data.vtype} · {data.duration}</div>
        </div>
        <VerdictPill verdict={data.verdict} />
      </div>

      <div className={styles.tabs}>
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === i ? styles.active : ''}`}
            onClick={() => setTab(i)}
          >
            {t}
            {i === 1 && <span className={styles.count}>{data.gotchas.length}</span>}
            {i === 3 && <span className={styles.count}>{data.community.length}</span>}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {tab === 0 && (
          <>
            <div className={styles.sectionTitle}>AI briefing</div>
            <p className={styles.briefing}>{data.brief}</p>
          </>
        )}

        {tab === 1 && (
          <>
            <div className={styles.sectionTitle}>Known gotchas</div>
            <div className={styles.gotchaList}>
              {data.gotchas.map((g, i) => (
                <div key={i} className={styles.gotchaItem}>
                  <span
                    className={styles.dot}
                    style={{ background: DOT_COLOR[g.t] }}
                  />
                  <span
                    className={styles.gotchaText}
                    dangerouslySetInnerHTML={{ __html: g.text }}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 2 && (
          <>
            <div className={styles.sectionTitle}>Entry details</div>
            <div className={styles.metaGrid}>
              {[
                ['Duration',   data.duration],
                ['Extension',  data.extend],
                ['Cost',       data.cost],
                ['Processing', data.processing],
              ].map(([label, val]) => (
                <div key={label} className={styles.metaCell}>
                  <div className={styles.metaLabel}>{label}</div>
                  <div className={styles.metaVal}>{val}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 3 && (
          <CommunityTab
            reports={data.community}
            from={from}
            to={to}
          />
        )}
      </div>
    </div>
  )
}
