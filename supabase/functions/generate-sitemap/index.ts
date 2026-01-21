import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

const SITE_URL = 'https://ebtfinder.org';
const URLS_PER_SITEMAP = 45000; // Google limit is 50k, leave buffer

// State data for state landing pages
const US_STATES = [
  { slug: 'alabama', name: 'Alabama', abbr: 'AL' },
  { slug: 'alaska', name: 'Alaska', abbr: 'AK' },
  { slug: 'arizona', name: 'Arizona', abbr: 'AZ' },
  { slug: 'arkansas', name: 'Arkansas', abbr: 'AR' },
  { slug: 'california', name: 'California', abbr: 'CA' },
  { slug: 'colorado', name: 'Colorado', abbr: 'CO' },
  { slug: 'connecticut', name: 'Connecticut', abbr: 'CT' },
  { slug: 'delaware', name: 'Delaware', abbr: 'DE' },
  { slug: 'florida', name: 'Florida', abbr: 'FL' },
  { slug: 'georgia', name: 'Georgia', abbr: 'GA' },
  { slug: 'hawaii', name: 'Hawaii', abbr: 'HI' },
  { slug: 'idaho', name: 'Idaho', abbr: 'ID' },
  { slug: 'illinois', name: 'Illinois', abbr: 'IL' },
  { slug: 'indiana', name: 'Indiana', abbr: 'IN' },
  { slug: 'iowa', name: 'Iowa', abbr: 'IA' },
  { slug: 'kansas', name: 'Kansas', abbr: 'KS' },
  { slug: 'kentucky', name: 'Kentucky', abbr: 'KY' },
  { slug: 'louisiana', name: 'Louisiana', abbr: 'LA' },
  { slug: 'maine', name: 'Maine', abbr: 'ME' },
  { slug: 'maryland', name: 'Maryland', abbr: 'MD' },
  { slug: 'massachusetts', name: 'Massachusetts', abbr: 'MA' },
  { slug: 'michigan', name: 'Michigan', abbr: 'MI' },
  { slug: 'minnesota', name: 'Minnesota', abbr: 'MN' },
  { slug: 'mississippi', name: 'Mississippi', abbr: 'MS' },
  { slug: 'missouri', name: 'Missouri', abbr: 'MO' },
  { slug: 'montana', name: 'Montana', abbr: 'MT' },
  { slug: 'nebraska', name: 'Nebraska', abbr: 'NE' },
  { slug: 'nevada', name: 'Nevada', abbr: 'NV' },
  { slug: 'new-hampshire', name: 'New Hampshire', abbr: 'NH' },
  { slug: 'new-jersey', name: 'New Jersey', abbr: 'NJ' },
  { slug: 'new-mexico', name: 'New Mexico', abbr: 'NM' },
  { slug: 'new-york', name: 'New York', abbr: 'NY' },
  { slug: 'north-carolina', name: 'North Carolina', abbr: 'NC' },
  { slug: 'north-dakota', name: 'North Dakota', abbr: 'ND' },
  { slug: 'ohio', name: 'Ohio', abbr: 'OH' },
  { slug: 'oklahoma', name: 'Oklahoma', abbr: 'OK' },
  { slug: 'oregon', name: 'Oregon', abbr: 'OR' },
  { slug: 'pennsylvania', name: 'Pennsylvania', abbr: 'PA' },
  { slug: 'rhode-island', name: 'Rhode Island', abbr: 'RI' },
  { slug: 'south-carolina', name: 'South Carolina', abbr: 'SC' },
  { slug: 'south-dakota', name: 'South Dakota', abbr: 'SD' },
  { slug: 'tennessee', name: 'Tennessee', abbr: 'TN' },
  { slug: 'texas', name: 'Texas', abbr: 'TX' },
  { slug: 'utah', name: 'Utah', abbr: 'UT' },
  { slug: 'vermont', name: 'Vermont', abbr: 'VT' },
  { slug: 'virginia', name: 'Virginia', abbr: 'VA' },
  { slug: 'washington', name: 'Washington', abbr: 'WA' },
  { slug: 'west-virginia', name: 'West Virginia', abbr: 'WV' },
  { slug: 'wisconsin', name: 'Wisconsin', abbr: 'WI' },
  { slug: 'wyoming', name: 'Wyoming', abbr: 'WY' },
  { slug: 'washington-dc', name: 'Washington D.C.', abbr: 'DC' }
];

// 210+ City pages for comprehensive SEO coverage
const CITY_PAGES = [
  // Top 50 cities
  'los-angeles', 'new-york', 'brooklyn', 'chicago', 'houston', 'phoenix',
  'philadelphia', 'san-antonio', 'san-diego', 'dallas', 'san-jose', 'austin',
  'jacksonville', 'fort-worth', 'columbus', 'charlotte', 'san-francisco',
  'indianapolis', 'seattle', 'denver', 'miami', 'boston', 'atlanta', 'detroit',
  'fresno', 'sacramento', 'orlando', 'las-vegas', 'memphis', 'baltimore',
  // Cities 31-60
  'nashville', 'portland', 'oklahoma-city', 'milwaukee', 'albuquerque', 'tucson',
  'kansas-city', 'raleigh', 'long-beach', 'virginia-beach', 'oakland', 'minneapolis',
  'tulsa', 'arlington', 'tampa', 'new-orleans', 'wichita', 'cleveland', 'bakersfield',
  'aurora',
  // Cities 61-100
  'anaheim', 'st-louis', 'pittsburgh', 'riverside', 'stockton', 'cincinnati',
  'greensboro', 'plano', 'newark', 'henderson', 'lincoln', 'buffalo', 'jersey-city',
  'chula-vista', 'fort-wayne', 'durham', 'st-petersburg', 'laredo', 'norfolk',
  'madison',
  // Cities 101-150
  'lubbock', 'chandler', 'scottsdale', 'reno', 'glendale', 'gilbert',
  'north-las-vegas', 'hialeah', 'garland', 'fremont', 'baton-rouge', 'richmond',
  'boise', 'san-bernardino', 'spokane', 'des-moines', 'modesto', 'birmingham',
  'tacoma', 'fontana',
  // Cities 151-200
  'rochester', 'oxnard', 'moreno-valley', 'fayetteville', 'yonkers', 'worcester',
  'salt-lake-city', 'huntington-beach', 'grand-rapids', 'amarillo', 'santa-clarita',
  'montgomery', 'shreveport', 'little-rock', 'akron', 'augusta', 'knoxville',
  'mobile', 'huntsville', 'providence',
  // Cities 201-210
  'chattanooga', 'fort-lauderdale', 'springfield', 'corpus-christi', 'el-paso',
  'lexington', 'louisville', 'omaha', 'honolulu', 'anchorage'
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'index';
  const page = parseInt(url.searchParams.get('page') || '1');

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const today = new Date().toISOString().split('T')[0];

  try {
    if (type === 'index') {
      // Generate sitemap index
      const { count } = await supabase
        .from('snap_stores')
        .select('*', { count: 'exact', head: true });

      const totalStores = count || 0;
      const storesSitemapCount = Math.ceil(totalStores / URLS_PER_SITEMAP);

      let indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-states.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-cities.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;

      // Add store sitemaps
      for (let i = 1; i <= storesSitemapCount; i++) {
        indexXml += `
  <sitemap>
    <loc>${SITE_URL}/sitemap-stores-${i}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
      }

      indexXml += `
</sitemapindex>`;

      return new Response(indexXml, { headers: corsHeaders });
    }

    if (type === 'static') {
      // Static pages sitemap
      const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/search', priority: '0.9', changefreq: 'hourly' },
        { url: '/snap-tips', priority: '0.8', changefreq: 'weekly' },
        { url: '/mission', priority: '0.7', changefreq: 'monthly' },
        { url: '/blog', priority: '0.8', changefreq: 'daily' },
        { url: '/benefits-calculator', priority: '0.8', changefreq: 'monthly' },
        { url: '/ebt-chip-card', priority: '0.7', changefreq: 'monthly' },
        { url: '/favorites', priority: '0.5', changefreq: 'daily' },
        { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
        { url: '/support', priority: '0.5', changefreq: 'monthly' },
      ];

      // Add blog posts
      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('is_published', true);

      let staticXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      for (const page of staticPages) {
        staticXml += `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      }

      if (blogPosts) {
        for (const post of blogPosts) {
          staticXml += `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${post.updated_at?.split('T')[0] || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        }
      }

      staticXml += `
</urlset>`;

      return new Response(staticXml, { headers: corsHeaders });
    }

    if (type === 'states') {
      // State landing pages sitemap
      let statesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      for (const state of US_STATES) {
        statesXml += `
  <url>
    <loc>${SITE_URL}/state/${state.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }

      statesXml += `
</urlset>`;

      return new Response(statesXml, { headers: corsHeaders });
    }

    if (type === 'cities') {
      // City pages sitemap - use /city/ prefix for SEO consistency
      let citiesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      for (const city of CITY_PAGES) {
        citiesXml += `
  <url>
    <loc>${SITE_URL}/city/${city}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }

      citiesXml += `
</urlset>`;

      return new Response(citiesXml, { headers: corsHeaders });
    }

    if (type === 'stores') {
      // Store pages sitemap (paginated)
      const offset = (page - 1) * URLS_PER_SITEMAP;
      
      const { data: stores, error } = await supabase
        .from('snap_stores')
        .select('id, Store_Name, City, State')
        .range(offset, offset + URLS_PER_SITEMAP - 1)
        .order('id');

      if (error) {
        console.error('Error fetching stores:', error);
        return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
      }

      let storesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      for (const store of stores || []) {
        storesXml += `
  <url>
    <loc>${SITE_URL}/store/${store.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }

      storesXml += `
</urlset>`;

      return new Response(storesXml, { headers: corsHeaders });
    }

    return new Response('Invalid sitemap type', { status: 400, headers: corsHeaders });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(`Error generating sitemap: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
