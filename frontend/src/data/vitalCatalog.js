export const VITALS = [
  {
    id: "heartRate",
    label: "Heart rate",
    unit: "bpm",
    min: 60,
    max: 100,
    decimals: 0,
    systemId: "heart",
    guidance:
      "Check for recent exertion or stress. Rest and recheck in 15 minutes, and report persistent readings to the onboard medical officer.",
  },
  {
    id: "spo2",
    label: "Blood oxygen (SpO2)",
    unit: "%",
    min: 95,
    max: 100,
    decimals: 0,
    systemId: "lungs",
    guidance:
      "Confirm the sensor is seated correctly, then notify the onboard medical officer if readings stay below range.",
  },
  {
    id: "systolic",
    label: "Systolic pressure",
    unit: "mmHg",
    min: 90,
    max: 120,
    decimals: 0,
    systemId: "heart",
    guidance:
      "Note posture and recent activity. Repeat the measurement after five minutes of rest and log the result.",
  },
  {
    id: "diastolic",
    label: "Diastolic pressure",
    unit: "mmHg",
    min: 60,
    max: 80,
    decimals: 0,
    systemId: "heart",
    guidance:
      "Repeat the measurement after five minutes of rest. Review it together with the systolic trend.",
  },
  {
    id: "temperature",
    label: "Body temperature",
    unit: "°C",
    min: 36.1,
    max: 37.2,
    decimals: 1,
    systemId: "skin",
    guidance:
      "Hydrate and recheck in 30 minutes. Report fever, chills or a sustained rise to the onboard medical officer.",
  },
  {
    id: "glucose",
    label: "Blood glucose",
    unit: "mg/dL",
    min: 70,
    max: 99,
    decimals: 0,
    systemId: "pancreas",
    guidance:
      "Review recent meals and stress. A single high reading says less than a sustained trend over several hours.",
  },
  {
    id: "sleep",
    label: "Sleep duration",
    unit: "h",
    min: 7,
    max: 9,
    decimals: 1,
    systemId: "brain",
    guidance:
      "Protect a fixed sleep window and reduce light exposure before bedtime. Discuss repeated short nights with the medical officer.",
  },
];

export const VITAL_BY_ID = Object.fromEntries(
  VITALS.map((vital) => [vital.id, vital]),
);

export const SOURCE_META = {
  manual: {
    label: "Manual entry",
    className: "border-cyan-400/40 text-cyan-300",
  },
  simulated: {
    label: "Simulated demo",
    className: "border-violet-400/40 text-violet-400",
  },
  research: {
    label: "Research dataset",
    className: "border-teal-400/40 text-teal-400",
  },
};
