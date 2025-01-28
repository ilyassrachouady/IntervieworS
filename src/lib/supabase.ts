import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function uploadCV(file: File) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  // Upload file to storage
  const { error: uploadError, data } = await supabase.storage
    .from('user_cvs')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('user_cvs')
    .getPublicUrl(filePath);

  // Calculate expiry date (15 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 15);

  // Create CV record
  const { error: dbError } = await supabase
    .from('user_cvs')
    .insert({
      user_id: user.id,
      cv_url: publicUrl,
      expires_at: expiresAt.toISOString(),
    });

  if (dbError) throw dbError;

  return { publicUrl, expiresAt };
}

export async function getUserCVs() {
  const { data, error } = await supabase
    .from('user_cvs')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteCV(cvId: string) {
  const { data: cv, error: fetchError } = await supabase
    .from('user_cvs')
    .select('cv_url')
    .eq('id', cvId)
    .single();

  if (fetchError) throw fetchError;

  // Extract file path from URL
  const filePath = cv.cv_url.split('/').slice(-2).join('/');

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('user_cvs')
    .remove([filePath]);

  if (storageError) throw storageError;

  // Delete record from database
  const { error: dbError } = await supabase
    .from('user_cvs')
    .delete()
    .eq('id', cvId);

  if (dbError) throw dbError;
}