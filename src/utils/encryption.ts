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
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
    return encrypted;
  } catch (error) {
    throw new Error('Chiffrement des données échouée');
  }
};

/**
 * Déchiffre les données AES
 */
export const decryptData = (encryptedData: string): unknown => {
  try {
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });

    if (decryptedBytes.sigBytes <= 0) {
      throw new Error('Déchiffrement échoué: données vides ou clé incorrecte');
    }

    const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted || decrypted.trim().length === 0) {
      throw new Error('Déchiffrement échoué: résultat vide');
    }

    const parsed = JSON.parse(decrypted);
    return parsed;
  } catch (error) {
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
    const encrypted = encryptData(testData);
    const decrypted = decryptData(encrypted);
    const success = JSON.stringify(testData) === JSON.stringify(decrypted);
    return success;
  } catch (error) {
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
    const encrypted = encryptData(responseData);
    const decrypted = decryptData(encrypted);
    const success = JSON.stringify(responseData) === JSON.stringify(decrypted);
    return success;
  } catch (error) {
    return false;
  }
};

