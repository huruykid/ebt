import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { SEOFooter } from '@/components/SEOFooter';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutFounder() {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Huruy Kidanemariam",
      "jobTitle": "Founder & Developer",
      "url": "https://ebtfinder.org/about-huruy-kidanemariam",
      "worksFor": {
        "@type": "Organization",
        "name": "EBT Finder",
        "url": "https://ebtfinder.org"
      },
      "knowsAbout": ["SNAP benefits", "EBT", "food assistance technology", "web development"],
      "description": "Huruy Kidanemariam is the founder and developer of EBT Finder, a free tool helping families locate SNAP-accepting stores across the United States."
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'person-schema';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.getElementById('person-schema')?.remove();
    };
  }, []);

  return (
    <>
      <SEOHead
        title="About Huruy Kidanemariam — Founder of EBT Finder"
        description="Learn about Huruy Kidanemariam, the founder and developer of EBT Finder. Discover the mission behind helping families find SNAP-accepting stores across the United States."
        keywords="Huruy Kidanemariam, EBT Finder founder, SNAP benefits, food assistance technology"
        canonicalUrl="https://ebtfinder.org/about-huruy-kidanemariam"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "About Huruy Kidanemariam", url: "/about-huruy-kidanemariam" }
      ]} />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <BreadcrumbNavigation
            items={[
              { label: 'Home', href: '/' },
              { label: 'About the Founder' }
            ]}
          />

          <article className="mt-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Huruy Kidanemariam
            </h1>
            <p className="text-lg text-primary font-medium mb-8">
              Founder &amp; Developer of EBT Finder
            </p>

            <div className="space-y-6 text-foreground leading-relaxed text-lg">
              <p>
                Huruy Kidanemariam is the founder and developer of{' '}
                <Link to="/" className="text-primary hover:text-primary/80 font-medium">EBT Finder</Link>,
                a free tool that helps families and individuals locate stores, restaurants, and farmers
                markets that accept EBT and SNAP benefits across the United States.
              </p>

              <p>
                With a passion for using technology to solve real-world problems, Huruy Kidanemariam
                built EBT Finder to address a simple but critical need: making it easier for SNAP
                recipients to find nearby locations where they can use their benefits. The platform
                now serves over 300,000 SNAP-authorized retailers nationwide.
              </p>

              <h2 className="text-2xl font-bold text-foreground pt-4">The Mission</h2>
              <p>
                Huruy Kidanemariam believes that access to nutritious food is a fundamental right.
                EBT Finder was created to bridge the gap between SNAP recipients and the stores that
                serve them — providing real-time location data, store hours, community reviews, and
                price information all in one place.
              </p>

              <h2 className="text-2xl font-bold text-foreground pt-4">Building EBT Finder</h2>
              <p>
                As the sole designer and developer, Huruy Kidanemariam handles every aspect of
                EBT Finder — from sourcing and maintaining the USDA retailer database, to building
                the search algorithms, map interfaces, and community features that make the
                platform useful for millions of Americans.
              </p>

              <div className="pt-6">
                <Button asChild>
                  <Link to="/">
                    Explore EBT Finder
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        </div>

        <SEOFooter />
      </div>
    </>
  );
}
