CREATE OR REPLACE FUNCTION public.set_mission_start_date_on_profile_creation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.mission_start_date := CURRENT_DATE;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_mission_start_date_on_profile_creation ON public.profiles;
CREATE TRIGGER set_mission_start_date_on_profile_creation
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_mission_start_date_on_profile_creation();
