import { useContext } from 'react'
import { HealthDataContext } from './HealthDataContext'

export function useHealthData() {
  const context = useContext(HealthDataContext)
  if (!context) throw new Error('useHealthData must be used inside HealthDataProvider')
  return context
}
