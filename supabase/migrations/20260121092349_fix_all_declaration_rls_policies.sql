/*
  # Fix All Declaration Related RLS Policies

  ## Overview
  This migration ensures all tables involved in the declaration process have
  proper Row Level Security policies to allow authenticated users to create
  and manage their declarations.

  ## Tables Updated
    - professionnel_sante
    - declarant
    - representant_legal
    - personne_exposee
    - allergies_connues
    - antecedents_medical
    - medicament_produit_simultanement
    - effet_indesirable
    - prise_charge_medicale
    - produit_suspecte

  ## Security
    - All policies are restricted to authenticated users
    - Users can insert and read data needed for declarations
*/

-- professionnel_sante
DROP POLICY IF EXISTS "Users can read professionnel_sante data" ON professionnel_sante;
DROP POLICY IF EXISTS "Users can insert professionnel_sante data" ON professionnel_sante;

CREATE POLICY "Authenticated users can read professionnel_sante"
  ON professionnel_sante FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert professionnel_sante"
  ON professionnel_sante FOR INSERT TO authenticated WITH CHECK (true);

-- declarant
DROP POLICY IF EXISTS "Users can read declarant data" ON declarant;
DROP POLICY IF EXISTS "Users can insert declarant data" ON declarant;

CREATE POLICY "Authenticated users can read declarant"
  ON declarant FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert declarant"
  ON declarant FOR INSERT TO authenticated WITH CHECK (true);

-- representant_legal
DROP POLICY IF EXISTS "Users can read representant_legal data" ON representant_legal;
DROP POLICY IF EXISTS "Users can insert representant_legal data" ON representant_legal;

CREATE POLICY "Authenticated users can read representant_legal"
  ON representant_legal FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert representant_legal"
  ON representant_legal FOR INSERT TO authenticated WITH CHECK (true);

-- personne_exposee
DROP POLICY IF EXISTS "Users can read personne_exposee data" ON personne_exposee;
DROP POLICY IF EXISTS "Users can insert personne_exposee data" ON personne_exposee;

CREATE POLICY "Authenticated users can read personne_exposee"
  ON personne_exposee FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert personne_exposee"
  ON personne_exposee FOR INSERT TO authenticated WITH CHECK (true);

-- allergies_connues
DROP POLICY IF EXISTS "Users can read allergies_connues data" ON allergies_connues;
DROP POLICY IF EXISTS "Users can insert allergies_connues data" ON allergies_connues;

CREATE POLICY "Authenticated users can read allergies_connues"
  ON allergies_connues FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert allergies_connues"
  ON allergies_connues FOR INSERT TO authenticated WITH CHECK (true);

-- antecedents_medical
DROP POLICY IF EXISTS "Users can read antecedents_medical data" ON antecedents_medical;
DROP POLICY IF EXISTS "Users can insert antecedents_medical data" ON antecedents_medical;

CREATE POLICY "Authenticated users can read antecedents_medical"
  ON antecedents_medical FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert antecedents_medical"
  ON antecedents_medical FOR INSERT TO authenticated WITH CHECK (true);

-- medicament_produit_simultanement
DROP POLICY IF EXISTS "Users can read medicament_produit_simultanement data" ON medicament_produit_simultanement;
DROP POLICY IF EXISTS "Users can insert medicament_produit_simultanement data" ON medicament_produit_simultanement;

CREATE POLICY "Authenticated users can read medicament_produit_simultanement"
  ON medicament_produit_simultanement FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert medicament_produit_simultanement"
  ON medicament_produit_simultanement FOR INSERT TO authenticated WITH CHECK (true);

-- effet_indesirable
DROP POLICY IF EXISTS "Users can read effet_indesirable data" ON effet_indesirable;
DROP POLICY IF EXISTS "Users can insert effet_indesirable data" ON effet_indesirable;

CREATE POLICY "Authenticated users can read effet_indesirable"
  ON effet_indesirable FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert effet_indesirable"
  ON effet_indesirable FOR INSERT TO authenticated WITH CHECK (true);

-- prise_charge_medicale
DROP POLICY IF EXISTS "Users can read prise_charge_medicale data" ON prise_charge_medicale;
DROP POLICY IF EXISTS "Users can insert prise_charge_medicale data" ON prise_charge_medicale;

CREATE POLICY "Authenticated users can read prise_charge_medicale"
  ON prise_charge_medicale FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert prise_charge_medicale"
  ON prise_charge_medicale FOR INSERT TO authenticated WITH CHECK (true);

-- produit_suspecte
DROP POLICY IF EXISTS "Users can read produit_suspecte data" ON produit_suspecte;
DROP POLICY IF EXISTS "Users can insert produit_suspecte data" ON produit_suspecte;

CREATE POLICY "Authenticated users can read produit_suspecte"
  ON produit_suspecte FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert produit_suspecte"
  ON produit_suspecte FOR INSERT TO authenticated WITH CHECK (true);