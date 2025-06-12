
import React, { useState } from 'react';
import { Phone, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { useAuth } from '@/contexts/AuthContext';
import { useContributionTracking } from '@/hooks/useContributionTracking';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface AddPhoneModalProps {
  store: Store;
}

export const AddPhoneModal: React.FC<AddPhoneModalProps> = ({ store }) => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { trackContribution } = useContributionTracking();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    if (!phoneNumber.trim()) return;

    // TODO: Save phone number to database
    console.log('Adding phone number:', phoneNumber, 'for store:', store.id);
    
    // Track the contribution
    trackContribution('contact_info', store.id);
    
    // Reset and close
    setPhoneNumber('');
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Phone
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Add Phone Number
            </DialogTitle>
            <DialogDescription>
              Help the community by adding the phone number for {store.store_name}. 
              You'll earn 15 points for this contribution.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!phoneNumber.trim()}>
                Add Phone Number
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        action="add contact information"
        description="Create an account or sign in to contribute store information and earn 15 points for helping the community."
      />
    </>
  );
};
