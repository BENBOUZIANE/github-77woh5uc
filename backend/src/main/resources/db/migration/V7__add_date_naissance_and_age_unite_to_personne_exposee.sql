-- Add date_naissance and age_unite columns to personne_exposee table
-- This migration adds support for birth date and age unit fields

ALTER TABLE personne_exposee
ADD COLUMN date_naissance VARCHAR(20),
ADD COLUMN age_unite VARCHAR(20);

-- Make age nullable since we now have date_naissance as an alternative
ALTER TABLE personne_exposee
MODIFY COLUMN age INT NULL;
