/*
  # Création Complète de la Base de Données Cosmetovigilance

  ## Description
  Migration unique qui crée l'ensemble du schéma de la base de données pour
  l'application de cosmetovigilance.

  ## Tables
  - utilisateur, professionnel_sante, representant_legal, declarant
  - personne_exposee, allergies_connues, antecedents_medical, medicament_produit_simultanement
  - declaration, effet_indesirable, produit_suspecte, prise_charge_medicale, attachments

  ## Fonctionnalités
  - Auto-génération des numéros de déclaration (COSM-YYYY-NNNNNN)
  - Mise à jour automatique des timestamps
  - RLS activé sur toutes les tables
  - Storage bucket sécurisé
*/

-- Tables principales
CREATE TABLE IF NOT EXISTS utilisateur (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS professionnel_sante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id uuid REFERENCES utilisateur(id) ON DELETE CASCADE,
  profession text NOT NULL,
  structure text NOT NULL,
  ville text NOT NULL
);

CREATE TABLE IF NOT EXISTS representant_legal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professionnel_sante_id uuid REFERENCES professionnel_sante(id) ON DELETE CASCADE,
  nom_etablissement text NOT NULL,
  numero_declaration_etablissement text,
  numero_document_enregistrement_produit text,
  date_reception_notification text,
  document_enregistrement text
);

CREATE TABLE IF NOT EXISTS declarant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id uuid REFERENCES utilisateur(id) ON DELETE CASCADE,
  nom text NOT NULL,
  prenom text NOT NULL,
  email text NOT NULL,
  tel text NOT NULL
);

CREATE TABLE IF NOT EXISTS personne_exposee (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  nom text NOT NULL,
  prenom text NOT NULL,
  date_naissance date,
  age integer NOT NULL,
  age_unite text DEFAULT 'ans',
  sexe text NOT NULL,
  grossesse boolean DEFAULT false,
  mois_grossesse integer,
  allaitement boolean DEFAULT false,
  email text,
  tel text
);

CREATE TABLE IF NOT EXISTS allergies_connues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_exposee_id uuid REFERENCES personne_exposee(id) ON DELETE CASCADE,
  label text NOT NULL
);

CREATE TABLE IF NOT EXISTS antecedents_medical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_exposee_id uuid REFERENCES personne_exposee(id) ON DELETE CASCADE,
  label text NOT NULL
);

CREATE TABLE IF NOT EXISTS medicament_produit_simultanement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personne_exposee_id uuid REFERENCES personne_exposee(id) ON DELETE CASCADE,
  label text NOT NULL
);

CREATE TABLE IF NOT EXISTS declaration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_declaration text UNIQUE,
  declarant_id uuid REFERENCES declarant(id) ON DELETE CASCADE,
  personne_exposee_id uuid REFERENCES personne_exposee(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  statut text DEFAULT 'en_cours',
  commentaire text,
  commentaire_anmps text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS effet_indesirable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_id uuid REFERENCES declaration(id) ON DELETE CASCADE,
  description text,
  localisation text NOT NULL,
  date_apparition date NOT NULL,
  date_fin date,
  gravite boolean DEFAULT false,
  criteres_gravite text,
  evolution_effet text NOT NULL
);

CREATE TABLE IF NOT EXISTS produit_suspecte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_id uuid REFERENCES declaration(id) ON DELETE CASCADE,
  nom_commercial text NOT NULL,
  marque text NOT NULL,
  fabricant text NOT NULL,
  type_produit text NOT NULL,
  numero_lot text NOT NULL,
  zone_application text,
  frequence_utilisation text NOT NULL,
  date_debut_utilisation date NOT NULL,
  arret_utilisation date,
  reexposition_produit boolean DEFAULT false,
  reapparition_effet_indesirable boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS prise_charge_medicale (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_id uuid REFERENCES declaration(id) ON DELETE CASCADE,
  diagnostic text NOT NULL,
  mesures_prise text NOT NULL,
  examens_realise text NOT NULL
);

CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_id uuid REFERENCES declaration(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  file text NOT NULL,
  file_name text,
  file_type text,
  file_size integer,
  attachment_category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_professionnel_sante_utilisateur_id ON professionnel_sante(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_representant_legal_professionnel_id ON representant_legal(professionnel_sante_id);
CREATE INDEX IF NOT EXISTS idx_declarant_utilisateur_id ON declarant(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_declaration_user_id ON declaration(user_id);
CREATE INDEX IF NOT EXISTS idx_declaration_numero ON declaration(numero_declaration);
CREATE INDEX IF NOT EXISTS idx_declaration_statut ON declaration(statut);
CREATE INDEX IF NOT EXISTS idx_declaration_created_at ON declaration(created_at DESC);

-- Fonctions
CREATE OR REPLACE FUNCTION generate_numero_declaration()
RETURNS TRIGGER AS $$
DECLARE
  current_year text;
  next_number integer;
  new_numero text;
BEGIN
  IF NEW.numero_declaration IS NULL THEN
    current_year := to_char(now(), 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_declaration FROM 11) AS INTEGER)), 0) + 1
    INTO next_number FROM declaration WHERE numero_declaration LIKE 'COSM-' || current_year || '-%';
    new_numero := 'COSM-' || current_year || '-' || LPAD(next_number::text, 6, '0');
    NEW.numero_declaration := new_numero;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_numero_declaration ON declaration;
CREATE TRIGGER trigger_generate_numero_declaration
  BEFORE INSERT ON declaration FOR EACH ROW EXECUTE FUNCTION generate_numero_declaration();

DROP TRIGGER IF EXISTS trigger_update_declaration_updated_at ON declaration;
CREATE TRIGGER trigger_update_declaration_updated_at
  BEFORE UPDATE ON declaration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE utilisateur ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionnel_sante ENABLE ROW LEVEL SECURITY;
ALTER TABLE representant_legal ENABLE ROW LEVEL SECURITY;
ALTER TABLE declarant ENABLE ROW LEVEL SECURITY;
ALTER TABLE personne_exposee ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies_connues ENABLE ROW LEVEL SECURITY;
ALTER TABLE antecedents_medical ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicament_produit_simultanement ENABLE ROW LEVEL SECURITY;
ALTER TABLE declaration ENABLE ROW LEVEL SECURITY;
ALTER TABLE effet_indesirable ENABLE ROW LEVEL SECURITY;
ALTER TABLE produit_suspecte ENABLE ROW LEVEL SECURITY;
ALTER TABLE prise_charge_medicale ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Politiques
CREATE POLICY "Authenticated users can read utilisateur" ON utilisateur FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert utilisateur" ON utilisateur FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can read professionnel_sante" ON professionnel_sante FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert professionnel_sante" ON professionnel_sante FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can read representant_legal" ON representant_legal FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert representant_legal" ON representant_legal FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can read declarant" ON declarant FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated users can insert declarant" ON declarant FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Authenticated users can read personne_exposee" ON personne_exposee FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated users can insert personne_exposee" ON personne_exposee FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Authenticated users can read allergies_connues" ON allergies_connues FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated users can insert allergies_connues" ON allergies_connues FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Authenticated users can read antecedents_medical" ON antecedents_medical FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated users can insert antecedents_medical" ON antecedents_medical FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Authenticated users can read medicament_produit_simultanement" ON medicament_produit_simultanement FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated users can insert medicament_produit_simultanement" ON medicament_produit_simultanement FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Users can view their own declarations" ON declaration FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own declarations" ON declaration FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own declarations" ON declaration FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own declarations" ON declaration FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow anonymous declarations" ON declaration FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "Allow anonymous to view declarations" ON declaration FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated users can read effet_indesirable" ON effet_indesirable FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated users can insert effet_indesirable" ON effet_indesirable FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Authenticated users can read produit_suspecte" ON produit_suspecte FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated users can insert produit_suspecte" ON produit_suspecte FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Authenticated users can read prise_charge_medicale" ON prise_charge_medicale FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated users can insert prise_charge_medicale" ON prise_charge_medicale FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Users can read attachments" ON attachments FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users can insert attachments" ON attachments FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Users can delete their attachments" ON attachments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Vue
CREATE OR REPLACE VIEW cosmetovigilance_declarations AS
SELECT
  d.id, d.numero_declaration, d.statut, d.created_at, d.updated_at, d.user_id,
  d.commentaire, d.commentaire_anmps,
  pe.nom as patient_nom, pe.prenom as patient_prenom, pe.email as patient_email,
  pe.age, pe.age_unite, pe.sexe, pe.date_naissance, pe.grossesse, pe.allaitement,
  ps.nom_commercial as produit_nom_commercial, ps.marque as produit_marque,
  ps.fabricant as produit_fabricant, ps.type_produit, ps.zone_application,
  ei.description as effet_description, ei.localisation as effet_localisation,
  ei.date_apparition as effet_date_apparition, ei.gravite as effet_gravite,
  dcl.nom as declarant_nom, dcl.prenom as declarant_prenom, dcl.email as declarant_email
FROM declaration d
LEFT JOIN personne_exposee pe ON d.personne_exposee_id = pe.id
LEFT JOIN declarant dcl ON d.declarant_id = dcl.id
LEFT JOIN effet_indesirable ei ON ei.declaration_id = d.id
LEFT JOIN produit_suspecte ps ON ps.declaration_id = d.id;

GRANT SELECT ON cosmetovigilance_declarations TO authenticated, anon;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cosmetovigilance-attachments', 'cosmetovigilance-attachments', false)
ON CONFLICT (id) DO NOTHING;
