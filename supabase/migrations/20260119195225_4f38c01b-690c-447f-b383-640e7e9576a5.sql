-- Fix security warnings for profiles and google_places_sync_queue tables
-- Add explicit denial policies to prevent unauthorized access

-- 1. Add explicit denial policy for public access to profiles table
-- This blocks anonymous/public access attempts at the profile data
CREATE POLICY "Deny public access to profiles"
ON public.profiles
FOR SELECT
TO anon, public
USING (false);

-- 2. Add explicit denial policy for public access to google_places_sync_queue
-- This table contains internal sync data that should not be publicly readable
CREATE POLICY "Deny public access to sync queue"
ON public.google_places_sync_queue
FOR SELECT
TO anon, public
USING (false);