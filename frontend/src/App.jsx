import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RedirectIfAuthenticated, RequireAuth } from './auth/RouteGuards'
import { HealthDataProvider } from './health/HealthDataContext'

const AppShell = lazy(() => import('./components/layout/AppShell'))
const LandingPage = lazy(() => import('./pages/ImmersiveLandingPage'))
const InfoPage = lazy(() => import('./pages/InfoPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const SignUpPage = lazy(() => import('./pages/auth/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const OverviewPage = lazy(() => import('./pages/OverviewPage'))
const MonitoringPage = lazy(() => import('./pages/MonitoringPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const AlertsPage = lazy(() => import('./pages/AlertsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="min-h-screen bg-space-950" />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<InfoPage />} />
          <Route path="/team" element={<InfoPage />} />
          <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
          <Route path="/signup" element={<RedirectIfAuthenticated><SignUpPage /></RedirectIfAuthenticated>} />
          <Route path="/forgot-password" element={<RedirectIfAuthenticated><ForgotPasswordPage /></RedirectIfAuthenticated>} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            element={
              <RequireAuth>
                <HealthDataProvider>
                  <AppShell />
                </HealthDataProvider>
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<OverviewPage />} />
            <Route path="monitoring" element={<MonitoringPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
