// Frontend helper functions for file uploads via Next.js API routes
export interface UploadResult {
  success: boolean;
  path: string;
  url: string;
  filename: string;
  size: number;
  type: string;
}

export const uploadFileToSupabase = async (file: File, bucket: string = 'images'): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);

  const response = await fetch('/api/upload-file', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return await response.json();
};

export const uploadImage = async (file: File): Promise<UploadResult> => {
  return await uploadFileToSupabase(file, 'images');
};

export const uploadVideo = async (file: File): Promise<UploadResult> => {
  return await uploadFileToSupabase(file, 'videos');
};

export const uploadDocument = async (file: File): Promise<UploadResult> => {
  return await uploadFileToSupabase(file, 'documents');
};

// Helper function to get the appropriate bucket for a file type
export const getBucketForFileType = (fileType: string): string => {
  if (fileType.startsWith('image/')) return 'images';
  if (fileType.startsWith('video/')) return 'videos';
  return 'documents';
};