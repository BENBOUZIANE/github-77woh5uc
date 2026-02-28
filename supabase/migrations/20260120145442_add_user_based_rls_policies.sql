/*
  # Add User-Based RLS Policies

  1. Changes
    - Add RLS policies that allow users to read their own declarations
    - Keep existing policies for backward compatibility

  2. Security
    - Users can only access declarations where user_id matches their authenticated user ID
    - This ensures proper data isolation between users
*/

-- Add policy for users to read their own declarations
CREATE POLICY "Users can read own declarations"
  ON declaration FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Add policy for users to update their own declarations
CREATE POLICY "Users can update own declarations"
  ON declaration FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add policy for users to delete their own declarations
CREATE POLICY "Users can delete own declarations"
  ON declaration FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);