export const MEASUREMENT_INSTRUCTIONS = {
  heartRate: {
    title: 'Heart rate',
    before: [
      'Sit quietly and relax for at least 5 minutes.',
      'Avoid measuring immediately after exercise, climbing, or another activity that can raise your heart rate.',
    ],
    howTo: [
      'Use the approved heart-rate monitor or follow the mission medical protocol for a manual check.',
      'Keep still while the reading is taken.',
      'Wait for the device to finish, or count the beats for the interval specified by the approved procedure.',
    ],
    record: 'Record the heart rate as beats per minute (BPM).',
    notes: [
      'Recent physical activity, stress, caffeine, or movement can affect the result.',
      'If the reading seems unexpected, repeat it after resting and follow mission medical guidance for persistent or concerning symptoms.',
    ],
  },
  spo2: {
    title: 'Blood oxygen (SpO₂)',
    before: [
      'Rest and keep your hand warm and relaxed if possible.',
      'Remove anything that prevents the approved sensor from making good contact.',
    ],
    howTo: [
      'Place the approved sensor on the designated finger or measurement site as shown in its instructions.',
      'Keep the sensor aligned and keep your hand still.',
      'Wait until the reading is stable before recording it.',
    ],
    record: 'Record the result as oxygen saturation percentage (%).',
    notes: [
      'Movement, poor sensor contact, cold skin, and some nail coverings can affect accuracy.',
      'Check the sensor placement and repeat an unexpected reading. Follow mission medical protocols for readings that remain concerning.',
    ],
  },
  bloodPressure: {
    title: 'Blood pressure',
    before: [
      'Rest quietly for about 5 minutes before measuring.',
      'Avoid measuring immediately after exercise, caffeine, or a stressful activity when the protocol allows.',
    ],
    howTo: [
      'Use the approved monitor and the cuff size specified for you.',
      'Sit with your back supported, feet flat, and legs uncrossed.',
      'Place the cuff on the bare upper arm as directed, with the arm supported at heart level.',
      'Remain quiet and still while the monitor takes the reading.',
      'Use the same reading for both values: systolic is the top number and diastolic is the bottom number.',
    ],
    record: 'Record systolic and diastolic pressure from the same reading, each in millimetres of mercury (mmHg).',
    notes: [
      'A cuff that is too large or small, unsupported posture, talking, and movement can affect the result.',
      'Do not record systolic from one reading and diastolic from another unless the medical protocol specifically instructs you to do so.',
      'Follow the approved device instructions and mission medical protocols for repeat readings or concerning results.',
    ],
  },
  temperature: {
    title: 'Body temperature',
    before: [
      'Use only the approved thermometer and measurement site.',
      'Allow enough time after exercise, eating, drinking, or exposure to a hot or cold environment if required by the device instructions.',
    ],
    howTo: [
      'Turn on the thermometer and check that it is ready.',
      'Place it at the approved measurement site exactly as instructed by the device.',
      'Keep it in position until the device signals that the reading is complete.',
      'Clean and store the device according to its instructions.',
    ],
    record: 'Record the temperature with its unit, degrees Celsius (°C) or degrees Fahrenheit (°F).',
    notes: [
      'Different measurement sites and methods can produce different readings. Use the same approved method when comparing results.',
      'Do not estimate a value or mix units. Follow mission medical protocols for unexpected readings or symptoms.',
    ],
  },
  glucose: {
    title: 'Blood glucose',
    before: [
      'Check whether the medical protocol requires a particular timing, such as before or after a meal. Do not assume every reading must be fasting.',
      'Wash and dry your hands, and prepare the approved glucose device and supplies.',
    ],
    howTo: [
      'Use the approved glucose monitoring device exactly as described in its instructions.',
      'Use a new lancet and the correct test strip or sensor for the device.',
      'Collect the sample or apply the sensor as instructed, then wait for the result.',
      'Dispose of sharps safely and clean the equipment as directed.',
    ],
    record: 'Record the glucose value in the unit shown by the approved device, such as mg/dL or mmol/L, and note the timing relative to meals when required.',
    notes: [
      'Food, medication, activity, illness, and timing can affect the result.',
      'Never share lancets or other blood-contact equipment. Follow device safety instructions and mission medical protocols for unexpected results.',
    ],
  },
  sleep: {
    title: 'Sleep duration',
    before: [
      'Review the sleep period that ended most recently.',
      'Use the approved sleep tracker or mission log if one is provided.',
    ],
    howTo: [
      'Identify when you actually fell asleep and when you finally woke up.',
      'Subtract periods when you were awake rather than counting all time spent in bed.',
      'Add the sleep periods together if sleep was interrupted.',
    ],
    record: 'Record actual sleep duration in hours and minutes. Include interruptions if the application provides a place to record them.',
    notes: [
      'Time in bed is not always the same as time asleep.',
      'Use the same time zone and reporting period as the mission log, and follow the approved sleep-tracking procedure when available.',
    ],
  },
  stress: {
    title: 'Stress level',
    before: [
      'Pause briefly and consider how stressed you personally feel at the time of recording.',
      'Base the rating on your current experience rather than on a device reading or what you think the result should be.',
    ],
    howTo: [
      'Select one number from 1 to 5.',
      'Choose 1 for very low stress, 2 for low stress, 3 for moderate stress, 4 for high stress, and 5 for very high stress.',
      'Record the number that best matches how you feel now.',
    ],
    record: 'Record a self-reported whole-number stress level from 1 to 5.',
    notes: [
      'This is a personal report, not a device-based measurement or a diagnosis.',
      'Use the same scale each time. Follow mission medical protocols if stress feels overwhelming or affects your ability to function.',
    ],
  },
  physicalActivity: {
    title: 'Physical activity duration',
    before: [
      'Review the physical activity completed during the day.',
      'Use the approved activity log or tracker if one is provided.',
    ],
    howTo: [
      'Add the duration of each qualifying physical activity period.',
      'Include separate sessions and interruptions only according to the mission logging procedure.',
      'Add the sessions together to get the day’s total.',
    ],
    record: 'Record the total duration of physical activity for the day in minutes.',
    notes: [
      'This records duration, not calories burned or exercise intensity.',
      'Do not estimate calories from this value. Follow the approved activity-tracking procedure when available.',
    ],
  },
}
