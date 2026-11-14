/* eslint-disable react/prop-types */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import * as api from '../lib/healthApi'

export const HealthDataContext = createContext(null)
const DAY_MS = 86400000

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
      const latestSubmission = dailyCheckIns
        .map((item) => Date.parse(item.submitted_at ?? item.created_at ?? ''))
        .filter(Number.isFinite)
        .sort((a, b) => b - a)[0]
      if (latestSubmission && Date.now() - latestSubmission < DAY_MS) {
        return null
      }
      const saved = await api.insertDailyCheckIn(userId, checkIn)
      setDailyCheckIns((current) => [
        saved,
        ...current,
      ])
      return saved
    } catch {
      return null
    }
  }, [dailyCheckIns, userId])

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
