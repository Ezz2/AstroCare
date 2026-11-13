/*
# Create AstroCare health schema (profiles, health readings, demo history)

Plain-English summary
- Each astronaut gets a personal profile (name, crew ID, mission details) that is created automatically when their account is created.
- Each astronaut gets a personal health history of readings. Only the owner can see or change their own rows.
- New accounts receive 14 days of clearly labelled SIMULATED demonstration readings so the dashboard has something to show. They are marked with source = 'simulated' and can be removed by the user from Settings.
- Readings entered by users are always stored with source = 'manual'. The database refuses any other source from the app, so manual entries can never be disguised as research or simulated data.

## 1. New tables
### public.profiles
- user_id (uuid, primary key, references auth.users, deleted with the account)
- full_name, crew_id, mission_name (text)
- mission_start_date (date)
- notify_alerts, notify_reminders (boolean)
- created_at (timestamp)

### public.health_readings
- id (uuid, primary key)
- user_id (uuid, owner, defaults to the signed-in user)
- vital_id (one of: heartRate, spo2, systolic, diastolic, temperature, glucose, sleep)
- value (positive number)
- measured_at (timestamp of the measurement)
- source (manual, simulated or research)
- note (short text, up to 500 characters)
- created_at (timestamp)

## 2. Functions and triggers
- handle_new_user(): runs after a new account is created. Creates the profile and seeds 14 days of simulated demonstration readings for that account only. Runs with elevated rights and is not callable by app users.

## 3. Security
- Row level security enabled on both tables.
- profiles: users can read and update only their own profile. Users cannot change their own user_id. No client insert or delete.
- health_readings: users can read their own rows, insert their own rows with source = 'manual' only, and delete their own rows. Readings are not editable after entry to keep the history auditable.
- No access for the anonymous role.

## 4. Notes
1. Readings are stored with timestamps so trends and comparisons use the real measurement time.
2. The 'research' source is reserved for imported published datasets in a later release.
3. All statements are idempotent so this migration can be safely re-applied.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  crew_id text NOT NULL DEFAULT '',
  mission_name text NOT NULL DEFAULT '',
  mission_start_date date,
  notify_alerts boolean NOT NULL DEFAULT true,
  notify_reminders boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, crew_id, mission_name, mission_start_date, notify_alerts, notify_reminders) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.health_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  vital_id text NOT NULL CHECK (vital_id IN ('heartRate', 'spo2', 'systolic', 'diastolic', 'temperature', 'glucose', 'sleep')),
  value numeric NOT NULL CHECK (value > 0 AND value < 1000),
  measured_at timestamptz NOT NULL,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'simulated', 'research')),
  note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS health_readings_user_time_idx ON public.health_readings (user_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS health_readings_user_vital_idx ON public.health_readings (user_id, vital_id, measured_at DESC);

ALTER TABLE public.health_readings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON public.health_readings TO authenticated;

DROP POLICY IF EXISTS "Users can view own readings" ON public.health_readings;
CREATE POLICY "Users can view own readings"
ON public.health_readings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add manual readings" ON public.health_readings;
CREATE POLICY "Users can add manual readings"
ON public.health_readings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND source = 'manual');

DROP POLICY IF EXISTS "Users can delete own readings" ON public.health_readings;
CREATE POLICY "Users can delete own readings"
ON public.health_readings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, crew_id, mission_name, mission_start_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'AX-' || upper(substr(replace(NEW.id::text, '-', ''), 1, 4)),
    'Demonstration Mission',
    CURRENT_DATE
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.health_readings (user_id, vital_id, value, measured_at, source, note)
  SELECT
    NEW.id,
    d.vital_id,
    round((d.base + d.amp * sin(d.day_offset * 0.8 + d.phase))::numeric, d.dec),
    now() - make_interval(days => d.day_offset),
    'simulated',
    'Simulated demonstration record'
  FROM (
    SELECT g.day_offset, v.vital_id, v.base, v.amp, v.phase, v.dec
    FROM generate_series(0, 13) AS g(day_offset)
    CROSS JOIN (VALUES
      ('heartRate', 72::numeric, 4::numeric, 0.4::numeric, 0),
      ('spo2', 97::numeric, 0.8::numeric, 1.1::numeric, 0),
      ('systolic', 114::numeric, 4::numeric, 2.0::numeric, 0),
      ('diastolic', 72::numeric, 3::numeric, 2.6::numeric, 0),
      ('temperature', 36.7::numeric, 0.15::numeric, 0.9::numeric, 1),
      ('glucose', 88::numeric, 6::numeric, 1.7::numeric, 0),
      ('sleep', 7.1::numeric, 0.6::numeric, 0.2::numeric, 1)
    ) AS v(vital_id, base, amp, phase, dec)
  ) AS d;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
