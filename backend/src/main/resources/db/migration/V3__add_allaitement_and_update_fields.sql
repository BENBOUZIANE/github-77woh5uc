-- Add allaitement field to personne_exposee table
ALTER TABLE personne_exposee
ADD COLUMN IF NOT EXISTS allaitement TINYINT(1) DEFAULT 0;

-- Update declarant table to make email nullable
ALTER TABLE declarant
MODIFY COLUMN email VARCHAR(255) NULL;

-- Update professionnel_sante table to make structure and ville nullable
ALTER TABLE professionnel_sante
MODIFY COLUMN structure VARCHAR(255) NULL,
MODIFY COLUMN ville VARCHAR(255) NULL;

-- Update prise_charge_medicale table to make mesures_prise and examens_realise nullable
ALTER TABLE prise_charge_medicale
MODIFY COLUMN mesures_prise TEXT NULL,
MODIFY COLUMN examens_realise TEXT NULL;

-- Update produit_suspecte table to make fabricant nullable
ALTER TABLE produit_suspecte
MODIFY COLUMN fabricant VARCHAR(255) NULL;
