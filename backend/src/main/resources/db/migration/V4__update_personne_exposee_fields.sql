-- Migration pour modifier les champs de personne_exposee

-- Ajouter le nouveau champ nom_prenom et ville
ALTER TABLE personne_exposee
ADD COLUMN nom_prenom VARCHAR(255),
ADD COLUMN ville VARCHAR(100);

-- Copier les données existantes (concaténer nom et prenom)
UPDATE personne_exposee
SET nom_prenom = CONCAT(COALESCE(nom, ''), ' ', COALESCE(prenom, ''));

-- Rendre le champ nom_prenom obligatoire
ALTER TABLE personne_exposee
MODIFY COLUMN nom_prenom VARCHAR(255) NOT NULL;

-- Supprimer les anciens champs nom, prenom, email et tel
ALTER TABLE personne_exposee
DROP COLUMN nom,
DROP COLUMN prenom,
DROP COLUMN email,
DROP COLUMN tel;

-- Rendre le champ ville obligatoire (après avoir défini une valeur par défaut pour les données existantes)
UPDATE personne_exposee
SET ville = 'Non spécifié'
WHERE ville IS NULL;

ALTER TABLE personne_exposee
MODIFY COLUMN ville VARCHAR(100) NOT NULL;
