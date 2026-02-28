/*
  # Add Attachment Category Field

  ## Overview
  This migration adds a category field to the attachments table to differentiate 
  between different types of attachments (e.g., general attachments vs. professional registration documents).

  ## 1. Table Updates
    - Add `attachment_category` column to `attachments` table:
      - `attachment_category` (text) - Category/type of attachment (default: 'general')
      - Possible values: 'general', 'document_enregistrement', etc.

  ## 2. Important Notes
    - Defaults to 'general' for backward compatibility with existing records
    - Allows healthcare professionals to upload their registration documents
    - Enables filtering and displaying attachments by category
*/

-- Add attachment_category column to attachments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attachments' AND column_name = 'attachment_category'
  ) THEN
    ALTER TABLE attachments ADD COLUMN attachment_category text DEFAULT 'general';
  END IF;
END $$;

-- Create index for faster queries by category
CREATE INDEX IF NOT EXISTS idx_attachments_category ON attachments(attachment_category);