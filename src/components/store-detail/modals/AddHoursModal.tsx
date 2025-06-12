
import React, { useState } from 'react';
import { Clock, Plus } from 'lucide-react';
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

interface AddHoursModalProps {
  store: Store;
}

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const AddHoursModal: React.FC<AddHoursModalProps> = ({ store }) => {
  const { user } = useAuth();
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    Monday: { open: '09:00', close: '18:00', closed: false },
    Tuesday: { open: '09:00', close: '18:00', closed: false },
    Wednesday: { open: '09:00', close: '18:00', closed: false },
    Thursday: { open: '09:00', close: '18:00', closed: false },
    Friday: { open: '09:00', close: '18:00', closed: false },
    Saturday: { open: '09:00', close: '18:00', closed: false },
    Sunday: { open: '10:00', close: '17:00', closed: false },
  });
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { trackContribution } = useContributionTracking();

  const handleDayToggle = (day: string) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed }
    }));
  };

  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // TODO: Save hours to database
    console.log('Adding hours:', hours, 'for store:', store.id);
    
    // Track the contribution
    trackContribution('store_hours', store.id);
    
    // Close modal
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Hours
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Add Store Hours
            </DialogTitle>
            <DialogDescription>
              Help the community by adding the operating hours for {store.store_name}. 
              You'll earn 20 points for this contribution.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="grid grid-cols-4 items-center gap-2">
                  <Label className="font-medium">{day}</Label>
                  <div className="flex items-center gap-2 col-span-3">
                    <input
                      type="checkbox"
                      checked={!hours[day].closed}
                      onChange={() => handleDayToggle(day)}
                      className="rounded"
                    />
                    {!hours[day].closed ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={hours[day].open}
                          onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={hours[day].close}
                          onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground flex-1">Closed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Store Hours
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        action="add store hours"
        description="Create an account or sign in to contribute store information and earn 20 points for helping the community."
      />
    </>
  );
};
