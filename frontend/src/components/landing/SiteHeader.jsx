/* eslint-disable react/prop-types */
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Activity, ArrowRight, Menu, X } from 'lucide-react'

export default function SiteHeader({ staticPosition = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const aboutCurrent = pathname === '/about'
  const teamCurrent = pathname === '/team'

  return (
    <header className={`cosmos-header${staticPosition ? ' cosmos-header-static' : ''}`}>
      <Link to="/" className="cosmos-brand" aria-label="AstroCare home">
        <span className="cosmos-brand-icon"><Activity size={18} strokeWidth={2.2} /></span>
        <span>ASTROCARE</span>
      </Link>

      <nav className="cosmos-nav" aria-label="Main navigation">
        <Link to="/" aria-current={pathname === '/' ? 'page' : undefined}>Home</Link>
        <Link to="/about" aria-current={aboutCurrent ? 'page' : undefined}>About AstroCare</Link>
        <Link to="/team" aria-current={teamCurrent ? 'page' : undefined}>AstroByteX</Link>
      </nav>

      <Link to="/dashboard" className="cosmos-dashboard-link">Dashboard <ArrowRight size={14} /></Link>

      <button
        className="cosmos-menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {menuOpen && (
        <nav className="cosmos-mobile-nav" aria-label="Mobile navigation">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About AstroCare</Link>
          <Link to="/team" onClick={() => setMenuOpen(false)}>About AstroByteX</Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Open Dashboard <ArrowRight size={14} /></Link>
        </nav>
      )}
    </header>
  )
}
