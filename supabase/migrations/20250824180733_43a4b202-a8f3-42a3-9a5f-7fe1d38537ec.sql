-- Enable Row Level Security on user_stats table
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own stats
CREATE POLICY "Users can view their own stats" 
ON public.user_stats 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for admins to view all stats (for admin functionality)
CREATE POLICY "Admins can view all user stats" 
ON public.user_stats 
FOR SELECT 
USING (is_admin_user());

-- No INSERT/UPDATE/DELETE policies needed as stats should only be updated by database functions/triggers