
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ConnectWallet } from './ConnectWallet/ConnectWallet'
import { useState } from 'react'

export function Layout() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <Link to="/" className="logo-link" onClick={closeMobileMenu}>
            <div className="logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">Batch Transfer</span>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="nav-menu desktop-only">
            <Link 
              to="/deploy" 
              className={`nav-link ${location.pathname === '/deploy' ? 'active' : ''}`}
            >
              Deploy
            </Link>
            <Link 
              to="/transfer" 
              className={`nav-link ${location.pathname === '/transfer' ? 'active' : ''}`}
            >
              Transfer
            </Link>
          </nav>
        </div>

        <div className="header-right">
          <div className="desktop-only">
            <ConnectWallet />
          </div>

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-nav-overlay">
            <nav className="mobile-nav-menu">
              <Link 
                to="/deploy" 
                className={`nav-link ${location.pathname === '/deploy' ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Deploy
              </Link>
              <Link 
                to="/transfer" 
                className={`nav-link ${location.pathname === '/transfer' ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Transfer
              </Link>
              <div className="mobile-wallet-wrapper">
                <ConnectWallet />
              </div>
            </nav>
          </div>
        )}
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
