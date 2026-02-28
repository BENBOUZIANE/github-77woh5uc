/*
  # Ajout des Champs Manquants

  ## Description
  Cette migration ajoute uniquement les champs manquants aux tables existantes
  et crée les fonctions automatiques.

  ## Champs ajoutés
  - declaration: numero_declaration, statut, commentaire_anmps, updated_at
  - personne_exposee: date_naissance, age_unite, allaitement
  - effet_indesirable: description
  - produit_suspecte: zone_application

  ## Fonctions
  - Auto-génération des numéros de déclaration
  - Mise à jour automatique de updated_at
*/

-- Ajout des champs à declaration
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'declaration' AND column_name = 'numero_declaration') THEN
    ALTER TABLE declaration ADD COLUMN numero_declaration text UNIQUE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'declaration' AND column_name = 'statut') THEN
    ALTER TABLE declaration ADD COLUMN statut text DEFAULT 'en_cours';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'declaration' AND column_name = 'commentaire_anmps') THEN
    ALTER TABLE declaration ADD COLUMN commentaire_anmps text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'declaration' AND column_name = 'updated_at') THEN
    ALTER TABLE declaration ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Ajout des champs à personne_exposee
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personne_exposee' AND column_name = 'date_naissance') THEN
    ALTER TABLE personne_exposee ADD COLUMN date_naissance date;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personne_exposee' AND column_name = 'age_unite') THEN
    ALTER TABLE personne_exposee ADD COLUMN age_unite text DEFAULT 'ans';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personne_exposee' AND column_name = 'allaitement') THEN
    ALTER TABLE personne_exposee ADD COLUMN allaitement boolean DEFAULT false;
  END IF;
END $$;

-- Ajout des champs à effet_indesirable
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'effet_indesirable' AND column_name = 'description') THEN
    ALTER TABLE effet_indesirable ADD COLUMN description text;
  END IF;
END $$;

-- Ajout des champs à produit_suspecte
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produit_suspecte' AND column_name = 'zone_application') THEN
    ALTER TABLE produit_suspecte ADD COLUMN zone_application text;
  END IF;
END $$;

-- Fonction auto-génération numéro déclaration
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
    INTO next_number
    FROM declaration
    WHERE numero_declaration LIKE 'COSM-' || current_year || '-%';
    new_numero := 'COSM-' || current_year || '-' || LPAD(next_number::text, 6, '0');
    NEW.numero_declaration := new_numero;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_numero_declaration ON declaration;
CREATE TRIGGER trigger_generate_numero_declaration
  BEFORE INSERT ON declaration
  FOR EACH ROW
  EXECUTE FUNCTION generate_numero_declaration();

-- Fonction updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_declaration_updated_at ON declaration;
CREATE TRIGGER trigger_update_declaration_updated_at
  BEFORE UPDATE ON declaration
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index supplémentaires
CREATE INDEX IF NOT EXISTS idx_declaration_numero ON declaration(numero_declaration);
CREATE INDEX IF NOT EXISTS idx_declaration_statut ON declaration(statut);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cosmetovigilance-attachments', 'cosmetovigilance-attachments', false)
ON CONFLICT (id) DO NOTHING;
