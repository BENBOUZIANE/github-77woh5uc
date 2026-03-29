/**
 * Valide un numéro de téléphone marocain.
 * Formats acceptés :
 *   - 0XXXXXXXXX  (10 chiffres, commence par 05, 06 ou 07)
 *   - +212XXXXXXXXX ou 00212XXXXXXXXX
 */
export function validateTelMaroc(tel: string): string | null {
  const cleaned = tel.replace(/[\s\-\.]/g, '');
  const regex = /^(?:\+212|00212|0)(5|6|7)\d{8}$/;
  if (!cleaned) return 'Le téléphone est obligatoire';
  if (!regex.test(cleaned)) return 'Numéro invalide (ex: 0612345678 ou +212612345678)';
  return null;
}
