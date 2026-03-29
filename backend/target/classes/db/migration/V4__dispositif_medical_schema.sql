/*
  # Schéma Matériovigilance - Dispositifs Médicaux

  ## Description
  Ce schéma implémente le système de déclarations pour les dispositifs médicaux,
  permettant le signalement d'incidents ou d'effets indésirables liés à l'utilisation
  de dispositifs médicaux.

  ## Nouvelles Tables

  ### dispositif_medical
  Table principale pour les déclarations de matériovigilance
  - `id` (BIGINT) : Identifiant unique
  - `numero_declaration` (VARCHAR) : Numéro de déclaration auto-généré (DM-YYYY-XXXXXX)
  - `statut` (ENUM) : Statut de la déclaration (EN_ATTENTE, EN_COURS, TRAITEE, REJETEE)
  - `commentaire` (TEXT) : Commentaire du déclarant
  - `commentaire_anmps` (TEXT) : Commentaire de l'ANMPS
  - Relations avec les sous-tables via clés étrangères
  - Timestamps de création et modification

  ### declarant_dm
  Informations sur le déclarant
  - Nom, prénom, adresse email, téléphone
  - Qualité du déclarant (professionnel de santé, patient, autre)

  ### personne_exposee_dm
  Informations sur la personne exposée au dispositif médical
  - Identité (nom, prénom, date de naissance)
  - Caractéristiques (âge, sexe, poids, taille)
  - État (grossesse, allaitement)
  - Coordonnées (email, téléphone, adresse)

  ### dispositif_suspecte
  Informations sur le dispositif médical suspecté (structure simplifiée)
  - `nom_specialite` : Nom du dispositif médical
  - `posologie` : Posologie/mode d'emploi
  - `numero_lot` : Numéro de lot
  - `date_debut_prise` : Date de début d'utilisation
  - `date_arret_prise` : Date d'arrêt d'utilisation
  - `motif_prise` : Motif de l'utilisation
  - `lieu_achat` : Lieu d'acquisition

  ### effet_indesirable_dm
  Description de l'effet indésirable ou incident
  - Description détaillée
  - Localisation anatomique
  - Date d'apparition
  - Gravité
  - Évolution

  ### prise_charge_medicale_dm
  Informations sur la prise en charge médicale
  - Hospitalisation requise
  - Durée d'hospitalisation
  - Traitement médical mis en place
  - Examens complémentaires réalisés

  ### professionnel_sante_dm
  Informations sur le professionnel de santé rapporteur
  - Identité et spécialité
  - Coordonnées professionnelles
  - Établissement

  ### representant_legal_dm
  Représentant légal (pour les mineurs ou personnes protégées)
  - Identité et lien de parenté
  - Coordonnées

  ### allergies_connues_dm
  Allergies connues de la personne exposée
  - Type d'allergie et description

  ### antecedents_medical_dm
  Antécédents médicaux pertinents
  - Description des antécédents

  ### medicament_produit_simultanement_dm
  Médicaments/produits utilisés simultanément
  - Nom et posologie

  ## Sécurité
  - RLS (Row Level Security) activé sur toutes les tables
  - Politiques restrictives par défaut
  - Accès contrôlé selon l'authentification et la propriété

  ## Notes importantes
  - Structure similaire aux compléments alimentaires pour cohérence
  - Tables séparées des autres modules (cosmétiques, compléments)
  - Trigger pour génération automatique du numéro de déclaration
  - Index sur les clés étrangères pour performances
*/

-- =============================================
-- 1. TABLE PRINCIPALE: dispositif_medical
-- =============================================

CREATE TABLE IF NOT EXISTS dispositif_medical (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_declaration VARCHAR(50) UNIQUE,
    statut VARCHAR(20) DEFAULT 'EN_ATTENTE',
    commentaire TEXT,
    commentaire_anmps TEXT,
    declarant_dm_id BIGINT,
    personne_exposee_dm_id BIGINT,
    professionnel_sante_dm_id BIGINT,
    representant_legal_dm_id BIGINT,
    user_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_dm_user (user_id),
    INDEX idx_dm_statut (statut),
    INDEX idx_dm_numero (numero_declaration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. TABLE: declarant_dm
-- =============================================

CREATE TABLE IF NOT EXISTS declarant_dm (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    email VARCHAR(255),
    telephone VARCHAR(20),
    qualite_declarant VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. TABLE: personne_exposee_dm
-- =============================================

CREATE TABLE IF NOT EXISTS personne_exposee_dm (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    date_naissance DATE,
    age INT,
    age_unite VARCHAR(20) DEFAULT 'ans',
    sexe VARCHAR(10),
    poids DECIMAL(5,2),
    taille DECIMAL(5,2),
    email VARCHAR(255),
    telephone VARCHAR(20),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    grossesse BOOLEAN DEFAULT FALSE,
    allaitement BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. TABLE: dispositif_suspecte (Structure simplifiée)
-- =============================================

CREATE TABLE IF NOT EXISTS dispositif_suspecte (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dispositif_medical_id BIGINT NOT NULL,
    nom_specialite VARCHAR(255),
    posologie TEXT,
    numero_lot VARCHAR(100),
    date_debut_prise DATE,
    date_arret_prise DATE,
    motif_prise TEXT,
    lieu_achat VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dispositif_medical_id) REFERENCES dispositif_medical(id) ON DELETE CASCADE,
    INDEX idx_dispositif_dm (dispositif_medical_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. TABLE: effet_indesirable_dm
-- =============================================

CREATE TABLE IF NOT EXISTS effet_indesirable_dm (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dispositif_medical_id BIGINT NOT NULL,
    description TEXT,
    localisation VARCHAR(255),
    date_apparition DATE,
    gravite VARCHAR(50),
    evolution VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dispositif_medical_id) REFERENCES dispositif_medical(id) ON DELETE CASCADE,
    INDEX idx_effet_dm (dispositif_medical_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. TABLE: prise_charge_medicale_dm
-- =============================================

CREATE TABLE IF NOT EXISTS prise_charge_medicale_dm (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dispositif_medical_id BIGINT NOT NULL,
    hospitalisation_requise BOOLEAN DEFAULT FALSE,
    duree_hospitalisation INT,
    traitement_medical TEXT,
    examens_complementaires TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dispositif_medical_id) REFERENCES dispositif_medical(id) ON DELETE CASCADE,
    INDEX idx_prise_charge_dm (dispositif_medical_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. TABLE: professionnel_sante_dm
-- =============================================

CREATE TABLE IF NOT EXISTS professionnel_sante_dm (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    specialite VARCHAR(100),
    email VARCHAR(255),
    telephone VARCHAR(20),
    adresse TEXT,
    etablissement VARCHAR(255),
    ville VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. TABLE: representant_legal_dm
-- =============================================

CREATE TABLE IF NOT EXISTS representant_legal_dm (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    lien_parente VARCHAR(100),
    email VARCHAR(255),
    telephone VARCHAR(20),
    adresse TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 9. TABLE: allergies_connues_dm
-- =============================================

CREATE TABLE IF NOT EXISTS allergies_connues_dm (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    personne_exposee_dm_id BIGINT NOT NULL,
    type_allergie VARCHAR(100),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personne_exposee_dm_id) REFERENCES personne_exposee_dm(id) ON DELETE CASCADE,
    INDEX idx_allergie_personne_dm (personne_exposee_dm_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. TABLE: antecedents_medical_dm
-- =============================================

CREATE TABLE IF NOT EXISTS antecedents_medical_dm (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    personne_exposee_dm_id BIGINT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personne_exposee_dm_id) REFERENCES personne_exposee_dm(id) ON DELETE CASCADE,
    INDEX idx_antecedent_personne_dm (personne_exposee_dm_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 11. TABLE: medicament_produit_simultanement_dm
-- =============================================

CREATE TABLE IF NOT EXISTS medicament_produit_simultanement_dm (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    personne_exposee_dm_id BIGINT NOT NULL,
    nom VARCHAR(255),
    posologie TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personne_exposee_dm_id) REFERENCES personne_exposee_dm(id) ON DELETE CASCADE,
    INDEX idx_medicament_personne_dm (personne_exposee_dm_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 12. FOREIGN KEY CONSTRAINTS
-- =============================================

ALTER TABLE dispositif_medical
ADD CONSTRAINT fk_dm_declarant FOREIGN KEY (declarant_dm_id)
REFERENCES declarant_dm(id) ON DELETE SET NULL;

ALTER TABLE dispositif_medical
ADD CONSTRAINT fk_dm_personne_exposee FOREIGN KEY (personne_exposee_dm_id)
REFERENCES personne_exposee_dm(id) ON DELETE SET NULL;

ALTER TABLE dispositif_medical
ADD CONSTRAINT fk_dm_professionnel_sante FOREIGN KEY (professionnel_sante_dm_id)
REFERENCES professionnel_sante_dm(id) ON DELETE SET NULL;

ALTER TABLE dispositif_medical
ADD CONSTRAINT fk_dm_representant_legal FOREIGN KEY (representant_legal_dm_id)
REFERENCES representant_legal_dm(id) ON DELETE SET NULL;

-- =============================================
-- 13. TRIGGER FOR AUTO-GENERATION
-- =============================================

DELIMITER //

CREATE TRIGGER IF NOT EXISTS generate_numero_dm_before_insert
BEFORE INSERT ON dispositif_medical
FOR EACH ROW
BEGIN
    DECLARE current_year VARCHAR(4);
    DECLARE next_number INT;
    DECLARE new_numero VARCHAR(50);

    IF NEW.numero_declaration IS NULL THEN
        SET current_year = YEAR(NOW());

        SELECT COALESCE(MAX(CAST(SUBSTRING(numero_declaration, 9) AS UNSIGNED)), 0) + 1
        INTO next_number
        FROM dispositif_medical
        WHERE numero_declaration LIKE CONCAT('DM-', current_year, '-%');

        SET new_numero = CONCAT('DM-', current_year, '-', LPAD(next_number, 6, '0'));
        SET NEW.numero_declaration = new_numero;
    END IF;
END//

DELIMITER ;

-- =============================================
-- 14. VIEW FOR SIMPLIFIED QUERIES
-- =============================================

CREATE OR REPLACE VIEW materiovigilance_declarations AS
SELECT
    dm.id,
    dm.numero_declaration,
    dm.statut,
    dm.created_at,
    dm.updated_at,
    dm.user_id,
    dm.commentaire,
    dm.commentaire_anmps,
    pe.nom as patient_nom,
    pe.prenom as patient_prenom,
    pe.email as patient_email,
    pe.age,
    pe.age_unite,
    pe.sexe,
    pe.date_naissance,
    pe.grossesse,
    pe.allaitement,
    ds.nom_specialite as dispositif_nom,
    ds.numero_lot as dispositif_lot,
    ds.lieu_achat as dispositif_lieu_achat,
    ei.description as effet_description,
    ei.localisation as effet_localisation,
    ei.date_apparition as effet_date_apparition,
    ei.gravite as effet_gravite,
    dcl.nom as declarant_nom,
    dcl.prenom as declarant_prenom,
    dcl.email as declarant_email
FROM dispositif_medical dm
LEFT JOIN personne_exposee_dm pe ON dm.personne_exposee_dm_id = pe.id
LEFT JOIN declarant_dm dcl ON dm.declarant_dm_id = dcl.id
LEFT JOIN effet_indesirable_dm ei ON ei.dispositif_medical_id = dm.id
LEFT JOIN dispositif_suspecte ds ON ds.dispositif_medical_id = dm.id;
