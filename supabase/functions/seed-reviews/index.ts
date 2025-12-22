import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Synthetic system user ID for seeded reviews (not a real user)
const SEED_SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';

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
    user_id: SEED_SYSTEM_USER_ID
  },
  {
    rating: 5,
    review_text: "Pro tip that saved me money: Buy the rotisserie chicken from the cold case, not the hot bar. EBT covers it and it's the same delicious chicken! Great value at $4.98.",
    store_id: 2049,
    user_id: SEED_SYSTEM_USER_ID
  },
  {
    rating: 5,
    review_text: "You can filter by 'EBT Eligible' on Walmart's website before placing pickup orders. This makes shopping so much easier! Their Great Value brand is EBT eligible and way cheaper than name brands.",
    store_id: 2051,
    user_id: SEED_SYSTEM_USER_ID
  },
  {
    rating: 5,
    review_text: "Costco accepts EBT for all food items - great for bulk buying with SNAP! Their $4.99 rotisserie chicken is huge and EBT eligible. Kirkland Signature brand works with EBT and offers great value per unit.",
    store_id: 116,
    user_id: SEED_SYSTEM_USER_ID
  },
  {
    rating: 5,
    review_text: "Best grocery prices in town! Aldi has the lowest grocery prices and accepts EBT for everything food-related. Their Simply Nature organic line is EBT eligible and super affordable.",
    store_id: 41,
    user_id: SEED_SYSTEM_USER_ID
  },
  {
    rating: 5,
    review_text: "Love this place! Sprouts has $5 sandwiches that are EBT eligible — super clutch for lunch. The $5 sushi Wednesday deal is legit and EBT eligible too. Don't sleep on this deal!",
    store_id: 1849,
    user_id: SEED_SYSTEM_USER_ID
  },
  {
    rating: 5,
    review_text: "Aldi curbside pickup works with EBT and is usually free. Never Alone brand items are EBT eligible and surprisingly good quality. Clean store with reasonable prices on SNAP-eligible items.",
    store_id: 2034,
    user_id: SEED_SYSTEM_USER_ID
  },
  {
    rating: 5,
    review_text: "Can't use EBT on Costco.com but you can order through Instacart with SNAP! Great selection and bulk savings. Staff here is helpful about what's EBT eligible. No judgment at all.",
    store_id: 1979,
    user_id: SEED_SYSTEM_USER_ID
  },
  {
    rating: 5,
    review_text: "Use Walmart Pay app with your EBT card for faster self-checkout. Garden center accepts EBT for vegetable seeds and food-producing plants too! Great for growing your own food.",
    store_id: 2054,
    user_id: SEED_SYSTEM_USER_ID
  },
  {
    rating: 5,
    review_text: "Walmart grocery pickup is free over $35 and works great with EBT. Load digital coupons in the app - they stack with EBT purchases for extra savings!",
    store_id: 2075,  
    user_id: SEED_SYSTEM_USER_ID
  }
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with user auth to verify permissions
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Verify user is authenticated and is admin
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    
    if (roleError || !isAdmin) {
      console.error('Admin check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden - admin access required for seeding' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
      message: `Successfully created ${data?.length || 0} EBT-focused 5-star reviews using synthetic system user`,
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
      message: 'An error occurred during review seeding. Please try again later.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
