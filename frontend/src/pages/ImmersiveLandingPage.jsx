/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, HeartPulse, Moon, Wind } from 'lucide-react'
import SiteHeader from '../components/landing/SiteHeader'
import useLanguage from '../i18n/useLanguage'
import '../landing.css'

const PHOTO_PATH = '/images/astronaut-eva.jpg'

function DataSignal({ className, icon: Icon, label, value, unit, detail }) {
  return (
    <div className={`cosmos-signal ${className}`}>
      <div className="cosmos-signal-top"><span><Icon size={13} /> {label}</span><span className="signal-dot" /></div>
      <div className="cosmos-signal-reading">{value}<small>{unit}</small></div>
      <div className="cosmos-signal-detail">{detail}</div>
    </div>
  )
}

export default function ImmersiveLandingPage() {
  const { t } = useLanguage()
  const sceneRef = useRef(null)

  useEffect(() => {
    const scene = sceneRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!scene || reduceMotion.matches) return undefined

    const onPointerMove = (event) => {
      const bounds = scene.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width - 0.5
      const y = (event.clientY - bounds.top) / bounds.height - 0.5
      scene.style.setProperty('--pointer-x', `${x.toFixed(3)}`)
      scene.style.setProperty('--pointer-y', `${y.toFixed(3)}`)
    }

    const onPointerLeave = () => {
      scene.style.setProperty('--pointer-x', '0')
      scene.style.setProperty('--pointer-y', '0')
    }

    scene.addEventListener('pointermove', onPointerMove)
    scene.addEventListener('pointerleave', onPointerLeave)
    return () => {
      scene.removeEventListener('pointermove', onPointerMove)
      scene.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <main className="cosmos-home" ref={sceneRef}>
      <div className="cosmos-aurora" aria-hidden="true" />
      <div className="cosmos-stars cosmos-stars-far" aria-hidden="true" />
      <div className="cosmos-stars cosmos-stars-near" aria-hidden="true" />
      <div className="cosmos-planet-glow" aria-hidden="true" />
      <div className="cosmos-wordmark-background" aria-hidden="true">ASTROCARE</div>
      <img
        className="cosmos-astronaut-photo"
        src={PHOTO_PATH}
        alt={t("Astronaut Ron Garan secured by a tether during a spacewalk above Earth")}
      />
      <div className="cosmos-photo-shade" aria-hidden="true" />

      <SiteHeader />

      <section className="cosmos-intro" aria-labelledby="hero-title">
        <p className="cosmos-kicker"><span /> {t("SPACE HEALTH, MADE HUMAN")}</p>
        <h1 id="hero-title">{t("Keeping Astronauts Healthy")}, <span>{t("Beyond Earth.")}</span></h1>
        <p className="cosmos-description">
          {t("AstroCare brings astronauts’ health measurements, changes, and body-system views together in one space-health platform.")}
        </p>
        <Link to="/dashboard" className="cosmos-primary-action">{t("Explore AstroCare")} <ArrowRight size={16} /></Link>
        <p className="cosmos-project-line">{t("Developed by")} <strong>AstroByteX</strong><span /> NASA Space Apps Challenge 2026</p>
      </section>

      <div className="cosmos-measurement-note"><span className="signal-dot" /> {t("ILLUSTRATIVE DEMO MEASUREMENTS — NOT LIVE ASTRONAUT DATA")}</div>
      <DataSignal
        className="cosmos-signal-heart"
        icon={HeartPulse}
        label={t("Heart rate")}
        value="72"
        unit=" bpm"
        detail={t("Example measurement")}
      />
      <DataSignal
        className="cosmos-signal-oxygen"
        icon={Wind}
        label={t("Blood oxygen")}
        value="98"
        unit="%"
        detail={t("Example measurement")}
      />
      <DataSignal
        className="cosmos-signal-sleep"
        icon={Moon}
        label={t("Sleep")}
        value="7.4"
        unit={` ${t("hrs")}`}
        detail={t("Example measurement")}
      />

      <div className="cosmos-scene-caption">
        <span>{t("ASTRONAUT IN LOW EARTH ORBIT")}</span>
        <span className="cosmos-photo-credit">NASA / Mike Fossum</span>
      </div>
      <div className="cosmos-coordinate" aria-hidden="true">28° 32′ N&nbsp; / &nbsp;LOW EARTH ORBIT</div>
    </main>
  )
}
