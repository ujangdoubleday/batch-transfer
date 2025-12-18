
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Home } from '../views/Home'
import { Deploy } from '../views/Deploy'
import { Sync } from '../views/Sync'
import { SyncAddress } from '../views/SyncAddress'

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="deploy" element={<Deploy />} />
          <Route path="sync" element={<Sync />} />
          <Route path="sync/:address" element={<SyncAddress />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
