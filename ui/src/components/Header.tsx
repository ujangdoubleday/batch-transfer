import { Link, useLocation } from 'react-router-dom'
import { ConnectWallet } from './ConnectWallet/ConnectWallet'
import { useState } from 'react'
import { cn } from '../lib/utils'

export function Header() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }


  const navLinkClass = (isActive: boolean) => cn(
    'text-sm font-medium transition-all duration-300 relative py-2',
    isActive ? 'text-white' : 'text-zinc-400 hover:text-white',
    isActive && 'after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-white after:shadow-[0_0_10px_rgba(255,255,255,0.5)]'
  )

  return (
    <>
      <header className="w-full bg-[#000000]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Desktop Nav */}
            <div className="flex items-center gap-12">
              <Link to="/" className="flex items-center gap-3 group no-underline text-inherit z-50" onClick={closeMobileMenu}>
                <div className="flex items-center gap-2 transition-all duration-300 group-hover:drop-shadow-[0_0_2em_rgba(255,255,255,0.4)]">
                  <span className="text-3xl">⚡</span>
                  <span className="text-xl font-bold tracking-tight text-white">
                    Batch Transfer
                  </span>
                </div>
              </Link>
              
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-10">
                <Link 
                  to="/deploy" 
                  className={navLinkClass(location.pathname === '/deploy')}
                >
                  Deploy
                </Link>
                <Link 
                  to="/transfer" 
                  className={navLinkClass(location.pathname === '/transfer')}
                >
                  Transfer
                </Link>
              </nav>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4 z-50">
              <div className="hidden md:block">
                <ConnectWallet />
              </div>

              {/* Elegant Mobile Toggle - High Z-index to stay above menu */}
              <button 
                className="md:hidden group relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm border border-white/10 z-[101]"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                <div className="flex flex-col gap-1.5 items-center justify-center w-5">
                  <span className={cn(
                    "block h-[1.5px] w-5 bg-white transition-all duration-300 origin-center",
                    isMobileMenuOpen ? "translate-y-2 rotate-45 w-6" : ""
                  )} />
                  <span className={cn(
                    "block h-[1.5px] w-3 bg-white transition-all duration-300",
                    isMobileMenuOpen ? "opacity-0 scale-0" : "group-hover:w-5"
                  )} />
                  <span className={cn(
                    "block h-[1.5px] w-5 bg-white transition-all duration-300 origin-center",
                    isMobileMenuOpen ? "-translate-y-2 -rotate-45 w-6" : ""
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Side Drawer - Moved outside header to ensure full coverage */}
      <div className={cn(
        "md:hidden fixed inset-0 z-[100] transition-all duration-300",
        isMobileMenuOpen ? "visible" : "invisible pointer-events-none"
      )}>
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeMobileMenu}
        />

        {/* Side Drawer */}
        <div className={cn(
          "absolute inset-y-0 w-[60%] sm:w-1/2 bg-[#0A0A0A]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-[right] duration-300 ease-out",
          isMobileMenuOpen ? "right-0" : "-right-full"
        )}>
            <div className="flex flex-col h-full p-6 pt-24">


              {/* Centered Navigation */}
              <nav className="flex-1 flex flex-col justify-center items-center gap-10">
                <Link 
                  to="/deploy" 
                  className="text-2xl font-light tracking-tight text-white hover:text-zinc-300 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Deploy
                </Link>
                <Link 
                  to="/transfer" 
                  className="text-2xl font-light tracking-tight text-white hover:text-zinc-300 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Transfer
                </Link>
              </nav>

              {/* Bottom Wallet */}
              <div className="mt-auto mb-8 w-full flex justify-center">
                <ConnectWallet isMobile={true} />
              </div>
            </div>
        </div>
      </div>
    </>
  )
}
