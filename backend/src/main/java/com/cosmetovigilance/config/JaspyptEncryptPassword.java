package com.cosmetovigilance.config;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;

public class JaspyptEncryptPassword {
    public static void main(String[] args) {
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        encryptor.setPassword("A7f#9kL2mNpQrT5vWxYzB8cD4eFgH1iJkM3nO6pQ"); // Votre clé
        String encrypted = encryptor.encrypt("test123"); // Votre mot de passe en clair
        System.out.println("ENC(" + encrypted + ")");
    }
}