#!/bin/bash
# ============================================
# Script d'arrêt VM LOCAL
# ============================================

echo "🛑 Arrêt de l'application..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Arrêter le backend
if [ -f backend.pid ]; then
    BACKEND_PID=$(cat backend.pid)
    echo -e "${BLUE}🔧 Arrêt du backend (PID: $BACKEND_PID)...${NC}"
    kill $BACKEND_PID 2>/dev/null
    rm backend.pid
    echo -e "${GREEN}✅ Backend arrêté${NC}"
else
    echo -e "${RED}⚠️  Fichier backend.pid non trouvé${NC}"
fi

# Arrêter le frontend
if [ -f frontend.pid ]; then
    FRONTEND_PID=$(cat frontend.pid)
    echo -e "${BLUE}🎨 Arrêt du frontend (PID: $FRONTEND_PID)...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    rm frontend.pid
    echo -e "${GREEN}✅ Frontend arrêté${NC}"
else
    echo -e "${RED}⚠️  Fichier frontend.pid non trouvé${NC}"
fi

echo -e "${GREEN}✅ Application arrêtée${NC}"
