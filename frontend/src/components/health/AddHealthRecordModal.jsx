/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Activity,
  Droplets,
  HeartPulse,
  Thermometer,
  Wind,
  X,
} from "lucide-react";
import HealthMeasurementCard from "./HealthMeasurementCard";
// import VoiceAssistant from "./VoiceAssistant";
import {
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
} from "../ui/fieldStyles";
import { VITALS } from "../../data/vitalCatalog";

const INITIAL_VALUES = {
  heartRate: "",
  spo2: "",
  systolic: "",
  diastolic: "",
  temperature: "",
  glucose: "",
};

const MEASUREMENTS = [
  {
    id: "heartRate",
    label: "Heart rate",
    unit: "Beats per minute (bpm)",
    icon: HeartPulse,
  },
  {
    id: "spo2",
    label: "Blood oxygen / SpO2",
    unit: "Percentage (%)",
    icon: Wind,
  },
  {
    id: "bloodPressure",
    label: "Blood pressure",
    unit: "mmHg",
    icon: Activity,
  },
  {
    id: "temperature",
    label: "Body temperature",
    unit: "Degrees Celsius (°C)",
    icon: Thermometer,
  },
  { id: "glucose", label: "Blood glucose", unit: "mg/dL", icon: Droplets },
];

export default function AddHealthRecordModal({
  isOpen,
  onClose,
  onSave,
  // onStartListening,
  // onStopListening,
}) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setValues(INITIAL_VALUES);
    setError(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const updateValue = (id, value) => {
    setError(null);
    setValues((current) => ({ ...current, [id]: value }));
  };

  // const handleMeasurementsExtracted = (measurements) => {
  //   setError(null);
  //   setValues((current) => ({ ...current, ...measurements }));
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (saving) return;
    const providedValues = Object.entries(values).filter(([, value]) =>
      value.trim(),
    );
    if (!providedValues.length) {
      setError("Enter at least one measurement before saving.");
      return;
    }
    const invalid = providedValues.find(([id, value]) => {
      const vital = VITALS.find((item) => item.id === id);
      return (
        !vital ||
        !Number.isFinite(Number(value)) ||
        Number(value) <= 0 ||
        Number(value) >= 1000
      );
    });
    if (invalid) {
      setError("Enter valid positive measurements below 1000.");
      return;
    }
    const measuredAt = new Date().toISOString();
    const rows = providedValues.map(([vitalId, value]) => ({
      vital_id: vitalId,
      value: Number(value),
      measured_at: measuredAt,
      source: "manual",
      note: "",
    }));
    setSaving(true);
    const saved = await onSave?.(rows);
    setSaving(false);
    if (!saved) {
      setError("We could not save your health record. Please try again.");
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-space-950/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onClose()
      }>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-health-record-title"
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-space-600 bg-space-900 shadow-2xl shadow-space-950/50">
        <header className="flex items-start justify-between gap-4 border-b border-space-700 px-5 py-3 sm:px-6">
          <div>
            <h2
              id="add-health-record-title"
              className="font-display text-xl font-semibold">
              Add Health Record
            </h2>
            <p className="mt-1 text-sm text-ink-300">
              Enter your health measurements manually.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add health record modal"
            className="rounded-lg p-2 text-ink-500 transition hover:bg-space-800 hover:text-ink-100">
            <X size={20} />
          </button>
        </header>

        <form
          id="add-health-record-form"
          onSubmit={handleSubmit}
          className="min-h-0 overflow-y-auto px-5 py-3 sm:overflow-visible sm:px-6">
          {/* <VoiceAssistant
            onMeasurementsExtracted={handleMeasurementsExtracted}
            onVoiceError={setError}
            onStartListening={onStartListening}
            onStopListening={onStopListening}
          /> */}
          <div className="mt-3">
            <div className="mb-2">
              <h3 className="font-display text-base font-semibold">
                Your measurements
              </h3>
              <p className="mt-1 text-xs text-ink-500">
                Enter only the measurements you have available.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {MEASUREMENTS.map((measurement) => (
                <HealthMeasurementCard
                  key={measurement.id}
                  icon={measurement.icon}
                  label={measurement.label}
                  unit={measurement.unit}
                  instructionId={
                    measurement.id === "bloodPressure"
                      ? "bloodPressure"
                      : measurement.id
                  }
                  value={values[measurement.id]}
                  onChange={(value) => updateValue(measurement.id, value)}
                  fields={
                    measurement.id === "bloodPressure"
                      ? [
                          {
                            id: "systolic",
                            label: "Systolic",
                            value: values.systolic,
                            onChange: (value) => updateValue("systolic", value),
                          },
                          {
                            id: "diastolic",
                            label: "Diastolic",
                            value: values.diastolic,
                            onChange: (value) =>
                              updateValue("diastolic", value),
                          },
                        ]
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
          {error && (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
        </form>

        <footer className="flex flex-col-reverse gap-3 border-t border-space-700 px-5 py-3 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className={SECONDARY_BUTTON_CLASS}>
            Cancel
          </button>
          <button
            type="submit"
            form="add-health-record-form"
            disabled={saving}
            className={PRIMARY_BUTTON_CLASS}>
            {saving ? "Saving..." : "Confirm & Save"}
          </button>
        </footer>
      </div>
    </div>
  );
}
