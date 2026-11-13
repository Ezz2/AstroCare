import { VITALS } from '../data/vitalCatalog'
import { formatValue, getStatus } from './health'
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
    const latest = groups[vital.id].at(-1) ?? null
    return { vital, latest, status: latest ? getStatus(vital, latest.value) : null }
  })
}

export function findUnusual(vital, list) {
  if (list.length < MIN_HISTORY) return []
  const values = list.map((reading) => reading.value)
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const sd = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length)
  if (sd === 0) return []

  return list.flatMap((reading) => {
    const z = (reading.value - mean) / sd
    if (Math.abs(z) < UNUSUAL_Z) return []
    const direction = z > 0 ? 'higher' : 'lower'
    return [
      {
        reading,
        vital,
        reason: `${vital.label} of ${formatValue(vital, reading.value)} ${vital.unit} is ${direction} than your usual average of ${formatValue(vital, mean)} ${vital.unit}.`,
      },
    ]
  })
}

export function buildAlerts(groups, now = Date.now()) {
  const alerts = []
  for (const vital of VITALS) {
    const list = groups[vital.id]
    const latest = list.at(-1)
    if (!latest) continue

    const status = getStatus(vital, latest.value)
    if (status !== 'normal') {
      alerts.push({
        id: `range-${vital.id}`,
        vital,
        severity: status,
        kind: 'range',
        value: latest.value,
        time: latest.time,
        title: `${vital.label} is ${status === 'alert' ? 'outside' : 'near the edge of'} its typical range`,
        explanation: `Latest reading of ${formatValue(vital, latest.value)} ${vital.unit}. Typical range is ${vital.min} to ${vital.max} ${vital.unit}.`,
        action: vital.guidance,
      })
    }

    for (const unusual of findUnusual(vital, list)) {
      if (unusual.reading.time < now - RECENT_HOURS * HOUR_MS) continue
      alerts.push({
        id: `unusual-${unusual.reading.id}`,
        vital,
        severity: 'watch',
        kind: 'unusual',
        value: unusual.reading.value,
        time: unusual.reading.time,
        title: `Unusual ${vital.label.toLowerCase()} reading`,
        explanation: unusual.reason,
        action: vital.guidance,
      })
    }
  }
  return alerts.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] || b.time - a.time)
}

export function buildReport(readings, days, now = Date.now(), dailyCheckIns = []) {
  const groups = groupByVital(readings)
  const rows = VITALS.map((vital) => {
    const current = filterByPeriod(groups[vital.id], days, now)
    const stats = statsFor(current)
    const previousStats = statsFor(previousPeriod(groups[vital.id], days, now))
    return {
      vital,
      stats,
      change: stats && previousStats ? percentChange(stats.mean, previousStats.mean) : null,
      status: stats ? getStatus(vital, stats.latest) : null,
      unusual: findUnusual(vital, current),
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
        `${vital.label} averaged ${formatValue(vital, stats.mean)} ${vital.unit}, ${direction} ${Math.abs(change).toFixed(0)}% from the previous period.`,
      )
    }
    if (outOfRange.length) {
      observations.push(
        `${outOfRange.length} ${vital.label.toLowerCase()} reading${outOfRange.length > 1 ? 's' : ''} fell outside the typical range of ${vital.min} to ${vital.max} ${vital.unit}.`,
      )
    }
  }
  if (!observations.length && rows.some((row) => row.stats)) {
    observations.push('No significant changes or out-of-range readings in this period.')
  }

  const unusual = rows
    .flatMap((row) => row.unusual)
    .sort((a, b) => b.reading.time - a.reading.time)
    .slice(0, 10)

  const flagged = rows.filter((row) => row.status && row.status !== 'normal' || row.unusual.length)
  const recommendations = [...new Set(flagged.map((row) => row.vital.guidance))]
  if (!recommendations.length) {
    recommendations.push('Keep your current routine and continue recording readings regularly.')
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

export function trendPoints(list) {
  return list.map((reading) => ({
    label: formatDateTime(reading.time),
    value: reading.value,
  }))
}
