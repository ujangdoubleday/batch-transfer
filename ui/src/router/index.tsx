
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Home } from '../views/Home'
import { Deploy } from '../views/Deploy'
import { Sync } from '../views/Sync'
import { SyncAddress } from '../views/sync/SyncAddress'
import { TransferEthPage } from '../views/sync/functions/TransferEthPage'
import { TransferTokenPage } from '../views/sync/functions/TransferTokenPage'
import { CombinedTransferPage } from '../views/sync/functions/CombinedTransferPage'
import { MultiTokenTransferPage } from '../views/sync/functions/MultiTokenTransferPage'
import { AdminPage } from '../views/sync/functions/AdminPage'
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

          <Route path="sync/:address/transfer-eth" element={
            <VerificationGuard>
              <TransferEthPage />
            </VerificationGuard>
          } />

          <Route path="sync/:address/transfer-token" element={
            <VerificationGuard>
              <TransferTokenPage />
            </VerificationGuard>
          } />

          <Route path="sync/:address/combined-transfer" element={
            <VerificationGuard>
              <CombinedTransferPage />
            </VerificationGuard>
          } />

          <Route path="sync/:address/multi-token-transfer" element={
            <VerificationGuard>
              <MultiTokenTransferPage />
            </VerificationGuard>
          } />

          <Route path="sync/:address/admin" element={
            <VerificationGuard>
              <AdminPage />
            </VerificationGuard>
          } />

        </Route>
      </Routes>
    </HashRouter>
  )
}
