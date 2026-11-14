export const VITALS = [
  {
    id: "heartRate",
    label: "Heart rate",
    unit: "bpm",
    min: 60,
    max: 100,
    decimals: 0,
    systemId: "heart",
    education: {
      what: "Heart rate is how many times your heart beats in one minute.",
      unit: "bpm means beats per minute.",
      measuredBy: "It is measured by a heart monitor or by counting your pulse.",
      factors: "Recent activity, stress, caffeine, illness, and movement can change it.",
      importance: "It helps show how your body is responding at rest or during activity.",
      unusual: "A change can have many causes. A single reading does not identify a diagnosis.",
    },
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
    education: {
      what: "Blood oxygen shows the percentage of oxygen carried in your blood.",
      unit: "% means the share of blood oxygen-carrying sites that are filled.",
      measuredBy: "A pulse oximeter usually estimates it with light through a fingertip.",
      factors: "Movement, cold fingers, poor contact, circulation, nail coverings, and skin factors can affect it.",
      importance: "Your organs need oxygen to work normally.",
      unusual: "An unexpected result may be a sensor problem or a real change, so it should be checked.",
    },
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
    education: {
      what: "Systolic pressure is the top blood-pressure number, when the heart pumps.",
      unit: "mmHg means millimetres of mercury, the pressure unit used by the monitor.",
      measuredBy: "An arm cuff measures pressure while it briefly squeezes the arm.",
      factors: "Posture, talking, movement, recent activity, stress, caffeine, and cuff fit can affect it.",
      importance: "Together with diastolic pressure, it shows the pressure in your blood vessels.",
      unusual: "One unusual result may be affected by how the measurement was taken; repeated changes need review.",
    },
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
    education: {
      what: "Diastolic pressure is the bottom blood-pressure number, when the heart relaxes between beats.",
      unit: "mmHg means millimetres of mercury, the pressure unit used by the monitor.",
      measuredBy: "An arm cuff measures pressure while it briefly squeezes the arm.",
      factors: "Posture, talking, movement, recent activity, stress, caffeine, and cuff fit can affect it.",
      importance: "Together with systolic pressure, it shows the pressure in your blood vessels.",
      unusual: "One unusual result may be affected by how the measurement was taken; repeated changes need review.",
    },
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
    education: {
      what: "Body temperature is a measure of how warm your body is.",
      unit: "°C means degrees Celsius.",
      measuredBy: "An approved thermometer measures temperature at a chosen body site.",
      factors: "Time of day, exercise, food or drink, environment, measurement site, and device technique can affect it.",
      importance: "It can help show that your body is changing, but it does not identify the cause by itself.",
      unusual: "An unusual result should be checked with the approved method and reviewed with the medical officer if it persists.",
    },
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
    education: {
      what: "Blood glucose is the amount of sugar in a blood sample.",
      unit: "mg/dL means milligrams of glucose per decilitre of blood.",
      measuredBy: "An approved meter or sensor measures a blood sample or fluid near the skin.",
      factors: "Meal timing, activity, illness, stress, and medicines can affect it.",
      importance: "Glucose is a main source of energy for your cells.",
      unusual: "The meaning depends on when it was measured, especially whether it was before or after a meal.",
    },
    guidance:
      "Record whether the reading was before or after a meal, review recent activity or stress, and follow the approved monitoring plan. Do not treat this result as a fasting reading unless it was taken after the required fast.",
  },
  {
    id: "sleep",
    label: "Sleep duration",
    unit: "h",
    min: 7,
    max: 9,
    decimals: 1,
    systemId: "brain",
    education: {
      what: "Sleep duration is the total time you were actually asleep.",
      unit: "h means hours.",
      measuredBy: "It is estimated by an approved tracker or recorded from sleep and wake times.",
      factors: "Interruptions, schedule changes, light, noise, and the difference between time in bed and time asleep can affect it.",
      importance: "Sleep supports attention, recovery, and safe mission work.",
      unusual: "One unusual night is different from a repeated sleep pattern and does not show the cause by itself.",
    },
    guidance:
      "Protect a fixed sleep window and reduce light exposure before bedtime. Discuss repeated short nights with the medical officer.",
  },
];

export const VITAL_BY_ID = Object.fromEntries(
  VITALS.map((vital) => [vital.id, vital]),
);

export const HEALTH_EDUCATION_REFERENCES = [
  {
    label: "MedlinePlus: Pulse",
    url: "https://medlineplus.gov/ency/article/003399.htm",
    supports: "heart rate definition, measurement, factors, and why changes need review",
  },
  {
    label: "MedlinePlus: Pulse Oximetry",
    url: "https://medlineplus.gov/lab-tests/pulse-oximetry/",
    supports: "oxygen saturation definition, sensor method, accuracy factors, and typical range",
  },
  {
    label: "MedlinePlus: Temperature measurement",
    url: "https://medlineplus.gov/ency/article/003400.htm",
    supports: "temperature measurement methods and factors that affect readings",
  },
  {
    label: "CDC: About High Blood Pressure",
    url: "https://www.cdc.gov/high-blood-pressure/about/index.html",
    supports: "blood-pressure meaning and why persistent changes need review",
  },
  {
    label: "MedlinePlus: Blood Glucose Test",
    url: "https://medlineplus.gov/lab-tests/blood-glucose-test/",
    supports: "glucose definition and why meal timing changes interpretation",
  },
  {
    label: "NHLBI: Sleep Deprivation and Deficiency",
    url: "https://www.nhlbi.nih.gov/health/sleep-deprivation",
    supports: "why repeated insufficient or poor-quality sleep matters",
  },
];

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
