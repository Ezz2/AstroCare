import { VITALS } from '../data/vitalCatalog'
import { formatValue, getMeasurementValidity, getStatus } from './health'
import { formatDateTime, toLocalDateInput } from './format'

const DAY_MS = 86400000
const HOUR_MS = 3600000
const MIN_HISTORY = 5
const UNUSUAL_Z = 2
const RECENT_HOURS = 72
const SIGNIFICANT_CHANGE_PERCENT = 3
const SEVERITY_RANK = { alert: 2, watch: 1 }

export const PERIODS = [
  { id: '7', label: '7 days', days: 7 },
  { id: '14', label: '14 days', days: 14 },
  { id: '30', label: '30 days', days: 30 },
  { id: 'all', label: 'All time', days: null },
]

export function groupByVital(readings) {
  const groups = Object.fromEntries(VITALS.map((vital) => [vital.id, []]))
  for (const reading of readings) groups[reading.vitalId]?.push(reading)
  for (const id of Object.keys(groups)) groups[id].sort((a, b) => a.time - b.time)
  return groups
}

export function mergeDailyCheckInSleep(readings, dailyCheckIns) {
  const sleepCheckIns = dailyCheckIns
    .filter((checkIn) => {
      const sleep = Number(checkIn.sleep_duration)
      return checkIn.check_in_date && Number.isFinite(sleep) && sleep > 0
    })
    .map((checkIn) => ({
      id: `daily-check-in-sleep-${checkIn.id ?? checkIn.check_in_date}`,
      vitalId: 'sleep',
      value: Number(checkIn.sleep_duration),
      time: Date.parse(`${checkIn.check_in_date}T12:00:00`),
      source: 'daily-check-in',
    }))

  const checkInDates = new Set(sleepCheckIns.map((reading) => toLocalDateInput(reading.time)))
  const existingReadings = readings.filter(
    (reading) =>
      reading.vitalId !== 'sleep' ||
      !checkInDates.has(toLocalDateInput(reading.time)),
  )

  return [...existingReadings, ...sleepCheckIns]
}

export function filterByPeriod(list, days, now = Date.now()) {
  if (!days) return list
  const since = now - days * DAY_MS
  return list.filter((reading) => reading.time >= since)
}

export function previousPeriod(list, days, now = Date.now()) {
  if (!days) return []
  return list.filter((reading) => reading.time >= now - 2 * days * DAY_MS && reading.time < now - days * DAY_MS)
}

export function statsFor(list) {
  if (!list.length) return null
  const values = list.map((reading) => reading.value)
  const latest = list.reduce((a, b) => (b.time > a.time ? b : a))
  return {
    count: list.length,
    mean: values.reduce((sum, v) => sum + v, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    latest: latest.value,
    latestTime: latest.time,
  }
}

export function percentChange(current, previous) {
  if (previous === null || previous === 0) return null
  return ((current - previous) / previous) * 100
}

export function currentStatuses(groups) {
  return VITALS.map((vital) => {
    const latest = groups[vital.id]
      .filter((reading) => getMeasurementValidity(vital, reading.value) === 'valid')
      .at(-1) ?? null
    return { vital, latest, status: latest ? getStatus(vital, latest.value) : null }
  })
}

const identity = (text) => text;

export function findUnusual(vital, list, t = identity) {
  const validList = list.filter(
    (reading) => getMeasurementValidity(vital, reading.value) === 'valid',
  )
  if (validList.length < MIN_HISTORY) return []
  const values = validList.map((reading) => reading.value)
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const sd = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length)
  if (sd === 0) return []

  return validList.flatMap((reading) => {
    const z = (reading.value - mean) / sd
    if (Math.abs(z) < UNUSUAL_Z) return []
    const direction = z > 0 ? 'higher' : 'lower'
    return [
      {
        reading,
        vital,
        reason: t(
          "{measurement} of {value} {unit} is {direction} than your usual average of {average} {unit}.",
          {
            measurement: t(vital.label),
            value: formatValue(vital, reading.value),
            unit: vital.unit,
            direction: t(direction),
            average: formatValue(vital, mean),
          },
        ),
      },
    ]
  })
}

export function buildAlerts(groups, now = Date.now(), t = identity) {
  const alerts = []
  for (const vital of VITALS) {
    if (vital.id === 'systolic' || vital.id === 'diastolic') continue
    const list = groups[vital.id]
    const latest = list.at(-1)
    if (!latest) continue

    if (getMeasurementValidity(vital, latest.value) === 'invalid') {
      alerts.push({
        id: `invalid-${vital.id}-${latest.id}`,
        vital,
        severity: 'watch',
        kind: 'invalid',
        value: latest.value,
        time: latest.time,
        title: t("Invalid {measurement} measurement", {
          measurement: t(vital.label).toLowerCase(),
        }),
        explanation: t(
          "{measurement} was recorded as {value} {unit}. This value cannot be interpreted reliably as a health measurement.",
          {
            measurement: t(vital.label),
            value: formatValue(vital, latest.value),
            unit: vital.unit,
          },
        ),
        meaning: t("This is most likely a sensor, unit, technique, or entry problem—not a health finding."),
        why: t(vital.education?.measuredBy ?? "Check how this measurement was taken."),
        action: t("Check the sensor, measurement method, unit, and entered value. Take a new valid measurement before using this result for health decisions."),
        education: vital.education,
      })
      continue
    }

    const personalBaseline = statsFor(list.slice(0, -1))
    const status = getStatus(vital, latest.value)
    if (status !== 'normal') {
      alerts.push({
        id: `range-${vital.id}`,
        vital,
        severity: status,
        kind: 'range',
        value: latest.value,
        time: latest.time,
        title: t("{measurement} is {comparison} its typical range", {
          measurement: t(vital.label),
          comparison: t(status === 'alert' ? 'outside' : 'near the edge of'),
        }),
        explanation: t(
          "Latest reading: {value} {unit}. Typical range: {min} to {max} {unit}{baseline}.",
          {
            value: formatValue(vital, latest.value),
            unit: vital.unit,
            min: vital.min,
            max: vital.max,
            baseline: personalBaseline
              ? t("; your recent average was {average} {unit}", {
                  average: formatValue(vital, personalBaseline.mean),
                  unit: vital.unit,
                })
              : "",
          },
        ),
        meaning: t(vital.education?.unusual),
        why: t(vital.education?.importance),
        action: t(vital.guidance),
        education: vital.education,
      })
    }

    for (const unusual of findUnusual(vital, list, t)) {
      if (unusual.reading.time < now - RECENT_HOURS * HOUR_MS) continue
      
      // Avoid showing the latest reading twice as both range and unusual.
      if (unusual.reading.id === latest.id && status !== 'normal') continue
      alerts.push({
        id: `unusual-${unusual.reading.id}`,
        vital,
        severity: 'watch',
        kind: 'unusual',
        value: unusual.reading.value,
        time: unusual.reading.time,
        title: t("Unusual {measurement} reading", {
          measurement: t(vital.label).toLowerCase(),
        }),
        explanation: unusual.reason,
        meaning: t(vital.education?.unusual),
        why: t(vital.education?.importance),
        action: t(vital.guidance),
        education: vital.education,
      })
    }
  }

  const systolic = groups.systolic.at(-1)
  const diastolic = groups.diastolic.at(-1)
  if (systolic || diastolic) {
    if (!systolic || !diastolic) {
      const available = systolic ?? diastolic
      alerts.push({
        id: `incomplete-blood-pressure-${available.id}`,
        vital: { id: 'bloodPressure', label: 'Blood pressure', unit: 'mmHg' },
        severity: 'watch',
        kind: 'invalid',
        value: available.value,
        time: available.time,
        title: t("Incomplete blood pressure measurement"),
        explanation: t("Only one blood-pressure number was recorded. A blood-pressure result needs both systolic and diastolic values from the same reading."),
        meaning: t("The top and bottom numbers describe different parts of the same pressure measurement and should be interpreted together."),
        why: t("Without both numbers, AstroCare cannot assess the blood-pressure result reliably."),
        action: t("Check the cuff and measurement technique, then record a new systolic and diastolic pair from the same reading."),
        education: VITALS.find((vital) => vital.id === 'systolic')?.education,
      })
    } else {
      const systolicVital = VITALS.find((vital) => vital.id === 'systolic')
      const diastolicVital = VITALS.find((vital) => vital.id === 'diastolic')
      const invalid = [
        [systolicVital, systolic],
        [diastolicVital, diastolic],
      ].find(([vital, reading]) => getMeasurementValidity(vital, reading.value) === 'invalid')

      if (invalid) {
        alerts.push({
          id: `invalid-blood-pressure-${systolic.id}-${diastolic.id}`,
          vital: { id: 'bloodPressure', label: 'Blood pressure', unit: 'mmHg' },
          severity: 'watch',
          kind: 'invalid',
          value: `${systolic.value}/${diastolic.value}`,
          time: Math.max(systolic.time, diastolic.time),
          title: t("Invalid blood pressure measurement"),
          explanation: t("Blood pressure needs both numbers from the same reading. One or both recorded values cannot be interpreted reliably."),
          meaning: t("Systolic is the top number and diastolic is the bottom number. Check both values before using this result."),
          why: t("A cuff, posture, movement, or entry error can affect either number."),
          action: t("Check the cuff and measurement technique, then record a new systolic and diastolic pair from the same reading."),
          education: systolicVital.education,
        })
      } else {
        const systolicStatus = getStatus(systolicVital, systolic.value)
        const diastolicStatus = getStatus(diastolicVital, diastolic.value)
        const severity =
          systolicStatus === 'alert' || diastolicStatus === 'alert'
            ? 'alert'
            : systolicStatus === 'watch' || diastolicStatus === 'watch'
              ? 'watch'
              : 'normal'
        if (severity !== 'normal') {
          alerts.push({
            id: `range-blood-pressure-${systolic.id}-${diastolic.id}`,
            vital: { id: 'bloodPressure', label: 'Blood pressure', unit: 'mmHg' },
            severity,
            kind: 'range',
            value: `${systolic.value}/${diastolic.value}`,
            time: Math.max(systolic.time, diastolic.time),
            title: t("Blood pressure is outside its typical range"),
            explanation: t("Latest pair: {systolic}/{diastolic} mmHg. Typical systolic range: {systolicMin} to {systolicMax}; typical diastolic range: {diastolicMin} to {diastolicMax}.", {
              systolic: formatValue(systolicVital, systolic.value),
              diastolic: formatValue(diastolicVital, diastolic.value),
              systolicMin: systolicVital.min,
              systolicMax: systolicVital.max,
              diastolicMin: diastolicVital.min,
              diastolicMax: diastolicVital.max,
            }),
            meaning: t("The top number shows pressure when the heart pumps; the bottom number shows pressure between beats. This result is outside one or both expected ranges."),
            why: t("Blood pressure describes pressure in your blood vessels. One result can be affected by posture, movement, stress, caffeine, or cuff fit."),
            action: t("Rest quietly, check the cuff and posture, and record a new pair from the same reading. Contact the onboard medical officer if the pattern persists or you feel unwell."),
            education: systolicVital.education,
          })
        }
      }
    }
  }

  return alerts.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] || b.time - a.time)
}

export function buildReport(readings, days, now = Date.now(), dailyCheckIns = [], t = identity) {
  const groups = groupByVital(readings)
  const rows = VITALS.map((vital) => {
    const validReadings = groups[vital.id].filter(
      (reading) => getMeasurementValidity(vital, reading.value) === 'valid',
    )
    const current = filterByPeriod(validReadings, days, now)
    const stats = statsFor(current)
    const previousStats = statsFor(previousPeriod(validReadings, days, now))
    return {
      vital,
      stats,
      change: stats && previousStats ? percentChange(stats.mean, previousStats.mean) : null,
      status: stats ? getStatus(vital, stats.latest) : null,
      unusual: findUnusual(vital, current, t),
      outOfRange: current.filter((reading) => getStatus(vital, reading.value) !== 'normal'),
    }
  })

  const observations = []
  for (const row of rows) {
    if (!row.stats) continue
    const { vital, stats, change, outOfRange } = row
    if (change !== null && Math.abs(change) >= SIGNIFICANT_CHANGE_PERCENT) {
      const direction = change > 0 ? 'up' : 'down'
      observations.push(
        t("{measurement} averaged {value} {unit}, {direction} {percent}% from the previous period.", {
          measurement: t(vital.label),
          value: formatValue(vital, stats.mean),
          unit: vital.unit,
          direction: t(direction),
          percent: Math.abs(change).toFixed(0),
        }),
      )
    }
    if (outOfRange.length) {
      observations.push(
        t("{count} {measurement} readings fell outside the typical range of {min} to {max} {unit}.", {
          count: outOfRange.length,
          measurement: t(vital.label).toLowerCase(),
          min: vital.min,
          max: vital.max,
          unit: vital.unit,
        }),
      )
    }
  }
  if (!observations.length && rows.some((row) => row.stats)) {
    observations.push(t('No significant changes or out-of-range readings in this period.'))
  }

  const unusual = rows
    .flatMap((row) => row.unusual)
    .sort((a, b) => b.reading.time - a.reading.time)
    .slice(0, 10)

  const flagged = rows.filter((row) => row.status && row.status !== 'normal' || row.unusual.length)
  const recommendations = [...new Set(flagged.map((row) => row.vital.guidance))]
  if (!recommendations.length) {
    recommendations.push(t('Keep your current routine and continue recording readings regularly.'))
  }

  const periodReadings = filterByPeriod(readings, days, now)
  const counts = { total: periodReadings.length, manual: 0, simulated: 0, research: 0 }
  for (const reading of periodReadings) counts[reading.source] = (counts[reading.source] ?? 0) + 1

  const moodSince = days ? toLocalDateInput(now - days * DAY_MS) : null
  const moodHistory = dailyCheckIns
    .filter((checkIn) => !moodSince || checkIn.check_in_date >= moodSince)
    .sort((a, b) => b.check_in_date.localeCompare(a.check_in_date))
  const moodCounts = {}
  for (const checkIn of moodHistory) {
    if (checkIn.mood) moodCounts[checkIn.mood] = (moodCounts[checkIn.mood] ?? 0) + 1
  }

  return {
    rows,
    observations,
    unusual,
    recommendations,
    counts,
    mood: { history: moodHistory, counts: moodCounts },
  }
}

function dayKey(time) {
  const d = new Date(time)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function dailyMeans(list) {
  const byDay = new Map()
  for (const reading of list) {
    const key = dayKey(reading.time)
    const entry = byDay.get(key) ?? { sum: 0, count: 0 }
    entry.sum += reading.value
    entry.count += 1
    byDay.set(key, entry)
  }
  return byDay
}

export function pairedDailyValues(groups, xId, yId) {
  const xs = dailyMeans(groups[xId])
  const ys = dailyMeans(groups[yId])
  const pairs = []
  for (const [key, x] of xs) {
    const y = ys.get(key)
    if (y) pairs.push({ x: x.sum / x.count, y: y.sum / y.count })
  }
  return pairs
}

export function pearson(pairs) {
  if (pairs.length < 3) return null
  const n = pairs.length
  const mx = pairs.reduce((s, p) => s + p.x, 0) / n
  const my = pairs.reduce((s, p) => s + p.y, 0) / n
  let num = 0
  let dx = 0
  let dy = 0
  for (const { x, y } of pairs) {
    num += (x - mx) * (y - my)
    dx += (x - mx) ** 2
    dy += (y - my) ** 2
  }
  if (dx === 0 || dy === 0) return null
  return num / Math.sqrt(dx * dy)
}

export function describeCorrelation(r) {
  if (r === null) return 'Not enough shared days yet to measure a relationship.'
  const strength = Math.abs(r) < 0.3 ? 'Weak' : Math.abs(r) < 0.6 ? 'Moderate' : 'Strong'
  const direction = r >= 0 ? 'positive' : 'negative'
  return `${strength} ${direction} relationship across shared days. Correlation does not prove cause.`
}

export function trendPoints(list, language) {
  return list.map((reading) => ({
    label: formatDateTime(reading.time, language),
    value: reading.value,
  }))
}
