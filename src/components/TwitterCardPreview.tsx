import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Twitter, Facebook, Linkedin } from 'lucide-react';

export const TwitterCardPreview = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const ogData = {
    title: "Find EBT & SNAP-Approved Stores Near You | EBT Finder",
    description: "Easily find stores, restaurants, and markets that accept EBT and SNAP benefits. Filter by ZIP code, store type, or hot meal eligibility. Mobile-friendly and free.",
    image: "/og-image.png",
    url: "https://ebtfinder.org"
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Social Card Preview</h1>
        <p className="text-muted-foreground">Preview how your site appears when shared on social media</p>
      </div>

      {/* Twitter Card Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Twitter className="h-5 w-5 text-[#1DA1F2]" />
            Twitter Card Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-2xl overflow-hidden bg-card max-w-[506px]">
            <div className="aspect-[1.91/1] bg-muted relative">
              <img
                src={ogData.image}
                alt="OG Preview"
                className={`w-full h-full object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Loading image...</div>
                </div>
              )}
            </div>
            <div className="p-3 space-y-1">
              <p className="text-xs text-muted-foreground">{ogData.url.replace('https://', '')}</p>
              <h3 className="font-semibold text-foreground line-clamp-1">{ogData.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{ogData.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facebook Card Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Facebook className="h-5 w-5 text-[#1877F2]" />
            Facebook Card Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden bg-card max-w-[500px]">
            <div className="aspect-[1.91/1] bg-muted">
              <img
                src={ogData.image}
                alt="OG Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 bg-muted/50 space-y-1">
              <p className="text-xs text-muted-foreground uppercase">{ogData.url.replace('https://', '')}</p>
              <h3 className="font-bold text-foreground line-clamp-2">{ogData.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{ogData.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Card Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Linkedin className="h-5 w-5 text-[#0A66C2]" />
            LinkedIn Card Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden bg-card max-w-[552px]">
            <div className="aspect-[1.91/1] bg-muted">
              <img
                src={ogData.image}
                alt="OG Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-1">
              <h3 className="font-semibold text-foreground line-clamp-2">{ogData.title}</h3>
              <p className="text-xs text-muted-foreground">{ogData.url.replace('https://', '')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">External Validators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Test your live site using these official validation tools:
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://cards-dev.twitter.com/validator" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Twitter className="h-4 w-4" />
                Twitter Validator
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://developers.facebook.com/tools/debug/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Facebook className="h-4 w-4" />
                Facebook Debugger
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://www.linkedin.com/post-inspector/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn Inspector
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
