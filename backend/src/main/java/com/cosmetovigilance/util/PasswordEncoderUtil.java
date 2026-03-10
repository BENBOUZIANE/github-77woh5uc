package com.cosmetovigilance.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utilitaire pour générer des hash BCrypt de mots de passe
 * À utiliser temporairement pour créer des utilisateurs de test
 */
public class PasswordEncoderUtil {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Générer les hashes pour des mots de passe courants
        String password1 = "test123";
        String password2 = "admin123";
        String password3 = "password123";

        System.out.println("Hash pour '" + password1 + "': " + encoder.encode(password1));
        System.out.println("Hash pour '" + password2 + "': " + encoder.encode(password2));
        System.out.println("Hash pour '" + password3 + "': " + encoder.encode(password3));

        // Test de vérification
        String hash = encoder.encode(password1);
        System.out.println("\nTest de vérification:");
        System.out.println("Password correct: " + encoder.matches(password1, hash));
        System.out.println("Password incorrect: " + encoder.matches("wrongpassword", hash));
    }
}