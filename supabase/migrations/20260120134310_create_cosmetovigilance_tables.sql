/*
  # Create Cosmetovigilance Database Schema

  1. New Tables
    - `utilisateur` - User information
      - `id` (uuid, primary key)
      - `type` (text)
      - `created_at` (timestamp)
    
    - `professionnel_sante` - Healthcare professional information
      - `id` (uuid, primary key)
      - `utilisateur_id` (uuid, foreign key)
      - `profession` (text)
      - `structure` (text)
      - `ville` (text)
    
    - `declarant` - Person making the declaration
      - `id` (uuid, primary key)
      - `utilisateur_id` (uuid, foreign key)
      - `nom` (text)
      - `prenom` (text)
      - `email` (text)
      - `tel` (text)
    
    - `representant_legal` - Legal representative information
      - `id` (uuid, primary key)
      - `professionnel_sante_id` (uuid, foreign key)
      - `nom_etablissement` (text)
      - `numero_declaration_etablissement` (text)
      - `numero_document_enregistrement_produit` (text)
      - `date_reception_notification` (text)
      - `document_enregistrement` (text)
    
    - `personne_exposee` - Exposed person information
      - `id` (uuid, primary key)
      - `type` (text)
      - `nom` (text)
      - `prenom` (text)
      - `age` (integer)
      - `grossesse` (boolean)
      - `mois_grossesse` (integer)
      - `email` (text)
      - `tel` (text)
      - `sexe` (text)
    
    - `allergies_connues` - Known allergies
      - `id` (uuid, primary key)
      - `personne_exposee_id` (uuid, foreign key)
      - `label` (text)
    
    - `antecedents_medical` - Medical history
      - `id` (uuid, primary key)
      - `personne_exposee_id` (uuid, foreign key)
      - `label` (text)
    
    - `medicament_produit_simultanement` - Concurrent medications/products
      - `id` (uuid, primary key)
      - `personne_exposee_id` (uuid, foreign key)
      - `label` (text)
    
    - `declaration` - Main declaration
      - `id` (uuid, primary key)
      - `declarant_id` (uuid, foreign key)
      - `personne_exposee_id` (uuid, foreign key)
      - `commentaire` (text)
      - `created_at` (timestamp)
    
    - `effet_indesirable` - Adverse effects
      - `id` (uuid, primary key)
      - `declaration_id` (uuid, foreign key)
      - `localisation` (text)
      - `date_apparition` (date)
      - `date_fin` (date)
      - `gravite` (boolean)
      - `criteres_gravite` (text)
      - `evolution_effet` (text)
    
    - `prise_charge_medicale` - Medical management
      - `id` (uuid, primary key)
      - `declaration_id` (uuid, foreign key)
      - `diagnostic` (text)
      - `mesures_prise` (text)
      - `examens_realise` (text)
    
    - `produit_suspecte` - Suspected product
      - `id` (uuid, primary key)
      - `declaration_id` (uuid, foreign key)
      - `nom_commercial` (text)
      - `marque` (text)
      - `fabricant` (text)
      - `type_produit` (text)
      - `numero_lot` (text)
      - `frequence_utilisation` (text)
      - `date_debut_utilisation` (text)
      - `arret_utilisation` (text)
      - `reexposition_produit` (boolean)
      - `reapparition_effet_indesirable` (boolean)
    
    - `attachments` - File attachments
      - `id` (uuid, primary key)
      - `declaration_id` (uuid, foreign key)
      - `file` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create utilisateur table
CREATE TABLE IF NOT EXISTS utilisateur (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE utilisateur ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all utilisateur data"
  ON utilisateur FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert utilisateur data"
  ON utilisateur FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create professionnel_sante table
CREATE TABLE IF NOT EXISTS professionnel_sante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id uuid REFERENCES utilisateur(id) ON DELETE CASCADE,
  profession text NOT NULL,
  structure text NOT NULL,
  ville text NOT NULL
);

ALTER TABLE professionnel_sante ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read professionnel_sante data"
  ON professionnel_sante FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert professionnel_sante data"
  ON professionnel_sante FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create declarant table
CREATE TABLE IF NOT EXISTS declarant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id uuid REFERENCES utilisateur(id) ON DELETE CASCADE,
  nom text NOT NULL,
  prenom text NOT NULL,
  email text NOT NULL,
  tel text NOT NULL
);

ALTER TABLE declarant ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read declarant data"
  ON declarant FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert declarant data"
  ON declarant FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create representant_legal table
CREATE TABLE IF NOT EXISTS representant_legal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professionnel_sante_id uuid REFERENCES professionnel_sante(id) ON DELETE CASCADE,
  nom_etablissement text NOT NULL,
  numero_declaration_etablissement text NOT NULL,
  numero_document_enregistrement_produit text NOT NULL,
  date_reception_notification text NOT NULL,
  document_enregistrement text
);

ALTER TABLE representant_legal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read representant_legal data"
  ON representant_legal FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert representant_legal data"
  ON representant_legal FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create personne_exposee table
CREATE TABLE IF NOT EXISTS personne_exposee (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  nom text NOT NULL,
  prenom text NOT NULL,
  age integer NOT NULL,
  grossesse boolean DEFAULT false,
  mois_grossesse integer,
  email text,
  tel text,
  sexe text NOT NULL
);

ALTER TABLE personne_exposee ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read personne_exposee data"
  ON personne_exposee FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert personne_exposee data"
  ON personne_exposee FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create allergies_connues table
CREATE TABLE IF NOT EXISTS allergies_connues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_exposee_id uuid REFERENCES personne_exposee(id) ON DELETE CASCADE,
  label text NOT NULL
);

ALTER TABLE allergies_connues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read allergies_connues data"
  ON allergies_connues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert allergies_connues data"
  ON allergies_connues FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create antecedents_medical table
CREATE TABLE IF NOT EXISTS antecedents_medical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_exposee_id uuid REFERENCES personne_exposee(id) ON DELETE CASCADE,
  label text NOT NULL
);

ALTER TABLE antecedents_medical ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read antecedents_medical data"
  ON antecedents_medical FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert antecedents_medical data"
  ON antecedents_medical FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create medicament_produit_simultanement table
CREATE TABLE IF NOT EXISTS medicament_produit_simultanement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_exposee_id uuid REFERENCES personne_exposee(id) ON DELETE CASCADE,
  label text NOT NULL
);

ALTER TABLE medicament_produit_simultanement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read medicament_produit_simultanement data"
  ON medicament_produit_simultanement FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert medicament_produit_simultanement data"
  ON medicament_produit_simultanement FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create declaration table
CREATE TABLE IF NOT EXISTS declaration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  declarant_id uuid REFERENCES declarant(id) ON DELETE CASCADE,
  personne_exposee_id uuid REFERENCES personne_exposee(id) ON DELETE CASCADE,
  commentaire text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE declaration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read declaration data"
  ON declaration FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert declaration data"
  ON declaration FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create effet_indesirable table
CREATE TABLE IF NOT EXISTS effet_indesirable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_id uuid REFERENCES declaration(id) ON DELETE CASCADE,
  localisation text NOT NULL,
  date_apparition date NOT NULL,
  date_fin date,
  gravite boolean DEFAULT false,
  criteres_gravite text,
  evolution_effet text NOT NULL
);

ALTER TABLE effet_indesirable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read effet_indesirable data"
  ON effet_indesirable FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert effet_indesirable data"
  ON effet_indesirable FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create prise_charge_medicale table
CREATE TABLE IF NOT EXISTS prise_charge_medicale (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_id uuid REFERENCES declaration(id) ON DELETE CASCADE,
  diagnostic text NOT NULL,
  mesures_prise text NOT NULL,
  examens_realise text NOT NULL
);

ALTER TABLE prise_charge_medicale ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read prise_charge_medicale data"
  ON prise_charge_medicale FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert prise_charge_medicale data"
  ON prise_charge_medicale FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create produit_suspecte table
CREATE TABLE IF NOT EXISTS produit_suspecte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_id uuid REFERENCES declaration(id) ON DELETE CASCADE,
  nom_commercial text NOT NULL,
  marque text NOT NULL,
  fabricant text NOT NULL,
  type_produit text NOT NULL,
  numero_lot text NOT NULL,
  frequence_utilisation text NOT NULL,
  date_debut_utilisation text NOT NULL,
  arret_utilisation text NOT NULL,
  reexposition_produit boolean DEFAULT false,
  reapparition_effet_indesirable boolean DEFAULT false
);

ALTER TABLE produit_suspecte ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read produit_suspecte data"
  ON produit_suspecte FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert produit_suspecte data"
  ON produit_suspecte FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_id uuid REFERENCES declaration(id) ON DELETE CASCADE,
  file text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read attachments data"
  ON attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert attachments data"
  ON attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);