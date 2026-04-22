import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useAnalytics } from '../hooks/useAnalytics'
import { FLAGS, PASSPORTS, DESTINATIONS, VERDICT_META } from '../lib/countries'
import styles from './AnalyticsPage.module.css'

// ── Verdict colour map ────────────────────────────────────────────
const VERDICT_COLOR = {
  free: '#1D9E75',
  voa:  '#378ADD',
  visa: '#EF9F27',
  no:   '#E24B4A',
}

// ── Subcomponents ─────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ children }) {
  return <div className={styles.sectionTitle}>{children}</div>
}

function VerdictBar({ item }) {
  return (
    <div className={styles.verdictRow}>
      <div className={styles.verdictLabel}>
        <span
          className={styles.verdictDot}
          style={{ background: VERDICT_COLOR[item.key] }}
        />
        {item.label}
      </div>
      <div className={styles.verdictTrack}>
        <div
          className={styles.verdictFill}
          style={{ width: `${item.pct}%`, background: VERDICT_COLOR[item.key] }}
        />
      </div>
      <div className={styles.verdictStats}>
        <span className={styles.verdictPct}>{item.pct}%</span>
        <span className={styles.verdictCount}>{item.count.toLocaleString()}</span>
      </div>
    </div>
  )
}

function RouteRow({ route, rank }) {
  const fromLabel = PASSPORTS[route.from]    || route.from
  const toLabel   = DESTINATIONS[route.to]   || route.to
  const fromFlag  = FLAGS[route.from] || ''
  const toFlag    = FLAGS[route.to]   || ''
  const vm        = VERDICT_META[route.verdict] ?? VERDICT_META.visa

  return (
    <div className={styles.routeRow}>
      <span className={styles.routeRank}>#{rank}</span>
      <span className={styles.routeFlags}>{fromFlag} → {toFlag}</span>
      <div className={styles.routeNames}>
        <span className={styles.routeFrom}>{fromLabel}</span>
        <span className={styles.routeArrow}>→</span>
        <span className={styles.routeTo}>{toLabel}</span>
      </div>
      <span
        className={styles.routeVerdict}
        style={{ color: VERDICT_COLOR[route.verdict] }}
      >
        {vm.short}
      </span>
      <span className={styles.routeCount}>{route.count.toLocaleString()}</span>
    </div>
  )
}

// ── Custom tooltip for the area chart ────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipValue}>{payload[0].value} searches</div>
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────
function Skeleton({ h = 20, w = '100%' }) {
  return (
    <div
      className={styles.skeleton}
      style={{ height: h, width: w }}
    />
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { data, loading, error } = useAnalytics()

  const totalSearches   = data?.totalSearches ?? 0
  const peakDay         = data?.timeSeries
    ? [...data.timeSeries].sort((a, b) => b.searches - a.searches)[0]
    : null
  const topRoute        = data?.routes?.[0]
  const avgDaily        = data?.timeSeries
    ? Math.round(data.timeSeries.reduce((s, d) => s + d.searches, 0) / 30)
    : 0

  return (
    <main className={styles.main}>

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.h1}>Analytics</h1>
          <p className={styles.sub}>Last 30 days · {data?.lastUpdated ?? '—'}</p>
        </div>
        {(data?.lastUpdated === 'demo mode' || data?.lastUpdated?.startsWith('no data')) && (
          <span className={styles.demoBadge}>
            {data?.lastUpdated?.startsWith('no data') ? 'run supabase-schema.sql to enable live data' : 'demo data'}
          </span>
        )}
      </div>

      {error && (
        <div className={styles.errorBanner}>
          Failed to load analytics: {error}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className={styles.statGrid}>
        {loading ? (
          [0,1,2,3].map(i => <Skeleton key={i} h={80} />)
        ) : (
          <>
            <StatCard
              label="Total searches"
              value={totalSearches.toLocaleString()}
              sub="last 30 days"
            />
            <StatCard
              label="Daily average"
              value={avgDaily.toLocaleString()}
              sub="searches / day"
            />
            <StatCard
              label="Peak day"
              value={peakDay?.searches ?? '—'}
              sub={peakDay?.label ?? ''}
            />
            <StatCard
              label="Top route"
              value={topRoute ? `${FLAGS[topRoute.from]} → ${FLAGS[topRoute.to]}` : '—'}
              sub={topRoute ? `${topRoute.count} searches` : ''}
            />
          </>
        )}
      </div>

      {/* ── Search volume over time ── */}
      <div className={styles.section}>
        <SectionTitle>Search volume — last 30 days</SectionTitle>
        <div className={styles.chartWrap}>
          {loading ? (
            <Skeleton h={200} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={data?.timeSeries ?? []}
                margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1D9E75" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#5f5e5a' }}
                  tickLine={false}
                  axisLine={false}
                  interval={6}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#5f5e5a' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="searches"
                  stroke="#1D9E75"
                  strokeWidth={1.5}
                  fill="url(#greenGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#1D9E75', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Two-col: verdict breakdown + top routes ── */}
      <div className={styles.twoCol}>

        {/* Verdict breakdown */}
        <div className={styles.section}>
          <SectionTitle>Verdict breakdown</SectionTitle>
          {loading ? (
            <div className={styles.verdictList}>
              {[0,1,2,3].map(i => <Skeleton key={i} h={36} />)}
            </div>
          ) : (
            <div className={styles.verdictList}>
              {(data?.verdicts ?? []).map(item => (
                <VerdictBar key={item.key} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Top routes */}
        <div className={styles.section}>
          <SectionTitle>Popular routes</SectionTitle>
          {loading ? (
            <div className={styles.routeList}>
              {[0,1,2,3,4,5].map(i => <Skeleton key={i} h={36} />)}
            </div>
          ) : (
            <div className={styles.routeList}>
              {(data?.routes ?? []).map((route, i) => (
                <RouteRow key={`${route.from}-${route.to}`} route={route} rank={i + 1} />
              ))}
            </div>
          )}
        </div>

      </div>

    </main>
  )
}
