import React, { useState, useMemo } from 'react';
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
import type { Store } from '@/types/storeTypes';

interface ShareStoreProps {
  store: Store;
  variant?: 'icon' | 'button';
  className?: string;
}

const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

export const ShareStore: React.FC<ShareStoreProps> = ({ 
  store, 
  variant = 'button', 
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const storeUrl = useMemo(
    () => `${window.location.origin}/store/${store.id}`,
    [store.id]
  );

  const shareData = useMemo(() => ({
    title: `${store.Store_Name} - SNAP/EBT Store`,
    text: `Check out this SNAP/EBT store: ${store.Store_Name}${store.City ? ` in ${store.City}` : ''}`,
    url: storeUrl
  }), [store.Store_Name, store.City, storeUrl]);

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
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {triggerButton}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {supportsNativeShare && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share className="h-4 w-4 mr-2" />
              Share via device
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleCopyUrl}>
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-primary" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy link'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
          <Facebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
          <Twitter className="h-4 w-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSocialShare('sms')}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Share via SMS
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
