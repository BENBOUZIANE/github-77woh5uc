# 🧴 Application Cosmetovigilance

Application de gestion des déclarations de cosmetovigilance avec backend Spring Boot et frontend React.

---

## 📚 Documentation

### Guides de déploiement

Choisissez le guide approprié selon votre système d'exploitation :

| Système | Guide | Scripts |
|---------|-------|---------|
| **Windows** | [`GUIDE_WINDOWS.md`](./GUIDE_WINDOWS.md) | `start-local.bat`, `start-vm.bat` |
| **Linux/Mac** | [`GUIDE_DEPLOIEMENT.md`](./GUIDE_DEPLOIEMENT.md) | `start-local.sh`, `start-vm.sh`, `deploy-production.sh` |

### Résumé rapide

#### 🏠 Développement Local

**Windows :**
```cmd
start-local.bat
```

**Linux/Mac :**
```bash
./start-local.sh
```

**Accès :** http://localhost:5173

---

#### 🖥 VM Réseau Local

**Windows :**
1. Double-cliquer sur `start-vm.bat`
2. Entrer l'IP de votre VM (ex: 192.168.1.50)
3. Transférer les fichiers compilés vers la VM

**Linux/Mac :**
```bash
./start-vm.sh
```

**Accès :** http://[IP_VM]:5173

---

#### ☁️ Production Cloud

**Linux uniquement :**
```bash
export DB_PASSWORD="votre_mot_de_passe"
export JWT_SECRET="votre_cle_secrete"
export CORS_ORIGINS="https://votredomaine.com"
./deploy-production.sh
```

---

## 🛠 Technologies

### Backend
- Spring Boot 3.x
- Java 17
- MySQL 8.0
- JWT Authentication
- Spring Security
- Flyway Migration
- Swagger/OpenAPI

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Lucide React Icons

---

## 📂 Structure du Projet

```
cosmetovigilance/
├── backend/                          # Backend Spring Boot
│   ├── src/main/
│   │   ├── java/com/cosmetovigilance/
│   │   │   ├── config/              # Configuration (Security, CORS, Swagger)
│   │   │   ├── controller/          # REST Controllers
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── model/               # Entités JPA
│   │   │   ├── repository/          # Repositories JPA
│   │   │   ├── security/            # JWT & Authentication
│   │   │   └── service/             # Services métier
│   │   └── resources/
│   │       ├── application.properties           # Config principale
│   │       ├── application-local.properties     # Config locale
│   │       ├── application-vm.properties        # Config VM
│   │       ├── application-prod.properties      # Config production
│   │       └── db/migration/                    # Scripts Flyway
│   └── target/                      # Fichiers compilés
│
├── src/                             # Frontend React
│   ├── components/                  # Composants réutilisables
│   ├── contexts/                    # Contexts React (Auth, etc.)
│   ├── pages/                       # Pages de l'application
│   ├── services/                    # Services API
│   └── data/                        # Données statiques
│
├── dist/                            # Build frontend (généré)
│
├── .env.local                       # Config frontend local
├── .env.vm                          # Config frontend VM
├── .env.production                  # Config frontend production
│
├── start-local.bat                  # Script Windows - Local
├── start-vm.bat                     # Script Windows - VM
├── start-local.sh                   # Script Linux - Local
├── start-vm.sh                      # Script Linux - VM
├── stop-vm.sh                       # Script Linux - Arrêt VM
├── deploy-production.sh             # Script Linux - Production
│
├── GUIDE_WINDOWS.md                 # Guide Windows
├── GUIDE_DEPLOIEMENT.md             # Guide Linux/Mac
└── README.md                        # Ce fichier
```

---

## 🚀 Démarrage Rapide

### Prérequis

- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven (inclus via wrapper)

### Installation

1. **Cloner le projet**
```bash
git clone <url_du_projet>
cd cosmetovigilance
```

2. **Créer la base de données**
```sql
CREATE DATABASE cosmetovigilance;
```

3. **Installer les dépendances frontend**
```bash
npm install
```

4. **Lancer l'application**

**Windows :** Double-cliquer sur `start-local.bat`

**Linux/Mac :**
```bash
chmod +x start-local.sh
./start-local.sh
```

5. **Accéder à l'application**
- Frontend : http://localhost:5173
- Backend : http://localhost:8080/api
- Swagger : http://localhost:8080/api/swagger-ui.html

---

## 🔐 Configuration

### Fichiers d'environnement

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_URL=http://localhost:5173
```

#### Backend (application.properties)
```properties
# Base de données
spring.datasource.url=jdbc:mysql://localhost:3306/cosmetovigilance
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe

# JWT
jwt.secret=votre_cle_secrete
jwt.expiration-ms=86400000

# CORS
cors.allowed-origins=http://localhost:5173
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Déclarations
- `GET /api/declarations` - Liste des déclarations
- `GET /api/declarations/{id}` - Détails d'une déclaration
- `POST /api/declarations` - Créer une déclaration
- `PUT /api/declarations/{id}` - Modifier une déclaration
- `DELETE /api/declarations/{id}` - Supprimer une déclaration
- `PATCH /api/declarations/{id}/status` - Changer le statut

### Fichiers
- `POST /api/attachments/upload` - Upload de fichier
- `GET /api/attachments/{id}` - Télécharger un fichier

**Documentation complète :** http://localhost:8080/api/swagger-ui.html

---

## 🧪 Tests

### Backend
```bash
cd backend
./mvnw test
```

### Frontend
```bash
npm run test
```

---

## 🔨 Build

### Développement
```bash
npm run dev
```

### Production
```bash
# Frontend
npm run build

# Backend
cd backend
./mvnw clean package
```

---

## 📝 Notes de développement

### Profils Spring Boot

Le backend utilise 3 profils différents :

- **local** : Développement sur PC local
- **vm** : Déploiement sur VM réseau
- **prod** : Production cloud

Activer un profil :
```bash
java -jar app.jar --spring.profiles.active=prod
```

### Migrations de base de données

Les migrations Flyway sont dans `backend/src/main/resources/db/migration/`

Créer une nouvelle migration :
1. Créer un fichier `V8__description.sql`
2. Ajouter les commandes SQL
3. Redémarrer l'application

---

## 🐛 Dépannage

### Problèmes courants

**Backend ne démarre pas**
- Vérifier que MySQL est démarré
- Vérifier les identifiants de connexion
- Vérifier que le port 8080 est libre

**Frontend ne charge pas**
- Vérifier que le backend est démarré
- Vérifier le fichier `.env`
- Vérifier la configuration CORS

**Erreur de connexion à la base de données**
- Vérifier que la base `cosmetovigilance` existe
- Vérifier les credentials dans `application.properties`
- Tester la connexion : `mysql -u root -p`

Pour plus de détails, consultez les guides de déploiement.

---

## 📄 Licence

Ce projet est privé et confidentiel.

---

## 👥 Contact

Pour toute question, contactez l'équipe de développement.

---

**Fait avec ❤️ pour la cosmetovigilance au Maroc**
