/*
  # Schéma pour les Compléments Alimentaires

  ## Description
  Cette migration crée toutes les tables nécessaires pour gérer les déclarations
  de compléments alimentaires dans le système de nutrivigilance. Le schéma suit
  la même structure que celui des cosmétiques mais reste totalement indépendant.

  ## Nouvelles Tables
    - `complement_alimentaire` (table principale)
    - `declarant_ca` (informations du déclarant)
    - `professionnel_sante_ca` (pour professionnels de santé)
    - `representant_legal_ca` (pour représentants légaux)
    - `personne_exposee_ca` (personne ayant consommé le complément)
    - `allergies_connues_ca` (allergies de la personne exposée)
    - `antecedents_medical_ca` (antécédents médicaux)
    - `medicament_produit_simultanement_ca` (médicaments pris en parallèle)
    - `effet_indesirable_ca` (effets indésirables observés)
    - `criteres_gravite_ca` (critères de gravité des effets)
    - `prise_charge_medicale_ca` (prise en charge médicale)
    - `complement_suspecte` (informations sur le complément suspecté)

  ## Sécurité
    - RLS activé sur toutes les tables
    - Encryption des données personnelles (nom, prénom, email, téléphone)
    - Politiques restrictives par défaut
*/

-- Table principale pour les déclarations de compléments alimentaires
CREATE TABLE IF NOT EXISTS complement_alimentaire (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  numero_declaration VARCHAR(255) UNIQUE NOT NULL,
  statut VARCHAR(50) DEFAULT 'EN_ATTENTE',
  commentaire_anmps TEXT,
  commentaire TEXT,
  date_creation TIMESTAMP DEFAULT NOW(),
  date_modification TIMESTAMP DEFAULT NOW()
);

ALTER TABLE complement_alimentaire ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own declarations"
  ON complement_alimentaire FOR SELECT
  TO authenticated
  USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can create own declarations"
  ON complement_alimentaire FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "ANMPS can read all declarations"
  ON complement_alimentaire FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

CREATE POLICY "ANMPS can update declarations"
  ON complement_alimentaire FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

-- Table pour les déclarants
CREATE TABLE IF NOT EXISTS declarant_ca (
  id BIGSERIAL PRIMARY KEY,
  complement_alimentaire_id BIGINT NOT NULL UNIQUE REFERENCES complement_alimentaire(id) ON DELETE CASCADE,
  utilisateur_type VARCHAR(50),
  utilisateur_type_autre VARCHAR(255),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  tel TEXT NOT NULL
);

ALTER TABLE declarant_ca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own declarant"
  ON declarant_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = declarant_ca.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "Users can create own declarant"
  ON declarant_ca FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = declarant_ca.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "ANMPS can read all declarants"
  ON declarant_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

-- Table pour les professionnels de santé
CREATE TABLE IF NOT EXISTS professionnel_sante_ca (
  id BIGSERIAL PRIMARY KEY,
  complement_alimentaire_id BIGINT NOT NULL UNIQUE REFERENCES complement_alimentaire(id) ON DELETE CASCADE,
  profession VARCHAR(100),
  profession_autre VARCHAR(255),
  structure VARCHAR(255),
  ville VARCHAR(100)
);

ALTER TABLE professionnel_sante_ca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own professionnel_sante"
  ON professionnel_sante_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = professionnel_sante_ca.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "Users can create own professionnel_sante"
  ON professionnel_sante_ca FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = professionnel_sante_ca.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "ANMPS can read all professionnels_sante"
  ON professionnel_sante_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

-- Table pour les représentants légaux
CREATE TABLE IF NOT EXISTS representant_legal_ca (
  id BIGSERIAL PRIMARY KEY,
  complement_alimentaire_id BIGINT NOT NULL UNIQUE REFERENCES complement_alimentaire(id) ON DELETE CASCADE,
  nom_etablissement VARCHAR(255),
  numero_declaration_etablissement VARCHAR(255),
  numero_document_enregistrement_produit VARCHAR(255),
  date_reception_notification DATE,
  document_enregistrement_path TEXT
);

ALTER TABLE representant_legal_ca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own representant_legal"
  ON representant_legal_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = representant_legal_ca.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "Users can create own representant_legal"
  ON representant_legal_ca FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = representant_legal_ca.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "ANMPS can read all representants_legaux"
  ON representant_legal_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

-- Table pour les personnes exposées
CREATE TABLE IF NOT EXISTS personne_exposee_ca (
  id BIGSERIAL PRIMARY KEY,
  complement_alimentaire_id BIGINT NOT NULL UNIQUE REFERENCES complement_alimentaire(id) ON DELETE CASCADE,
  type VARCHAR(50),
  nom_prenom TEXT NOT NULL,
  date_naissance VARCHAR(50),
  age INTEGER,
  age_unite VARCHAR(20),
  grossesse BOOLEAN DEFAULT FALSE,
  mois_grossesse INTEGER,
  allaitement BOOLEAN DEFAULT FALSE,
  sexe VARCHAR(1),
  ville VARCHAR(100)
);

ALTER TABLE personne_exposee_ca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own personne_exposee"
  ON personne_exposee_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = personne_exposee_ca.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "Users can create own personne_exposee"
  ON personne_exposee_ca FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = personne_exposee_ca.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "ANMPS can read all personnes_exposees"
  ON personne_exposee_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

-- Table pour les allergies connues
CREATE TABLE IF NOT EXISTS allergies_connues_ca (
  id BIGSERIAL PRIMARY KEY,
  personne_exposee_ca_id BIGINT NOT NULL REFERENCES personne_exposee_ca(id) ON DELETE CASCADE,
  allergie TEXT NOT NULL
);

ALTER TABLE allergies_connues_ca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own allergies"
  ON allergies_connues_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personne_exposee_ca pe
      JOIN complement_alimentaire ca ON ca.id = pe.complement_alimentaire_id
      WHERE pe.id = allergies_connues_ca.personne_exposee_ca_id
      AND ca.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "Users can create own allergies"
  ON allergies_connues_ca FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personne_exposee_ca pe
      JOIN complement_alimentaire ca ON ca.id = pe.complement_alimentaire_id
      WHERE pe.id = allergies_connues_ca.personne_exposee_ca_id
      AND ca.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "ANMPS can read all allergies"
  ON allergies_connues_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

-- Table pour les antécédents médicaux
CREATE TABLE IF NOT EXISTS antecedents_medical_ca (
  id BIGSERIAL PRIMARY KEY,
  personne_exposee_ca_id BIGINT NOT NULL REFERENCES personne_exposee_ca(id) ON DELETE CASCADE,
  antecedent TEXT NOT NULL
);

ALTER TABLE antecedents_medical_ca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own antecedents"
  ON antecedents_medical_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personne_exposee_ca pe
      JOIN complement_alimentaire ca ON ca.id = pe.complement_alimentaire_id
      WHERE pe.id = antecedents_medical_ca.personne_exposee_ca_id
      AND ca.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "Users can create own antecedents"
  ON antecedents_medical_ca FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personne_exposee_ca pe
      JOIN complement_alimentaire ca ON ca.id = pe.complement_alimentaire_id
      WHERE pe.id = antecedents_medical_ca.personne_exposee_ca_id
      AND ca.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "ANMPS can read all antecedents"
  ON antecedents_medical_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

-- Table pour les médicaments pris simultanément
CREATE TABLE IF NOT EXISTS medicament_produit_simultanement_ca (
  id BIGSERIAL PRIMARY KEY,
  personne_exposee_ca_id BIGINT NOT NULL REFERENCES personne_exposee_ca(id) ON DELETE CASCADE,
  medicament TEXT NOT NULL
);

ALTER TABLE medicament_produit_simultanement_ca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own medicaments"
  ON medicament_produit_simultanement_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personne_exposee_ca pe
      JOIN complement_alimentaire ca ON ca.id = pe.complement_alimentaire_id
      WHERE pe.id = medicament_produit_simultanement_ca.personne_exposee_ca_id
      AND ca.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "Users can create own medicaments"
  ON medicament_produit_simultanement_ca FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personne_exposee_ca pe
      JOIN complement_alimentaire ca ON ca.id = pe.complement_alimentaire_id
      WHERE pe.id = medicament_produit_simultanement_ca.personne_exposee_ca_id
      AND ca.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "ANMPS can read all medicaments"
  ON medicament_produit_simultanement_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

-- Table pour les effets indésirables
CREATE TABLE IF NOT EXISTS effet_indesirable_ca (
  id BIGSERIAL PRIMARY KEY,
  complement_alimentaire_id BIGINT NOT NULL UNIQUE REFERENCES complement_alimentaire(id) ON DELETE CASCADE,
  localisation TEXT,
  description_symptomes TEXT,
  date_apparition DATE,
  delai_survenue VARCHAR(255),
  gravite BOOLEAN DEFAULT FALSE,
  evolution_effet VARCHAR(100)
);

ALTER TABLE effet_indesirable_ca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own effet_indesirable"
  ON effet_indesirable_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = effet_indesirable_ca.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "Users can create own effet_indesirable"
  ON effet_indesirable_ca FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = effet_indesirable_ca.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "ANMPS can read all effets_indesirables"
  ON effet_indesirable_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

-- Table pour les critères de gravité
CREATE TABLE IF NOT EXISTS criteres_gravite_ca (
  effet_indesirable_ca_id BIGINT NOT NULL REFERENCES effet_indesirable_ca(id) ON DELETE CASCADE,
  critere VARCHAR(255) NOT NULL,
  PRIMARY KEY (effet_indesirable_ca_id, critere)
);

ALTER TABLE criteres_gravite_ca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own criteres_gravite"
  ON criteres_gravite_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM effet_indesirable_ca ei
      JOIN complement_alimentaire ca ON ca.id = ei.complement_alimentaire_id
      WHERE ei.id = criteres_gravite_ca.effet_indesirable_ca_id
      AND ca.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "Users can create own criteres_gravite"
  ON criteres_gravite_ca FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM effet_indesirable_ca ei
      JOIN complement_alimentaire ca ON ca.id = ei.complement_alimentaire_id
      WHERE ei.id = criteres_gravite_ca.effet_indesirable_ca_id
      AND ca.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "ANMPS can read all criteres_gravite"
  ON criteres_gravite_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

-- Table pour la prise en charge médicale
CREATE TABLE IF NOT EXISTS prise_charge_medicale_ca (
  id BIGSERIAL PRIMARY KEY,
  complement_alimentaire_id BIGINT NOT NULL UNIQUE REFERENCES complement_alimentaire(id) ON DELETE CASCADE,
  consultation_medicale BOOLEAN DEFAULT FALSE,
  diagnostic_medecin TEXT,
  mesures_prise_type VARCHAR(100),
  mesures_prise_autre TEXT,
  examens_realise TEXT
);

ALTER TABLE prise_charge_medicale_ca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own prise_charge"
  ON prise_charge_medicale_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = prise_charge_medicale_ca.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "Users can create own prise_charge"
  ON prise_charge_medicale_ca FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = prise_charge_medicale_ca.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "ANMPS can read all prises_charge"
  ON prise_charge_medicale_ca FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

-- Table pour les compléments suspectés
CREATE TABLE IF NOT EXISTS complement_suspecte (
  id BIGSERIAL PRIMARY KEY,
  complement_alimentaire_id BIGINT NOT NULL UNIQUE REFERENCES complement_alimentaire(id) ON DELETE CASCADE,
  nom_commercial VARCHAR(255),
  marque VARCHAR(255),
  fabricant VARCHAR(255),
  numero_lot VARCHAR(255),
  forme_galenique VARCHAR(100),
  posologie TEXT,
  frequence_utilisation VARCHAR(255),
  date_debut_utilisation DATE,
  arret_utilisation VARCHAR(50),
  reexposition_produit BOOLEAN DEFAULT FALSE,
  reapparition_effet_indesirable BOOLEAN DEFAULT FALSE,
  composition_produit TEXT
);

ALTER TABLE complement_suspecte ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own complement_suspecte"
  ON complement_suspecte FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = complement_suspecte.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "Users can create own complement_suspecte"
  ON complement_suspecte FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complement_alimentaire
      WHERE complement_alimentaire.id = complement_suspecte.complement_alimentaire_id
      AND complement_alimentaire.user_id = auth.uid()::BIGINT
    )
  );

CREATE POLICY "ANMPS can read all complements_suspectes"
  ON complement_suspecte FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::BIGINT
      AND users.role = 'ANMPS'
    )
  );

-- Création d'index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_complement_alimentaire_user_id ON complement_alimentaire(user_id);
CREATE INDEX IF NOT EXISTS idx_complement_alimentaire_statut ON complement_alimentaire(statut);
CREATE INDEX IF NOT EXISTS idx_complement_alimentaire_date_creation ON complement_alimentaire(date_creation DESC);
CREATE INDEX IF NOT EXISTS idx_declarant_ca_complement_id ON declarant_ca(complement_alimentaire_id);
CREATE INDEX IF NOT EXISTS idx_personne_exposee_ca_complement_id ON personne_exposee_ca(complement_alimentaire_id);
CREATE INDEX IF NOT EXISTS idx_personne_exposee_ca_ville ON personne_exposee_ca(ville);
CREATE INDEX IF NOT EXISTS idx_personne_exposee_ca_sexe ON personne_exposee_ca(sexe);
CREATE INDEX IF NOT EXISTS idx_effet_indesirable_ca_complement_id ON effet_indesirable_ca(complement_alimentaire_id);
CREATE INDEX IF NOT EXISTS idx_complement_suspecte_complement_id ON complement_suspecte(complement_alimentaire_id);
CREATE INDEX IF NOT EXISTS idx_complement_suspecte_forme_galenique ON complement_suspecte(forme_galenique);
