# Architecture de Production - Cosmetovigilance

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│         Application Cosmetovigilance (Port 8080)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │   Spring Boot Application Server    │
        │         (Java + Spring MVC)         │
        └─────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────┐                   ┌───────────────────┐
│  Static Resource  │                   │   REST API        │
│     Handler       │                   │  Controllers      │
│                   │                   │                   │
│  /                │                   │  /api/auth        │
│  /login           │                   │  /api/declarations│
│  /dashboard       │                   │  /api/attachments │
│  /cosmetovigilance│                   │                   │
│  /declarations    │                   │  (JSON responses) │
│  /assets/*        │                   │                   │
│                   │                   │                   │
│  (HTML/CSS/JS)    │                   │                   │
└───────────────────┘                   └───────────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌───────────────────┐                   ┌───────────────────┐
│  React SPA        │                   │   MySQL Database  │
│  (Frontend)       │                   │   + JWT Auth      │
│                   │                   │                   │
│  Served from:     │                   │  Tables:          │
│  classpath:       │                   │  - users          │
│  /static/         │                   │  - declarations   │
│                   │                   │  - attachments    │
│  index.html       │                   │  - etc.           │
│  assets/          │                   │                   │
└───────────────────┘                   └───────────────────┘
```

## Flux des Requêtes

### 1. Requête Frontend (ex: http://localhost:8080/dashboard)

```
Client Browser
     │
     │ GET /dashboard
     ▼
Spring Boot Server (Port 8080)
     │
     ├─ Route match: /dashboard
     │
     ▼
SpaController.java
     │
     ├─ forward:/index.html
     │
     ▼
Static Resource Handler
     │
     ├─ Read: classpath:/static/index.html
     │
     ▼
Return HTML + React App
     │
     ▼
Client Browser
     │
     ├─ Parse HTML
     ├─ Load /assets/index-*.js
     ├─ Load /assets/index-*.css
     │
     ▼
React Router
     │
     ├─ Client-side routing
     ├─ Render DashboardPage component
     │
     ▼
Page Displayed ✓
```

### 2. Requête API (ex: http://localhost:8080/api/declarations)

```
Client Browser (React App)
     │
     │ fetch('/api/declarations')
     │ Header: Authorization: Bearer [JWT]
     ▼
Spring Boot Server (Port 8080)
     │
     ├─ Route match: /api/declarations
     │
     ▼
Spring Security Filter
     │
     ├─ Validate JWT Token
     ├─ Check user permissions
     │
     ▼
DeclarationController.java
     │
     ├─ @GetMapping
     ├─ Call DeclarationService
     │
     ▼
DeclarationService.java
     │
     ├─ Query database via JPA
     │
     ▼
MySQL Database
     │
     ├─ Execute SQL query
     ├─ Return results
     │
     ▼
Response: JSON data
     │
     ▼
Client Browser (React App)
     │
     ├─ Update state
     ├─ Re-render UI
     │
     ▼
Data Displayed ✓
```

## Structure des Fichiers en Production

```
backend/
├── src/main/
│   ├── java/com/cosmetovigilance/
│   │   ├── controller/
│   │   │   ├── SpaController.java        ← Routes frontend
│   │   │   ├── AuthController.java       ← /api/auth
│   │   │   ├── DeclarationController.java← /api/declarations
│   │   │   └── AttachmentController.java ← /api/attachments
│   │   ├── config/
│   │   │   ├── WebConfig.java           ← Static resources
│   │   │   └── SecurityConfig.java      ← JWT + CORS
│   │   ├── service/
│   │   ├── repository/
│   │   └── model/
│   └── resources/
│       ├── static/                      ← Frontend files
│       │   ├── index.html              ← Entry point
│       │   ├── assets/
│       │   │   ├── index-*.js          ← React app
│       │   │   └── index-*.css         ← Styles
│       │   └── *.png                   ← Images
│       ├── application.properties
│       └── application-prod.properties  ← Production config
└── target/
    └── cosmetovigilance-0.0.1-SNAPSHOT.jar  ← Executable JAR
```

## Configuration Clé

### application-prod.properties
```properties
# Pas de context-path pour permettre le routing à la racine
server.port=8080
# server.servlet.context-path=/api  ← SUPPRIMÉ!

# CORS pour autoriser les requêtes
cors.allowed-origins=*
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
```

### WebConfig.java
```java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // Assets avec cache
    registry.addResourceHandler("/assets/**")
            .addResourceLocations("classpath:/static/assets/")
            .setCachePeriod(3600);

    // Autres fichiers sans cache
    registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/")
            .setCachePeriod(0);
}
```

### SpaController.java
```java
@RequestMapping(value = {"/", "/login", "/dashboard", ...})
public String forward() {
    return "forward:/index.html";  // React Router prend le relais
}
```

## Avantages de Cette Architecture

### 1. Simplicité de Déploiement
- Un seul fichier JAR à déployer
- Pas de serveur frontend séparé
- Configuration minimale

### 2. Performance
- Fichiers statiques servis directement par Spring Boot
- Pas de latence réseau entre frontend et backend
- Cache HTTP pour les assets

### 3. Sécurité
- Pas de problèmes CORS complexes
- Même origine pour frontend et backend
- JWT validé côté serveur

### 4. Développement
- Mode dev: Frontend et backend séparés (hot reload)
- Mode prod: Application unifiée (déploiement simple)

## Commandes de Déploiement

### Build Complet
```bash
# 1. Build frontend
npm run build

# 2. Copier vers backend
cp -r dist/* backend/src/main/resources/static/

# 3. Build backend (inclut frontend)
cd backend
./mvnw clean package

# 4. Lancer
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Ou en une commande
```bash
./deploy.sh && cd backend && java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## URLs en Production

| Type | URL | Gestion |
|------|-----|---------|
| Frontend | `http://localhost:8080/` | React Router |
| Frontend | `http://localhost:8080/login` | React Router |
| Frontend | `http://localhost:8080/dashboard` | React Router |
| Assets | `http://localhost:8080/assets/*` | Spring Static Handler |
| API | `http://localhost:8080/api/auth` | Spring Controller |
| API | `http://localhost:8080/api/declarations` | Spring Controller |
| API | `http://localhost:8080/api/attachments` | Spring Controller |

## Support et Documentation

- **Guide complet**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Démarrage rapide**: [QUICK-START-PROD.md](QUICK-START-PROD.md)
- **Changelog**: [CHANGELOG-DEPLOYMENT.md](CHANGELOG-DEPLOYMENT.md)
