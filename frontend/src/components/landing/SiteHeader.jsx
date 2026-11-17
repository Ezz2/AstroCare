
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Activity, ArrowRight } from 'lucide-react'
import LanguageSwitcher from '../LanguageSwitcher'
import useLanguage from '../../i18n/useLanguage'

export default function SiteHeader({ staticPosition = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef(null)
  const mobileNavRef = useRef(null)  
  const { pathname } = useLocation()
  const { t } = useLanguage()

  const aboutCurrent = pathname === '/about'
  const teamCurrent = pathname === '/team'

  useEffect(() => {
    function handleOutsideClick(event) {
      const clickedInsideMenu =
        mobileNavRef.current?.contains(event.target)

      const clickedToggle = event.target.closest('.cosmos-menu-toggle')

      if (!clickedInsideMenu && !clickedToggle) {
        setMenuOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick, true)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick, true)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <header ref={headerRef} className={`cosmos-header${staticPosition ? ' cosmos-header-static' : ''}`} >
      <Link to="/" className="cosmos-brand" aria-label={t('ASTROCARE home')}>
        <span className="cosmos-brand-icon">
          <img
            src="/favicon.png"
            alt="AstroCare"
            className="h-full w-full rounded-lg object-contain"
          />
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
        <LanguageSwitcher className="cosmos-language-switcher" menuPosition="bottom" />
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
        ref={mobileNavRef}
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
