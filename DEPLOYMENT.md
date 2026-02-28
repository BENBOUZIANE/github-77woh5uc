# Guide de Déploiement en Production

## Changements Importants

### Architecture Modifiée

L'application a été restructurée pour servir le frontend et le backend depuis le même serveur Spring Boot sur le port 8080.

**Avant:**
- Frontend: Port 5173 (dev) ou port séparé
- Backend: Port 8080 avec context-path `/api`

**Après:**
- Application complète: Port 8080
- Frontend: `http://localhost:8080/`
- API Backend: `http://localhost:8080/api/`

### Routes

**Routes Frontend (React Router):**
- `/` - Page d'accueil
- `/login` - Page de connexion
- `/dashboard` - Tableau de bord ANMPS
- `/cosmetovigilance` - Formulaire de déclaration
- `/declarations` - Mes déclarations
- `/declarations/:id` - Détail d'une déclaration

**Routes API Backend:**
- `/api/auth/**` - Authentification
- `/api/declarations/**` - Gestion des déclarations
- `/api/attachments/**` - Upload de fichiers

### Fichiers Modifiés

1. **backend/src/main/resources/application-prod.properties**
   - Suppression de `server.servlet.context-path=/api`
   - Le serveur écoute maintenant à la racine

2. **backend/src/main/java/com/cosmetovigilance/config/WebConfig.java**
   - Configuration pour servir les fichiers statiques depuis `classpath:/static/`
   - Gestion des assets avec cache

3. **backend/src/main/java/com/cosmetovigilance/controller/SpaController.java**
   - Nouveau contrôleur pour rediriger les routes React vers `index.html`
   - Permet le routing côté client (React Router)

4. **Tous les contrôleurs API**
   - `AuthController`: `/auth` → `/api/auth`
   - `DeclarationController`: `/declarations` → `/api/declarations`
   - `AttachmentController`: `/attachments` → `/api/attachments`

## Déploiement Pas à Pas

### Option 1: Script Automatisé (Recommandé)

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
cd backend
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

**Windows:**
```cmd
deploy.bat
cd backend
java -jar target\cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Option 2: Manuel

**Étape 1 - Build du frontend:**
```bash
npm install
npm run build
```

**Étape 2 - Copier vers backend:**
```bash
mkdir -p backend/src/main/resources/static
cp -r dist/* backend/src/main/resources/static/
```

**Étape 3 - Build du backend:**
```bash
cd backend
./mvnw clean package -DskipTests
```

**Étape 4 - Lancer l'application:**
```bash
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## Vérification du Déploiement

1. **Vérifier que le frontend est accessible:**
   - Ouvrir `http://localhost:8080/`
   - Vous devriez voir la page d'accueil de Cosmetovigilance

2. **Vérifier les routes React:**
   - Naviguer vers `http://localhost:8080/login`
   - Naviguer vers `http://localhost:8080/cosmetovigilance`
   - Les routes doivent fonctionner sans erreur 404

3. **Vérifier l'API:**
   - L'API est accessible sur `http://localhost:8080/api/`
   - Test: `curl http://localhost:8080/api/auth/test`

4. **Vérifier les assets:**
   - Ouvrir les DevTools du navigateur
   - Vérifier que les fichiers CSS et JS se chargent depuis `/assets/`

## Résolution des Problèmes

### Erreur 404 sur la page d'accueil
- Vérifier que les fichiers sont bien dans `backend/src/main/resources/static/`
- Vérifier que `index.html` existe dans ce dossier
- Rebuilder le backend: `mvnw clean package`

### Erreur 404 sur les routes React
- Vérifier que `SpaController.java` est bien présent
- Vérifier que toutes les routes React sont listées dans `@RequestMapping`

### API non accessible
- Vérifier que tous les contrôleurs utilisent le préfixe `/api/`
- Vérifier la configuration CORS dans `application-prod.properties`

### Assets ne se chargent pas
- Vérifier que le dossier `assets/` existe dans `backend/src/main/resources/static/`
- Vérifier les chemins dans `index.html`

## Configuration CORS

Par défaut, CORS est configuré pour accepter les requêtes de:
- Développement local: `http://localhost:5173`
- Production: Configuré via la variable d'environnement `CORS_ORIGINS`

Pour modifier en production:
```bash
export CORS_ORIGINS=https://votre-domaine.com
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## Base de Données

Assurez-vous que la base de données MySQL est configurée avec les bonnes variables:
```bash
export DB_URL=jdbc:mysql://localhost:3306/cosmetovigilance
export DB_USERNAME=root
export DB_PASSWORD=votre_mot_de_passe
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## Sécurité JWT

Pour la production, utilisez un secret JWT sécurisé:
```bash
export JWT_SECRET=votre_secret_securise_de_256_bits_minimum
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```
