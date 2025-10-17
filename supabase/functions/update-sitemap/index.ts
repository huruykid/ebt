import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlogPost {
  slug: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting sitemap generation...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch published blog posts
    const { data: blogPosts, error } = await supabaseClient
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }

    console.log(`Found ${blogPosts?.length || 0} published blog posts`);

    // Generate current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Static pages
    const staticPages = [
      { loc: 'https://ebtfinder.org/', changefreq: 'hourly', priority: '1.0', lastmod: today },
      { loc: 'https://ebtfinder.org/search', changefreq: 'daily', priority: '0.9', lastmod: today },
      { loc: 'https://ebtfinder.org/snap-tips', changefreq: 'weekly', priority: '0.9', lastmod: today },
      { loc: 'https://ebtfinder.org/blog', changefreq: 'weekly', priority: '0.9', lastmod: today },
      { loc: 'https://ebtfinder.org/mission', changefreq: 'monthly', priority: '0.8', lastmod: today },
      { loc: 'https://ebtfinder.org/ebt-chip-card', changefreq: 'monthly', priority: '0.7', lastmod: today },
      { loc: 'https://ebtfinder.org/city/los-angeles', changefreq: 'weekly', priority: '0.8', lastmod: today },
      { loc: 'https://ebtfinder.org/city/chicago-ebt', changefreq: 'weekly', priority: '0.8', lastmod: today },
      { loc: 'https://ebtfinder.org/city/houston', changefreq: 'weekly', priority: '0.8', lastmod: today },
      { loc: 'https://ebtfinder.org/city/phoenix', changefreq: 'weekly', priority: '0.8', lastmod: today },
      { loc: 'https://ebtfinder.org/city/philadelphia', changefreq: 'weekly', priority: '0.8', lastmod: today },
      { loc: 'https://ebtfinder.org/city/san-antonio', changefreq: 'weekly', priority: '0.8', lastmod: today },
      { loc: 'https://ebtfinder.org/city/san-diego', changefreq: 'weekly', priority: '0.8', lastmod: today },
      { loc: 'https://ebtfinder.org/city/dallas', changefreq: 'weekly', priority: '0.8', lastmod: today },
      { loc: 'https://ebtfinder.org/search/grocery-stores', changefreq: 'daily', priority: '0.8', lastmod: today },
      { loc: 'https://ebtfinder.org/search/restaurants', changefreq: 'daily', priority: '0.8', lastmod: today },
      { loc: 'https://ebtfinder.org/search/farmers-markets', changefreq: 'weekly', priority: '0.7', lastmod: today },
      { loc: 'https://ebtfinder.org/privacy-policy', changefreq: 'monthly', priority: '0.5', lastmod: today },
      { loc: 'https://ebtfinder.org/support', changefreq: 'monthly', priority: '0.6', lastmod: today },
    ];

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${page.loc}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
      xml += '  </url>\n';
    }

    // Add blog posts
    if (blogPosts && blogPosts.length > 0) {
      for (const post of blogPosts as BlogPost[]) {
        const lastmod = post.updated_at.split('T')[0];
        xml += '  <url>\n';
        xml += `    <loc>https://ebtfinder.org/blog/${post.slug}</loc>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';

    console.log('Sitemap generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sitemap generated successfully',
        blogPostCount: blogPosts?.length || 0,
        sitemap: xml,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
