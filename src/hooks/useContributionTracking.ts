
import { useGameification } from './useGameification';
import type { Database } from '@/integrations/supabase/types';

type ContributionType = Database['public']['Enums']['contribution_type'];

export const useContributionTracking = () => {
  const { awardPoints } = useGameification();

  const trackContribution = (
    type: ContributionType,
    storeId?: number,
    customPoints?: number
  ) => {
    const pointsMap: Record<ContributionType, number> = {
      'store_review': 15,
      'store_photo': 10,
      'store_hours': 20,
      'store_tag': 5,
      'contact_info': 15,
      'report_incorrect_info': 10,
      'verify_info': 25,
    };

    const points = customPoints || pointsMap[type];
    
    awardPoints({
      contributionType: type,
      storeId,
      points,
    });
  };

  return { trackContribution };
};
