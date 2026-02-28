# Solution au Problème 404 - Résumé

## Le Problème

Vous aviez une **erreur 404** quand vous accédiez à `http://localhost:8080/` après avoir:
1. Fait `npm run build`
2. Copié le contenu de `dist/` vers `backend/src/main/resources/static/`
3. Lancé l'application avec `java -jar ...`

## La Cause

Le backend Spring Boot avait `server.servlet.context-path=/api` dans la configuration, ce qui signifie:
- TOUTES les requêtes devaient commencer par `/api/`
- Impossible d'accéder à `/` (racine)
- Le frontend ne pouvait pas être servi

```
AVANT:
http://localhost:8080/          → 404 ❌
http://localhost:8080/api/...   → Fonctionne ✓
```

## La Solution

### 1. Suppression du context-path

Dans `backend/src/main/resources/application-prod.properties`:

```diff
server.port=8080
-server.servlet.context-path=/api
server.address=0.0.0.0
```

### 2. Ajout du préfixe /api/ aux contrôleurs

Tous les contrôleurs API ont été modifiés:

```diff
-@RequestMapping("/auth")
+@RequestMapping("/api/auth")

-@RequestMapping("/declarations")
+@RequestMapping("/api/declarations")

-@RequestMapping("/attachments")
+@RequestMapping("/api/attachments")
```

### 3. Création du SpaController

Nouveau fichier `SpaController.java` pour gérer les routes React:

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

### 4. Configuration des ressources statiques

Dans `WebConfig.java`:

```java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/assets/**")
            .addResourceLocations("classpath:/static/assets/");

    registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/");
}
```

## Résultat

```
APRÈS:
http://localhost:8080/              → Frontend React ✓
http://localhost:8080/login         → Frontend React ✓
http://localhost:8080/dashboard     → Frontend React ✓
http://localhost:8080/assets/*      → CSS, JS ✓
http://localhost:8080/api/auth      → API Backend ✓
http://localhost:8080/api/declarations → API Backend ✓
```

## Comment Déployer Maintenant

### Méthode Automatique (Recommandée)

```bash
# 1. Exécuter le script de déploiement
./deploy.sh

# 2. Lancer l'application
cd backend
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# 3. Accéder à l'application
# http://localhost:8080
```

### Méthode Manuelle

```bash
# 1. Build frontend
npm run build

# 2. Copier vers backend
mkdir -p backend/src/main/resources/static
cp -r dist/* backend/src/main/resources/static/

# 3. Build backend
cd backend
./mvnw clean package

# 4. Lancer
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# 5. Accéder à l'application
# http://localhost:8080
```

## Vérification

### ✅ Frontend accessible
```bash
curl http://localhost:8080/
# Devrait retourner du HTML
```

### ✅ Routes React fonctionnent
```bash
curl http://localhost:8080/login
curl http://localhost:8080/dashboard
# Devraient retourner du HTML (index.html)
```

### ✅ API fonctionne
```bash
curl http://localhost:8080/api/auth/...
# Devrait retourner du JSON
```

### ✅ Assets se chargent
Ouvrir dans le navigateur et vérifier la console (F12):
- Pas d'erreurs 404
- Fichiers CSS chargés
- Fichiers JS chargés

## Architecture Finale

```
                    localhost:8080
                         |
        +----------------+----------------+
        |                                 |
    Frontend                            API
        |                                 |
   /                               /api/auth
   /login                          /api/declarations
   /dashboard                      /api/attachments
   /cosmetovigilance
   /declarations
   /assets/*
```

**Un seul serveur, un seul port, tout fonctionne!**

## Fichiers Modifiés

| Fichier | Modification |
|---------|-------------|
| `application-prod.properties` | Supprimé `context-path=/api` |
| `AuthController.java` | `/auth` → `/api/auth` |
| `DeclarationController.java` | `/declarations` → `/api/declarations` |
| `AttachmentController.java` | `/attachments` → `/api/attachments` |
| `SpaController.java` | **Nouveau** - Gère routes frontend |
| `WebConfig.java` | Configuration ressources statiques |

## Nouveaux Fichiers

- `deploy.sh` / `deploy.bat` - Scripts de déploiement automatique
- `DEPLOYMENT.md` - Guide complet
- `QUICK-START-PROD.md` - Démarrage rapide
- `ARCHITECTURE-PROD.md` - Schéma architecture
- `TROUBLESHOOTING.md` - Guide de dépannage
- `.deployment-checklist` - Checklist de vérification
- `SOLUTION-404.md` - Ce fichier

## Support

En cas de problème:

1. **Erreur 404 sur /** → Voir [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problème 1
2. **Erreur 404 sur /login** → Voir [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problème 2
3. **API ne répond pas** → Voir [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problème 3
4. **Guide complet** → Voir [DEPLOYMENT.md](DEPLOYMENT.md)

## Commande Complète en Une Ligne

**Linux/Mac:**
```bash
./deploy.sh && cd backend && java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

**Windows:**
```cmd
deploy.bat && cd backend && java -jar target\cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

**Accès:** http://localhost:8080

---

✅ **Problème résolu!** Votre application devrait maintenant fonctionner sans erreur 404.
