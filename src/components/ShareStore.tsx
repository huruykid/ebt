
import React, { useState } from 'react';
import { Share, Copy, Check, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface ShareStoreProps {
  store: Store;
  variant?: 'icon' | 'button';
  className?: string;
}

export const ShareStore: React.FC<ShareStoreProps> = ({ 
  store, 
  variant = 'button', 
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const storeUrl = `${window.location.origin}/store/${store.id}`;
  
  const shareData = {
    title: `${store.Store_Name} - SNAP/EBT Store`,
    text: `Check out this SNAP/EBT store: ${store.Store_Name}${store.City ? ` in ${store.City}` : ''}`,
    url: storeUrl
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Store details have been shared."
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copy URL
      handleCopyUrl();
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Store link has been copied to your clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareData.text);
    const encodedUrl = encodeURIComponent(storeUrl);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'sms':
        shareUrl = `sms:?body=${encodedText}%20${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const triggerButton = variant === 'icon' ? (
    <Button variant="ghost" size="icon" className={className}>
      <Share className="h-4 w-4" />
    </Button>
  ) : (
    <Button variant="outline" className={`flex items-center gap-2 ${className}`}>
      <Share className="h-4 w-4" />
      Share Store
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerButton}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
        {navigator.share && (
          <>
            <DropdownMenuItem onClick={handleNativeShare} className="text-popover-foreground">
              <Share className="h-4 w-4 mr-2" />
              Share via device
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
          </>
        )}
        
        <DropdownMenuItem onClick={handleCopyUrl} className="text-popover-foreground">
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-primary" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy link'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem onClick={() => handleSocialShare('facebook')} className="text-popover-foreground">
          <Facebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSocialShare('twitter')} className="text-popover-foreground">
          <Twitter className="h-4 w-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSocialShare('sms')} className="text-popover-foreground">
          <MessageCircle className="h-4 w-4 mr-2" />
          Share via SMS
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
