import { SEOHead } from '@/components/SEOHead';

export default function Blog() {
  return (
    <>
      <SEOHead
        title="SNAP Savvy Blog - EBT Tips, Recipes & Resources | EBT Finder"
        description="Discover practical tips to maximize your SNAP benefits, find EBT-friendly recipes, and learn about programs that help stretch your food budget."
        keywords="SNAP tips, EBT recipes, food stamp resources, maximize SNAP benefits, budget recipes"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">SNAP Savvy Blog</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your resource for maximizing SNAP benefits, finding resources, and stretching your food budget.
          </p>

          <div className="space-y-6">
            <article className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-2">Coming Soon: Blog Articles</h2>
              <p className="text-muted-foreground mb-4">
                We're working on bringing you helpful content about maximizing your SNAP benefits, 
                budget-friendly recipes, and resources to help you make the most of your benefits.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Tips & Tricks</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Recipes</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Resources</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
