/*
  # Recreate Cosmetovigilance Declarations View

  1. Actions
    - Drop existing cosmetovigilance_declarations view
    - Create new view with complete declaration data

  2. New View Structure
    - `cosmetovigilance_declarations` - Consolidated view of declarations with related data
      - Joins declaration with personne_exposee, produit_suspecte, and effet_indesirable tables
      - Provides easy access to key declaration information for the MyDeclarations page

  3. Security
    - Grant SELECT access to authenticated users
*/

-- Drop the existing view if it exists
DROP VIEW IF EXISTS cosmetovigilance_declarations CASCADE;

-- Create the cosmetovigilance_declarations view
CREATE OR REPLACE VIEW cosmetovigilance_declarations AS
SELECT 
  d.id,
  d.created_at,
  d.user_id,
  d.commentaire,
  pe.nom AS patient_nom,
  pe.prenom AS patient_prenom,
  pe.age AS patient_age,
  pe.sexe AS patient_sexe,
  pe.email AS patient_email,
  pe.tel AS patient_tel,
  ps.nom_commercial AS produit_nom_commercial,
  ps.marque AS produit_marque,
  ps.fabricant AS produit_fabricant,
  ps.type_produit AS produit_type,
  ps.numero_lot AS produit_numero_lot,
  ei.localisation AS effet_localisation,
  ei.date_apparition AS effet_date_apparition,
  ei.gravite AS effet_gravite,
  ei.evolution_effet AS effet_evolution
FROM declaration d
LEFT JOIN personne_exposee pe ON d.personne_exposee_id = pe.id
LEFT JOIN produit_suspecte ps ON ps.declaration_id = d.id
LEFT JOIN effet_indesirable ei ON ei.declaration_id = d.id;

-- Grant access to authenticated users
GRANT SELECT ON cosmetovigilance_declarations TO authenticated;