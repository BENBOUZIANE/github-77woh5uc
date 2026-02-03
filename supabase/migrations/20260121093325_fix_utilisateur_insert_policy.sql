/*
  # Fix Utilisateur Table Insert Policy

  ## Overview
  This migration ensures that authenticated users can properly insert into the utilisateur table.

  ## Changes
    - Drops and recreates the insert policy for utilisateur table
    - Ensures RLS is enabled
    - Verifies the policy allows authenticated users to insert

  ## Security
    - Policies are restricted to authenticated users only
    - Users can insert utilisateur records
*/

-- Ensure RLS is enabled
ALTER TABLE utilisateur ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read utilisateur" ON utilisateur;
DROP POLICY IF EXISTS "Authenticated users can insert utilisateur" ON utilisateur;
DROP POLICY IF EXISTS "Users can insert utilisateur data" ON utilisateur;
DROP POLICY IF EXISTS "Users can read all utilisateur data" ON utilisateur;

-- Create SELECT policy
CREATE POLICY "Authenticated users can read utilisateur"
  ON utilisateur
  FOR SELECT
  TO authenticated
  USING (true);

-- Create INSERT policy
CREATE POLICY "Authenticated users can insert utilisateur"
  ON utilisateur
  FOR INSERT
  TO authenticated
  WITH CHECK (true);