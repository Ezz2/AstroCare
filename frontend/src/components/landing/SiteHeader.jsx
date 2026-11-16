
/* eslint-disable react/prop-types */
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Activity, ArrowRight } from 'lucide-react'
import LanguageSwitcher from '../LanguageSwitcher'
import useLanguage from '../../i18n/useLanguage'

export default function SiteHeader({ staticPosition = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { t } = useLanguage()

  const aboutCurrent = pathname === '/about'
  const teamCurrent = pathname === '/team'

  return (
    <header className={`cosmos-header${staticPosition ? ' cosmos-header-static' : ''}`}>
      <Link to="/" className="cosmos-brand" aria-label={t('ASTROCARE home')}>
        <span className="cosmos-brand-icon">
          <Activity size={18} strokeWidth={2.2} />
        </span>
        <span>ASTROCARE</span>
      </Link>

      <nav className="cosmos-nav" aria-label={t('Main navigation')}>
        <Link to="/" aria-current={pathname === '/' ? 'page' : undefined}>
          {t('Home')}
        </Link>

        <Link to="/about" aria-current={aboutCurrent ? 'page' : undefined}>
          {t('About AstroCare')}
        </Link>

        <Link to="/team" aria-current={teamCurrent ? 'page' : undefined}>
          {t('AstroByteX')}
        </Link>
      </nav>

      <div className="cosmos-header-actions">
        <LanguageSwitcher className="cosmos-language-switcher" />
      </div>

      <button
        className={`cosmos-menu-toggle ${menuOpen ? 'is-open' : ''}`}
        type="button"
        aria-expanded={menuOpen}
        aria-label={t(menuOpen ? 'Close navigation' : 'Open navigation')}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        className={`cosmos-mobile-nav ${menuOpen ? 'is-open' : ''}`}
        aria-label={t('Main navigation')}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <Link to="/" onClick={() => setMenuOpen(false)}>
          {t('Home')}
        </Link>

        <Link to="/about" onClick={() => setMenuOpen(false)}>
          {t('About AstroCare')}
        </Link>

        <Link to="/team" onClick={() => setMenuOpen(false)}>
          {t('About AstroByteX')}
        </Link>

        <Link to="/login" onClick={() => setMenuOpen(false)}>
          {t('Open Dashboard')} <ArrowRight size={14} />
        </Link>
      </nav>
    </header>
  )
}
