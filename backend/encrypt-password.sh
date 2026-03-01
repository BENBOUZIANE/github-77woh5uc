#!/bin/bash
# Usage: ./encrypt-password.sh [cle_jasypt] [mot_de_passe_db]
# Exemple: ./encrypt-password.sh cosmetoKey test1234

KEY="${1:-cosmetoKey}"
PASS="${2:-test1234}"

echo "Générer ENC(...) avec clé=$KEY et mot de passe=$PASS"
echo ""

./mvnw -q compile exec:java -Dexec.mainClass="com.cosmetovigilance.util.EncryptPasswordUtil" -Dexec.args="$KEY $PASS"

echo ""
echo "Au démarrage du backend, définir: export JASYPT_ENCRYPTOR_PASSWORD=$KEY"
