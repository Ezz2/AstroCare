import { CONTRIBUTING_FACTORS } from "../data/moods";
import {
  filterByPeriod,
  groupByVital,
  mergeDailyCheckInSleep,
  previousPeriod,
  statsFor,
} from "./analysis";
import { formatValue, getStatus, getWorstStatus } from "./health";
import { toLocalDateInput } from "./format";
import { VITALS, VITAL_BY_ID } from "../data/vitalCatalog";

const DAY_MS = 86400000;
const RECENT_DAYS = 7;
const BASELINE_DAYS = 30;
const MIN_TREND_READINGS = 2;

const PRIORITY_RANK = { informational: 0, low: 1, medium: 2, high: 3 };
const factorLabels = Object.fromEntries(
  CONTRIBUTING_FACTORS.map((factor) => [factor.id, factor.label]),
);

function latestCheckIn(dailyCheckIns) {
  return (
    dailyCheckIns
      .filter((checkIn) => checkIn?.check_in_date)
      .slice()
      .sort((a, b) => b.check_in_date.localeCompare(a.check_in_date))[0] ?? null
  );
}

function recentCheckIns(dailyCheckIns, now) {
  const since = toLocalDateInput(now - BASELINE_DAYS * DAY_MS);
  return dailyCheckIns.filter((checkIn) => checkIn.check_in_date >= since);
}

function recommendation({ id, priority, title, what, why, action, time }) {
  return { id, priority, title, what, why, action, time };
}

function trendFor(vital, current, previous) {
  if (
    current.length < MIN_TREND_READINGS ||
    previous.length < MIN_TREND_READINGS
  ) {
    return "steady";
  }
  const currentStats = statsFor(current);
  const previousStats = statsFor(previous);
  if (!currentStats || !previousStats || previousStats.mean === 0) {
    return "steady";
  }
  const change =
    ((currentStats.mean - previousStats.mean) / previousStats.mean) * 100;
  const meaningfulChange = Math.max(
    3,
    ((vital.max - vital.min) / vital.min) * 100,
  );
  if (change >= meaningfulChange) return "rising";
  if (change <= -meaningfulChange) return "falling";
  return "steady";
}

function rangeDistance(vital, value) {
  if (value >= vital.min && value <= vital.max) return 0;
  return value < vital.min ? vital.min - value : value - vital.max;
}

function isImproving(vital, current, previous) {
  if (
    current.length < MIN_TREND_READINGS ||
    previous.length < MIN_TREND_READINGS
  ) {
    return false;
  }
  const currentStats = statsFor(current);
  const previousStats = statsFor(previous);
  if (!currentStats || !previousStats) return false;
  return (
    rangeDistance(vital, previousStats.mean) >
    rangeDistance(vital, currentStats.mean)
  );
}

function buildVitalStatus(vital, readings, now) {
  const current = filterByPeriod(readings, RECENT_DAYS, now);
  const previous = previousPeriod(readings, RECENT_DAYS, now);
  const latest = readings.at(-1) ?? null;
  const recentOutOfRange = current.filter(
    (reading) => getStatus(vital, reading.value) !== "normal",
  );

  return {
    vital,
    latest,
    status: latest ? getStatus(vital, latest.value) : null,
    trend: trendFor(vital, current, previous),
    improving: isImproving(vital, current, previous),
    repeatedOutOfRange: recentOutOfRange.length >= 2,
    current,
  };
}

function buildPhysiologicalGroups(statuses) {
  const bloodPressure = statuses.filter(({ vital }) =>
    ["systolic", "diastolic"].includes(vital.id),
  );
  const otherGroups = statuses
    .filter(({ vital }) => !["systolic", "diastolic"].includes(vital.id))
    .map((item) => ({
      id: item.vital.id,
      label: item.vital.label,
      items: [item],
      latestStatus: item.status,
    }));

  if (bloodPressure.some((item) => item.latest)) {
    otherGroups.push({
      id: "bloodPressure",
      label: "Blood pressure",
      items: bloodPressure,
      latestStatus: getWorstStatus(
        bloodPressure.map((item) => item.status).filter(Boolean),
      ),
    });
  }

  return otherGroups.filter((group) => group.items.some((item) => item.latest));
}

function buildContextPatterns(dailyCheckIns, now) {
  const recent = recentCheckIns(dailyCheckIns, now);
  const sleepEntries = recent.filter((checkIn) =>
    Number.isFinite(Number(checkIn.sleep_duration)),
  );
  const shortSleep = sleepEntries.filter(
    (checkIn) => Number(checkIn.sleep_duration) < VITAL_BY_ID.sleep.min,
  );
  const concernMoods = recent.filter((checkIn) =>
    ["anxious", "low", "irritated", "exhausted"].includes(checkIn.mood),
  );
  const exhausted = recent.filter((checkIn) => checkIn.mood === "exhausted");
  const poorSleep = recent.filter((checkIn) =>
    (checkIn.contributing_factors ?? []).includes("poor_sleep"),
  );
  const factors = [
    ...new Set(recent.flatMap((checkIn) => checkIn.contributing_factors ?? [])),
  ];

  return {
    recent,
    shortSleep,
    concernMoods,
    exhausted,
    poorSleep,
    factors,
    recoveryPattern:
      shortSleep.length >= 2 &&
      (exhausted.length > 0 || poorSleep.length > 0 || concernMoods.length >= 2),
    moodPattern: concernMoods.length >= 2,
  };
}

function stableInsight(statuses, groups, dailyCheckIns, now) {
  const recentReadings = VITALS.flatMap((vital) =>
    filterByPeriod(groups[vital.id], RECENT_DAYS, now),
  );
  const recentCheckIn = latestCheckIn(dailyCheckIns);
  const hasPositiveContext = recentCheckIn?.contributing_factors?.some((id) =>
    ["great_day", "good_rest", "crew_time", "family_contact"].includes(id),
  );
  const allInRange =
    recentReadings.length > 0 &&
    statuses.every(({ latest, status }) => !latest || status === "normal");

  if (!allInRange) return null;
  if (statuses.filter((item) => item.improving).length >= 2) {
    return {
      title: "Your recent health pattern is improving",
      text: "Several recorded indicators are moving closer to their usual ranges. Keep the routines and monitoring schedule that are helping.",
    };
  }
  if (recentCheckIn?.mood === "great" || recentCheckIn?.mood === "good") {
    return {
      title: "Your recent pattern looks steady",
      text: `Your recorded readings are within their usual ranges${hasPositiveContext ? " and your latest check-in includes positive day context" : ""}. Keep the routines that are working for you.`,
    };
  }
  if (recentReadings.length >= 5) {
    return {
      title: "Your recent readings are stable",
      text: "The readings recorded this week are within their usual ranges. Continue your normal monitoring routine and keep checking in.",
    };
  }
  return null;
}

function classifyHealth({ statuses, physiologicalGroups, contextPatterns, criticalAlerts }) {
  if (criticalAlerts.length > 0) return "critical";

  const availableCount = statuses.filter((item) => item.latest).length;
  if (availableCount === 0 && contextPatterns.recent.length === 0) {
    return "insufficient";
  }

  const abnormalGroups = physiologicalGroups.filter(
    (group) => group.latestStatus && group.latestStatus !== "normal",
  );
  const significantGroups = abnormalGroups.filter(
    (group) => group.latestStatus === "alert",
  );
  const persistentGroups = abnormalGroups.filter((group) =>
    group.items.some((item) => item.repeatedOutOfRange),
  );

  if (
    significantGroups.length >= 2 ||
    (abnormalGroups.length >= 3 &&
      (significantGroups.length >= 1 || persistentGroups.length >= 2)) ||
    (significantGroups.length >= 1 && persistentGroups.length >= 2)
  ) {
    return "concerning";
  }
  if (
    abnormalGroups.length > 0 ||
    contextPatterns.recoveryPattern ||
    contextPatterns.moodPattern
  ) {
    return "needs_attention";
  }
  return "stable";
}

function buildHighPriorityWarnings(physiologicalGroups) {
  const abnormalGroups = physiologicalGroups.filter(
    (group) => group.latestStatus && group.latestStatus !== "normal",
  );
  if (abnormalGroups.length < 2) return [];

  const significantCount = abnormalGroups.filter(
    (group) => group.latestStatus === "alert",
  ).length;
  const measurements = abnormalGroups
    .flatMap((group) =>
      group.items
        .filter((item) => item.latest)
        .map(
          (item) =>
            `${item.vital.label}: ${formatValue(item.vital, item.latest.value)} ${item.vital.unit}`,
        ),
    )
    .join(" · ");
  const time = abnormalGroups
    .flatMap((group) => group.items)
    .map((item) => item.latest?.time)
    .filter(Boolean)
    .sort()
    .at(-1);
  const id = `multi-group-warning-${abnormalGroups
    .map((group) => `${group.id}-${group.latestStatus}`)
    .join("_")}-${time ?? "unknown"}`;

  return [
    {
      id,
      priority: "high",
      severity: "warning",
      kind: "multiple-indicators",
      title: "Multiple health indicators need prompt review",
      what: `${measurements}.`,
      why: `Several distinct health groups are outside their expected ranges${significantCount > 0 ? `, including ${significantCount} significant result${significantCount === 1 ? "" : "s"}` : ""}. This is a high-priority warning for review, not a diagnosis or emergency classification.`,
      action:
        "Repeat the measurements while rested and follow your onboard monitoring protocol. Contact the onboard medical officer promptly if the pattern persists or worsens.",
      time,
    },
  ];
}

function buildRecommendations({
  physiologicalGroups,
  contextPatterns,
  healthStatus,
  latest,
  insight,
}) {
  const recommendations = [];
  const {
    shortSleep,
    concernMoods,
    factors,
    recoveryPattern,
    moodPattern,
  } = contextPatterns;

  if (recoveryPattern) {
    const context = factors
      .filter((id) => ["poor_sleep", "busy_schedule", "mission_tasks"].includes(id))
      .map((id) => factorLabels[id])
      .slice(0, 2)
      .join(" and ");
    recommendations.push(
      recommendation({
        id: "recovery-pattern",
        priority: "medium",
        title: "Your recovery pattern needs attention",
        what: `You logged ${shortSleep.length} nights below ${VITAL_BY_ID.sleep.min} hours${concernMoods.length > 0 ? ` and ${concernMoods.length} difficult self-reported moods` : ""}${context ? `, with ${context} selected as context` : ""}.`,
        why: "Repeated sleep and check-in entries make recovery the clearest area to focus on. They do not establish a medical cause.",
        action:
          "Protect your next sleep window and discuss the pattern with the onboard medical officer if it continues.",
        time: shortSleep[0]?.check_in_date,
      }),
    );
  } else if (moodPattern) {
    const context = factors
      .map((id) => factorLabels[id] ?? id)
      .slice(0, 2)
      .join(" and ");
    recommendations.push(
      recommendation({
        id: "mood-context-pattern",
        priority: "low",
        title: "Your recent check-ins need support",
        what: `You reported a difficult mood on ${concernMoods.length} recent check-ins${context ? `, including ${context}` : ""}.`,
        why: "Mood remains self-reported in AstroCare. Repeated entries are useful context for choosing support, but they do not explain why you feel this way.",
        action:
          "Choose one support action today, such as a short reset or crew connection, and speak with the medical officer if you want help.",
        time: latest?.check_in_date,
      }),
    );
  }

  const abnormalGroups = physiologicalGroups.filter(
    (group) => group.latestStatus && group.latestStatus !== "normal",
  );
  const repeatedGroups = abnormalGroups.filter((group) =>
    group.items.some((item) => item.repeatedOutOfRange),
  );

  if (abnormalGroups.length >= 2) {
    const labels = abnormalGroups.map((group) => group.label).join(", ");
    const significantCount = abnormalGroups.filter(
      (group) => group.latestStatus === "alert",
    ).length;
    recommendations.push(
      recommendation({
        id: "combined-indicator-pattern",
        priority: significantCount >= 2 ? "high" : "medium",
        title:
          healthStatus === "concerning"
            ? "Several health indicators need prompt review"
            : "Several health indicators need attention",
        what: `${labels} are currently outside their expected ranges${significantCount > 0 ? `, including ${significantCount} significant result${significantCount === 1 ? "" : "s"}` : ""}.`,
        why: "AstroCare is grouping these findings for review; it is not assuming they share a cause. The combined pattern deserves more attention than any one reading alone.",
        action:
          "Repeat the measurements while rested, review the trend in Reports, and follow your onboard monitoring protocol.",
        time: abnormalGroups
          .flatMap((group) => group.items)
          .map((item) => item.latest?.time)
          .filter(Boolean)
          .sort()
          .at(-1),
      }),
    );
  } else if (repeatedGroups.length === 1) {
    const group = repeatedGroups[0];
    const item = group.items.find((entry) => entry.repeatedOutOfRange);
    recommendations.push(
      recommendation({
        id: "persistent-indicator-pattern",
        priority: "medium",
        title: `Review a repeated ${group.label.toLowerCase()} pattern`,
        what: `${group.label} has been outside its expected range on repeated recent readings.`,
        why: "A repeated pattern is more useful than a single result, but it does not establish a cause or diagnosis.",
        action:
          "Repeat the measurement while rested and review the trend in Reports. Follow your onboard monitoring protocol if it continues.",
        time: item?.latest?.time,
      }),
    );
  }

  if (!recommendations.length && insight) {
    recommendations.push(
      recommendation({
        id: "positive-health-pattern",
        priority: "informational",
        title: insight.title,
        what: insight.text,
        why: "This summary is based on the readings and self-reported check-ins currently stored in AstroCare.",
        action:
          "Continue your regular measurements and daily check-in so changes can be noticed early.",
        time: latest?.check_in_date,
      }),
    );
  }

  return recommendations.sort(
    (a, b) =>
      PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] ||
      String(b.time ?? "").localeCompare(String(a.time ?? "")),
  );
}

function healthStatusSummary(status, { physiologicalGroups, contextPatterns }) {
  if (status === "insufficient") {
    return "There is not enough stored health data to assess your overall condition yet.";
  }
  if (status === "concerning") {
    return "Several health indicators are outside their expected ranges. Your condition needs prompt review.";
  }
  if (status === "needs_attention") {
    if (contextPatterns.recoveryPattern) {
      return "Your health indicators are mostly stable, but your recent recovery pattern needs attention.";
    }
    if (physiologicalGroups.some((group) => group.latestStatus !== "normal")) {
      return "One or more health indicators need monitoring and follow-up.";
    }
    return "Your health is generally stable, but your recent check-ins need attention.";
  }
  if (status === "critical") {
    return "Your recent health readings meet validated criteria requiring immediate attention.";
  }
  return "Your health indicators are currently within their expected ranges.";
}

export function assessHealth({
  readings = [],
  dailyCheckIns = [],
  now = Date.now(),
} = {}) {
  const groups = groupByVital(mergeDailyCheckInSleep(readings, dailyCheckIns));
  const statuses = VITALS.map((vital) =>
    buildVitalStatus(vital, groups[vital.id], now),
  );
  const physiologicalGroups = buildPhysiologicalGroups(statuses);
  const contextPatterns = buildContextPatterns(dailyCheckIns, now);
  // No emergency criteria are configured until validated medical protocols are supplied.
  const criticalAlerts = [];
  const urgentWarnings = buildHighPriorityWarnings(physiologicalGroups);
  const healthStatus = classifyHealth({
    statuses,
    physiologicalGroups,
    contextPatterns,
    criticalAlerts,
  });
  const overall = getWorstStatus(
    statuses.map((item) => item.status).filter(Boolean),
  );
  const latestReading =
    statuses
      .map((item) => item.latest)
      .filter(Boolean)
      .sort((a, b) => b.time - a.time)[0] ?? null;
  const latest = latestCheckIn(dailyCheckIns);
  const insight = stableInsight(statuses, groups, dailyCheckIns, now);
  const recommendations = buildRecommendations({
    statuses,
    physiologicalGroups,
    contextPatterns,
    healthStatus,
    latest,
    insight,
  });

  return {
    groups,
    statuses,
    overall,
    healthStatus,
    healthStatusLabel: healthStatus
      .split("_")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" "),
    healthStatusSummary: healthStatusSummary(healthStatus, {
      physiologicalGroups,
      contextPatterns,
    }),
    physiologicalGroups,
    contextPatterns,
    latestReading,
    latestCheckIn: latest,
    recommendations,
    insight,
    criticalAlerts,
    urgentWarnings,
    generatedAt: now,
  };
}
