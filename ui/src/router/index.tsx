
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Home } from '../views/Home'
import { Deploy } from '../views/Deploy'
import { Transfer } from '../views/Transfer'

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="deploy" element={<Deploy />} />
          <Route path="transfer" element={<Transfer />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
