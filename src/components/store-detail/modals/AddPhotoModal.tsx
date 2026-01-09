import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Camera, AlertCircle } from 'lucide-react';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';
import { validateImageUpload } from '@/utils/security';

type Store = Tables<'snap_stores'>;

const MAX_PHOTOS_PER_STORE = 10;

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
  onPhotoUploaded?: () => void;
}

export const AddPhotoModal: React.FC<AddPhotoModalProps> = ({ 
  isOpen, 
  onClose, 
  store,
  onPhotoUploaded 
}) => {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [existingPhotoCount, setExistingPhotoCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch existing photo count for this store
  useEffect(() => {
    const fetchPhotoCount = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        // Cast to any to work around type generation timing
        const { count, error } = await (supabase
          .from('store_photos' as any)
          .select('*', { count: 'exact', head: true })
          .eq('store_id', store.id) as any);
        
        if (error) throw error;
        setExistingPhotoCount(count || 0);
      } catch (error) {
        console.error('Error fetching photo count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotoCount();
  }, [isOpen, store.id]);

  const remainingSlots = MAX_PHOTOS_PER_STORE - existingPhotoCount;
  const canUploadMore = remainingSlots > 0;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUploadMore) {
      toast.error(`This store has reached the maximum of ${MAX_PHOTOS_PER_STORE} photos.`);
      return;
    }

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
    
    // Add valid files, respecting remaining slots
    if (validFiles.length > 0) {
      setSelectedFiles(prev => {
        const newFiles = [...prev, ...validFiles];
        const maxAllowed = Math.min(remainingSlots, 5); // Max 5 at a time, but respect store limit
        if (newFiles.length > maxAllowed) {
          toast.warning(`You can only upload ${maxAllowed} more photo(s) for this store.`);
          return newFiles.slice(0, maxAllowed);
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
        const fileName = `${user.id}/${store.id}_${Date.now()}_${index}.${fileExt}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('store-photos')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('store-photos')
          .getPublicUrl(fileName);

        // Save metadata to database (cast to any for type timing)
        const { error: dbError } = await (supabase
          .from('store_photos' as any)
          .insert({
            store_id: store.id,
            user_id: user.id,
            file_path: fileName,
            file_name: file.name,
            file_size: file.size
          }) as any);
        
        if (dbError) throw dbError;
        
        return publicUrl;
      });

      await Promise.all(uploadPromises);

      toast.success(`${selectedFiles.length} photo(s) uploaded successfully!`);
      setSelectedFiles([]);
      onPhotoUploaded?.();
      onClose();
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const maxFilesToSelect = Math.min(remainingSlots - selectedFiles.length, 5);

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
            {/* Photo count indicator */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Store photos: {existingPhotoCount}/{MAX_PHOTOS_PER_STORE}
              </span>
              {remainingSlots > 0 ? (
                <span className="text-primary font-medium">
                  {remainingSlots} slot(s) available
                </span>
              ) : (
                <span className="text-destructive font-medium flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Limit reached
                </span>
              )}
            </div>

            {/* File Input */}
            {canUploadMore ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                  disabled={!canUploadMore || loading}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to select photos or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max {maxFilesToSelect} photos, JPG, PNG, GIF up to 10MB each
                  </p>
                </label>
              </div>
            ) : (
              <div className="border-2 border-dashed border-destructive/25 rounded-lg p-6 text-center bg-destructive/5">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="text-sm text-destructive">
                  This store has reached the maximum of {MAX_PHOTOS_PER_STORE} photos.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Thank you for your contribution!
                </p>
              </div>
            )}

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  Selected Photos ({selectedFiles.length}/{maxFilesToSelect + selectedFiles.length})
                </h4>
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
                disabled={selectedFiles.length === 0 || uploading || !canUploadMore}
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
