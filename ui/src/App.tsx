import { ConnectWallet } from './components/ConnectWallet'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Batch Transfer</span>
        </div>
        <ConnectWallet />
      </header>
      <main className="main">
        <h1>Welcome to Batch Transfer</h1>
        <p className="subtitle">Connect your wallet to get started</p>
      </main>
    </div>
  )
}

export default App
