import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewToInsert {
  rating: number;
  review_text: string;
  store_id: number;
  user_id: string;
}

const storeReviews: ReviewToInsert[] = [
  {
    rating: 5,
    review_text: "Amazing EBT experience! Walmart curbside pickup works perfectly with EBT - just pay at the window when you arrive. Super convenient and the staff is always helpful.",
    store_id: 2019,
    user_id: "1aad7c79-105d-4ff7-bb5b-f2f6bf25d22e"
  },
  {
    rating: 5,
    review_text: "Pro tip that saved me money: Buy the rotisserie chicken from the cold case, not the hot bar. EBT covers it and it's the same delicious chicken! Great value at $4.98.",
    store_id: 2049,
    user_id: "1aad7c79-105d-4ff7-bb5b-f2f6bf25d22e"
  },
  {
    rating: 5,
    review_text: "You can filter by 'EBT Eligible' on Walmart's website before placing pickup orders. This makes shopping so much easier! Their Great Value brand is EBT eligible and way cheaper than name brands.",
    store_id: 2051,
    user_id: "eae18b88-9608-4803-8a16-7c4bb350d2d8"
  },
  {
    rating: 5,
    review_text: "Costco accepts EBT for all food items - great for bulk buying with SNAP! Their $4.99 rotisserie chicken is huge and EBT eligible. Kirkland Signature brand works with EBT and offers great value per unit.",
    store_id: 116,
    user_id: "eae18b88-9608-4803-8a16-7c4bb350d2d8"
  },
  {
    rating: 5,
    review_text: "Best grocery prices in town! Aldi has the lowest grocery prices and accepts EBT for everything food-related. Their Simply Nature organic line is EBT eligible and super affordable.",
    store_id: 41,
    user_id: "d6acaf9f-cf81-40e9-88e5-69c81c42a426"
  },
  {
    rating: 5,
    review_text: "Love this place! Sprouts has $5 sandwiches that are EBT eligible — super clutch for lunch. The $5 sushi Wednesday deal is legit and EBT eligible too. Don't sleep on this deal!",
    store_id: 1849,
    user_id: "d6acaf9f-cf81-40e9-88e5-69c81c42a426"
  },
  {
    rating: 5,
    review_text: "Aldi curbside pickup works with EBT and is usually free. Never Alone brand items are EBT eligible and surprisingly good quality. Clean store with reasonable prices on SNAP-eligible items.",
    store_id: 2034,
    user_id: "3e036bc9-44b4-4879-ac9f-92fab01ca938"
  },
  {
    rating: 5,
    review_text: "Can't use EBT on Costco.com but you can order through Instacart with SNAP! Great selection and bulk savings. Staff here is helpful about what's EBT eligible. No judgment at all.",
    store_id: 1979,
    user_id: "3e036bc9-44b4-4879-ac9f-92fab01ca938"
  },
  {
    rating: 5,
    review_text: "Use Walmart Pay app with your EBT card for faster self-checkout. Garden center accepts EBT for vegetable seeds and food-producing plants too! Great for growing your own food.",
    store_id: 2054,
    user_id: "1aad7c79-105d-4ff7-bb5b-f2f6bf25d22e"
  },
  {
    rating: 5,
    review_text: "Walmart grocery pickup is free over $35 and works great with EBT. Load digital coupons in the app - they stack with EBT purchases for extra savings!",
    store_id: 2075,  
    user_id: "eae18b88-9608-4803-8a16-7c4bb350d2d8"
  }
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Starting EBT review seeding...');
    
    // Check existing reviews to avoid duplicates
    const { data: existingReviews } = await supabase
      .from('reviews')
      .select('store_id, user_id')
      .in('store_id', storeReviews.map(r => r.store_id));
    
    const existingCombos = new Set(
      (existingReviews || []).map(r => `${r.store_id}-${r.user_id}`)
    );
    
    // Filter out reviews that already exist
    const newReviews = storeReviews.filter(review => 
      !existingCombos.has(`${review.store_id}-${review.user_id}`)
    );
    
    if (newReviews.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'All EBT reviews already exist',
        inserted: 0,
        skipped: storeReviews.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Inserting ${newReviews.length} new EBT reviews...`);
    
    // Insert the new reviews
    const { data, error } = await supabase
      .from('reviews')
      .insert(newReviews)
      .select();
    
    if (error) {
      console.error('Error inserting reviews:', error);
      throw error;
    }
    
    console.log(`Successfully inserted ${data?.length || 0} EBT reviews`);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully created ${data?.length || 0} EBT-focused 5-star reviews`,
      inserted: data?.length || 0,
      skipped: storeReviews.length - newReviews.length,
      reviews: data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in review seeding:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: `Review seeding failed: ${error.message}`,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});