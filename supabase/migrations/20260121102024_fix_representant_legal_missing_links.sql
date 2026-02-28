/*
  # Fix Representant Legal Missing Professional Links

  1. Changes
    - Create missing professionnel_sante entries for representant_legal records that have null professionnel_sante_id
    - Link existing representant_legal records to their newly created professionnel_sante entries
  
  2. Purpose
    - Ensures all representant_legal records are properly linked through the professionnel_sante table
    - Enables correct data retrieval in the declaration detail page
*/

DO $$
DECLARE
  rep_record RECORD;
  new_prof_id UUID;
  utilisateur_id_val UUID;
BEGIN
  FOR rep_record IN 
    SELECT rl.id as rep_id, rl.nom_etablissement, u.id as util_id
    FROM representant_legal rl
    LEFT JOIN professionnel_sante ps ON rl.professionnel_sante_id = ps.id
    LEFT JOIN declarant d ON d.id IN (
      SELECT declarant_id FROM declaration WHERE declarant_id = d.id LIMIT 1
    )
    LEFT JOIN utilisateur u ON d.utilisateur_id = u.id
    WHERE rl.professionnel_sante_id IS NULL AND u.type = 'representant_legal'
  LOOP
    INSERT INTO professionnel_sante (utilisateur_id, profession, structure, ville)
    VALUES (
      rep_record.util_id,
      'Représentant Légal',
      COALESCE(rep_record.nom_etablissement, 'N/A'),
      'N/A'
    )
    RETURNING id INTO new_prof_id;
    
    UPDATE representant_legal
    SET professionnel_sante_id = new_prof_id
    WHERE id = rep_record.rep_id;
  END LOOP;
END $$;