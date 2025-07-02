
export interface GeneratedComment {
  text: string;
  userName: string;
  createdAt: Date;
}

// Realistic usernames that feel authentic
const userNames = [
  'Sarah_M', 'MikeEBT', 'CaliforniaDeals', 'BudgetMom23', 'EBTSaver',
  'GroceryGuru', 'SnapDealFinder', 'FoodieOnSnap', 'CouponsNCash',
  'BargainHunter', 'HealthyEats4Less', 'SmartShopper91', 'DealSeeker',
  'FrugalFamily', 'SavingsExpert', 'BudgetGuru', 'CheapEats', 'ThriftyMom',
  'ValueHunter', 'PennyWise', 'DealAlert', 'SnapSaver', 'BargainBabe'
];

// Realistic EBT-focused comment templates
const commentTemplates = [
  // $5 sandwich mentions
  "Sprouts has $5 sandwiches that are EBT eligible — super clutch for lunch.",
  "The $5 sandwiches here work with EBT and they're actually pretty good!",
  "Pro tip: their $5 grab-and-go sandwiches are EBT approved. Perfect for work.",
  "Those $5 sandwiches at the deli counter? EBT covers them. Game changer.",
  
  // $5 sushi mentions  
  "If you're using EBT, check out their $5 sushi Wednesdays. Worth it.",
  "$5 sushi Wednesday is legit and EBT eligible. Don't sleep on this deal.",
  "Wednesday sushi deal for $5 - works with EBT. My weekly treat!",
  "EBT covers the $5 sushi on Wednesdays. Finally some good food on a budget.",
  
  // Grab-n-go meals
  "This location always has great $5 grab-n-go meals that work with EBT.",
  "The ready-made meals section has tons of EBT options under $6.",
  "Grab-and-go section is clutch for EBT users. Lots of $5-7 options.",
  "Hot food bar items ring up as cold sometimes - ask if they're EBT eligible.",
  
  // General EBT tips
  "Sprouts deli salads count as EBT if they're cold. Just FYI.",
  "Their produce section has the best EBT deals. Stock up on fruits here.",
  "EBT tip: buy the rotisserie chicken cold, it's way cheaper than hot.",
  "Bulk bins accept EBT - great for nuts, grains, and snacks on a budget.",
  "The vitamin water here is often on sale and EBT eligible.",
  "Pre-made salads in the cold case work with EBT. Way better than fast food.",
  "Their store brand stuff is EBT friendly and actually pretty good quality.",
  "Pro tip: EBT covers energy drinks here. Red Bull for days lol.",
  "The soup bar is hit or miss for EBT but worth asking about.",
  "Cheese selection is amazing and all EBT eligible. Perfect for meal prep.",
  
  // Location-specific observations
  "Staff here is super helpful about what's EBT eligible. No judgment.",
  "This location keeps the good stuff stocked. Never disappointed.",
  "Parking can be crazy but the EBT deals make it worth it.",
  "Clean store, good selection, EBT runs smooth here.",
  "They actually have cart wipes that work lol. Small things matter.",
  "Self-checkout works fine with EBT if you don't want to deal with people.",
  "The produce quality is way better than other stores in the area.",
  "Lines move fast here even during peak hours. Appreciate that.",
  
  // Specific product callouts
  "Their kombucha selection is huge and most are EBT eligible.",
  "Organic frozen meals on sale + EBT = winning combo.",
  "The bakery section has day-old bread that's still EBT covered.",
  "Fresh juice bar is pricey but EBT works if you need that vitamin boost.",
  "Protein bars in the supplement aisle - check if they're food vs supplement.",
  "The olive bar is EBT eligible by weight. Great for Mediterranean meals.",
  "Specialty diet foods (keto, paleo) often work with EBT here.",
  "Their coconut water is overpriced but goes on sale often.",
];

// Generate random date within last 3 weeks
function getRandomDate(): Date {
  const now = new Date();
  const threeWeeksAgo = new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000));
  const randomTime = threeWeeksAgo.getTime() + Math.random() * (now.getTime() - threeWeeksAgo.getTime());
  return new Date(randomTime);
}

// Generate a realistic comment
export function generateComment(): GeneratedComment {
  const randomTemplate = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
  const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
  
  return {
    text: randomTemplate,
    userName: randomUser,
    createdAt: getRandomDate()
  };
}

// Generate multiple unique comments (avoiding duplicates for same store)
export function generateCommentsForStore(storeId: string, count: number = 2): GeneratedComment[] {
  const comments: GeneratedComment[] = [];
  const usedTemplates = new Set<string>();
  const usedUsers = new Set<string>();
  
  while (comments.length < count && usedTemplates.size < commentTemplates.length) {
    const comment = generateComment();
    
    // Ensure no duplicate templates or users for this store
    if (!usedTemplates.has(comment.text) && !usedUsers.has(comment.userName)) {
      usedTemplates.add(comment.text);
      usedUsers.add(comment.userName);
      comments.push(comment);
    }
  }
  
  // Sort by date (oldest first)
  return comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
