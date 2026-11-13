import {
  Annoyed,
  Armchair,
  Brain,
  ClipboardList,
  Dumbbell,
  Frown,
  Globe2,
  Meh,
  Moon,
  MessageCircle,
  Rocket,
  Smile,
  SmilePlus,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";

export const MOODS = {
  great: { label: "Great", icon: SmilePlus, color: "text-teal-300" },
  good: { label: "Good", icon: Smile, color: "text-cyan-300" },
  okay: { label: "Okay", icon: Meh, color: "text-sky-300" },
  anxious: {
    label: "Anxious",
    icon: Brain,
    color: "text-violet-300",
  },
  low: { label: "Low", icon: Frown, color: "text-amber-300" },
  irritated: {
    label: "Irritated",
    icon: Annoyed,
    color: "text-orange-300",
  },
  exhausted: {
    label: "Exhausted",
    icon: Moon,
    color: "text-rose-300",
  },
};

export const MOOD_OPTIONS = Object.entries(MOODS).map(([id, mood]) => ({
  id,
  ...mood,
}));

const LEGACY_MOOD_ALIASES = {
  positive: "good",
  neutral: "okay",
  fatigued: "exhausted",
};

export function moodMeta(id) {
  const resolvedId = LEGACY_MOOD_ALIASES[id] ?? id;
  return MOODS[resolvedId] ?? null;
}

export const CONTRIBUTING_FACTORS = [
  { id: "great_day", label: "A great day", icon: Star },
  { id: "good_rest", label: "Good rest", icon: Armchair },
  { id: "crew_time", label: "Time with the crew", icon: Users },
  { id: "family_contact", label: "Contact with family or friends", icon: Globe2 },
  { id: "mission_tasks", label: "Mission tasks", icon: Rocket },
  { id: "physical_activity", label: "Physical activity", icon: Dumbbell },
  { id: "poor_sleep", label: "Poor sleep", icon: Moon },
  { id: "busy_schedule", label: "Busy schedule", icon: ClipboardList },
  { id: "physical_discomfort", label: "Physical discomfort", icon: Stethoscope },
  { id: "something_else", label: "Something else", icon: MessageCircle },
];
