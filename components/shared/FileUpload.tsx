/**
 * FILE PATH: /ejdk/ejidike-foundation/components/shared/FileUpload.tsx
 * PURPOSE: Reusable file upload component with validation and progress
 * USED IN: Application forms, profile editor
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface FileUploadProps {
  applicationId?: string;
  documentType?: string;
  onUploadComplete?: (fileUrl: string, fileName: string) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
  label?: string;
}

export default function FileUpload({
  applicationId,
  documentType = 'supporting_document',
  onUploadComplete,
  maxSizeMB = 10,
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  label = 'Upload Document'
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const allowedExtensions = allowedTypes
        .map(type => type.split('/')[1].toUpperCase())
        .join(', ');
      return `File type not allowed. Allowed types: ${allowedExtensions}`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate
    const error = validateFile(file);
    if (error) {
      toast.error('Invalid file', {
        description: error
      });
      return;
    }

    setSelectedFile(file);
    toast.info('File selected', {
      description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
    });
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('No file selected');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Build file path
      let filePath = '';
      if (applicationId) {
        filePath = `${user.id}/${applicationId}/${fileName}`;
      } else {
        filePath = `${user.id}/${fileName}`;
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('application-documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      setUploadProgress(100);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('application-documents')
        .getPublicUrl(filePath);

      // If applicationId provided, save to database
      if (applicationId) {
        const { error: dbError } = await supabase
          .from('application_documents')
          .insert({
            application_id: applicationId,
            document_type: documentType,
            file_name: selectedFile.name,
            file_path: filePath,
            file_url: publicUrl,
            file_size: selectedFile.size,
            uploaded_at: new Date().toISOString()
          });

        if (dbError) throw dbError;
      }

      // Success!
      toast.success('File uploaded successfully', {
        description: selectedFile.name
      });

      // Callback
      if (onUploadComplete) {
        onUploadComplete(publicUrl, selectedFile.name);
      }

      // Reset
      setSelectedFile(null);
      setUploadProgress(0);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: error.message || 'Please try again'
      });
    } finally {
      setUploading(false);
    }
  };

  // Remove selected file
  const handleRemove = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    toast.info('File removed');
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Label */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          <span className="text-xs text-muted-foreground">
            Max {maxSizeMB}MB • {allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
          </span>
        </div>

        {/* File input or selected file */}
        {!selectedFile ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept={allowedTypes.join(',')}
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm">
                <span className="text-primary font-medium">Click to upload</span>
                <span className="text-muted-foreground"> or drag and drop</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} up to {maxSizeMB}MB
              </p>
            </label>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  
                  {/* Progress bar */}
                  {uploading && (
                    <div className="mt-2">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {!uploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Upload button */}
        {selectedFile && !uploading && (
          <Button onClick={handleUpload} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        )}

        {uploading && (
          <Button disabled className="w-full">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </Button>
        )}
      </div>
    </Card>
  );
}