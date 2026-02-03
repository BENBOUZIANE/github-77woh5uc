/*
  # Disable All RLS Policies

  1. Changes
    - Drop all RLS policies from all tables
    - Disable RLS on all tables
  
  2. Security
    - WARNING: This removes all Row Level Security protection
    - All data will be accessible without authentication checks
*/

-- Drop all policies and disable RLS on utilisateur
DROP POLICY IF EXISTS "Users can read own data" ON utilisateur;
DROP POLICY IF EXISTS "Users can insert own data" ON utilisateur;
DROP POLICY IF EXISTS "Users can update own data" ON utilisateur;
ALTER TABLE utilisateur DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on professionnel_sante
DROP POLICY IF EXISTS "Users can read own professionnel_sante" ON professionnel_sante;
DROP POLICY IF EXISTS "Users can insert own professionnel_sante" ON professionnel_sante;
DROP POLICY IF EXISTS "Users can update own professionnel_sante" ON professionnel_sante;
ALTER TABLE professionnel_sante DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on declarant
DROP POLICY IF EXISTS "Users can read own declarant" ON declarant;
DROP POLICY IF EXISTS "Users can insert own declarant" ON declarant;
DROP POLICY IF EXISTS "Users can update own declarant" ON declarant;
ALTER TABLE declarant DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on representant_legal
DROP POLICY IF EXISTS "Users can read own representant_legal" ON representant_legal;
DROP POLICY IF EXISTS "Users can insert own representant_legal" ON representant_legal;
DROP POLICY IF EXISTS "Users can update own representant_legal" ON representant_legal;
ALTER TABLE representant_legal DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on personne_exposee
DROP POLICY IF EXISTS "Users can read own personne_exposee" ON personne_exposee;
DROP POLICY IF EXISTS "Users can insert own personne_exposee" ON personne_exposee;
DROP POLICY IF EXISTS "Users can update own personne_exposee" ON personne_exposee;
ALTER TABLE personne_exposee DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on allergies_connues
DROP POLICY IF EXISTS "Users can read own allergies" ON allergies_connues;
DROP POLICY IF EXISTS "Users can insert own allergies" ON allergies_connues;
DROP POLICY IF EXISTS "Users can update own allergies" ON allergies_connues;
DROP POLICY IF EXISTS "Users can delete own allergies" ON allergies_connues;
ALTER TABLE allergies_connues DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on antecedents_medical
DROP POLICY IF EXISTS "Users can read own antecedents" ON antecedents_medical;
DROP POLICY IF EXISTS "Users can insert own antecedents" ON antecedents_medical;
DROP POLICY IF EXISTS "Users can update own antecedents" ON antecedents_medical;
DROP POLICY IF EXISTS "Users can delete own antecedents" ON antecedents_medical;
ALTER TABLE antecedents_medical DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on medicament_produit_simultanement
DROP POLICY IF EXISTS "Users can read own medicaments" ON medicament_produit_simultanement;
DROP POLICY IF EXISTS "Users can insert own medicaments" ON medicament_produit_simultanement;
DROP POLICY IF EXISTS "Users can update own medicaments" ON medicament_produit_simultanement;
DROP POLICY IF EXISTS "Users can delete own medicaments" ON medicament_produit_simultanement;
ALTER TABLE medicament_produit_simultanement DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on declaration
DROP POLICY IF EXISTS "Users can read own declarations" ON declaration;
DROP POLICY IF EXISTS "Users can insert own declarations" ON declaration;
DROP POLICY IF EXISTS "Users can update own declarations" ON declaration;
ALTER TABLE declaration DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on effet_indesirable
DROP POLICY IF EXISTS "Users can read own effet_indesirable" ON effet_indesirable;
DROP POLICY IF EXISTS "Users can insert own effet_indesirable" ON effet_indesirable;
DROP POLICY IF EXISTS "Users can update own effet_indesirable" ON effet_indesirable;
ALTER TABLE effet_indesirable DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on prise_charge_medicale
DROP POLICY IF EXISTS "Users can read own prise_charge" ON prise_charge_medicale;
DROP POLICY IF EXISTS "Users can insert own prise_charge" ON prise_charge_medicale;
DROP POLICY IF EXISTS "Users can update own prise_charge" ON prise_charge_medicale;
ALTER TABLE prise_charge_medicale DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on produit_suspecte
DROP POLICY IF EXISTS "Users can read own produit_suspecte" ON produit_suspecte;
DROP POLICY IF EXISTS "Users can insert own produit_suspecte" ON produit_suspecte;
DROP POLICY IF EXISTS "Users can update own produit_suspecte" ON produit_suspecte;
ALTER TABLE produit_suspecte DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on attachments
DROP POLICY IF EXISTS "Users can read own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can insert own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can update own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can delete own attachments" ON attachments;
ALTER TABLE attachments DISABLE ROW LEVEL SECURITY;