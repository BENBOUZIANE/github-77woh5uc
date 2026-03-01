package com.cosmetovigilance.config;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;

/**
 * Déchiffrement Jasypt avec le même algorithme que EncryptPasswordUtil.
 */
final class JasyptDecryptor {

    private static final String ALGORITHM = "PBEWITHHMACSHA512ANDAES_256";

    static String decrypt(String password, String encrypted) {
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        encryptor.setPassword(password);
        encryptor.setAlgorithm(ALGORITHM);
        return encryptor.decrypt(encrypted);
    }

    private JasyptDecryptor() {}
}
