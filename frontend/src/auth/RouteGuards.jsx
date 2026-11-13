import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import LoadingScreen from '../components/ui/LoadingScreen'

export function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace />
  return children
}

export function RedirectIfAuthenticated({ children }) {
  const { session, recovering, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (session && !recovering) return <Navigate to="/dashboard" replace />
  return children
}
