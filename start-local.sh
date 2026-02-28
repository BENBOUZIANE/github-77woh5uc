#!/bin/bash
# ============================================
# Script de démarrage DÉVELOPPEMENT LOCAL
# ============================================

echo "🚀 Démarrage de l'application en mode LOCAL..."

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que MySQL est en cours d'exécution
echo -e "${BLUE}📊 Vérification de MySQL...${NC}"
if ! pgrep -x "mysqld" > /dev/null; then
    echo -e "${RED}❌ MySQL n'est pas démarré. Veuillez démarrer MySQL d'abord.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ MySQL est démarré${NC}"

# Copier le fichier d'environnement pour le frontend
echo -e "${BLUE}📝 Configuration de l'environnement frontend...${NC}"
cp .env.local .env
echo -e "${GREEN}✅ Fichier .env configuré${NC}"

# Démarrer le backend
echo -e "${BLUE}🔧 Démarrage du backend sur le port 8080...${NC}"
cd backend
# Compiler et démarrer le backend avec le profil local
./mvnw spring-boot:run -Dspring-boot.run.profiles=local &
BACKEND_PID=$!
cd ..

# Attendre que le backend démarre
echo -e "${BLUE}⏳ Attente du démarrage du backend...${NC}"
sleep 10

# Démarrer le frontend
echo -e "${BLUE}🎨 Démarrage du frontend sur le port 5173...${NC}"
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Application démarrée avec succès!${NC}"
echo -e "${GREEN}🌐 Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}🔧 Backend: http://localhost:8080/api${NC}"
echo -e "${GREEN}📚 Swagger UI: http://localhost:8080/api/swagger-ui.html${NC}"
echo ""
echo -e "${BLUE}Pour arrêter l'application, appuyez sur Ctrl+C${NC}"

# Attendre les processus
wait $BACKEND_PID $FRONTEND_PID
