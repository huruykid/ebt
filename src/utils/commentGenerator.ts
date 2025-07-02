export interface GeneratedComment {
  text: string;
  userName: string;
  createdAt: Date;
}

// Import the new store-specific system
import { getCommentsForStore } from './storeSpecificComments';

// Enhanced usernames that feel authentic
const userNames = [
  'Sarah_M', 'MikeEBT', 'CaliforniaDeals', 'BudgetMom23', 'EBTSaver',
  'GroceryGuru', 'SnapDealFinder', 'FoodieOnSnap', 'CouponsNCash',
  'BargainHunter', 'HealthyEats4Less', 'SmartShopper91', 'DealSeeker',
  'FrugalFamily', 'SavingsExpert', 'BudgetGuru', 'CheapEats', 'ThriftyMom',
  'ValueHunter', 'PennyWise', 'DealAlert', 'SnapSaver', 'BargainBabe',
  'EBTHacks', 'SnapHero', 'BudgetWise', 'DealHunter', 'SaverMom',
  'EBTExpert', 'FoodBudget', 'SnapTips', 'BargainSeeker', 'WiseShopper',
  'CouponQueen', 'BudgetBoss', 'SnapSmart', 'DollarStretcher', 'WiseSpender',
  'MealPlanner', 'BargainBetty', 'SnapDeals', 'ThriftyDad', 'SavvySaver'
];

// Generate random date within last 3 weeks
function getRandomDate(): Date {
  const now = new Date();
  const threeWeeksAgo = new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000));
  const randomTime = threeWeeksAgo.getTime() + Math.random() * (now.getTime() - threeWeeksAgo.getTime());
  return new Date(randomTime);
}

// Generate a realistic comment using store-specific templates
export function generateComment(storeName?: string): GeneratedComment {
  const storeComments = getCommentsForStore(storeName || '');
  const randomTemplate = storeComments[Math.floor(Math.random() * storeComments.length)];
  const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
  
  return {
    text: randomTemplate,
    userName: randomUser,
    createdAt: getRandomDate()
  };
}

// Generate multiple unique comments for a store
export function generateCommentsForStore(storeId: string, count: number = 2, storeName?: string): GeneratedComment[] {
  const storeComments = getCommentsForStore(storeName || '');
  const comments: GeneratedComment[] = [];
  const usedTemplates = new Set<string>();
  const usedUsers = new Set<string>();
  
  while (comments.length < count && usedTemplates.size < storeComments.length) {
    const randomTemplate = storeComments[Math.floor(Math.random() * storeComments.length)];
    const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
    
    // Ensure no duplicate templates or users for this store
    if (!usedTemplates.has(randomTemplate) && !usedUsers.has(randomUser)) {
      usedTemplates.add(randomTemplate);
      usedUsers.add(randomUser);
      comments.push({
        text: randomTemplate,
        userName: randomUser,
        createdAt: getRandomDate()
      });
    }
  }
  
  // Sort by date (oldest first)
  return comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
