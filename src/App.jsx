import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Topbar from './components/Topbar'
import CheckPage   from './pages/CheckPage'
import HistoryPage from './pages/HistoryPage'

// Lazy-load analytics so Recharts (~500kb) only loads when the route is visited
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-tertiary)', fontSize: 13 }}>
      Loading...
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"          element={<CheckPage />}     />
          <Route path="/history"   element={<HistoryPage />}   />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
