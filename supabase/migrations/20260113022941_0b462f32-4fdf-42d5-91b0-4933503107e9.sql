-- Update the weekly budget limit to $0.15 for 2-3 quality posts per week
-- Also update the check_snap_blog_budget function default

CREATE OR REPLACE FUNCTION public.get_current_week_budget()
 RETURNS snap_blog_budget
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  week_start_date DATE;
  budget_record public.snap_blog_budget;
BEGIN
  -- Get the start of the current week (Monday)
  week_start_date := date_trunc('week', CURRENT_DATE)::date;
  
  -- Try to get existing record
  SELECT * INTO budget_record 
  FROM public.snap_blog_budget 
  WHERE week_start = week_start_date;
  
  -- If not found, create one with new $0.15 limit
  IF NOT FOUND THEN
    INSERT INTO public.snap_blog_budget (week_start, weekly_limit_usd)
    VALUES (week_start_date, 0.15)
    RETURNING * INTO budget_record;
  END IF;
  
  RETURN budget_record;
END;
$function$;

-- Update existing budget records to new limit
UPDATE public.snap_blog_budget 
SET weekly_limit_usd = 0.15 
WHERE week_start >= date_trunc('week', CURRENT_DATE)::date;