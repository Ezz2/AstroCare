const DAY_MS = 86400000

function currentLocale() {
  const language =
    typeof document === "undefined" ? "en" : document.documentElement.lang;
  return { en: "en-US", ar: "ar", de: "de-DE" }[language] ?? "en-US";
}

export function formatDateTime(ms) {
  return new Date(ms).toLocaleString(currentLocale(), {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(ms) {
  return new Date(ms).toLocaleDateString(currentLocale(), { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatPercent(value) {
  return new Intl.NumberFormat(currentLocale(), {
    style: "percent",
    maximumFractionDigits: 0,
    signDisplay: "exceptZero",
  }).format(value / 100)
}

export function toLocalDateInput(ms) {
  const d = new Date(ms)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function toLocalTimeInput(ms) {
  const d = new Date(ms)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function missionDayFor(startDate) {
  if (!startDate) return null
  const [year, month, day] = startDate.split('-').map(Number)

  if (!year || !month || !day) return null

  const start = Date.UTC(year, month - 1, day)

  const today = new Date()
  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  const elapsedDays = Math.floor((todayUTC - start) / DAY_MS)

  return Math.max(0, elapsedDays + 1)
}

export function daysAgo(ms) {
  return Math.floor((Date.now() - ms) / DAY_MS)
}
