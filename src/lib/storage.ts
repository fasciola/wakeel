import { supabase, isSupabaseConfigured } from './supabase';

// Supported MIME types for safe corporate document archives
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png'
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export interface UploadProgress {
  success: boolean;
  filePath?: string;
  error?: string;
}

export function sanitizeFileName(name: string): string {
  // Replace spacing, percent characters and preserve safe extension names
  return name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

export function validateDocument(file: File): { ok: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { 
      ok: false, 
      error: 'Unsupported file type. Please upload PDF, Word (docx), Excel (xlsx), JPEG, or PNG files only.' 
    };
  }
  
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { 
      ok: false, 
      error: `File size exceeds the limit of 25MB. Your file is ${Math.round(file.size / 1024 / 1024)}MB.` 
    };
  }
  
  return { ok: true };
}

// Generates the strict storage path format requested:
// {workspace_id}/{company_id}/{document_id}/v{version_number}/{sanitized_file_name}
export function getDocumentStoragePath(
  workspaceId: string, 
  companyId: string, 
  documentId: string, 
  version: number, 
  fileName: string
): string {
  const sanitized = sanitizeFileName(fileName);
  return `${workspaceId}/${companyId}/${documentId}/v${version}/${sanitized}`;
}

export async function uploadDocumentToStorage(
  file: File,
  workspaceId: string,
  companyId: string,
  documentId: string,
  version: number
): Promise<UploadProgress> {
  const validation = validateDocument(file);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const storagePath = getDocumentStoragePath(workspaceId, companyId, documentId, version, file.name);

  try {
    const { data, error } = await supabase.storage
      .from('wakeel-documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, filePath: storagePath };
  } catch (err: any) {
    return { success: false, error: err.message || 'Storage uploading failed.' };
  }
}

// Request a short-lived 5-minute signed URL
export async function getDocumentSignedUrl(
  documentId: string,
  storagePath: string
): Promise<string> {
  // If Supabase is connected, generate 5-min link; fall back to mock image/file content
  try {
    if (!isSupabaseConfigured()) {
      return `https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800`;
    }

    // Call document-signed-url edge function or standard signed url generator
    const { data, error } = await supabase.storage
      .from('wakeel-documents')
      .createSignedUrl(storagePath, 300); // 300 seconds = 5 minutes

    if (error) {
      console.error('Error generating document link:', error);
      // fallback
      return `https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800`;
    }

    return data?.signedUrl || '';
  } catch {
    return `https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800`;
  }
}
