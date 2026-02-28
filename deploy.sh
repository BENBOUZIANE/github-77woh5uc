#!/bin/bash

echo "=========================================="
echo "Déploiement de l'application Cosmetovigilance"
echo "=========================================="
echo ""

echo "Étape 1/4: Build du frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "Erreur lors du build du frontend!"
    exit 1
fi

echo ""
echo "Étape 2/4: Copie des fichiers frontend vers backend/static..."
mkdir -p backend/src/main/resources/static
cp -r dist/* backend/src/main/resources/static/

if [ $? -ne 0 ]; then
    echo "Erreur lors de la copie des fichiers!"
    exit 1
fi

echo ""
echo "Étape 3/4: Build du backend..."
cd backend
./mvnw clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "Erreur lors du build du backend!"
    exit 1
fi

echo ""
echo "=========================================="
echo "Build terminé avec succès!"
echo "=========================================="
echo ""
echo "Pour lancer l'application:"
echo "  cd backend"
echo "  java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod"
echo ""
echo "L'application sera accessible sur: http://localhost:8080"
echo "=========================================="
