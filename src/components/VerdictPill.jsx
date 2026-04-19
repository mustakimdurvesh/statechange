import styles from './VerdictPill.module.css'
import { VERDICT_META } from '../lib/countries'

export default function VerdictPill({ verdict, short = false }) {
  const meta = VERDICT_META[verdict] ?? VERDICT_META.visa
  return (
    <span className={`${styles.pill} ${styles[verdict]}`}>
      {short ? meta.short : meta.label}
    </span>
  )
}
