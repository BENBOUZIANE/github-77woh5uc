#!/bin/bash
# ============================================
# Script de démarrage VM LOCAL (Réseau)
# ============================================

echo "🚀 Démarrage de l'application en mode VM (Réseau Local)..."

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Obtenir l'adresse IP de la VM
VM_IP=$(hostname -I | awk '{print $1}')
echo -e "${BLUE}📍 Adresse IP détectée: ${GREEN}$VM_IP${NC}"

# Vérifier que MySQL est en cours d'exécution
echo -e "${BLUE}📊 Vérification de MySQL...${NC}"
if ! pgrep -x "mysqld" > /dev/null; then
    echo -e "${RED}❌ MySQL n'est pas démarré. Veuillez démarrer MySQL d'abord.${NC}"
    echo -e "${YELLOW}💡 Commande: sudo systemctl start mysql${NC}"
    exit 1
fi
echo -e "${GREEN}✅ MySQL est démarré${NC}"

# Créer le fichier .env avec l'IP de la VM
echo -e "${BLUE}📝 Configuration de l'environnement frontend...${NC}"
cat > .env << EOF
# Configuration VM - Généré automatiquement
VITE_API_URL=http://$VM_IP:8080/api
VITE_APP_URL=http://$VM_IP:5173
EOF
echo -e "${GREEN}✅ Fichier .env configuré avec IP: $VM_IP${NC}"

# Mettre à jour le fichier application-vm.properties avec l'IP
echo -e "${BLUE}📝 Configuration du backend...${NC}"
sed -i "s/<VM_IP>/$VM_IP/g" backend/src/main/resources/application-vm.properties
echo -e "${GREEN}✅ Configuration backend mise à jour${NC}"

# Compiler le backend
echo -e "${BLUE}🔨 Compilation du backend...${NC}"
cd backend
./mvnw clean package -DskipTests
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la compilation du backend${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ Backend compilé${NC}"

# Compiler le frontend
echo -e "${BLUE}🔨 Compilation du frontend...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la compilation du frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend compilé${NC}"

# Démarrer le backend
echo -e "${BLUE}🔧 Démarrage du backend...${NC}"
nohup java -jar backend/target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=vm > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
echo -e "${GREEN}✅ Backend démarré (PID: $BACKEND_PID)${NC}"

# Attendre que le backend démarre
echo -e "${BLUE}⏳ Attente du démarrage du backend (30 secondes)...${NC}"
sleep 30

# Démarrer le frontend avec le serveur de production
echo -e "${BLUE}🎨 Démarrage du frontend...${NC}"
nohup npm run preview -- --host 0.0.0.0 --port 5173 > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid
echo -e "${GREEN}✅ Frontend démarré (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Application démarrée avec succès!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}🌐 Accès depuis cette VM:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:8080/api${NC}"
echo ""
echo -e "${BLUE}🌍 Accès depuis d'autres PC du réseau:${NC}"
echo -e "   Frontend: ${GREEN}http://$VM_IP:5173${NC}"
echo -e "   Backend:  ${GREEN}http://$VM_IP:8080/api${NC}"
echo -e "   Swagger:  ${GREEN}http://$VM_IP:8080/api/swagger-ui.html${NC}"
echo ""
echo -e "${YELLOW}📋 Pour arrêter l'application:${NC}"
echo -e "   ${BLUE}./stop-vm.sh${NC}"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "   Backend:  ${BLUE}tail -f backend.log${NC}"
echo -e "   Frontend: ${BLUE}tail -f frontend.log${NC}"
echo ""
