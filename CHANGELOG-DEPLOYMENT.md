# Changelog - Architecture de Déploiement

## Problème Résolu

**Erreur 404 en production** lors de l'accès à `http://localhost:8080/`

### Cause du problème

L'application Spring Boot était configurée avec `server.servlet.context-path=/api`, ce qui signifie que TOUTES les requêtes devaient commencer par `/api/`. Il était impossible d'accéder à la racine `/` pour servir le frontend.

## Solution Implémentée

### 1. Architecture Unifiée

**Avant:**
```
Frontend (séparé):  http://localhost:5173
Backend:            http://localhost:8080/api/
```

**Après:**
```
Application:        http://localhost:8080/
├── Frontend:       http://localhost:8080/
├── API Backend:    http://localhost:8080/api/
└── Assets:         http://localhost:8080/assets/
```

### 2. Modifications du Backend

#### a) Configuration Spring Boot (`application-prod.properties`)
```diff
# Server Configuration
server.port=8080
-server.servlet.context-path=/api
server.address=0.0.0.0
```

#### b) Routes des Contrôleurs
Tous les contrôleurs ont été mis à jour pour inclure le préfixe `/api/`:

```diff
-@RequestMapping("/auth")
+@RequestMapping("/api/auth")

-@RequestMapping("/declarations")
+@RequestMapping("/api/declarations")

-@RequestMapping("/attachments")
+@RequestMapping("/api/attachments")
```

#### c) Nouveau Contrôleur SPA (`SpaController.java`)
Gère le routing React côté serveur:
```java
@Controller
public class SpaController {
    @RequestMapping(value = {
        "/", "/login", "/dashboard",
        "/cosmetovigilance", "/declarations", "/declarations/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
```

#### d) Configuration Web (`WebConfig.java`)
Sert les fichiers statiques depuis `classpath:/static/`:
```java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/assets/**")
            .addResourceLocations("classpath:/static/assets/")
            .setCachePeriod(3600);

    registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/")
            .setCachePeriod(0);
}
```

### 3. Nouveaux Scripts de Déploiement

#### `deploy.sh` (Linux/Mac)
- Build automatique du frontend
- Copie vers `backend/src/main/resources/static/`
- Build du backend avec Maven
- Instructions de lancement

#### `deploy.bat` (Windows)
- Même fonctionnalité pour Windows

### 4. Documentation

- **DEPLOYMENT.md**: Guide complet de déploiement
- **README.md**: Mis à jour avec les nouvelles instructions
- **CHANGELOG-DEPLOYMENT.md**: Ce fichier

## Comment Déployer Maintenant

### Méthode Rapide

```bash
# 1. Build tout
./deploy.sh

# 2. Lancer l'application
cd backend
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# 3. Accéder à l'application
# Frontend: http://localhost:8080/
# API:      http://localhost:8080/api/
```

## Vérifications Post-Déploiement

### 1. Frontend accessible
```bash
curl http://localhost:8080/
# Devrait retourner le HTML du frontend
```

### 2. Routes React fonctionnent
```bash
curl http://localhost:8080/login
curl http://localhost:8080/dashboard
# Devraient tous retourner index.html
```

### 3. API fonctionne
```bash
curl http://localhost:8080/api/auth/...
# Devrait retourner du JSON
```

### 4. Assets se chargent
```bash
curl http://localhost:8080/assets/index-*.js
curl http://localhost:8080/assets/index-*.css
# Devraient retourner les fichiers JS/CSS
```

## Structure des Fichiers

```
backend/src/main/resources/
└── static/              # ← Fichiers frontend copiés ici
    ├── index.html       # Point d'entrée
    ├── assets/          # JS, CSS, etc.
    │   ├── index-*.js
    │   └── index-*.css
    └── *.png            # Images
```

## Avantages de Cette Architecture

1. **Un seul serveur** - Plus simple à déployer
2. **Un seul port** - Pas de configuration CORS complexe
3. **Fichiers statiques optimisés** - Servis directement par Spring Boot
4. **Routing React fonctionnel** - Grâce au SpaController
5. **API séparée** - Toujours accessible sur `/api/`

## Rollback (si nécessaire)

Si vous voulez revenir à l'ancienne architecture:

1. Restaurer `server.servlet.context-path=/api` dans `application-prod.properties`
2. Supprimer `SpaController.java`
3. Retirer le préfixe `/api/` des contrôleurs
4. Servir le frontend séparément (ex: `npm run preview`)
