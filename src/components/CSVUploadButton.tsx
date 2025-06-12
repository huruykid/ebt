
import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CSVUploadButton: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress('Reading CSV file...');

    try {
      // Read the file content
      const fileContent = await file.text();
      
      setUploadProgress('Processing CSV data...');

      // Send to edge function for processing
      const { data, error } = await supabase.functions.invoke('process-csv-stores', {
        body: { csvContent: fileContent },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Upload Complete!",
          description: `Successfully imported ${data.totalStores} SNAP stores`,
        });
        setUploadProgress('');
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || 'Failed to process CSV file',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        className="hidden"
      />
      <button
        onClick={handleFileSelect}
        disabled={isUploading}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isUploading ? (
          <>
            <FileText className="h-4 w-4 animate-pulse" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload CSV File
          </>
        )}
      </button>
      {uploadProgress && (
        <p className="text-xs text-gray-600">{uploadProgress}</p>
      )}
      <p className="text-xs text-gray-500">
        Upload the USDA SNAP retailer CSV file (~264k records)
      </p>
    </div>
  );
};
