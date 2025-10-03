-- Create blog categories table
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  author TEXT NOT NULL,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  featured_image TEXT,
  excerpt TEXT,
  body TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0
);

-- Create blog tags table
CREATE TABLE public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create post_tags junction table
CREATE TABLE public.post_tags (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  featured_image TEXT,
  cost_per_serving NUMERIC(10,2),
  servings INTEGER,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  nutrition_info JSONB,
  snap_eligible BOOLEAN DEFAULT true,
  category TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_published BOOLEAN DEFAULT false
);

-- Create newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'website'
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories
CREATE POLICY "Anyone can view published categories"
  ON public.blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.blog_categories FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- RLS Policies for blog_posts
CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all posts"
  ON public.blog_posts FOR SELECT
  USING (is_admin_user());

CREATE POLICY "Admins can manage posts"
  ON public.blog_posts FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- RLS Policies for blog_tags
CREATE POLICY "Anyone can view tags"
  ON public.blog_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tags"
  ON public.blog_tags FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- RLS Policies for post_tags
CREATE POLICY "Anyone can view post tags"
  ON public.post_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage post tags"
  ON public.post_tags FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- RLS Policies for recipes
CREATE POLICY "Anyone can view published recipes"
  ON public.recipes FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all recipes"
  ON public.recipes FOR SELECT
  USING (is_admin_user());

CREATE POLICY "Admins can manage recipes"
  ON public.recipes FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- RLS Policies for newsletter_subscribers
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (is_admin_user());

CREATE POLICY "Admins can manage subscribers"
  ON public.newsletter_subscribers FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Create indexes
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
CREATE INDEX idx_recipes_slug ON public.recipes(slug);
CREATE INDEX idx_recipes_published ON public.recipes(is_published, published_at DESC);
CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);

-- Create trigger for updated_at
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial categories
INSERT INTO public.blog_categories (name, slug, description) VALUES
  ('Maximizing Benefits', 'maximizing-benefits', 'Tips and strategies to stretch your SNAP benefits further'),
  ('Where to Use EBT', 'where-to-use-ebt', 'Discover stores, restaurants, and markets accepting EBT'),
  ('Nutrition & Recipes', 'nutrition-recipes', 'Healthy, affordable recipes for SNAP recipients'),
  ('Programs & Incentives', 'programs-incentives', 'Learn about matching programs and special benefits'),
  ('Storeowner Guides', 'storeowner-guides', 'Resources for businesses accepting EBT'),
  ('Policy & Rights', 'policy-rights', 'Know your rights and understand SNAP policies');

-- Seed initial blog posts
INSERT INTO public.blog_posts (title, slug, author, category_id, body, excerpt, is_published, published_at, meta_title, meta_description) VALUES
  (
    '5 Legal Ways to Stretch Your SNAP/EBT Benefits This Month',
    '5-legal-ways-stretch-snap-benefits',
    'SNAP Savvy Team',
    (SELECT id FROM public.blog_categories WHERE slug = 'maximizing-benefits'),
    E'<h2>Introduction</h2><p>Making your SNAP benefits last the entire month can be challenging, but there are several legal and ethical strategies you can use to maximize your purchasing power. Here are five proven methods to stretch your benefits further.</p>

<h2>1. Shop at Farmers Markets with Matching Programs</h2><p>Many farmers markets across the country offer matching programs like Double Up Food Bucks. When you spend $20 in SNAP benefits on fruits and vegetables, you receive an additional $20 to spend on fresh produce. This effectively doubles your purchasing power for healthy foods.</p>

<h3>How to Find Matching Programs:</h3><ul><li>Visit your local farmers market and ask about SNAP matching</li><li>Check the USDA SNAP retailer locator</li><li>Look for markets displaying "SNAP Accepted Here" signs</li></ul>

<h2>2. Buy Generic and Store Brands</h2><p>Store-brand and generic products are typically 20-30% cheaper than name brands while maintaining similar quality. Focus your generic purchases on:</p><ul><li>Canned vegetables and fruits</li><li>Dried pasta and rice</li><li>Frozen vegetables</li><li>Dairy products</li><li>Bread and bakery items</li></ul>

<h2>3. Plan Meals Around Sales</h2><p>Check weekly store circulars before shopping and plan your meals around items that are on sale. Stock up on non-perishables when they''re discounted, and freeze meat and bread when prices are low.</p>

<h2>4. Use the WIC Program If Eligible</h2><p>If you have children under 5 or are pregnant, you may qualify for WIC (Women, Infants, and Children) benefits in addition to SNAP. WIC provides specific foods like milk, eggs, cereal, and infant formula at no cost.</p>

<h2>5. Take Advantage of Loyalty Programs</h2><p>Many grocery stores offer free loyalty programs that provide additional discounts and coupons. These savings stack on top of your SNAP benefits, helping you get more for your money.</p>

<h2>Conclusion</h2><p>By implementing these five strategies, you can significantly extend the value of your SNAP benefits throughout the month. Remember, these are all legal and encouraged ways to maximize your assistance. Start with one or two strategies and gradually incorporate more as you become comfortable.</p>',
    'Discover five legal, proven strategies to maximize your SNAP benefits and make your food assistance dollars go further each month.',
    true,
    now(),
    '5 Legal Ways to Stretch Your SNAP Benefits | SNAP Savvy',
    'Learn how to maximize your SNAP/EBT benefits with these 5 legal strategies including farmers market matching programs, smart shopping tips, and more.'
  ),
  (
    'How SNAP Matching Programs at Farmers Markets Work',
    'snap-matching-programs-farmers-markets',
    'SNAP Savvy Team',
    (SELECT id FROM public.blog_categories WHERE slug = 'programs-incentives'),
    E'<h2>What Are SNAP Matching Programs?</h2><p>SNAP matching programs, also known as incentive programs, help SNAP recipients purchase more fresh fruits and vegetables by providing additional funds when they shop at participating locations. The most common program is Double Up Food Bucks, but many states have their own versions.</p>

<h2>How They Work</h2><p>The concept is simple but powerful:</p><ol><li>Visit a participating farmers market</li><li>Use your EBT card to purchase tokens or receive a voucher</li><li>Receive matching dollars (usually up to $10-$30 per day) to spend on fresh produce</li><li>Shop from local farmers for fresh, healthy foods</li></ol>

<h2>Example Transaction</h2><p>Here''s how a typical transaction works:</p><ul><li>You swipe your EBT card for $20</li><li>You receive $20 in market tokens PLUS an additional $20 in matching tokens</li><li>You now have $40 to spend on fresh fruits and vegetables</li><li>That''s 100% more purchasing power for healthy foods!</li></ul>

<h2>State-by-State Programs</h2>

<h3>Michigan - Double Up Food Bucks</h3><p>Michigan offers one of the most generous programs with up to $20 per day matching at farmers markets and participating grocery stores.</p>

<h3>California - Market Match</h3><p>California''s program typically offers dollar-for-dollar matching up to $10 per market day.</p>

<h3>New York - Health Bucks</h3><p>NYC''s program provides $2 Health Bucks coupons for every $5 spent in SNAP benefits, up to $10 per day.</p>

<h2>Finding Participating Markets</h2><p>To find SNAP matching programs near you:</p><ul><li>Check the Fair Food Network website for Double Up locations</li><li>Visit your state''s agriculture department website</li><li>Call your local farmers markets directly</li><li>Look for signs at market entrances</li></ul>

<h2>Tips for Success</h2><ol><li><strong>Go early:</strong> Best selection of produce is usually in the morning</li><li><strong>Bring bags:</strong> Many markets encourage reusable bags</li><li><strong>Ask questions:</strong> Farmers love to share cooking tips and recipes</li><li><strong>Plan ahead:</strong> Know which vendors accept SNAP before you go</li></ol>

<h2>Conclusion</h2><p>SNAP matching programs at farmers markets are one of the best ways to maximize your benefits while supporting local agriculture and getting the freshest produce possible. With programs available in most states, there''s likely a participating market near you.</p>',
    'Learn how SNAP matching programs at farmers markets can double your purchasing power for fresh fruits and vegetables.',
    true,
    now(),
    'How SNAP Matching Programs Work | Double Your Benefits',
    'Discover how SNAP matching programs at farmers markets can double your benefits for fresh produce. Find programs in your state and maximize your food assistance.'
  ),
  (
    'How Small Stores Can Start Accepting EBT — Step by Step',
    'small-stores-accept-ebt-guide',
    'SNAP Savvy Team',
    (SELECT id FROM public.blog_categories WHERE slug = 'storeowner-guides'),
    E'<h2>Why Accept EBT?</h2><p>Accepting EBT/SNAP benefits can significantly expand your customer base and increase sales. With over 42 million Americans using SNAP benefits, becoming an authorized retailer can help your small store thrive while serving your community.</p>

<h2>Step 1: Determine Eligibility</h2><p>To accept SNAP benefits, your store must:</p><ul><li>Have a valid business license</li><li>Maintain a fixed location (mobile vendors have different requirements)</li><li>Stock a minimum variety of staple foods in at least 3 of these categories:</li><ul><li>Dairy products</li><li>Breads and cereals</li><li>Fruits and vegetables</li><li>Meats, poultry, and fish</li></ul><li>Offer perishable foods in at least 2 categories</li></ul>

<h2>Step 2: Gather Required Documents</h2><p>You''ll need:</p><ul><li>Store tax ID (EIN) or Social Security Number</li><li>Business license or permit</li><li>Articles of incorporation (if applicable)</li><li>Current store inventory list</li><li>Business bank account information</li><li>Contact information for all store owners/officers</li></ul>

<h2>Step 3: Complete the Application</h2><p>Apply online through the USDA Food and Nutrition Service at <a href="https://www.fns.usda.gov/snap/retailer" target="_blank">www.fns.usda.gov/snap/retailer</a></p>

<p>The application typically takes 45-60 days to process. You can check your application status online.</p>

<h2>Step 4: Pass the Site Inspection</h2><p>If your application is approved, a USDA inspector will visit your store to verify:</p><ul><li>You stock the required food categories</li><li>Your inventory matches what you reported</li><li>Your store is operating as described</li></ul>

<h2>Step 5: Get EBT Equipment</h2><p>Once authorized, you''ll need:</p><ul><li>An EBT-capable point-of-sale terminal</li><li>Internet connection for transaction processing</li><li>Staff training on EBT procedures</li></ul>

<p>Many payment processors offer EBT terminals. Compare rates from:</p><ul><li>Your current payment processor</li><li>FIS (formerly WorldPay)</li><li>Elavon</li><li>Clover</li></ul>

<h2>Step 6: Train Your Staff</h2><p>Ensure all employees know:</p><ul><li>How to process EBT transactions</li><li>Which items are SNAP-eligible</li><li>What to do if a transaction is declined</li><li>How to split payments (EBT + cash/card)</li></ul>

<h2>Step 7: Display Your Authorization</h2><p>Once approved, display:</p><ul><li>Your SNAP retailer authorization letter</li><li>"We Accept EBT" signs at entrances and checkout</li><li>Information about which items are SNAP-eligible</li></ul>

<h2>Costs and Fees</h2><p>Expected costs include:</p><ul><li>Application: Free</li><li>EBT terminal: $0-$300 (or monthly rental $20-$40)</li><li>Transaction fees: Typically 1-2% per transaction</li><li>No monthly minimums for SNAP transactions</li></ul>

<h2>Restaurant Meals Program (RMP)</h2><p>If you operate a restaurant, you may be eligible for RMP, which allows you to accept EBT from:</p><ul><li>Elderly individuals (60+)</li><li>Disabled persons</li><li>Homeless individuals</li></ul>

<p>RMP is only available in certain states: California, Arizona, Illinois, Maryland, Michigan, New York, Rhode Island, and Virginia.</p>

<h2>Maintaining Compliance</h2><p>To keep your authorization:</p><ul><li>Never manually key in EBT card numbers</li><li>Don''t accept EBT for ineligible items</li><li>Maintain required inventory levels</li><li>Respond promptly to USDA communications</li><li>Update your information if you move or change ownership</li></ul>

<h2>Resources</h2><ul><li>USDA SNAP Retailer Service Center: 1-877-823-4369</li><li>Online retailer portal: <a href="https://www.fns.usda.gov/snap/retailer" target="_blank">fns.usda.gov/snap/retailer</a></li><li>State SNAP agencies for local support</li></ul>

<h2>Conclusion</h2><p>Accepting EBT can be a game-changer for small stores. While the application process requires patience, the benefits of serving SNAP recipients and increasing your customer base make it worthwhile. Follow these steps carefully, and you''ll be accepting EBT in no time.</p>',
    'A comprehensive guide for small store owners on how to become authorized to accept EBT/SNAP benefits.',
    true,
    now(),
    'How to Accept EBT: Complete Guide for Small Stores | SNAP Savvy',
    'Step-by-step guide for small stores to start accepting EBT/SNAP benefits. Learn about eligibility, application process, costs, and compliance requirements.'
  );

-- Add some tags
INSERT INTO public.blog_tags (name, slug) VALUES
  ('SNAP Tips', 'snap-tips'),
  ('Farmers Markets', 'farmers-markets'),
  ('Budget Friendly', 'budget-friendly'),
  ('Store Owners', 'store-owners'),
  ('EBT Guide', 'ebt-guide'),
  ('Healthy Eating', 'healthy-eating');

COMMENT ON TABLE public.blog_posts IS 'Blog posts for SNAP Savvy Blog with SEO and content management features';
COMMENT ON TABLE public.recipes IS 'SNAP-friendly recipes with cost, nutrition, and schema markup support';
COMMENT ON TABLE public.newsletter_subscribers IS 'Email subscribers for SNAP Savvy newsletter';