# Démarrage en environnement LOCAL (tests sur votre PC)

Environnement : **Windows**.  
Frontend : **Vite** sur le port **5137** (`npm run dev`).  
Backend : profil **local** (`application-local.properties`).  
Pas de nginx.

---

## 1. Prérequis

- **Node.js** 18+
- **Java JDK 17+**
- **Maven** 3.8+
- **MySQL** 8+

---

## 2. Configuration

### Backend : `backend/src/main/resources/application-local.properties`

Vérifier / modifier au minimum :

```properties
# Base de données
spring.datasource.url=jdbc:mysql://localhost:3306/cosmetovigilance?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=VOTRE_MOT_DE_PASSE

# Port du backend (par défaut 8080)
server.port=8080
```

Les CORS et la CSP sont déjà réglés pour localhost (port 5137 et 5173).

### Frontend : `.env.local`

À la racine du projet (à côté de `package.json`) : le fichier **`.env.local`** est chargé automatiquement par Vite en dev. S’il n’existe pas, créer à partir de l’exemple :

```env
VITE_DEV_PORT=5137
VITE_API_URL=http://localhost:8080/api
VITE_CSP_ALLOWED_HTTP_HOSTS=localhost,127.0.0.1
VITE_CSP_ALLOW_PRIVATE_NETWORK_HTTP=false
```

---

## 3. Base de données

Créer la base si besoin :

```cmd
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS cosmetovigilance;
```

---

## 4. Lancer l’application

### Terminal 1 – Backend

```cmd
cd backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

Attendre le message du type : `Started CosmetovigilanceApplication`.

### Terminal 2 – Frontend

```cmd
npm install
npm run dev
```

Vite démarre sur **http://localhost:5137** (ou le port défini dans `VITE_DEV_PORT`).

---

## 5. Accès

| Service              | URL                          |
|----------------------|------------------------------|
| Application (front)  | http://localhost:5137        |
| API Backend          | http://localhost:8080/api    |
| Swagger              | http://localhost:8080/api/swagger-ui.html |

---

## 6. Arrêter

- **Frontend** : `Ctrl+C` dans le terminal Vite.
- **Backend** : `Ctrl+C` dans le terminal Maven.

---

## Dépannage

- **Port 5137 ou 8080 déjà utilisé**  
  Changer `VITE_DEV_PORT` dans `.env` et/ou `server.port` dans `application-local.properties`, puis adapter `VITE_API_URL` si le port backend change.

- **Front ne parle pas au backend**  
  Vérifier que `VITE_API_URL` dans `.env.local` correspond au port du backend (ex. `http://localhost:8080/api`).

- **Erreur MySQL**  
  Vérifier que MySQL est démarré et que les identifiants dans `application-local.properties` sont corrects.
