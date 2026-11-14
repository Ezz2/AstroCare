import { CONTRIBUTING_FACTORS } from "../data/moods";
import {
  filterByPeriod,
  groupByVital,
  mergeDailyCheckInSleep,
  previousPeriod,
  statsFor,
} from "./analysis";
import {
  formatValue,
  getMeasurementValidity,
  getStatus,
  getWorstStatus,
} from "./health";
import { toLocalDateInput } from "./format";
import { VITALS, VITAL_BY_ID } from "../data/vitalCatalog";

const DAY_MS = 86400000;
const RECENT_DAYS = 7;
const BASELINE_DAYS = 30;
const MIN_TREND_READINGS = 2;

const PRIORITY_RANK = { informational: 0, low: 1, medium: 2, high: 3 };
const identity = (text, values = {}) =>
  text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
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

function recommendation({ id, priority, title, what, why, action, time, education }) {
  return { id, priority, title, what, why, action, time, education };
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
  const invalidLatest = readings.at(-1);
  const validReadings = readings.filter(
    (reading) => getMeasurementValidity(vital, reading.value) === "valid",
  );
  const latest = validReadings.at(-1) ?? null;
  const baseline = statsFor(
    validReadings.filter(
      (reading) =>
        reading !== latest &&
        reading.time >= now - BASELINE_DAYS * DAY_MS,
    ),
  );
  const validCurrent = current.filter(
    (reading) => getMeasurementValidity(vital, reading.value) === "valid",
  );
  const validPrevious = previous.filter(
    (reading) => getMeasurementValidity(vital, reading.value) === "valid",
  );
  const recentOutOfRange = validCurrent.filter((reading) => getStatus(vital, reading.value) !== "normal");

  return {
    vital,
    latest,
    invalidLatest:
      invalidLatest &&
      getMeasurementValidity(vital, invalidLatest.value) === "invalid"
        ? invalidLatest
        : null,
    status: latest ? getStatus(vital, latest.value) : null,
    trend: trendFor(vital, validCurrent, validPrevious),
    improving: isImproving(vital, validCurrent, validPrevious),
    repeatedOutOfRange: recentOutOfRange.length >= 2,
    recentOutOfRange,
    baseline,
    current: validCurrent,
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

function stableInsight(statuses, groups, dailyCheckIns, now, t) {
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
      title: t("Your recent health pattern is improving"),
      text: t("Several recorded indicators are moving closer to their usual ranges. Keep the routines and monitoring schedule that are helping."),
    };
  }
  if (recentCheckIn?.mood === "great" || recentCheckIn?.mood === "good") {
    return {
      title: t("Your recent pattern looks steady"),
      text: hasPositiveContext
        ? t("Your recorded readings are within their usual ranges and your latest check-in includes positive day context. Keep the routines that are working for you.")
        : t("Your recorded readings are within their usual ranges. Keep the routines that are working for you."),
    };
  }
  if (recentReadings.length >= 5) {
    return {
      title: t("Your recent readings are stable"),
      text: t("The readings recorded this week are within their usual ranges. Continue your normal monitoring routine and keep checking in."),
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

function buildHighPriorityWarnings(physiologicalGroups, t) {
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
            `${t(item.vital.label)}: ${formatValue(item.vital, item.latest.value)} ${item.vital.unit}`,
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
      title: t("Multiple health indicators need prompt review"),
      what: t("{measurements}.", { measurements }),
      why: t(
        significantCount > 0
          ? "Several distinct health groups are outside their expected ranges, including {count} significant results. This is a high-priority warning for review, not a diagnosis or emergency classification."
          : "Several distinct health groups are outside their expected ranges. This is a high-priority warning for review, not a diagnosis or emergency classification.",
        { count: significantCount },
      ),
      action: t(
        "Repeat the measurements while rested and follow your onboard monitoring protocol. Contact the onboard medical officer promptly if the pattern persists or worsens.",
      ),
      time,
    },
  ];
}

function buildRecommendations({
  statuses,
  physiologicalGroups,
  contextPatterns,
  healthStatus,
  latest,
  insight,
  t,
}) {
  const recommendations = [];
  const {
    shortSleep,
    concernMoods,
    factors,
    recoveryPattern,
    moodPattern,
  } = contextPatterns;

  const abnormalGroups = physiologicalGroups.filter(
    (group) => group.latestStatus && group.latestStatus !== "normal",
  );
  const repeatedGroups = abnormalGroups.filter((group) =>
    group.items.some((item) => item.repeatedOutOfRange),
  );
  const sleepStatus = statuses.find((item) => item.vital.id === "sleep");
  const sleepImproving =
    sleepStatus?.improving &&
    sleepStatus.latest &&
    sleepStatus.status === "normal";

  for (const item of statuses.filter((entry) => entry.invalidLatest)) {
    recommendations.push(
      recommendation({
        id: `invalid-measurement-${item.vital.id}`,
        priority: "medium",
        title: t("Check an invalid {measurement} result", {
          measurement: t(item.vital.label).toLowerCase(),
        }),
        what: t(
          "The latest {measurement} entry was {value} {unit}, which cannot be interpreted reliably.",
          {
            measurement: t(item.vital.label).toLowerCase(),
            value: formatValue(item.vital, item.invalidLatest.value),
            unit: item.vital.unit,
          },
        ),
        why: t(
          "This looks like a sensor, unit, technique, or entry problem—not a health finding. AstroCare will not use it to judge your health pattern.",
        ),
        action: t(
          "Check the sensor, measurement method, unit, and entered value. Take a new valid measurement before using this result for health decisions.",
        ),
        time: item.invalidLatest.time,
        education: item.vital.education,
      }),
    );
  }

  if (
    healthStatus === "insufficient" &&
    abnormalGroups.length === 0 &&
    !statuses.some((item) => item.invalidLatest)
  ) {
    const missing = statuses
      .filter((item) => !item.latest)
      .map((item) => t(item.vital.label))
      .slice(0, 3)
      .join(", ");
    recommendations.push(
      recommendation({
        id: "insufficient-health-data",
        priority: "low",
        title: t("More health data is needed"),
        what: missing
          ? t("AstroCare has too little recent data to assess {measurements}.", {
              measurements: missing,
            })
          : t("AstroCare does not have enough recent health readings to assess a pattern."),
        why: t("A missing measurement is not the same as a normal result, so a reliable trend or comparison cannot be made yet."),
        action: t("Record the missing measurements and complete your next daily check-in. Until then, treat this assessment as incomplete rather than as an all-clear."),
        time: latest?.check_in_date,
      }),
    );
  }

  if (recoveryPattern && !sleepImproving) {
    const context = factors
      .filter((id) => ["poor_sleep", "busy_schedule", "mission_tasks"].includes(id))
      .map((id) => t(factorLabels[id]))
      .slice(0, 2)
      .join(` ${t("and")} `);
    recommendations.push(
      recommendation({
        id: "recovery-pattern",
        priority: "medium",
        title: t("Your recovery pattern needs attention"),
        what: t(
          "You logged {nights} nights below {hours} hours{moodPart}{contextPart}.",
          {
            nights: shortSleep.length,
            hours: VITAL_BY_ID.sleep.min,
            moodPart:
              concernMoods.length > 0
                ? t(" and {count} difficult self-reported moods", {
                    count: concernMoods.length,
                  })
                : "",
            contextPart: context ? t(", with {context} selected as context", { context }) : "",
          },
        ),
        why: t("The short-sleep entries and self-reported check-ins identify a repeated recovery concern, but they do not establish that one caused the other."),
        action: t("Protect your next sleep window, reduce avoidable light or task interruptions before bed, and record the next sleep duration. Contact the onboard medical officer if the pattern continues or you feel unable to carry out mission tasks safely."),
        time: shortSleep[0]?.check_in_date,
        education: VITAL_BY_ID.sleep.education,
      }),
    );
  } else if (moodPattern && !sleepImproving) {
    const context = factors
      .map((id) => t(factorLabels[id] ?? id))
      .slice(0, 2)
      .join(` ${t("and")} `);
    recommendations.push(
      recommendation({
        id: "mood-context-pattern",
        priority: "low",
        title: t("Your recent check-ins need support"),
        what: t("You reported a difficult mood on {count} recent check-ins{contextPart}.", {
          count: concernMoods.length,
          contextPart: context ? t(", including {context}", { context }) : "",
        }),
        why: t("Mood remains self-reported in AstroCare. Repeated entries are useful context for choosing support, but they do not explain why you feel this way."),
        action: t("Choose one support action today, such as a short reset or crew connection, and speak with the medical officer if you want help."),
        time: latest?.check_in_date,
      }),
    );
  }

  if (abnormalGroups.length >= 2) {
    const labels = abnormalGroups.map((group) => t(group.label)).join(", ");
    const significantCount = abnormalGroups.filter(
      (group) => group.latestStatus === "alert",
    ).length;
    recommendations.push(
      recommendation({
        id: "combined-indicator-pattern",
        priority: significantCount >= 2 ? "high" : "medium",
        title: t(
          healthStatus === "concerning"
            ? "Several health indicators need prompt review"
            : "Several health indicators need attention",
        ),
        what: t("{measurements}.", {
          measurements: abnormalGroups
            .flatMap((group) =>
              group.items
                .filter((item) => item.latest)
                .map(
                  (item) =>
                    `${t(item.vital.label)} is ${formatValue(item.vital, item.latest.value)} ${item.vital.unit}`,
                ),
            )
            .join(" · "),
        }),
        why: t(
          significantCount > 0
            ? "{labels} are outside their expected ranges, including {count} significant results. AstroCare is grouping these findings for review; it is not assuming they share a cause."
            : "{labels} are outside their expected ranges. Seeing more than one indicator change at the same time deserves more attention than an isolated result, but it does not establish a diagnosis.",
          { labels, count: significantCount },
        ),
        action: t("Repeat each measurement while rested, check that the sensors are positioned correctly, and compare the results with the recent trend in Reports. Contact the onboard medical officer promptly if any result remains outside its range or worsens."),
        time: abnormalGroups
          .flatMap((group) => group.items)
          .map((item) => item.latest?.time)
          .filter(Boolean)
          .sort()
          .at(-1),
      }),
    );
  } else if (repeatedGroups.length === 1 && !recoveryPattern) {
    const group = repeatedGroups[0];
    const item = group.items.find((entry) => entry.repeatedOutOfRange);
    recommendations.push(
      recommendation({
        id: "persistent-indicator-pattern",
        priority: "medium",
        title: t("Review a repeated {measurement} pattern", {
          measurement: t(group.label).toLowerCase(),
        }),
        what: t(
          "{measurement} was outside its expected range on {count} recent readings; the latest was {value} {unit}.",
          {
            measurement: t(group.label),
            count: item?.recentOutOfRange.length ?? 2,
            value: item?.latest ? formatValue(item.vital, item.latest.value) : "--",
            unit: item?.vital.unit ?? "",
          },
        ),
        why: item?.baseline
          ? t("This repeated pattern differs from your recent personal average of {average} {unit}. It is more informative than a single result, but it does not establish a cause or diagnosis.", {
              average: formatValue(item.vital, item.baseline.mean),
              unit: item.vital.unit,
            })
          : t("A repeated pattern is more informative than a single result, but it does not establish a cause or diagnosis."),
        action: t("Repeat the measurement while rested, record the result and any relevant context such as recent activity, then contact the onboard medical officer if it remains outside range or continues across days."),
        time: item?.latest?.time,
        education: item?.vital.education,
      }),
    );
  } else if (abnormalGroups.length === 1 && repeatedGroups.length === 0) {
    const group = abnormalGroups[0];
    if (group.id === "bloodPressure") {
      const systolic = group.items.find((item) => item.vital.id === "systolic");
      const diastolic = group.items.find((item) => item.vital.id === "diastolic");
      recommendations.push(
        recommendation({
          id: "isolated-blood-pressure-pair",
          priority: group.latestStatus === "alert" ? "medium" : "low",
          title: t("Verify an unusual blood pressure reading"),
          what: t(
            "Your latest blood pressure pair was {systolic}/{diastolic} mmHg. One or both values are outside the expected range.",
            {
              systolic: systolic?.latest
                ? formatValue(systolic.vital, systolic.latest.value)
                : "--",
              diastolic: diastolic?.latest
                ? formatValue(diastolic.vital, diastolic.latest.value)
                : "--",
            },
          ),
          why: t(
            "The top number is pressure when the heart pumps and the bottom number is pressure between beats. One result can be affected by posture, movement, stress, caffeine, or cuff fit.",
          ),
          action: t(
            "Rest quietly, check the cuff and posture, and record a new pair from the same reading. Contact the onboard medical officer if the pattern persists or you feel unwell.",
          ),
          time: Math.max(systolic?.latest?.time ?? 0, diastolic?.latest?.time ?? 0),
        }),
      );
    } else {
      const item = group.items.find((entry) => entry.latest);
      if (item?.latest) {
        recommendations.push(
        recommendation({
          id: "isolated-indicator-reading",
          priority: item.status === "alert" ? "medium" : "low",
          title: t("Verify an unusual {measurement} reading", {
            measurement: t(group.label).toLowerCase(),
          }),
          what: t("Your latest {measurement} was {value} {unit}, outside the expected range of {min} to {max} {unit}.", {
            measurement: t(item.vital.label).toLowerCase(),
            value: formatValue(item.vital, item.latest.value),
            unit: item.vital.unit,
            min: formatValue(item.vital, item.vital.min),
            max: formatValue(item.vital, item.vital.max),
          }),
          why: item.baseline
            ? t("This is one unusual result, and it differs from your recent personal average of {average} {unit}. One reading alone cannot show whether a lasting change is present.", {
                average: formatValue(item.vital, item.baseline.mean),
                unit: item.vital.unit,
              })
            : t("This is one unusual result. One reading alone cannot show whether a lasting change is present."),
          action: t(item.vital.guidance),
          time: item.latest.time,
          education: item.vital.education,
        }),
        );
      }
    }
  }

  const improving = statuses.filter(
    (item) => item.improving && item.latest && item.status === "normal",
  );
  if (improving.length > 0 && abnormalGroups.length === 0) {
    const labels = improving
      .slice(0, 3)
      .map((item) => t(item.vital.label))
      .join(", ");
    recommendations.push(
      recommendation({
        id: "improving-health-pattern",
        priority: "informational",
        title: t("Your recent health pattern is improving"),
        what: t("Recent readings for {measurements} are moving closer to their expected ranges compared with the previous period.", {
          measurements: labels,
        }),
        why: t("The recent averages are closer to the expected ranges than the preceding period. This is a positive change, not proof of a medical cause."),
        action: t("Keep the routines and monitoring schedule that were in place during the improvement, and continue recording readings so the pattern can be confirmed."),
        time: latest?.check_in_date,
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
        why: t("This summary is based on the readings and self-reported check-ins currently stored in AstroCare."),
        action: t("Continue your regular measurements and daily check-in. If a reading changes or a new symptom appears, record it with the time and context and contact the onboard medical officer when appropriate."),
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

function healthStatusSummary(status, { physiologicalGroups, contextPatterns }, t) {
  if (status === "insufficient") {
    return t("There is not enough stored health data to assess your overall condition yet.");
  }
  if (status === "concerning") {
    return t("Several health indicators are outside their expected ranges. Your condition needs prompt review.");
  }
  if (status === "needs_attention") {
    if (contextPatterns.recoveryPattern) {
      return t("Your health indicators are mostly stable, but your recent recovery pattern needs attention.");
    }
    if (physiologicalGroups.some((group) => group.latestStatus !== "normal")) {
      return t("One or more health indicators need monitoring and follow-up.");
    }
    return t("Your health is generally stable, but your recent check-ins need attention.");
  }
  if (status === "critical") {
    return t("Your recent health readings meet validated criteria requiring immediate attention.");
  }
  return t("Your health indicators are currently within their expected ranges.");
}

export function assessHealth({
  readings = [],
  dailyCheckIns = [],
  now = Date.now(),
  t = identity,
} = {}) {
  const groups = groupByVital(mergeDailyCheckInSleep(readings, dailyCheckIns));
  const statuses = VITALS.map((vital) =>
    buildVitalStatus(vital, groups[vital.id], now),
  );
  const physiologicalGroups = buildPhysiologicalGroups(statuses);
  const contextPatterns = buildContextPatterns(dailyCheckIns, now);
  // No emergency criteria are configured until validated medical protocols are supplied.
  const criticalAlerts = [];
  const urgentWarnings = buildHighPriorityWarnings(physiologicalGroups, t);
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
  const insight = stableInsight(statuses, groups, dailyCheckIns, now, t);
  const recommendations = buildRecommendations({
    statuses,
    physiologicalGroups,
    contextPatterns,
    healthStatus,
    latest,
    insight,
    t,
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
    healthStatusSummary: healthStatusSummary(
      healthStatus,
      { physiologicalGroups, contextPatterns },
      t,
    ),
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
