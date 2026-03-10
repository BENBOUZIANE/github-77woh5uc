# Guide de Déploiement LOCAL (Développement)

Ce guide explique comment lancer l'application en local sur votre PC pour le développement.

## Prérequis

- Node.js 18+
- Java 17+
- Maven 3.8+
- MySQL 8.0+

## 1. Configuration de MySQL

### Démarrer MySQL

**Windows :**
```cmd
net start MySQL80
```

**Linux/Mac :**
```bash
sudo systemctl start mysql
```

### Créer la base de données

```sql
mysql -u root -p

CREATE DATABASE IF NOT EXISTS cosmetovigilance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

## 2. Configuration du Backend

### Variable d'environnement OBLIGATOIRE

Le mot de passe DB est chiffré. Vous DEVEZ définir :

**Windows (CMD) :**
```cmd
set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
```

**Windows (PowerShell) :**
```powershell
$env:JASYPT_ENCRYPTOR_PASSWORD="cosmetoKey"
```

**Linux/Mac :**
```bash
export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
```

### Vérifier la configuration

Fichier : `backend/src/main/resources/application-local.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cosmetovigilance?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=ENC(JCwGHLjP0Y8yN2kVxRQzMw==)
```

Si votre mot de passe MySQL n'est pas `test1234`, générez un nouveau mot de passe chiffré :

```cmd
cd backend
encrypt-password.cmd cosmetoKey VotreMotDePasseMySQL
```

Copiez le résultat `ENC(...)` dans `application-local.properties`.

### Démarrer le Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**Windows :**
```cmd
cd backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

Le backend démarre sur : `http://localhost:8080/api`

## 3. Configuration du Frontend

### Créer le fichier .env.local

```bash
VITE_API_URL=http://localhost:8080/api
```

### Installer les dépendances

```bash
npm install
```

### Démarrer le Frontend

```bash
npm run dev
```

Le frontend s'ouvre sur : `http://localhost:5173`

## 4. Vérification

### Backend
- API : http://localhost:8080/api/auth/login
- Swagger UI : http://localhost:8080/api/swagger-ui.html

### Frontend
- Application : http://localhost:5173

## 5. Comptes de Test

Après le premier démarrage, créez un compte via l'interface ou utilisez :

**Créer un utilisateur ANMPS :**
```sql
INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role, numero_telephone)
VALUES ('Admin', 'ANMPS', 'admin@anmps.ma',
        '$2a$10$YourBcryptHashHere', 'ANMPS', '0600000000');
```

## Résolution des Problèmes

### Erreur : "Impossible de déchiffrer le mot de passe"

**Solution :**
```bash
# Vérifier la variable
echo %JASYPT_ENCRYPTOR_PASSWORD%  # Windows
echo $JASYPT_ENCRYPTOR_PASSWORD   # Linux/Mac

# La redéfinir
set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey  # Windows
export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey  # Linux/Mac
```

### Erreur : "Access denied for user 'root'"

Votre mot de passe MySQL est différent. Générez un nouveau mot de passe chiffré :

```bash
cd backend
./encrypt-password.sh cosmetoKey VotreVraiMotDePasse
```

### Port 8080 déjà utilisé

Changez le port dans `application-local.properties` :
```properties
server.port=8081
```

Et dans `.env.local` :
```
VITE_API_URL=http://localhost:8081/api
```

### Port 5173 déjà utilisé

Vite choisira automatiquement le port suivant (5174, 5175, etc.)

## Commandes Utiles

### Backend

```bash
# Compiler
./mvnw clean install

# Lancer avec logs debug
./mvnw spring-boot:run -Dspring-boot.run.profiles=local -Dlogging.level.root=DEBUG

# Générer mot de passe chiffré
./encrypt-password.sh cosmetoKey nouveauPassword
```

### Frontend

```bash
# Installer les dépendances
npm install

# Démarrer en mode dev
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

## Structure des Logs

### Backend
Les logs s'affichent dans la console Maven.

### Frontend
Les logs s'affichent dans la console du navigateur (F12).

## Arrêter les Services

**Backend :** `Ctrl+C` dans le terminal Maven

**Frontend :** `Ctrl+C` dans le terminal npm

**MySQL (Windows) :**
```cmd
net stop MySQL80
```

**MySQL (Linux/Mac) :**
```bash
sudo systemctl stop mysql
```

## Documentation Complémentaire

- [backend/CHIFFREMENT-PASSWORD.md](backend/CHIFFREMENT-PASSWORD.md) - Chiffrement des mots de passe
- [backend/DEMARRAGE-RAPIDE.md](backend/DEMARRAGE-RAPIDE.md) - Guide rapide backend
- [backend/README.md](backend/README.md) - Documentation API
