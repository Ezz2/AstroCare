import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bone, ChartNoAxesCombined, FileText, HeartPulse, ShieldAlert } from 'lucide-react'
import SiteHeader from '../components/landing/SiteHeader'
import '../landing.css'

const PROJECT_FEATURES = [
  { icon: HeartPulse, title: 'Monitor measurements', text: 'Record and review health measurements such as heart rate, blood oxygen, temperature, glucose, and sleep.' },
  { icon: ChartNoAxesCombined, title: 'Follow changes over time', text: 'Use charts and history to compare readings and see how a measurement changes across days.' },
  { icon: ShieldAlert, title: 'Review unusual readings', text: 'Prototype alerts flag readings outside configured ranges or patterns that may need a closer look.' },
  { icon: FileText, title: 'Read health summaries', text: 'Reports gather measurements, ranges, changes, and unusual readings for a selected period.' },
  { icon: Bone, title: 'Explore a body-system map', text: 'A simplified, interactive 3D view links selected measurements to body systems for orientation.' },
]

export default function InfoPage() {
  const { pathname } = useLocation()
  const isTeam = pathname === '/team'

  return (
    <main className="cosmos-info-page">
      <div className="cosmos-info-stars" aria-hidden="true" />
      <SiteHeader staticPosition />

      <div className="cosmos-info-content">
        <Link to="/" className="cosmos-back-link"><ArrowLeft size={14} /> Back to the space scene</Link>

        {isTeam ? (
          <>
            <p className="cosmos-info-kicker">THE PEOPLE BEHIND THE PROJECT</p>
            <h1>AstroCare is built by <span>AstroByteX.</span></h1>
            <p className="cosmos-info-lead">
              AstroByteX developed AstroCare as a project for the NASA Space Apps Challenge 2026. The team set out to make astronaut health information easier to collect, follow, and explore during space missions.
            </p>
            <section className="cosmos-context-panel">
              <span className="cosmos-context-index">PROJECT CONTEXT</span>
              <h2>NASA Space Apps Challenge 2026</h2>
              <p>The challenge is where AstroCare was developed. AstroCare is an independent hackathon prototype—not an official NASA product, endorsement, or partnership.</p>
            </section>
            <p className="cosmos-info-disclaimer">No team member names, roles, or achievements are listed here because those details have not been provided.</p>
          </>
        ) : (
          <>
            <p className="cosmos-info-kicker">ABOUT ASTROCARE</p>
            <h1>One place to follow astronaut health during a mission.</h1>
            <p className="cosmos-info-lead">
              AstroCare is a space-health monitoring platform developed by AstroByteX. It brings health measurements, trends, alerts, reports, and a body-system view together to make astronaut health information easier to understand.
            </p>

            <section className="cosmos-info-section">
              <h2>Why monitor health in space?</h2>
              <p>Microgravity changes how the body works. Radiation exposure is higher than on Earth, and unusual light cycles and mission schedules can disrupt sleep. Following health measurements over time helps make changes easier to see.</p>
            </section>

            <section className="cosmos-info-section">
              <h2>What the prototype includes</h2>
              <div className="cosmos-feature-list">
                {PROJECT_FEATURES.map(({ icon: Icon, title, text }) => (
                  <article className="cosmos-feature" key={title}>
                    <span><Icon size={17} /></span>
                    <div><h3>{title}</h3><p>{text}</p></div>
                  </article>
                ))}
              </div>
            </section>

            <p className="cosmos-info-disclaimer">
              AstroCare is a hackathon prototype, not a certified medical device. It uses manually entered, simulated, and research data; it is not connected to live astronaut sensors and does not diagnose or treat medical conditions.
            </p>
          </>
        )}

        <Link to="/dashboard" className="cosmos-primary-action">Explore the dashboard <ArrowRight size={16} /></Link>
      </div>
    </main>
  )
}
