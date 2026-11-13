const STATUS_RANK = { normal: 0, watch: 1, alert: 2 }

export const STATUS_META = {
  normal: { label: 'In range', text: 'text-teal-400', dot: 'bg-teal-400', glow: '#2dd4bf' },
  watch: { label: 'Watch', text: 'text-amber-400', dot: 'bg-amber-400', glow: '#fbbf24' },
  alert: { label: 'Outside range', text: 'text-rose-400', dot: 'bg-rose-400', glow: '#fb7185' },
}

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
  return value.toFixed(vital.decimals ?? 0)
}
