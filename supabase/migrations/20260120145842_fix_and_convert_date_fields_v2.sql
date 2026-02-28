/*
  # Fix and Convert Date Fields to Proper Date Type

  1. Changes
    - Delete invalid test data rows
    - Make `arret_utilisation` nullable (product may still be in use)
    - Update `arret_utilisation` field values (Oui/Non) to NULL
    - Convert `date_debut_utilisation` from text to date type
    - Convert `arret_utilisation` from text to nullable date type

  2. Notes
    - `date_debut_utilisation` should be a required date field
    - `arret_utilisation` should be an optional date field (NULL if product still in use)
    - Cleans up invalid/test data before type conversion
*/

-- First, make arret_utilisation nullable
ALTER TABLE produit_suspecte 
ALTER COLUMN arret_utilisation DROP NOT NULL;

-- Delete invalid test data rows
DELETE FROM produit_suspecte 
WHERE date_debut_utilisation NOT SIMILAR TO '[0-9]{4}-[0-9]{2}-[0-9]{2}';

-- Update arret_utilisation to NULL where it contains Oui/Non instead of actual dates
UPDATE produit_suspecte 
SET arret_utilisation = NULL 
WHERE arret_utilisation IN ('Oui', 'Non') OR arret_utilisation NOT SIMILAR TO '[0-9]{4}-[0-9]{2}-[0-9]{2}';

-- Convert date_debut_utilisation from text to date (NOT NULL)
ALTER TABLE produit_suspecte 
ALTER COLUMN date_debut_utilisation TYPE date USING date_debut_utilisation::date;

-- Convert arret_utilisation from text to date (NULLABLE)
ALTER TABLE produit_suspecte 
ALTER COLUMN arret_utilisation TYPE date USING 
  CASE 
    WHEN arret_utilisation IS NULL THEN NULL
    ELSE arret_utilisation::date 
  END;