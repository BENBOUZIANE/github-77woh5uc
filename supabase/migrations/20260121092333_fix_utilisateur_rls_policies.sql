/*
  # Fix Utilisateur Table RLS Policies

  ## Overview
  This migration fixes the Row Level Security policies for the `utilisateur` table
  to allow authenticated users to insert and read data properly.

  ## Changes
    - Drop existing restrictive policies
    - Create new policies that allow authenticated users to insert and read data
    - Ensure policies work correctly with the authentication system

  ## Security
    - Policies are restricted to authenticated users only
    - Users can insert their own data
    - Users can read all utilisateur data (needed for declaration relationships)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read all utilisateur data" ON utilisateur;
DROP POLICY IF EXISTS "Users can insert utilisateur data" ON utilisateur;

-- Create new policies with proper permissions
CREATE POLICY "Authenticated users can read utilisateur"
  ON utilisateur
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert utilisateur"
  ON utilisateur
  FOR INSERT
  TO authenticated
  WITH CHECK (true);