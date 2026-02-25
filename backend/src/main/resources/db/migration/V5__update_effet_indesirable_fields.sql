-- Migration pour modifier les champs de effet_indesirable

-- Ajouter les nouveaux champs
ALTER TABLE effet_indesirable
ADD COLUMN description_symptomes TEXT,
ADD COLUMN delai_survenue VARCHAR(255);

-- Copier les données existantes si nécessaire (date_fin vers delai_survenue comme temporaire)
UPDATE effet_indesirable
SET delai_survenue = 'Non spécifié',
    description_symptomes = 'Non spécifié'
WHERE delai_survenue IS NULL OR description_symptomes IS NULL;

-- Rendre les nouveaux champs obligatoires
ALTER TABLE effet_indesirable
MODIFY COLUMN description_symptomes TEXT NOT NULL,
MODIFY COLUMN delai_survenue VARCHAR(255) NOT NULL;

-- Supprimer l'ancien champ date_fin
ALTER TABLE effet_indesirable
DROP COLUMN date_fin;
