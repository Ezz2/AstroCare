ALTER TABLE public.daily_checkins
  ALTER COLUMN mood DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS contributing_factors jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.daily_checkins
  DROP CONSTRAINT IF EXISTS daily_checkins_mood_check,
  DROP CONSTRAINT IF EXISTS daily_checkins_contributing_factors_check;

ALTER TABLE public.daily_checkins
  ADD CONSTRAINT daily_checkins_mood_check
  CHECK (mood IN ('great', 'good', 'okay', 'anxious', 'low', 'irritated', 'exhausted', 'positive', 'neutral', 'fatigued')),
  ADD CONSTRAINT daily_checkins_contributing_factors_check
  CHECK (jsonb_typeof(contributing_factors) = 'array');
