# Application Cosmetovigilance

Application web pour la gestion des déclarations de cosmétovigilance.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Spring Boot (Java)
- **Base de données**: MySQL
- **Déploiement**: Application unifiée (Frontend + Backend sur port 8080)

### Architecture de Production

```
http://localhost:8080/
├── /                    → Frontend (React)
├── /login              → Frontend (React Router)
├── /dashboard          → Frontend (React Router)
├── /cosmetovigilance   → Frontend (React Router)
├── /declarations       → Frontend (React Router)
├── /assets/*           → CSS, JS, Images
└── /api/*              → Backend REST API
    ├── /api/auth
    ├── /api/declarations
    └── /api/attachments
```

## Prérequis

### Outils nécessaires (Windows et Linux)

1. **Node.js** (version 18 ou supérieure)
   - Windows: https://nodejs.org/
   - Linux: `sudo apt install nodejs npm` ou `sudo dnf install nodejs npm`

2. **Java JDK** (version 17 ou supérieure)
   - Windows: https://www.oracle.com/java/technologies/downloads/
   - Linux: `sudo apt install openjdk-17-jdk` ou `sudo dnf install java-17-openjdk`

3. **MySQL** (version 8.0 ou supérieure)
   - Windows: https://dev.mysql.com/downloads/installer/
   - Linux: `sudo apt install mysql-server` ou `sudo dnf install mysql-server`

4. **Maven** (version 3.8 ou supérieure)
   - Windows: https://maven.apache.org/download.cgi (ajouter au PATH)
   - Linux: `sudo apt install maven` ou `sudo dnf install maven`

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-projet>
cd project
```

### 2. Configuration de la base de données MySQL

#### Windows
```cmd
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE cosmetovigilance;
```

#### Linux
```bash
# Démarrer MySQL
sudo systemctl start mysql

# Se connecter
mysql -u root -p

# Créer la base de données
CREATE DATABASE cosmetovigilance;
```

### 3. Configuration Backend

Les fichiers de configuration sont dans `backend/src/main/resources/`:

**application-local.properties** (Développement local):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cosmetovigilance
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
server.port=8080
```

**application-prod.properties** (Production):
```properties
spring.datasource.url=jdbc:mysql://votre-serveur:3306/cosmetovigilance
spring.datasource.username=user_prod
spring.datasource.password=${DB_PASSWORD}
server.port=8080
```

### 4. Configuration Frontend

Le fichier de configuration est `.env`:

**Pour développement local:**
```env
VITE_API_URL=http://localhost:8080/api
```

**Pour production:**
```env
VITE_API_URL=https://votre-domaine.com/api
```

### 5. Installation des dépendances

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
mvn clean install
```

## Démarrage de l'application

### Déploiement en Production

**IMPORTANT:** L'application a été restructurée pour servir le frontend et le backend depuis le même serveur (port 8080).

Pour un guide complet de déploiement, consultez [DEPLOYMENT.md](DEPLOYMENT.md)

**Déploiement rapide:**

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

L'application complète sera accessible sur **http://localhost:8080**

### Développement Local

### Windows

#### Développement local

**Terminal 1 - Backend:**
```cmd
cd backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

**Terminal 2 - Frontend:**
```cmd
npm run dev
```

#### Production (avec frontend intégré dans le backend)

**Étape 1 - Build du frontend:**
```cmd
npm run build
```

**Étape 2 - Copier les fichiers build dans le backend:**
```cmd
REM Créer le dossier static s'il n'existe pas
mkdir backend\src\main\resources\static

REM Copier le contenu de dist vers static
xcopy /E /I /Y dist\* backend\src\main\resources\static\
```

**Étape 3 - Build et lancement du backend:**
```cmd
cd backend
mvnw.cmd clean package
java -jar target\cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

**L'application complète sera accessible sur:** http://localhost:8080

### Linux

#### Développement local

**Terminal 1 - Backend:**
```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### Production (avec frontend intégré dans le backend)

**Étape 1 - Build du frontend:**
```bash
npm run build
```

**Étape 2 - Copier les fichiers build dans le backend:**
```bash
# Créer le dossier static s'il n'existe pas
mkdir -p backend/src/main/resources/static

# Copier le contenu de dist vers static
cp -r dist/* backend/src/main/resources/static/
```

**Étape 3 - Build et lancement du backend:**
```bash
cd backend
./mvnw clean package
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

**L'application complète sera accessible sur:** http://localhost:8080

## Accès à l'application

### Mode Développement
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **Documentation API**: http://localhost:8080/api-docs

### Mode Production
- **Application complète**: http://localhost:8080 (frontend + backend)
- **API**: http://localhost:8080/api
- **Documentation API**: Désactivée en production

## Utilisateur de test

- **Email**: sana.amkar@ammps.gov.ma
- **Mot de passe**: test123

## Structure du projet

```
project/
├── backend/                    # Application Spring Boot
│   ├── src/main/
│   │   ├── java/              # Code source Java
│   │   │   └── com/cosmetovigilance/
│   │   │       ├── config/    # Configuration
│   │   │       ├── controller/# REST Controllers
│   │   │       ├── dto/       # Data Transfer Objects
│   │   │       ├── model/     # Entités JPA
│   │   │       ├── repository/# Repositories
│   │   │       ├── security/  # JWT & Security
│   │   │       └── service/   # Services métier
│   │   └── resources/
│   │       ├── application.properties         # Config principale
│   │       ├── application-local.properties   # Config locale
│   │       ├── application-prod.properties    # Config production
│   │       └── db/migration/                  # Scripts SQL
│   └── pom.xml                # Dépendances Maven
│
├── src/                       # Application React
│   ├── components/            # Composants React
│   ├── pages/                 # Pages
│   ├── services/              # Services API
│   ├── contexts/              # Contextes React
│   └── data/                  # Données statiques
│
├── public/                    # Fichiers statiques
├── .env                       # Configuration frontend
└── package.json              # Dépendances npm
```

## Scripts npm disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualisation du build
- `npm run lint` - Vérification du code
- `npm run serve` - Servir l'application compilée

## Scripts Maven disponibles

- `mvn clean install` - Compiler et installer
- `mvn spring-boot:run` - Démarrer l'application
- `mvn test` - Exécuter les tests
- `mvn clean package` - Créer le JAR exécutable

## Environnements supportés

1. **local**: Développement local (localhost)
2. **prod**: Production

Pour changer d'environnement:
```bash
java -jar app.jar --spring.profiles.active=prod
```

## Dépannage

### Problèmes courants

**MySQL ne démarre pas (Linux):**
```bash
sudo systemctl status mysql
sudo systemctl start mysql
```

**Port 8080 déjà utilisé:**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux
sudo lsof -i :8080
sudo kill -9 <PID>
```

**Erreur de connexion à la base:**
- Vérifier que MySQL est démarré
- Vérifier les credentials dans application-local.properties
- Vérifier que la base cosmetovigilance existe

**Frontend ne se connecte pas au backend:**
- Vérifier que le backend est démarré sur le port 8080
- Vérifier l'URL dans le fichier .env
- Vérifier la configuration CORS dans le backend

## Support

Pour toute question, contactez l'équipe de développement.
