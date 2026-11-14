ALTER TABLE public.daily_checkins
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

UPDATE public.daily_checkins
SET submitted_at = created_at
WHERE submitted_at IS NULL;

ALTER TABLE public.daily_checkins
  ALTER COLUMN submitted_at SET DEFAULT now(),
  ALTER COLUMN submitted_at SET NOT NULL,
  DROP CONSTRAINT IF EXISTS daily_checkins_user_date_key;

CREATE OR REPLACE FUNCTION public.set_daily_checkin_submitted_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.submitted_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS daily_checkins_submitted_at ON public.daily_checkins;
CREATE TRIGGER daily_checkins_submitted_at
BEFORE INSERT ON public.daily_checkins
FOR EACH ROW EXECUTE FUNCTION public.set_daily_checkin_submitted_at();

CREATE OR REPLACE FUNCTION public.can_submit_daily_checkin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));

  RETURN NOT EXISTS (
    SELECT 1
    FROM public.daily_checkins
    WHERE user_id = auth.uid()
      AND submitted_at > now() - interval '24 hours'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.can_submit_daily_checkin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_submit_daily_checkin() TO authenticated;

DROP POLICY IF EXISTS "Users can update own daily check-ins" ON public.daily_checkins;
REVOKE UPDATE ON public.daily_checkins FROM authenticated;

DROP POLICY IF EXISTS "Users can add own daily check-ins" ON public.daily_checkins;
CREATE POLICY "Users can add own daily check-ins"
ON public.daily_checkins FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.can_submit_daily_checkin()
);
