import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const AXIS_TICK = { fill: '#7d93b3', fontSize: 11 }

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-xs shadow-lg">
      <p className="text-ink-300">{label}</p>
      <p className="font-semibold text-ink-100">
        {payload[0].value} {unit}
      </p>
    </div>
  )
}

export default function VitalTrendChart({ vital, points, height = 'h-72' }) {
  const gradientId = `trend-fill-${vital.id}`

  return (
    <div className={`${height} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#17294a" vertical={false} />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis domain={['auto', 'auto']} tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} />
          <Tooltip content={<ChartTooltip unit={vital.unit} />} cursor={{ stroke: '#34507f' }} />
          <ReferenceLine y={vital.min} stroke="#2dd4bf" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={vital.max} stroke="#2dd4bf" strokeDasharray="4 4" strokeOpacity={0.6} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#22d3ee"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
