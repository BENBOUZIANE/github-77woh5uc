#!/usr/bin/env node

/**
 * Script de test pour vérifier le chiffrement AES
 * Usage: node test-encryption.js
 */

const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = 'Qf1ZkB8yLp0DxT3vSnM6Hr4cWuPaY9gE';

function encryptData(data) {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

  try {
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
}

function decryptData(encryptedData) {
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

    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Erreur lors du déchiffrement:', error);
    throw new Error('Déchiffrement des données échouée');
  }
}

function testEncryption() {
  console.log('🔐 Testing AES encryption/decryption...');

  const testData = {
    email: 'test@example.com',
    password: 'test123',
    role: 'user'
  };

  try {
    console.log('Original data:', testData);

    const encrypted = encryptData(testData);
    console.log('Encrypted:', encrypted.substring(0, 50) + '...');

    const decrypted = decryptData(encrypted);
    console.log('Decrypted:', decrypted);

    const success = JSON.stringify(testData) === JSON.stringify(decrypted);

    if (success) {
      console.log('✅ Encryption test PASSED');
      return true;
    } else {
      console.log('❌ Encryption test FAILED - Data mismatch');
      return false;
    }
  } catch (error) {
    console.error('❌ Encryption test FAILED:', error.message);
    return false;
  }
}

// Test avec les données d'exemple du login
function testLoginData() {
  console.log('\n🔐 Testing login data encryption...');

  const loginData = {
    email: 'admin@example.com',
    password: 'password123'
  };

  try {
    const encrypted = encryptData(loginData);
    const payload = { e: encrypted };

    console.log('Login payload to send:', JSON.stringify(payload, null, 2));

    const decrypted = decryptData(encrypted);
    console.log('Decrypted login data:', decrypted);

    const success = JSON.stringify(loginData) === JSON.stringify(decrypted);
    console.log(success ? '✅ Login encryption PASSED' : '❌ Login encryption FAILED');

    return success;
  } catch (error) {
    console.error('❌ Login encryption test FAILED:', error.message);
    return false;
  }
}

// Exécuter les tests
if (require.main === module) {
  const test1 = testEncryption();
  const test2 = testLoginData();

  if (test1 && test2) {
    console.log('\n🎉 All encryption tests PASSED! Ready for production.');
    process.exit(0);
  } else {
    console.log('\n💥 Some encryption tests FAILED! Check configuration.');
    process.exit(1);
  }
}

module.exports = { encryptData, decryptData, testEncryption, testLoginData };