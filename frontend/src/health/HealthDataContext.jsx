/* eslint-disable react/prop-types */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import * as api from '../lib/healthApi'

export const HealthDataContext = createContext(null)

export function HealthDataProvider({ children }) {
  const { user } = useAuth()
  const userId = user.id
  const [profile, setProfile] = useState(null)
  const [readings, setReadings] = useState([])
  const [dailyCheckIns, setDailyCheckIns] = useState([])
  const [status, setStatus] = useState('loading')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [nextProfile, nextReadings, nextDailyCheckIns] = await Promise.all([
          api.fetchProfile(userId),
          api.fetchReadings(),
          api.fetchDailyCheckIns(),
        ])
        if (!active) return
        setProfile(nextProfile)
        setReadings(nextReadings)
        setDailyCheckIns(nextDailyCheckIns)
        setStatus('ready')
      } catch {
        if (active) setStatus('error')
      }
    }

    load()
    return () => {
      active = false
    }
  }, [userId, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const addReadings = useCallback(async (rows) => {
    try {
      await api.insertReadings(rows)
      reload()
      return true
    } catch {
      return false
    }
  }, [reload])

  const removeReading = useCallback(async (id) => {
    try {
      await api.deleteReading(id)
      reload()
      return true
    } catch {
      return false
    }
  }, [reload])

  const removeSimulatedReadings = useCallback(async () => {
    try {
      await api.deleteSimulatedReadings()
      reload()
      return true
    } catch {
      return false
    }
  }, [reload])

  const saveProfile = useCallback(async (patch) => {
    try {
      const updated = await api.updateProfile(userId, patch)
      setProfile(updated)
      return true
    } catch {
      return false
    }
  }, [userId])

  const saveDailyCheckIn = useCallback(async (checkIn) => {
    try {
      const saved = await api.upsertDailyCheckIn(userId, checkIn)
      setDailyCheckIns((current) => [
        saved,
        ...current.filter((item) => item.check_in_date !== saved.check_in_date),
      ])
      return saved
    } catch {
      return null
    }
  }, [userId])

  const value = useMemo(
    () => ({
      profile,
      readings,
      dailyCheckIns,
      status,
      reload,
      addReadings,
      removeReading,
      removeSimulatedReadings,
      saveProfile,
      saveDailyCheckIn,
    }),
    [profile, readings, dailyCheckIns, status, reload, addReadings, removeReading, removeSimulatedReadings, saveProfile, saveDailyCheckIn],
  )

  return <HealthDataContext.Provider value={value}>{children}</HealthDataContext.Provider>
}
