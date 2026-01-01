import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Camera } from 'lucide-react';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';
import { validateImageUpload } from '@/utils/security';

type Store = Tables<'snap_stores'>;

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
}

export const AddPhotoModal: React.FC<AddPhotoModalProps> = ({ isOpen, onClose, store }) => {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    
    // Validate each file
    for (const file of files) {
      const validation = validateImageUpload(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
      } else {
        validFiles.push(file);
      }
    }
    
    // Add valid files, max 5 total
    if (validFiles.length > 0) {
      setSelectedFiles(prev => {
        const newFiles = [...prev, ...validFiles];
        if (newFiles.length > 5) {
          toast.warning('Maximum 5 photos allowed. Only the first 5 will be kept.');
          return newFiles.slice(0, 5);
        }
        return newFiles;
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (selectedFiles.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${store.id}_${user.id}_${Date.now()}_${index}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('store-photos')
          .upload(fileName, file);
        
        if (error) throw error;
        return fileName;
      });

      await Promise.all(uploadPromises);

      toast.success(`${selectedFiles.length} photo(s) uploaded successfully!`);
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Add Photos to {store.Store_Name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Input */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to select photos or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5 photos, JPG, PNG, GIF up to 10MB each
                </p>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Selected Photos ({selectedFiles.length}/5)</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={uploadPhotos} 
                disabled={selectedFiles.length === 0 || uploading}
                className="flex-1"
              >
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photo(s)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        action="upload photos"
        description="Create an account or sign in to upload photos and help the community discover great stores."
      />
    </>
  );
};
