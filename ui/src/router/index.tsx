
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Home } from '../views/Home'
import { Deploy } from '../views/Deploy'
import { Sync } from '../views/Sync'
import { SyncAddress } from '../views/sync/SyncAddress'
import { VerificationGuard } from '../components/VerificationGuard'

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="deploy" element={<Deploy />} />
          <Route path="sync" element={<Sync />} />
          <Route path="sync/:address" element={
            <VerificationGuard>
              <SyncAddress />
            </VerificationGuard>
          } />
          {/* Example of future sub-route protected by the same guard, as requested */}
          <Route path="sync/:address/transfer" element={
            <VerificationGuard>
              <SyncAddress /> 
              {/* This would be the transfer component in the future */}
            </VerificationGuard>
          } />
        </Route>
      </Routes>
    </HashRouter>
  )
}
