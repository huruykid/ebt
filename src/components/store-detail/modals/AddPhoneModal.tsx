
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
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface AddPhoneModalProps {
  store: Store;
  onPhoneAdded?: (phoneNumber: string) => void;
}

export const AddPhoneModal: React.FC<AddPhoneModalProps> = ({ store, onPhoneAdded }) => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    if (!phoneNumber.trim()) return;

    setIsSubmitting(true);

    try {
      // TODO: Save phone number to database when backend is ready
      console.log('Adding phone number:', phoneNumber, 'for store:', store.id);
      
      // Update the frontend immediately
      if (onPhoneAdded) {
        onPhoneAdded(phoneNumber);
      }
      
      // Show success message
      toast.success('Phone number added successfully!');
      
      // Reset and close
      setPhoneNumber('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding phone number:', error);
      toast.error('Failed to add phone number. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              Help the community by adding the phone number for {store.Store_Name}.
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
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!phoneNumber.trim() || isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Phone Number'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        action="add contact information"
        description="Create an account or sign in to contribute store information and help the community."
      />
    </>
  );
};
