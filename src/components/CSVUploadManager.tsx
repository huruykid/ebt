
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CSVUploadManager: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress('Uploading and processing CSV file...');

    try {
      const formData = new FormData();
      formData.append('csv', file);

      const { data, error } = await supabase.functions.invoke('upload-csv-stores', {
        body: formData
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Upload Complete!",
          description: data.message,
        });
        setUploadProgress(`Successfully imported ${data.totalStores} stores`);
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || 'Failed to upload and process CSV file',
        variant: "destructive"
      });
      setUploadProgress('');
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg border space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Store Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Upload a CSV file to replace all SNAP store data
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label 
            htmlFor="csv-upload" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors w-fit"
          >
            <Upload className={`h-4 w-4 ${isUploading ? 'animate-pulse' : ''}`} />
            {isUploading ? 'Processing...' : 'Upload CSV File'}
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </div>
        
        {uploadProgress && (
          <p className="text-sm text-gray-600">{uploadProgress}</p>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>CSV Upload:</strong> Replaces all existing store data with the uploaded CSV</p>
        <p><strong>Format:</strong> Ensure your CSV includes columns for store_name, address, city, state, etc.</p>
        <p><strong>Size:</strong> Maximum file size is 100MB</p>
      </div>
    </div>
  );
};
