import { useMemo } from 'react'
import { useHealthData } from './useHealthData'
import { buildAlerts, currentStatuses, groupByVital } from '../lib/analysis'
import { getWorstStatus } from '../lib/health'

export function useHealthInsights() {
  const { readings } = useHealthData()

  return useMemo(() => {
    const groups = groupByVital(readings)
    const statuses = currentStatuses(groups)
    const alerts = buildAlerts(groups)
    const overall = getWorstStatus(statuses.map((item) => item.status).filter(Boolean))

    const statusBySystem = {}
    for (const { vital, status } of statuses) {
      if (!status) continue
      statusBySystem[vital.systemId] = getWorstStatus([statusBySystem[vital.systemId] ?? 'normal', status])
    }

    return { groups, statuses, alerts, overall, statusBySystem }
  }, [readings])
}
