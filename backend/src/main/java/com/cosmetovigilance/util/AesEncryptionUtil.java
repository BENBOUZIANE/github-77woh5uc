package com.cosmetovigilance.util;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

/**
 * Utilitaire pour déchiffrer les données AES
 * Doit utiliser la même clé que le frontend
 */
public class AesEncryptionUtil {

    private static final String ALGORITHM = "AES";

    /**
     * Déchiffre les données AES chiffrées par le frontend
     * 
     * @param encryptedData les données chiffrées en base64
     * @param key la clé de déchiffrement (32 caractères pour AES-256)
     * @return les données déchiffrées en texte clair
     */
    public static String decrypt(String encryptedData, String key) throws Exception {
        byte[] decodedKey = key.getBytes();
        SecretKeySpec secretKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, ALGORITHM);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, secretKey);

        byte[] decodedEncryptedData = Base64.getDecoder().decode(encryptedData);
        byte[] decrypted = cipher.doFinal(decodedEncryptedData);

        return new String(decrypted);
    }

    /**
     * Chiffre les données en AES
     * 
     * @param data les données à chiffrer
     * @param key la clé de chiffrement
     * @return les données chiffrées en base64
     */
    public static String encrypt(String data, String key) throws Exception {
        byte[] decodedKey = key.getBytes();
        SecretKeySpec secretKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, ALGORITHM);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);

        byte[] encrypted = cipher.doFinal(data.getBytes());
        return Base64.getEncoder().encodeToString(encrypted);
    }

    /**
     * Test du chiffrement/déchiffrement (pour debug)
     */
    public static boolean testEncryption(String key) {
        try {
            String testData = "{\"email\":\"test@example.com\",\"password\":\"test123\"}";
            String encrypted = encrypt(testData, key);
            String decrypted = decrypt(encrypted, key);

            System.out.println("Backend encryption test:");
            System.out.println("Original: " + testData);
            System.out.println("Encrypted: " + encrypted.substring(0, Math.min(50, encrypted.length())) + "...");
            System.out.println("Decrypted: " + decrypted);

            return testData.equals(decrypted);
        } catch (Exception e) {
            System.err.println("Backend encryption test failed: " + e.getMessage());
            return false;
        }
    }
}
