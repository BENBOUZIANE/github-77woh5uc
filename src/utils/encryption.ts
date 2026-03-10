import CryptoJS from 'crypto-js';

// La clé AES - DOIT être la même côté backend
// Elle peut être fournie via VITE_ENCRYPTION_KEY dans le fichier .env
// (mode dev) ou en paramètre d'environnement lors de la build.
const ENCRYPTION_KEY =
  import.meta.env.VITE_ENCRYPTION_KEY ||
  'Qf1ZkB8yLp0DxT3vSnM6Hr4cWuPaY9gE'; // 32 caractères pour AES-256 (même clé que le backend)

/**
 * Chiffre un objet/string avec AES (mode ECB, PKCS7 padding pour compatibilité Java)
 */
export const encryptData = (data: unknown): string => {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

  try {
    // Le deuxième argument doit être un WordArray (clé brute), pas la passphrase.
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
    return encrypted;
  } catch (error) {
    console.error('Erreur lors du chiffrement:', error);
    throw new Error('Chiffrement des données échouée');
  }
};

/**
 * Déchiffre les données AES
 */
export const decryptData = (encryptedData: string): unknown => {
  try {
    console.log('🔓 Début déchiffrement avec clé (32 chars):', ENCRYPTION_KEY.length === 32);
    
    // Utiliser la clé brute aussi pour le déchiffrement
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });

    // Vérifier que le déchiffrement a réussi
    if (decryptedBytes.sigBytes <= 0) {
      console.error('❌ Déchiffrement échoué: sigBytes =', decryptedBytes.sigBytes);
      throw new Error('Déchiffrement échoué: données vides ou clé incorrecte');
    }

    const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);
    console.log('🔓 Déchiffrement réussi, sigBytes =', decryptedBytes.sigBytes, ', résultat (100 chars):', decrypted.substring(0, 100));

    // Vérifier que le résultat n'est pas vide
    if (!decrypted || decrypted.trim().length === 0) {
      console.error('❌ Déchiffrement échoué: résultat vide');
      throw new Error('Déchiffrement échoué: résultat vide');
    }

    const parsed = JSON.parse(decrypted);
    console.log('✅ JSON parsé avec succès');
    return parsed;
  } catch (error) {
    console.error('❌ Erreur lors du déchiffrement:', error);
    throw error;
  }
};

/**
 * Crée un payload chiffré pour envoyer au backend
 */
export const createEncryptedPayload = (data: unknown): { e: string } => {
  const encrypted = encryptData(data);
  return { e: encrypted };
};

/**
 * Test du chiffrement/déchiffrement (pour debug)
 */
export const testEncryption = (): boolean => {
  try {
    const testData = { email: 'test@example.com', password: 'test123' };
    console.log('🔍 Test data:', testData);

    const encrypted = encryptData(testData);
    console.log('🔍 Encrypted result:', encrypted.substring(0, 50) + '...');

    const decrypted = decryptData(encrypted);
    console.log('🔍 Decrypted result:', decrypted);

    const success = JSON.stringify(testData) === JSON.stringify(decrypted);
    console.log('🔍 Test result:', success ? 'SUCCESS' : 'FAILED');

    return success;
  } catch (error) {
    console.error('❌ Test encryption failed:', error);
    return false;
  }
};

/**
 * Test du chiffrement des réponses (simule une réponse API)
 */
export const testResponseEncryption = (): boolean => {
  try {
    const responseData = {
      data: {
        accessToken: 'eyJhbGciOiJIUzI1NiJ9.fake.jwt',
        user: { id: '123', email: 'test@example.com' }
      },
      message: 'Login successful'
    };
    console.log('🔍 Test response data:', responseData);

    const encrypted = encryptData(responseData);
    console.log('🔍 Encrypted response:', encrypted.substring(0, 50) + '...');

    const decrypted = decryptData(encrypted);
    console.log('🔍 Decrypted response:', decrypted);

    const success = JSON.stringify(responseData) === JSON.stringify(decrypted);
    console.log('🔍 Response encryption test:', success ? 'SUCCESS' : 'FAILED');

    return success;
  } catch (error) {
    console.error('❌ Response encryption test failed:', error);
    return false;
  }
};

