const STATUS_RANK = { normal: 0, watch: 1, alert: 2 }

export const STATUS_META = {
  normal: { label: 'In range', text: 'text-teal-400', dot: 'bg-teal-400', glow: '#2dd4bf' },
  watch: { label: 'Watch', text: 'text-amber-400', dot: 'bg-amber-400', glow: '#fbbf24' },
  alert: { label: 'Outside range', text: 'text-rose-400', dot: 'bg-rose-400', glow: '#fb7185' },
}

const INVALID_READING_MESSAGE = 'This value cannot be interpreted reliably as a health measurement.'

// These are input-integrity guards, not clinical thresholds. SpO2 is a
// percentage, sleep is a daily duration, and temperature uses a conservative
// human body-measurement range so obvious sensor or entry errors are not
// interpreted as medical findings.

export function getMeasurementValidity(vital, value) {
  if (!Number.isFinite(value)) return 'invalid'

  const valid =
    vital.id === 'spo2'
      ? value >= 0 && value <= 100
      : vital.id === 'sleep'
        ? value >= 0 && value <= 24
        : vital.id === 'temperature'
          ? value >= 25 && value <= 45
          : ['heartRate', 'systolic', 'diastolic', 'glucose'].includes(vital.id)
            ? value > 0
            : true

  return valid ? 'valid' : 'invalid'
}

export { INVALID_READING_MESSAGE }

export function getStatus(vital, value) {
  if (value >= vital.min && value <= vital.max) return 'normal'
  const span = vital.max - vital.min
  const distance = value < vital.min ? vital.min - value : value - vital.max
  return distance <= span * 0.25 ? 'watch' : 'alert'
}

export function getWorstStatus(statuses) {
  return statuses.reduce(
    (worst, status) => (STATUS_RANK[status] > STATUS_RANK[worst] ? status : worst),
    'normal',
  )
}

export function formatValue(vital, value) {
  const language =
    typeof document === "undefined" ? "en" : document.documentElement.lang;
  const locale = { en: "en-US", ar: "ar", de: "de-DE" }[language] ?? "en-US";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: vital.decimals ?? 0,
    maximumFractionDigits: vital.decimals ?? 0,
  }).format(value)
}
