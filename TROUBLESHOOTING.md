# Guide de Dépannage - Déploiement Production

## Problème 1: Erreur 404 sur http://localhost:8080/

### Symptômes
```
GET http://localhost:8080/
Status: 404 Not Found
```

### Diagnostic
```bash
# Vérifier si les fichiers frontend sont présents
ls -la backend/src/main/resources/static/

# Devrait afficher:
# index.html
# assets/
# *.png
```

### Solutions

#### Solution A: Fichiers manquants
```bash
# 1. Rebuilder le frontend
npm run build

# 2. Copier vers backend
mkdir -p backend/src/main/resources/static
cp -r dist/* backend/src/main/resources/static/

# 3. Vérifier la copie
ls -la backend/src/main/resources/static/
# index.html doit être présent!

# 4. Rebuilder le backend
cd backend
./mvnw clean package

# 5. Relancer
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

#### Solution B: context-path toujours présent
```bash
# Vérifier le fichier de configuration
cat backend/src/main/resources/application-prod.properties | grep context-path

# Si vous voyez:
# server.servlet.context-path=/api

# SUPPRIMER cette ligne et rebuilder!
```

## Problème 2: Erreur 404 sur /login ou /dashboard

### Symptômes
```
GET http://localhost:8080/login
Status: 404 Not Found
```

### Diagnostic
```bash
# Vérifier que SpaController existe
ls backend/src/main/java/com/cosmetovigilance/controller/SpaController.java

# Devrait exister!
```

### Solution
```bash
# Si le fichier manque, le créer:
cat > backend/src/main/java/com/cosmetovigilance/controller/SpaController.java << 'EOF'
package com.cosmetovigilance.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {
    @RequestMapping(value = {
        "/",
        "/login",
        "/dashboard",
        "/cosmetovigilance",
        "/declarations",
        "/declarations/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
EOF

# Rebuilder
cd backend
./mvnw clean package
```

## Problème 3: API retourne 404 (ex: /api/declarations)

### Symptômes
```
GET http://localhost:8080/api/declarations
Status: 404 Not Found
```

### Diagnostic
```bash
# Vérifier les routes des contrôleurs
grep -r "@RequestMapping" backend/src/main/java/com/cosmetovigilance/controller/

# Devrait afficher:
# AuthController.java:@RequestMapping("/api/auth")
# DeclarationController.java:@RequestMapping("/api/declarations")
# AttachmentController.java:@RequestMapping("/api/attachments")
```

### Solution
Si les contrôleurs n'ont PAS le préfixe `/api/`, les modifier:

```java
// AVANT (incorrect)
@RequestMapping("/declarations")

// APRÈS (correct)
@RequestMapping("/api/declarations")
```

Puis rebuilder le backend.

## Problème 4: Assets ne se chargent pas (CSS/JS)

### Symptômes
- La page s'affiche mais sans style
- Console navigateur: `Failed to load resource: /assets/index-*.css`

### Diagnostic
```bash
# Vérifier que le dossier assets existe
ls -la backend/src/main/resources/static/assets/

# Devrait afficher des fichiers .js et .css
```

### Solution
```bash
# Si le dossier manque, recopier le frontend
npm run build
cp -r dist/* backend/src/main/resources/static/

# Vérifier index.html pointe vers les bons assets
cat backend/src/main/resources/static/index.html | grep assets
# Devrait afficher des lignes avec /assets/

# Rebuilder
cd backend
./mvnw clean package
```

## Problème 5: CORS Errors

### Symptômes
```
Access to fetch at 'http://localhost:8080/api/declarations' from origin 'http://localhost:8080'
has been blocked by CORS policy
```

### Diagnostic
```bash
# Vérifier la configuration CORS
cat backend/src/main/resources/application-prod.properties | grep cors

# Devrait afficher:
# cors.allowed-origins=...
# cors.allowed-methods=...
```

### Solution
```properties
# Dans application-prod.properties
cors.allowed-origins=http://localhost:8080,http://localhost:5173
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
cors.allowed-headers=*
cors.max-age=3600
```

Puis rebuilder le backend.

## Problème 6: Erreur de connexion à la base de données

### Symptômes
```
Error: Unable to connect to database
Communications link failure
```

### Diagnostic
```bash
# Vérifier que MySQL est en cours d'exécution
# Linux:
sudo systemctl status mysql

# Windows:
# Vérifier dans Services

# Tester la connexion
mysql -u root -p -e "SHOW DATABASES;"
```

### Solution
```bash
# Démarrer MySQL si nécessaire
# Linux:
sudo systemctl start mysql

# Windows:
# Démarrer le service MySQL dans Services

# Vérifier que la base existe
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cosmetovigilance;"

# Configurer les variables d'environnement
export DB_URL=jdbc:mysql://localhost:3306/cosmetovigilance
export DB_USERNAME=root
export DB_PASSWORD=votre_mot_de_passe

# Relancer l'application
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## Problème 7: JWT Token Invalid

### Symptômes
```
401 Unauthorized
Token validation failed
```

### Solution
```bash
# Vérifier que JWT_SECRET est configuré
# En production, utiliser un secret sécurisé:
export JWT_SECRET=votre_secret_securise_minimum_256_bits

# Relancer l'application
```

## Problème 8: Port 8080 déjà utilisé

### Symptômes
```
Error: Port 8080 is already in use
```

### Diagnostic
```bash
# Trouver quel processus utilise le port
# Linux:
sudo lsof -i :8080

# Windows:
netstat -ano | findstr :8080
```

### Solution
```bash
# Option 1: Tuer le processus
# Linux:
sudo kill -9 <PID>

# Windows:
taskkill /PID <PID> /F

# Option 2: Changer le port
export SERVER_PORT=8081
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
# Accès: http://localhost:8081
```

## Problème 9: Build Maven échoue

### Symptômes
```
[ERROR] Failed to execute goal
[ERROR] BUILD FAILURE
```

### Solution
```bash
# Nettoyer et rebuilder
cd backend
./mvnw clean
rm -rf target/
./mvnw clean package -DskipTests

# Si erreur de dépendances:
./mvnw clean install -U
```

## Problème 10: Refresh de page retourne 404

### Symptômes
- Navigation fonctionne
- Mais F5 sur /dashboard retourne 404

### Diagnostic
Le SpaController ne gère pas toutes les routes React.

### Solution
```java
// Dans SpaController.java, ajouter toutes les routes React
@RequestMapping(value = {
    "/",
    "/login",
    "/dashboard",
    "/cosmetovigilance",
    "/declarations",
    "/declarations/**"  // Important: /** pour les sous-routes
})
```

## Commandes de Diagnostic Rapide

### Vérifier l'application
```bash
# Backend démarré?
curl http://localhost:8080/

# API fonctionne?
curl http://localhost:8080/api/auth/test

# Assets chargés?
curl -I http://localhost:8080/assets/index-*.css
```

### Vérifier les logs
```bash
# Logs temps réel
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# Chercher des erreurs
# Dans les logs, chercher:
# - "ERROR"
# - "Exception"
# - "Failed to"
# - "Cannot connect"
```

### Vérifier la structure des fichiers
```bash
# Structure attendue:
tree backend/src/main/resources/static/

# Devrait afficher:
# static/
# ├── index.html
# ├── assets/
# │   ├── index-*.js
# │   └── index-*.css
# └── *.png
```

## Workflow de Débogage

```
1. Vérifier les logs backend
   └─ Erreur?
      ├─ Yes → Résoudre l'erreur spécifique
      └─ No → Continuer

2. Tester les URLs
   └─ 404?
      ├─ Frontend → Problème 1 ou 2
      ├─ API → Problème 3
      └─ Assets → Problème 4

3. Tester dans le navigateur
   └─ Console errors?
      ├─ CORS → Problème 5
      ├─ 401 → Problème 7
      └─ Network failed → Problème 6

4. Vérifier les fichiers
   └─ Fichiers manquants?
      └─ Yes → Recommencer le build

5. Rebuilder complètement
   └─ ./deploy.sh
```

## Contact & Support

Si les problèmes persistent:

1. Vérifier [DEPLOYMENT.md](DEPLOYMENT.md) - Guide complet
2. Consulter [ARCHITECTURE-PROD.md](ARCHITECTURE-PROD.md) - Architecture
3. Lire [.deployment-checklist](.deployment-checklist) - Checklist
4. Vérifier les logs Spring Boot en détail
