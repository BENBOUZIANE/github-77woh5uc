-- Add commentaire_anmps and statut columns to declaration table

ALTER TABLE declaration
ADD COLUMN IF NOT EXISTS commentaire_anmps TEXT,
ADD COLUMN IF NOT EXISTS statut ENUM('nouveau','en_cours','traite','rejete','cloture') NOT NULL DEFAULT 'nouveau';

-- Add index on statut for better query performance
ALTER TABLE declaration ADD INDEX IF NOT EXISTS idx_statut (statut);
