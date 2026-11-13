CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date date NOT NULL,
  sleep_duration numeric NOT NULL CHECK (sleep_duration > 0 AND sleep_duration < 24),
  mood text CHECK (mood IN ('great', 'good', 'okay', 'anxious', 'low', 'irritated', 'exhausted', 'positive', 'neutral', 'fatigued')),
  contributing_factors jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(contributing_factors) = 'array'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT daily_checkins_user_date_key UNIQUE (user_id, check_in_date)
);

CREATE INDEX IF NOT EXISTS daily_checkins_user_date_idx
  ON public.daily_checkins (user_id, check_in_date DESC);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.daily_checkins TO authenticated;

DROP POLICY IF EXISTS "Users can view own daily check-ins" ON public.daily_checkins;
CREATE POLICY "Users can view own daily check-ins"
ON public.daily_checkins FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add own daily check-ins" ON public.daily_checkins;
CREATE POLICY "Users can add own daily check-ins"
ON public.daily_checkins FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily check-ins" ON public.daily_checkins;
CREATE POLICY "Users can update own daily check-ins"
ON public.daily_checkins FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_daily_checkin_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS daily_checkins_updated_at ON public.daily_checkins;
CREATE TRIGGER daily_checkins_updated_at
BEFORE UPDATE ON public.daily_checkins
FOR EACH ROW EXECUTE FUNCTION public.set_daily_checkin_updated_at();
