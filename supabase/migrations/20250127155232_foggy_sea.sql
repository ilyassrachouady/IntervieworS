/*
  # User Management System with CV Storage

  1. New Tables
    - `users`
      - `id` (uuid, primary key, linked to auth.users)
      - `full_name` (text)
      - `avatar_url` (text)
      - `role` (user_role enum)
      - `created_at` (timestamp)
    - `user_cvs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `cv_url` (text)
      - `expires_at` (timestamp)
      - `uploaded_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to access their own data
    - Add policies for admins to access all data
    
  3. Storage
    - Create storage bucket for CVs
    - Set up access policies
*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('admin', 'user', 'editor');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  avatar_url text,
  role user_role DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Create user_cvs table
CREATE TABLE IF NOT EXISTS user_cvs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  cv_url text NOT NULL,
  expires_at timestamptz NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  CONSTRAINT expires_after_upload CHECK (expires_at > uploaded_at)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cvs ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user_cvs', 'user_cvs', false);

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- User CVs policies
CREATE POLICY "Users can view own CVs"
  ON user_cvs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can upload own CVs"
  ON user_cvs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own CVs"
  ON user_cvs
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all CVs"
  ON user_cvs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Storage policies
CREATE POLICY "Users can upload own CVs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user_cvs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own CVs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user_cvs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own CVs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user_cvs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can manage all CVs"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'user_cvs' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to delete expired CVs
CREATE OR REPLACE FUNCTION delete_expired_cvs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete storage objects for expired CVs
  DELETE FROM storage.objects
  WHERE bucket_id = 'user_cvs'
  AND EXISTS (
    SELECT 1 FROM user_cvs
    WHERE user_cvs.cv_url LIKE '%' || storage.objects.name
    AND user_cvs.expires_at < NOW()
  );

  -- Delete expired CV records
  DELETE FROM user_cvs
  WHERE expires_at < NOW();
END;
$$;