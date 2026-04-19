import { Link, useLocation } from 'react-router-dom'
import styles from './Topbar.module.css'

export default function Topbar() {
  const { pathname } = useLocation()

  return (
    <header className={styles.topbar}>
      <Link to="/" className={styles.logo}>
        <div className={styles.mark}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round">
            <circle cx="8" cy="8" r="5" />
            <path d="M3 8h10M8 3v10" />
          </svg>
        </div>
        <div>
          <div className={styles.name}>StateChange</div>
          <div className={styles.sub}>Check entry needs for your next stop</div>
        </div>
      </Link>
      <nav className={styles.nav}>
        <Link to="/"        className={`${styles.pill} ${pathname === '/'        ? styles.active : ''}`}>Entry check</Link>
        <Link to="/history" className={`${styles.pill} ${pathname === '/history' ? styles.active : ''}`}>History</Link>
      </nav>
    </header>
  )
}
