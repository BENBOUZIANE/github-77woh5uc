/*
  # Update Attachments Table and Add Storage

  ## Overview
  This migration updates the existing attachments table and creates storage infrastructure 
  for storing file attachments (images, PDFs, etc.) associated with cosmetovigilance declarations.

  ## 1. Table Updates
    - Add new columns to `attachments` table:
      - `file_name` (text) - Original filename
      - `file_type` (text) - MIME type of the file
      - `file_size` (integer) - Size of file in bytes
      - `user_id` (uuid, foreign key) - User who uploaded the file

  ## 2. Storage
    - Creates a storage bucket named `attachments` for file uploads
    - Configures appropriate file size limits and allowed MIME types

  ## 3. Security
    - Enable RLS on `attachments` table (if not already enabled)
    - Users can only view attachments for their own declarations
    - Users can upload attachments to their own declarations
    - Users can delete their own attachments
    - Storage policies restrict access to authenticated users and their own files

  ## 4. Important Notes
    - Supports multiple file types: images (jpg, png, gif, etc.) and PDFs
    - File size limit set to 10MB per file
    - Storage bucket is private by default with RLS policies controlling access
*/

-- Add missing columns to attachments table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attachments' AND column_name = 'file_name'
  ) THEN
    ALTER TABLE attachments ADD COLUMN file_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attachments' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE attachments ADD COLUMN file_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attachments' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE attachments ADD COLUMN file_size integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attachments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE attachments ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on attachments table
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them
DROP POLICY IF EXISTS "Users can view attachments for their declarations" ON attachments;
DROP POLICY IF EXISTS "Users can upload attachments to their declarations" ON attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON attachments;

-- Policy: Users can view attachments for their own declarations
CREATE POLICY "Users can view attachments for their declarations"
  ON attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM declaration
      WHERE declaration.id = attachments.declaration_id
      AND declaration.user_id = auth.uid()
    )
  );

-- Policy: Users can upload attachments to their own declarations
CREATE POLICY "Users can upload attachments to their declarations"
  ON attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM declaration
      WHERE declaration.id = attachments.declaration_id
      AND declaration.user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own attachments
CREATE POLICY "Users can delete their own attachments"
  ON attachments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Storage policy: Users can upload files to their own folder
CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: Users can view their own files
CREATE POLICY "Users can view their own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: Users can delete their own files
CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_attachments_declaration_id ON attachments(declaration_id);
CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments(user_id);