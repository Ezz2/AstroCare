import { useMemo } from 'react'
import { useHealthData } from './useHealthData'
import {
  buildAlerts,
  currentStatuses,
  groupByVital,
  mergeDailyCheckInSleep,
} from '../lib/analysis'
import { getWorstStatus } from '../lib/health'
import { assessHealth } from '../lib/assessment'

export function useHealthInsights() {
  const { readings, dailyCheckIns } = useHealthData()

  return useMemo(() => {
    const groups = groupByVital(mergeDailyCheckInSleep(readings, dailyCheckIns))
    const statuses = currentStatuses(groups)
    const alerts = buildAlerts(groups)
    const overall = getWorstStatus(statuses.map((item) => item.status).filter(Boolean))

    const statusBySystem = {}
    for (const { vital, status } of statuses) {
      if (!status) continue
      statusBySystem[vital.systemId] = getWorstStatus([statusBySystem[vital.systemId] ?? 'normal', status])
    }

    const assessment = assessHealth({ readings, dailyCheckIns })

    return { groups, statuses, alerts, overall, statusBySystem, assessment }
  }, [readings, dailyCheckIns])
}
