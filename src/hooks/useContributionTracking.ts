
import { useGameification } from './useGameification';
import type { Database } from '@/integrations/supabase/types';

type ContributionType = Database['public']['Enums']['contribution_type'];

export const useContributionTracking = () => {
  const { awardPoints } = useGameification();

  // Points are now calculated server-side for security
  const trackContribution = (
    type: ContributionType,
    storeId?: number
  ) => {
    awardPoints({
      contributionType: type,
      storeId,
    });
  };

  return { trackContribution };
};
