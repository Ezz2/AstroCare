
import { useState } from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { VITALS, VITAL_BY_ID } from '../../data/vitalCatalog'
import {
  describeCorrelation,
  pairedDailyValues,
  pearson,
} from '../../lib/analysis'
import { LABEL_CLASS } from '../ui/fieldStyles'
import CustomSelect from '../ui/CustomSelect'

const AXIS_TICK = { fill: '#7d93b3', fontSize: 11 }

const VITAL_OPTIONS = VITALS.map((vital) => ({
  value: vital.id,
  label: vital.label,
}))

export default function RelationshipExplorer({ groups }) {
  const [xId, setXId] = useState('heartRate')
  const [yId, setYId] = useState('systolic')

  const xVital = VITAL_BY_ID[xId]
  const yVital = VITAL_BY_ID[yId]

  const pairs = pairedDailyValues(groups, xId, yId)
  const r = pearson(pairs)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <label htmlFor="rel-x" className={LABEL_CLASS}>
            Compare
          </label>

          <CustomSelect
            id="rel-x"
            value={xId}
            onChange={setXId}
            options={VITAL_OPTIONS}
            ariaLabel="Compare measurement"
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="rel-y" className={LABEL_CLASS}>
            With
          </label>

          <CustomSelect
            id="rel-y"
            value={yId}
            onChange={setYId}
            options={VITAL_OPTIONS}
            ariaLabel="Compare with measurement"
          />
        </div>
      </div>

      {xId === yId ? (
        <p className="text-sm text-ink-500">
          Choose two different measurements to compare.
        </p>
      ) : (
        <>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 8, right: 12, left: -8, bottom: 0 }}
              >
                <CartesianGrid stroke="#17294a" />

                <XAxis
                  type="number"
                  dataKey="x"
                  name={xVital.label}
                  unit={` ${xVital.unit}`}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />

                <YAxis
                  type="number"
                  dataKey="y"
                  name={yVital.label}
                  unit={` ${yVital.unit}`}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  domain={['auto', 'auto']}
                />

                <Tooltip
                  cursor={{ stroke: '#34507f' }}
                  contentStyle={{
                    background: '#08111f',
                    border: '1px solid #22385f',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />

                <Scatter
                  data={pairs}
                  fill="#22d3ee"
                  fillOpacity={0.75}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <p className="text-sm text-ink-300">
            {pairs.length} shared day{pairs.length === 1 ? '' : 's'}.{' '}
            {describeCorrelation(r)}
          </p>
        </>
      )}
    </div>
  )
}
