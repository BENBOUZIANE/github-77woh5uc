# Architecture de l'Application Cosmétovigilance

## Vue d'Ensemble

L'application est composée de trois couches principales :

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│    React 18 + TypeScript + Tailwind     │
└─────────────────────────────────────────┘
                   ↓ HTTPS
          Chiffrement AES-256
                   ↓
┌─────────────────────────────────────────┐
│       Backend (Spring Boot + JWT)       │
│        Java 17 + Spring Security        │
└─────────────────────────────────────────┘
                   ↓ JDBC
┌─────────────────────────────────────────┐
│          Base de Données MySQL          │
│     MySQL 8.0 + Flyway (migrations)     │
└─────────────────────────────────────────┘
```

## Stack Technique

### Frontend

| Technologie | Version | Rôle |
|------------|---------|------|
| **React** | 18.3.1 | Framework UI |
| **TypeScript** | 5.5+ | Typage statique |
| **Vite** | 5.4+ | Build tool & dev server |
| **React Router** | 7.12+ | Routing SPA |
| **Tailwind CSS** | 3.4+ | Styles CSS utilitaires |
| **Lucide React** | 0.344+ | Icônes |
| **CryptoJS** | 4.2+ | Chiffrement AES-256 |

### Backend

| Technologie | Version | Rôle |
|------------|---------|------|
| **Spring Boot** | 3.2+ | Framework Java |
| **Spring Security** | 6.2+ | Authentification/Autorisation |
| **Spring Data JPA** | 3.2+ | ORM (Hibernate) |
| **MySQL Connector** | 8.0+ | Driver JDBC MySQL |
| **Flyway** | 9.22+ | Migrations de base de données |
| **Jasypt** | 3.0+ | Chiffrement des mots de passe |
| **JWT (jjwt)** | 0.12+ | JSON Web Tokens |
| **SpringDoc OpenAPI** | 2.3+ | Documentation API (Swagger) |
| **Lombok** | 1.18+ | Réduction du code boilerplate |

### Base de Données

| Technologie | Version | Rôle |
|------------|---------|------|
| **MySQL** | 8.0+ | SGBD relationnel |
| **Flyway** | 9.22+ | Gestion des migrations |

### Serveur Web (Production)

| Technologie | Version | Rôle |
|------------|---------|------|
| **Nginx** | 1.18+ | Reverse proxy & serveur HTTP |
| **Certbot** | - | Certificats SSL (Let's Encrypt) |

## Architecture Détaillée

### Frontend - Structure des Dossiers

```
src/
├── components/           # Composants réutilisables
│   ├── BarChart.tsx
│   ├── PieChart.tsx
│   └── ProtectedRoute.tsx
├── contexts/            # Contextes React (state global)
│   └── AuthContext.tsx  # Gestion de l'authentification
├── pages/               # Pages de l'application
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── CosmetovigillancePage.tsx
│   ├── DashboardPage.tsx
│   ├── MyDeclarationsPage.tsx
│   └── DeclarationDetailPage.tsx
├── services/            # Services API
│   └── api.ts           # Client HTTP + chiffrement
├── utils/               # Utilitaires
│   └── encryption.ts    # Fonctions de chiffrement AES
├── data/                # Données statiques
│   └── villesMaroc.ts
├── App.tsx              # Composant racine
├── main.tsx             # Point d'entrée
└── index.css            # Styles globaux
```

### Backend - Architecture en Couches

```
backend/src/main/java/com/cosmetovigilance/
├── config/                      # Configuration Spring
│   ├── SecurityConfig.java      # Spring Security + JWT
│   ├── WebConfig.java           # CORS
│   ├── OpenApiConfig.java       # Swagger
│   ├── RequestDecryptionFilter.java   # Déchiffrement requêtes
│   └── ApiResponseEncodingFilter.java # Chiffrement réponses
├── controller/                  # Contrôleurs REST
│   ├── AuthController.java      # /api/auth/**
│   ├── DeclarationController.java  # /api/declarations/**
│   └── AttachmentController.java   # /api/attachments/**
├── service/                     # Logique métier
│   ├── AuthService.java
│   ├── DeclarationService.java
│   ├── AttachmentService.java
│   └── CustomUserDetailsService.java
├── repository/                  # Accès aux données (JPA)
│   ├── UserRepository.java
│   ├── DeclarationRepository.java
│   ├── DeclarantRepository.java
│   └── ...
├── model/                       # Entités JPA
│   ├── User.java
│   ├── Declaration.java
│   ├── Declarant.java
│   └── ...
├── dto/                         # Data Transfer Objects
│   ├── LoginRequest.java
│   ├── AuthResponse.java
│   ├── DeclarationRequest.java
│   └── ...
├── security/                    # Sécurité
│   ├── JwtTokenProvider.java   # Génération/validation JWT
│   ├── JwtAuthenticationFilter.java
│   └── JwtAuthenticationEntryPoint.java
├── util/                        # Utilitaires
│   ├── AesEncryptionUtil.java  # Chiffrement AES-256
│   ├── PasswordEncoderUtil.java
│   └── EncryptPasswordUtil.java
└── CosmetovigilanceApplication.java  # Classe principale
```

### Base de Données - Schéma Principal

#### Tables Principales

```sql
utilisateur
├── id (PK)
├── nom, prenom, email
├── mot_de_passe (BCrypt)
├── role (PUBLIC, ANMPS)
├── numero_telephone
└── created_at, updated_at

declaration
├── id (PK)
├── user_id (FK → utilisateur)
├── numero_declaration (unique)
├── statut (EN_ATTENTE, EN_COURS, TRAITEE, REJETEE)
├── type_declarant (consommateur, professionnel, etc.)
├── commentaire_anmps
└── date_declaration, date_traitement

declarant (informations du déclarant)
├── id (PK)
├── declaration_id (FK → declaration)
├── nom, prenom, email
├── adresse, ville, code_postal
└── telephone

personne_exposee (victime)
├── id (PK)
├── declaration_id (FK → declaration)
├── nom, prenom
├── date_naissance, age, sexe
├── poids, taille
└── est_enceinte, trimestre_grossesse

produit_suspecte (cosmétique incriminé)
├── id (PK)
├── declaration_id (FK → declaration)
├── nom_commercial, marque, type_produit
├── numero_lot, date_peremption
└── lieu_achat, frequence_utilisation

effet_indesirable (symptômes)
├── id (PK)
├── declaration_id (FK → declaration)
├── description
├── date_apparition, duree_exposition
└── gravite (GRAVE, NON_GRAVE)

prise_charge_medicale
├── id (PK)
├── declaration_id (FK → declaration)
├── consultation, hospitalisation
└── nom_etablissement

attachment (fichiers PDF)
├── id (PK)
├── declaration_id (FK → declaration)
├── file_name, file_path
├── file_type, file_size
└── upload_date
```

## Flux de Données

### 1. Flux d'Authentification

```
Utilisateur
    ↓ (email + password)
Frontend (encryption.ts)
    ↓ Chiffre en AES-256 → {e: "..."}
    ↓ POST /api/auth/login
Backend (RequestDecryptionFilter)
    ↓ Déchiffre → {email, password}
AuthService
    ↓ Vérifie BCrypt
    ↓ Génère JWT
JwtTokenProvider
    ↓ {accessToken, refreshToken, user}
ApiResponseEncodingFilter
    ↓ Chiffre en AES-256 → {encrypted: true, data: "..."}
Frontend (api.ts)
    ↓ Déchiffre
AuthContext
    ↓ Stocke le token dans localStorage
    ↓ Redirige vers Dashboard
```

### 2. Flux de Déclaration

```
Utilisateur remplit le formulaire
    ↓
CosmetovigillancePage.tsx
    ↓ Validation côté client
    ↓ Chiffrement AES-256
    ↓ POST /api/declarations
Backend (RequestDecryptionFilter)
    ↓ Déchiffre
DeclarationController
    ↓ Validation @Valid
DeclarationService
    ↓ Enregistre en base
    ↓ Génère numero_declaration
    ↓ Retourne Declaration
ApiResponseEncodingFilter
    ↓ Chiffre la réponse
Frontend
    ↓ Déchiffre
    ↓ Upload des fichiers PDF
    ↓ POST /api/attachments/upload
AttachmentService
    ↓ Sauvegarde dans ./uploads/
    ↓ Enregistre metadata en base
```

### 3. Flux de Consultation (Dashboard ANMPS)

```
Agent ANMPS se connecte
    ↓
DashboardPage.tsx
    ↓ GET /api/declarations (avec JWT)
JwtAuthenticationFilter
    ↓ Valide le token
    ↓ Extrait user_id et role
DeclarationController
    ↓ Vérifie @PreAuthorize("hasRole('ANMPS')")
DeclarationService
    ↓ Récupère toutes les déclarations
    ↓ Calcule les statistiques
ApiResponseEncodingFilter
    ↓ Chiffre la réponse
Frontend
    ↓ Déchiffre
    ↓ Affiche tableaux et graphiques
```

## Sécurité

### 1. Chiffrement des Communications

**Couche 1 : AES-256 (Application)**
- Frontend et Backend partagent une clé AES de 32 caractères
- Requêtes POST/PATCH chiffrées avec `{e: "..."}`
- Réponses chiffrées avec `{encrypted: true, data: "..."}`

**Couche 2 : HTTPS (Transport)**
- En production uniquement
- Certificats SSL via Let's Encrypt
- TLS 1.2/1.3

### 2. Authentification

**JWT (JSON Web Tokens)**
- `accessToken` : valide 24h
- `refreshToken` : valide 7 jours
- Algorithme : HS256 (HMAC + SHA-256)
- Stockage : `localStorage` (frontend)

### 3. Autorisation

**Rôles :**
- `PUBLIC` : Peut créer des déclarations
- `ANMPS` : Peut consulter et gérer toutes les déclarations

**Vérification :**
- Spring Security : `@PreAuthorize("hasRole('ANMPS')")`
- Frontend : `ProtectedRoute` component

### 4. Protection des Données

**Mots de passe :**
- Utilisateurs : BCrypt (Spring Security)
- Base de données : Jasypt AES-256

**Fichiers :**
- Upload limité à 10 MB
- Types autorisés : PDF uniquement
- Stockage : répertoire `./uploads/` hors webroot

## Environnements

### Local (Développement)

| Service | Configuration |
|---------|--------------|
| **Frontend** | Vite dev server (port 5173) |
| **Backend** | Spring Boot embedded Tomcat (port 8080) |
| **BDD** | MySQL local (port 3306) |
| **HTTPS** | Non (HTTP seulement) |
| **CORS** | `http://localhost:5173` |

**Profil :** `application-local.properties`

### VM (Réseau Local)

| Service | Configuration |
|---------|--------------|
| **Frontend** | Nginx (fichiers statiques) |
| **Backend** | Service systemd (port 8080) |
| **BDD** | MySQL sur la VM |
| **HTTPS** | Non (HTTP seulement) |
| **CORS** | `cors.allow-any-origin=true` (tout le réseau) |

**Profil :** `application-vm.properties`

### Production (Internet)

| Service | Configuration |
|---------|--------------|
| **Frontend** | Nginx avec SSL (port 443) |
| **Backend** | Service systemd (port 8080, localhost uniquement) |
| **BDD** | MySQL (localhost uniquement) |
| **HTTPS** | Oui (Let's Encrypt) |
| **CORS** | Domaine spécifique uniquement |
| **Firewall** | Ports 22, 80, 443 ouverts |

**Profil :** `application-prod.properties`

## Outils de Développement

### Installation des Prérequis

| Outil | Installation |
|-------|-------------|
| **Node.js** | https://nodejs.org/ (v18+) |
| **Java JDK** | https://adoptium.net/ (v17+) |
| **Maven** | Inclus dans le projet (Maven Wrapper) |
| **MySQL** | https://dev.mysql.com/downloads/mysql/ (v8.0+) |
| **Git** | https://git-scm.com/ |

### Commandes Utiles

**Frontend :**
```bash
npm install          # Installer les dépendances
npm run dev          # Démarrer en mode dev
npm run build        # Build de production
npm run preview      # Preview du build
npm run lint         # Linter ESLint
```

**Backend :**
```bash
./mvnw clean install    # Compiler le projet
./mvnw spring-boot:run  # Démarrer le serveur
./mvnw test            # Lancer les tests
./mvnw package         # Créer le JAR
```

**Base de données :**
```bash
mysql -u root -p                    # Se connecter à MySQL
CREATE DATABASE cosmetovigilance;   # Créer la base
SHOW TABLES;                        # Lister les tables
```

## Monitoring et Logs

### Frontend

**Console navigateur (F12) :**
- Erreurs réseau
- Erreurs JavaScript
- Performance

### Backend

**Logs Spring Boot :**
- Console : `stdout`
- Fichier : Non configuré par défaut
- Niveau : `INFO` (production), `DEBUG` (local)

**Swagger UI :**
- URL : `http://localhost:8080/api/swagger-ui.html`
- Désactivé en production

### Base de Données

**Logs MySQL :**
- Localisation : `/var/log/mysql/error.log`
- Slow queries : Configurable dans `my.cnf`

### Nginx (Production)

**Logs :**
- Access : `/var/log/nginx/cosmetovigilance-access.log`
- Error : `/var/log/nginx/cosmetovigilance-error.log`

## Performance

### Optimisations Frontend

- **Code splitting** : Vite automatique
- **Lazy loading** : Routes React
- **Cache** : Assets statiques (1 an)
- **Compression** : Gzip activé sur Nginx

### Optimisations Backend

- **Connection pooling** : HikariCP (défaut Spring Boot)
- **Cache** : Pas implémenté (peut ajouter Redis)
- **Pagination** : Requêtes API
- **Batch inserts** : Hibernate (config dans properties)

### Optimisations Base de Données

- **Index** : Sur colonnes fréquemment requêtées
- **Relations** : `@ManyToOne`, `@OneToMany` optimisées
- **Lazy loading** : Par défaut sur relations

## Évolutions Futures

### Fonctionnalités
- Export PDF des déclarations
- Notifications email
- Statistiques avancées
- Module de recherche avancée

### Technique
- Tests unitaires et d'intégration
- CI/CD avec GitHub Actions
- Monitoring avec Prometheus + Grafana
- Cache Redis pour les sessions
- Elasticsearch pour la recherche full-text

## Documentation Complémentaire

- [ENCRYPTION_GUIDE.md](ENCRYPTION_GUIDE.md) - Détails sur le chiffrement
- [README-DEPLOY-LOCAL.md](README-DEPLOY-LOCAL.md) - Installation locale
- [README-DEPLOY-VM.md](README-DEPLOY-VM.md) - Déploiement VM
- [README-DEPLOY-SERVEUR.md](README-DEPLOY-SERVEUR.md) - Déploiement production
