#!/bin/bash
# ============================================
# Script de déploiement PRODUCTION (Cloud)
# ============================================

echo "🚀 Déploiement de l'application en PRODUCTION..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier les variables d'environnement requises
echo -e "${BLUE}🔍 Vérification des variables d'environnement...${NC}"
REQUIRED_VARS=("DB_URL" "DB_USERNAME" "DB_PASSWORD" "JWT_SECRET" "CORS_ORIGINS")
MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Variables d'environnement manquantes:${NC}"
    for VAR in "${MISSING_VARS[@]}"; do
        echo -e "   ${RED}- $VAR${NC}"
    done
    echo ""
    echo -e "${YELLOW}💡 Exportez ces variables avant de lancer le script:${NC}"
    echo -e "   ${BLUE}export DB_URL='jdbc:mysql://...'${NC}"
    echo -e "   ${BLUE}export DB_USERNAME='...'${NC}"
    echo -e "   ${BLUE}export DB_PASSWORD='...'${NC}"
    echo -e "   ${BLUE}export JWT_SECRET='...'${NC}"
    echo -e "   ${BLUE}export CORS_ORIGINS='https://yourdomain.com'${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Variables d'environnement configurées${NC}"

# Créer les répertoires nécessaires
echo -e "${BLUE}📁 Création des répertoires...${NC}"
sudo mkdir -p /var/log/cosmetovigilance
sudo mkdir -p /opt/cosmetovigilance/uploads
sudo chown -R $USER:$USER /var/log/cosmetovigilance
sudo chown -R $USER:$USER /opt/cosmetovigilance
echo -e "${GREEN}✅ Répertoires créés${NC}"

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

# Compiler le frontend avec la configuration production
echo -e "${BLUE}🔨 Compilation du frontend...${NC}"
cp .env.production .env
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la compilation du frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend compilé${NC}"

# Copier les fichiers vers le répertoire de production
echo -e "${BLUE}📦 Déploiement des fichiers...${NC}"
sudo cp backend/target/cosmetovigilance-backend-1.0.0.jar /opt/cosmetovigilance/
sudo cp -r dist /opt/cosmetovigilance/frontend
echo -e "${GREEN}✅ Fichiers déployés${NC}"

# Créer le service systemd pour le backend
echo -e "${BLUE}⚙️  Configuration du service backend...${NC}"
sudo tee /etc/systemd/system/cosmetovigilance-backend.service > /dev/null << EOF
[Unit]
Description=Cosmetovigilance Backend
After=syslog.target network.target mysql.service

[Service]
User=$USER
WorkingDirectory=/opt/cosmetovigilance
ExecStart=/usr/bin/java -jar /opt/cosmetovigilance/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=prod
SuccessExitStatus=143
Restart=always
RestartSec=10

# Variables d'environnement
Environment="DB_URL=${DB_URL}"
Environment="DB_USERNAME=${DB_USERNAME}"
Environment="DB_PASSWORD=${DB_PASSWORD}"
Environment="JWT_SECRET=${JWT_SECRET}"
Environment="CORS_ORIGINS=${CORS_ORIGINS}"
Environment="UPLOAD_DIR=/opt/cosmetovigilance/uploads"

[Install]
WantedBy=multi-user.target
EOF

# Recharger systemd et démarrer le service
echo -e "${BLUE}🔄 Démarrage du service backend...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable cosmetovigilance-backend
sudo systemctl restart cosmetovigilance-backend

# Attendre que le backend démarre
echo -e "${BLUE}⏳ Attente du démarrage du backend (30 secondes)...${NC}"
sleep 30

# Vérifier le statut du backend
if sudo systemctl is-active --quiet cosmetovigilance-backend; then
    echo -e "${GREEN}✅ Backend démarré avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors du démarrage du backend${NC}"
    echo -e "${YELLOW}📝 Vérifiez les logs: sudo journalctl -u cosmetovigilance-backend -f${NC}"
    exit 1
fi

# Configurer Nginx pour le frontend (optionnel)
if command -v nginx &> /dev/null; then
    echo -e "${BLUE}🌐 Configuration de Nginx...${NC}"

    DOMAIN=${CORS_ORIGINS#https://}
    DOMAIN=${DOMAIN#http://}

    sudo tee /etc/nginx/sites-available/cosmetovigilance > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend
    location / {
        root /opt/cosmetovigilance/frontend;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    sudo ln -sf /etc/nginx/sites-available/cosmetovigilance /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx configuré${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx non installé. Installation recommandée pour la production.${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Déploiement terminé avec succès!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}🌐 URLs de l'application:${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:8080/api${NC}"
if command -v nginx &> /dev/null; then
    echo -e "   Frontend: ${GREEN}http://$DOMAIN${NC}"
fi
echo ""
echo -e "${YELLOW}📝 Commandes utiles:${NC}"
echo -e "   Statut backend:  ${BLUE}sudo systemctl status cosmetovigilance-backend${NC}"
echo -e "   Logs backend:    ${BLUE}sudo journalctl -u cosmetovigilance-backend -f${NC}"
echo -e "   Redémarrer:      ${BLUE}sudo systemctl restart cosmetovigilance-backend${NC}"
echo -e "   Arrêter:         ${BLUE}sudo systemctl stop cosmetovigilance-backend${NC}"
echo ""
