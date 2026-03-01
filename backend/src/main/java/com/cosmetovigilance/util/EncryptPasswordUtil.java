package com.cosmetovigilance.util;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;

/**
 * Utilitaire pour générer un mot de passe chiffré à mettre dans application-*.properties.
 * Usage (depuis la racine backend) :
 *   mvn compile exec:java -Dexec.mainClass="com.cosmetovigilance.util.EncryptPasswordUtil" -Dexec.args="VOTRE_CLE_SECRETE VOTRE_MOT_DE_PASSE_DB"
 * Puis dans application-local.properties ou application-vm.properties :
 *   spring.datasource.password=ENC(la_sortie_ci-dessous)
 * Au démarrage : JASYPT_ENCRYPTOR_PASSWORD=VOTRE_CLE_SECRETE
 */
public final class EncryptPasswordUtil {

    public static void main(String[] args) {
        if (args == null || args.length < 2) {
            System.err.println("Usage: EncryptPasswordUtil <cle_jasypt> <mot_de_passe_db>");
            System.err.println("Exemple: EncryptPasswordUtil maCleSecrete test1234");
            System.exit(1);
        }
        String key = args[0];
        String password = args[1];
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        encryptor.setPassword(key);
        encryptor.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        String encrypted = encryptor.encrypt(password);
        System.out.println("spring.datasource.password=ENC(" + encrypted + ")");
        System.out.println("Au demarrage : JASYPT_ENCRYPTOR_PASSWORD=" + key);
    }
}
