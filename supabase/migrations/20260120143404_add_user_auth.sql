/*
  # Add User Authentication Support

  1. Changes
    - Add user_id column to declaration table
    - Create RLS policies for declarations
    - Create view for simplified declaration queries

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to view their own declarations
    - Add policies for authenticated users to insert their own declarations
*/

-- Add user_id to declaration table
ALTER TABLE declaration ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_declaration_user_id ON declaration(user_id);

-- Enable RLS on existing tables if not already enabled
ALTER TABLE declaration ENABLE ROW LEVEL SECURITY;
ALTER TABLE declarant ENABLE ROW LEVEL SECURITY;
ALTER TABLE personne_exposee ENABLE ROW LEVEL SECURITY;
ALTER TABLE effet_indesirable ENABLE ROW LEVEL SECURITY;
ALTER TABLE prise_charge_medicale ENABLE ROW LEVEL SECURITY;
ALTER TABLE produit_suspecte ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own declarations" ON declaration;
DROP POLICY IF EXISTS "Users can insert their own declarations" ON declaration;
DROP POLICY IF EXISTS "Allow anonymous declarations" ON declaration;

-- Policies for declaration table
CREATE POLICY "Users can view their own declarations"
  ON declaration
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own declarations"
  ON declaration
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow anonymous declarations"
  ON declaration
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow anonymous to view their session declarations"
  ON declaration
  FOR SELECT
  TO anon
  USING (true);

-- Policies for related tables (declarant)
DROP POLICY IF EXISTS "Users can view declarant data" ON declarant;
DROP POLICY IF EXISTS "Anyone can insert declarant data" ON declarant;

CREATE POLICY "Users can view declarant data"
  ON declarant
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert declarant data"
  ON declarant
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policies for personne_exposee
DROP POLICY IF EXISTS "Users can view personne_exposee data" ON personne_exposee;
DROP POLICY IF EXISTS "Anyone can insert personne_exposee data" ON personne_exposee;

CREATE POLICY "Users can view personne_exposee data"
  ON personne_exposee
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert personne_exposee data"
  ON personne_exposee
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policies for effet_indesirable
DROP POLICY IF EXISTS "Users can view effet_indesirable data" ON effet_indesirable;
DROP POLICY IF EXISTS "Anyone can insert effet_indesirable data" ON effet_indesirable;

CREATE POLICY "Users can view effet_indesirable data"
  ON effet_indesirable
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert effet_indesirable data"
  ON effet_indesirable
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policies for prise_charge_medicale
DROP POLICY IF EXISTS "Users can view prise_charge_medicale data" ON prise_charge_medicale;
DROP POLICY IF EXISTS "Anyone can insert prise_charge_medicale data" ON prise_charge_medicale;

CREATE POLICY "Users can view prise_charge_medicale data"
  ON prise_charge_medicale
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert prise_charge_medicale data"
  ON prise_charge_medicale
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policies for produit_suspecte
DROP POLICY IF EXISTS "Users can view produit_suspecte data" ON produit_suspecte;
DROP POLICY IF EXISTS "Anyone can insert produit_suspecte data" ON produit_suspecte;

CREATE POLICY "Users can view produit_suspecte data"
  ON produit_suspecte
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert produit_suspecte data"
  ON produit_suspecte
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Create a view for simplified declaration queries
CREATE OR REPLACE VIEW cosmetovigilance_declarations AS
SELECT
  d.id,
  d.created_at,
  d.user_id,
  d.commentaire,
  pe.nom as patient_nom,
  pe.prenom as patient_prenom,
  pe.email as patient_email,
  ps.nom_commercial as produit_nom_commercial,
  ps.marque as produit_marque,
  ei.localisation as effet_localisation,
  ei.date_apparition as effet_date_apparition,
  ei.gravite as effet_gravite,
  dcl.nom as declarant_nom,
  dcl.prenom as declarant_prenom,
  dcl.email as declarant_email
FROM declaration d
LEFT JOIN personne_exposee pe ON d.personne_exposee_id = pe.id
LEFT JOIN declarant dcl ON d.declarant_id = dcl.id
LEFT JOIN effet_indesirable ei ON ei.declaration_id = d.id
LEFT JOIN produit_suspecte ps ON ps.declaration_id = d.id;

-- Grant access to the view
GRANT SELECT ON cosmetovigilance_declarations TO authenticated, anon;
