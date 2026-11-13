
import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Bell,
  CircleAlert,
  TriangleAlert,
  Settings,
  ChevronRight,
  UserRound,
  ChevronDown,
  LogOut,
} from 'lucide-react'

import UserSettingsModal from '../settings/UserSettingsModal'
import Sidebar from './Sidebar'
import { NAV_ITEMS } from './navItems'
import { useHealthData } from '../../health/useHealthData'
import { useAuth } from '../../auth/useAuth'
import { buildAlerts, groupByVital } from '../../lib/analysis'
import { missionDayFor } from '../../lib/format'

export default function AppShell() {
  const [navOpen, setNavOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [userSettingsOpen, setUserSettingsOpen] = useState(false)

  const alertsMenuRef = useRef(null)
  const accountMenuRef = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()

  const { profile, readings } = useHealthData()
  const { signOut } = useAuth()

  const alerts = buildAlerts(groupByVital(readings))
  const alertCount = alerts.length

  const missionDay = missionDayFor(profile?.mission_start_date)

  const current = NAV_ITEMS.find((item) =>
    item.end
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to)
  )

  const fullName = profile?.full_name || 'Astronaut'
  const crewId = profile?.crew_id || 'Crew ID pending'

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        alertsMenuRef.current &&
        !alertsMenuRef.current.contains(event.target)
      ) {
        setAlertsOpen(false)
      }

      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const toggleAlerts = () => {
    setAlertsOpen((open) => !open)
    setAccountOpen(false)
  }

  const toggleAccount = () => {
    setAccountOpen((open) => !open)
    setAlertsOpen(false)
  }

  const openAllAlerts = () => {
    setAlertsOpen(false)
    navigate('/alerts')
  }

  const handleSignOut = () => {
    setAccountOpen(false)
    signOut()
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-space-800 lg:flex">
        <div className="w-full">
          <Sidebar
            alertCount={alertCount}
            onOpenUserSettings={() => setUserSettingsOpen(true)}
          />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-space-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-space-800 shadow-2xl transition-transform duration-300 lg:hidden ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          alertCount={alertCount}
          onNavigate={() => setNavOpen(false)}
          onOpenUserSettings={() => setUserSettingsOpen(true)}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-space-800 bg-space-950/90 px-4 backdrop-blur sm:px-6 lg:px-8">

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg border border-space-700 p-2 text-ink-300 transition hover:text-cyan-300 lg:hidden"
          >
            <Menu size={18} />
          </button>

          <h1 className="font-display text-lg font-semibold">
            {current?.label ?? 'AstroCare'}
          </h1>

          {/* Navbar Actions */}
          <div className="ml-auto flex items-center gap-3">

            {/* Alerts Menu */}
            <div ref={alertsMenuRef} className="relative">
              <button
                type="button"
                onClick={toggleAlerts}
                aria-label="Open notifications"
                aria-expanded={alertsOpen}
                className="relative rounded-xl border border-space-700 bg-space-850 p-2.5 text-ink-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
              >
                <Bell size={19} />

                {alertCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {alertCount > 99 ? '99+' : alertCount}
                  </span>
                )}
              </button>

              <div className={` fixed right-4 top-20 z-50 w-[calc(100vw-32px)] max-w-[340px] origin-top-right overflow-hidden rounded-2xl border border-space-700 bg-space-900 shadow-2xl transition-all duration-200 ease-out sm:absolute sm:right-0 sm:top-full sm:mt-3 sm:w-[340px] ${ alertsOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-2 scale-[0.98] opacity-0 pointer-events-none' } `} >
                  <div className="flex items-center justify-between border-b border-space-700 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-100">
                        Notifications
                      </p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {alertCount} current alerts
                      </p>
                    </div>

                    <Bell size={17} className="text-cyan-300" />
                  </div>

                  <div className="max-h-72 overflow-y-auto p-3">
                    {alerts.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {alerts.slice(0, 5).map((alert, index) => (
                          <div
                            key={alert.id ?? `${alert.title ?? 'alert'}-${index}`}
                            className={`flex gap-3 rounded-xl border p-3 ${ alert.severity === 'alert' ? 'border-rose-400/30 bg-rose-400/5' : 'border-amber-400/20 bg-amber-400/5' }`}
                          >
                            <div className={`mt-0.5 ${alert.severity === 'alert' ? 'text-rose-400' : 'text-amber-400'}`}>
                              {alert.severity === 'alert' ? (
                                <CircleAlert size={20} strokeWidth={2.2} />
                              ) : (
                                <TriangleAlert size={20} strokeWidth={2.2} />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-ink-100">
                                {alert.title ?? alert.message ?? 'Health alert'}
                              </p>

                              {alert.message && alert.title && (
                                <p className="mt-1 text-xs text-ink-400">
                                  {alert.message}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                          <Bell size={19} />
                        </div>

                        <p className="text-sm font-medium text-ink-100">
                          All clear
                        </p>

                        <p className="mt-1 text-xs text-ink-500">
                          No current alerts detected.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 border-t border-space-700 p-3">
                    

                    <button
                      type="button"
                      onClick={openAllAlerts}
                      className="flex w-full items-center justify-between rounded-lg bg-cyan-400/10 px-3 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/15"
                    >
                      See All Alerts
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
            </div>

            {/* Account Menu */}
            <div ref={accountMenuRef} className="relative lg:hidden">
              <button
                type="button"
                onClick={toggleAccount}
                aria-expanded={accountOpen}
                aria-label="Open account menu"
                className="flex items-center gap-2 rounded-xl border border-space-700 bg-space-850 py-1.5 pl-1.5 pr-2.5 transition hover:border-cyan-400/30 hover:bg-space-800"
              >
                {/* Avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-xs font-bold text-cyan-300">
                  {initials || <UserRound size={17} />}
                </div>

                {/* Name */}
                <span className="max-w-24 truncate text-xs font-medium text-ink-200 min-[400px]:max-w-32 sm:text-sm">
                  {fullName}
                </span>

                <ChevronDown
                  size={15}
                  className={`text-ink-400 transition-transform ${
                    accountOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Account Dropdown */}
                <div className={` absolute right-0 top-full z-50 mt-3 w-[min(290px,calc(100vw-32px))] origin-top-right overflow-hidden rounded-2xl border border-space-700 bg-space-900 shadow-2xl transition-all duration-200 ease-out ${ accountOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-2 scale-[0.98] opacity-0 pointer-events-none' } `} >

                  {/* Account Header */}
                  <div className="border-b border-space-700 bg-space-850/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-sm font-bold text-cyan-300">
                        {initials || <UserRound size={20} />}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-100">
                          {fullName}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-500">
                          Astronaut Account
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-ink-500">
                        Crew ID
                      </span>
                      <span className="text-xs font-medium text-ink-200">
                        {crewId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-ink-500">
                        Mission Day
                      </span>
                      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-[10px] font-medium text-cyan-300">
                        {missionDay !== null ? `Mission Day ${missionDay}` : 'Not set'}
                      </span>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="border-t border-space-700 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false)
                        setUserSettingsOpen(true)
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-300 transition hover:bg-space-800 hover:text-cyan-300"
                    >
                      <Settings size={16} />
                      <span className="flex-1 text-left">
                        View / Edit Profile
                      </span>
                      <ChevronRight size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-300 transition hover:bg-space-800 hover:text-rose-400"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {userSettingsOpen && (
        <UserSettingsModal
          onClose={() => setUserSettingsOpen(false)}
        />
      )}

    </div>
  )
}
