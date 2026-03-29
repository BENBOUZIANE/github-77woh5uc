/*
  # Simplification de la table complement_suspecte

  1. Modifications
    - Supprime les colonnes inutilisées:
      - nom_commercial
      - marque
      - fabricant
      - forme_galenique
      - frequence_utilisation
      - arret_utilisation
      - reexposition_produit
      - reapparition_effet_indesirable
      - composition_produit

    - Ajoute les nouvelles colonnes essentielles:
      - nom_specialite (Nom de la spécialité/présentation)
      - date_debut_prise (Date début de prise)
      - date_arret_prise (Date arrêt de prise)
      - motif_prise (Motif de la prise)
      - lieu_achat (Lieu d'achat: 1=Pharmacie, 2=Parapharmacie, 3=Internet, 4=Inconnu)

    - Renomme les colonnes existantes:
      - date_debut_utilisation -> date_debut_prise

  2. Notes
    - Les colonnes conservées: id, complement_alimentaire_id, posologie, numero_lot
    - Cette migration est destructive pour les données existantes dans les colonnes supprimées
*/

-- Ajouter les nouvelles colonnes
ALTER TABLE complement_suspecte ADD COLUMN IF NOT EXISTS nom_specialite VARCHAR(255);
ALTER TABLE complement_suspecte ADD COLUMN IF NOT EXISTS motif_prise VARCHAR(255);
ALTER TABLE complement_suspecte ADD COLUMN IF NOT EXISTS lieu_achat VARCHAR(10);
ALTER TABLE complement_suspecte ADD COLUMN IF NOT EXISTS date_arret_prise DATE;

-- Migrer date_debut_utilisation vers date_debut_prise si elle n'existe pas encore
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'complement_suspecte' AND column_name = 'date_debut_prise'
  ) THEN
    ALTER TABLE complement_suspecte RENAME COLUMN date_debut_utilisation TO date_debut_prise;
  END IF;
END $$;

-- Supprimer les anciennes colonnes qui ne sont plus nécessaires
ALTER TABLE complement_suspecte DROP COLUMN IF EXISTS nom_commercial;
ALTER TABLE complement_suspecte DROP COLUMN IF EXISTS marque;
ALTER TABLE complement_suspecte DROP COLUMN IF EXISTS fabricant;
ALTER TABLE complement_suspecte DROP COLUMN IF EXISTS forme_galenique;
ALTER TABLE complement_suspecte DROP COLUMN IF EXISTS frequence_utilisation;
ALTER TABLE complement_suspecte DROP COLUMN IF EXISTS arret_utilisation;
ALTER TABLE complement_suspecte DROP COLUMN IF EXISTS reexposition_produit;
ALTER TABLE complement_suspecte DROP COLUMN IF EXISTS reapparition_effet_indesirable;
ALTER TABLE complement_suspecte DROP COLUMN IF EXISTS composition_produit;
ALTER TABLE complement_suspecte DROP COLUMN IF EXISTS date_debut_utilisation;
