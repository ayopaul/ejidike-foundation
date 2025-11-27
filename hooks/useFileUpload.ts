/**
 * FILE PATH: /ejdk/ejidike-foundation/hooks/useFileUpload.ts
 * PURPOSE: Hook for handling file uploads to Supabase storage
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseFileUploadOptions {
  bucket: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export function useFileUpload({
  bucket,
  maxSizeMB = 10,
  allowedTypes = ['image/*', 'application/pdf']
}: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFile = (file: File): boolean => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    // Check file type
    const isTypeAllowed = allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isTypeAllowed) {
      toast.error('File type not allowed');
      return false;
    }

    return true;
  };

  const uploadFile = async (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string | null> => {
    if (!validateFile(file)) {
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress (Supabase doesn't provide real upload progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      toast.success('File uploaded successfully');
      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file', {
        description: error.message
      });
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const deleteFile = async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      toast.success('File deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
      return false;
    }
  };

  return {
    uploading,
    progress,
    uploadFile,
    deleteFile
  };
}