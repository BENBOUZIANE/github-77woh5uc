-- Cosmetovigilance Database Schema for MySQL

-- Users table (replaces auth.users from Supabase)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Utilisateur table
CREATE TABLE IF NOT EXISTS utilisateur (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Professionnel de santé table
CREATE TABLE IF NOT EXISTS professionnel_sante (
    id VARCHAR(36) PRIMARY KEY,
    utilisateur_id VARCHAR(36),
    profession VARCHAR(255) NOT NULL,
    structure VARCHAR(255) NOT NULL,
    ville VARCHAR(255) NOT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    INDEX idx_utilisateur_id (utilisateur_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Représentant légal table
CREATE TABLE IF NOT EXISTS representant_legal (
    id VARCHAR(36) PRIMARY KEY,
    professionnel_sante_id VARCHAR(36),
    nom_etablissement VARCHAR(255) NOT NULL,
    numero_declaration_etablissement VARCHAR(255) NOT NULL,
    numero_document_enregistrement_produit VARCHAR(255) NOT NULL,
    date_reception_notification VARCHAR(255) NOT NULL,
    document_enregistrement TEXT,
    FOREIGN KEY (professionnel_sante_id) REFERENCES professionnel_sante(id) ON DELETE CASCADE,
    INDEX idx_professionnel_sante_id (professionnel_sante_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Déclarant table
CREATE TABLE IF NOT EXISTS declarant (
    id VARCHAR(36) PRIMARY KEY,
    utilisateur_id VARCHAR(36),
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    tel VARCHAR(50) NOT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    INDEX idx_utilisateur_id (utilisateur_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Personne exposée table
CREATE TABLE IF NOT EXISTS personne_exposee (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    grossesse TINYINT(1) DEFAULT 0,
    mois_grossesse INT,
    email VARCHAR(255),
    tel VARCHAR(50),
    sexe VARCHAR(1) NOT NULL,
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Allergies connues table
CREATE TABLE IF NOT EXISTS allergies_connues (
    id VARCHAR(36) PRIMARY KEY,
    personne_exposee_id VARCHAR(36),
    label VARCHAR(255) NOT NULL,
    FOREIGN KEY (personne_exposee_id) REFERENCES personne_exposee(id) ON DELETE CASCADE,
    INDEX idx_personne_exposee_id (personne_exposee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Antécédents médicaux table
CREATE TABLE IF NOT EXISTS antecedents_medical (
    id VARCHAR(36) PRIMARY KEY,
    personne_exposee_id VARCHAR(36),
    label VARCHAR(255) NOT NULL,
    FOREIGN KEY (personne_exposee_id) REFERENCES personne_exposee(id) ON DELETE CASCADE,
    INDEX idx_personne_exposee_id (personne_exposee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Médicaments produits simultanément table
CREATE TABLE IF NOT EXISTS medicament_produit_simultanement (
    id VARCHAR(36) PRIMARY KEY,
    personne_exposee_id VARCHAR(36),
    label VARCHAR(255) NOT NULL,
    FOREIGN KEY (personne_exposee_id) REFERENCES personne_exposee(id) ON DELETE CASCADE,
    INDEX idx_personne_exposee_id (personne_exposee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Déclaration table
CREATE TABLE IF NOT EXISTS declaration (
    id VARCHAR(36) PRIMARY KEY,
    declarant_id VARCHAR(36),
    personne_exposee_id VARCHAR(36),
    user_id VARCHAR(36),
    commentaire TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (declarant_id) REFERENCES declarant(id) ON DELETE CASCADE,
    FOREIGN KEY (personne_exposee_id) REFERENCES personne_exposee(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Effet indésirable table
CREATE TABLE IF NOT EXISTS effet_indesirable (
    id VARCHAR(36) PRIMARY KEY,
    declaration_id VARCHAR(36),
    localisation VARCHAR(255) NOT NULL,
    date_apparition DATE NOT NULL,
    date_fin DATE,
    gravite TINYINT(1) DEFAULT 0,
    criteres_gravite TEXT,
    evolution_effet VARCHAR(100) NOT NULL,
    FOREIGN KEY (declaration_id) REFERENCES declaration(id) ON DELETE CASCADE,
    INDEX idx_declaration_id (declaration_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prise en charge médicale table
CREATE TABLE IF NOT EXISTS prise_charge_medicale (
    id VARCHAR(36) PRIMARY KEY,
    declaration_id VARCHAR(36),
    diagnostic TEXT NOT NULL,
    mesures_prise TEXT NOT NULL,
    examens_realise TEXT NOT NULL,
    FOREIGN KEY (declaration_id) REFERENCES declaration(id) ON DELETE CASCADE,
    INDEX idx_declaration_id (declaration_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Produit suspecté table
CREATE TABLE IF NOT EXISTS produit_suspecte (
    id VARCHAR(36) PRIMARY KEY,
    declaration_id VARCHAR(36),
    nom_commercial VARCHAR(255) NOT NULL,
    marque VARCHAR(255) NOT NULL,
    fabricant VARCHAR(255) NOT NULL,
    type_produit VARCHAR(255) NOT NULL,
    numero_lot VARCHAR(255) NOT NULL,
    frequence_utilisation VARCHAR(255) NOT NULL,
    date_debut_utilisation VARCHAR(255) NOT NULL,
    arret_utilisation VARCHAR(255) NOT NULL,
    reexposition_produit TINYINT(1) DEFAULT 0,
    reapparition_effet_indesirable TINYINT(1) DEFAULT 0,
    FOREIGN KEY (declaration_id) REFERENCES declaration(id) ON DELETE CASCADE,
    INDEX idx_declaration_id (declaration_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(36) PRIMARY KEY,
    declaration_id VARCHAR(36),
    file VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    file_size BIGINT,
    user_id VARCHAR(36),
    attachment_category VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (declaration_id) REFERENCES declaration(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_declaration_id (declaration_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- View for simplified declaration queries
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
