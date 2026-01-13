-- Fix permissive RLS policies that claim to be service-role-only but use USING (true)
-- These policies should actually check for service_role

-- 1. Fix api_usage_ledger policy
DROP POLICY IF EXISTS "Service role can manage usage ledger" ON api_usage_ledger;
CREATE POLICY "Service role can manage usage ledger"
ON api_usage_ledger
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Fix budget_events policy  
DROP POLICY IF EXISTS "Service role can manage budget events" ON budget_events;
CREATE POLICY "Service role can manage budget events"
ON budget_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Fix snap_news_articles policy
DROP POLICY IF EXISTS "Service role can manage news articles" ON snap_news_articles;
CREATE POLICY "Service role can manage news articles"
ON snap_news_articles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Fix snap_blog_budget policy
DROP POLICY IF EXISTS "Service role can manage budget" ON snap_blog_budget;
CREATE POLICY "Service role can manage budget"
ON snap_blog_budget
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);