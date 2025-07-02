
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
  'ValueHunter', 'PennyWise', 'DealAlert', 'SnapSaver', 'BargainBabe',
  'EBTHacks', 'SnapHero', 'BudgetWise', 'DealHunter', 'SaverMom',
  'EBTExpert', 'FoodBudget', 'SnapTips', 'BargainSeeker', 'WiseShopper'
];

// Enhanced EBT-focused comment templates based on real tips and hacks
const commentTemplates = [
  // Sprouts-specific $5 sandwich mentions
  "Sprouts has $5 sandwiches that are EBT eligible — super clutch for lunch.",
  "The $5 sandwiches here work with EBT and they're actually pretty good!",
  "Pro tip: their $5 grab-and-go sandwiches are EBT approved. Perfect for work.",
  "Those $5 sandwiches at the deli counter? EBT covers them. Game changer.",
  "Love the $5 sandwich deal here - works with EBT and saves me from fast food.",
  
  // Sprouts $5 sushi mentions  
  "If you're using EBT, check out their $5 sushi Wednesdays. Worth it.",
  "$5 sushi Wednesday is legit and EBT eligible. Don't sleep on this deal.",
  "Wednesday sushi deal for $5 - works with EBT. My weekly treat!",
  "EBT covers the $5 sushi on Wednesdays. Finally some good food on a budget.",
  "Sushi Wednesday here is clutch - $5 and EBT approved. Better than grocery store sushi.",
  
  // General Sprouts EBT tips
  "This location always has great $5 grab-n-go meals that work with EBT.",
  "The ready-made meals section has tons of EBT options under $6.",
  "Grab-and-go section is clutch for EBT users. Lots of $5-7 options.",
  "Hot food bar items ring up as cold sometimes - ask if they're EBT eligible.",
  "Sprouts deli salads count as EBT if they're cold. Just FYI.",
  
  // Produce and bulk tips
  "Their produce section has the best EBT deals. Stock up on fruits here.",
  "EBT tip: buy the rotisserie chicken cold, it's way cheaper than hot.",
  "Bulk bins accept EBT - great for nuts, grains, and snacks on a budget.",
  "The vitamin water here is often on sale and EBT eligible.",
  "Pre-made salads in the cold case work with EBT. Way better than fast food.",
  
  // Store-specific observations
  "Their store brand stuff is EBT friendly and actually pretty good quality.",
  "Pro tip: EBT covers energy drinks here. Red Bull for days lol.",
  "The soup bar is hit or miss for EBT but worth asking about.",
  "Cheese selection is amazing and all EBT eligible. Perfect for meal prep.",
  "Staff here is super helpful about what's EBT eligible. No judgment.",
  
  // BOGO and sales tips
  "They run BOGO deals all the time - your EBT covers it and you get double the food.",
  "Watch for their buy-one-get-one sales. EBT pays for one, you get both!",
  "Their weekly BOGO specials are clutch for stretching EBT dollars.",
  "Stack their digital coupons with EBT - saves even more money.",
  "Load their app coupons before shopping. Works with EBT and saves big.",
  
  // Store experience
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
  
  // Seeds and plants hack
  "Did you know you can buy vegetable seeds here with EBT? Garden center accepts it.",
  "EBT covers herb plants and vegetable seedlings - grow your own food!",
  "Pro tip: tomato plants in the garden section are EBT eligible. Smart investment.",
  "You can use SNAP for food-producing plants here. Basil, tomatoes, etc.",
  
  // Online ordering
  "Their curbside pickup works with EBT - order online, pay at pickup.",
  "You can shop their website and pay with EBT for pickup. Super convenient.",
  "Online ordering here accepts EBT for pickup - saves time in store.",
  
  // Double up programs
  "This store participates in Double Up Food Bucks - extra money for produce!",
  "Ask about produce matching programs - they double your EBT for fruits/veggies.",
  "They have a program that matches EBT dollars for fresh produce. Ask customer service.",
  
  // Cold vs hot food hacks
  "Get the cold rotisserie chicken - same price but EBT eligible.",
  "Cold pizza slices work with EBT, hot ones don't. Microwave at home.",
  "Anything from the cold deli case is EBT approved. Hot bar is not.",
  "Pro tip: buy cold prepared foods and heat them at home. EBT covers it.",
  
  // General money-saving tips
  "Always check unit prices here - sometimes bulk isn't cheaper per ounce.",
  "Their digital deals stack with EBT payments. Load them in the app first.",
  "End of day bakery markdowns are still EBT eligible. Great deals.",
  "Stock up on non-perishables when they're on sale. EBT covers sale prices.",
  "Their loyalty program works with EBT - get points and discounts.",
  
  // Store logistics
  "Best time to shop is weekday mornings - fresher selection, shorter lines.",
  "They restock produce Tuesday/Thursday if you want the best selection.",
  "Customer service desk can tell you exactly what's EBT eligible if unsure.",
  "Bathrooms are always clean and they have a water fountain if you need it.",
  "Free WiFi if you need to check your EBT balance on the Providers app.",
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
