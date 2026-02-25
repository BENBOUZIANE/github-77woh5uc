-- Add zone_application column to produit_suspecte table
ALTER TABLE produit_suspecte ADD COLUMN IF NOT EXISTS zone_application VARCHAR(255) NOT NULL DEFAULT '';
