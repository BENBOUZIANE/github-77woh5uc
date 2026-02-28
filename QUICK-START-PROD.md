# Démarrage Rapide - Production

## En Une Commande

### Linux/Mac
```bash
./deploy.sh && cd backend && java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Windows
```cmd
deploy.bat && cd backend && java -jar target\cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## Accès à l'Application

**Application complète:** http://localhost:8080

### Pages Frontend
- Page d'accueil: http://localhost:8080/
- Connexion: http://localhost:8080/login
- Tableau de bord: http://localhost:8080/dashboard
- Formulaire: http://localhost:8080/cosmetovigilance
- Déclarations: http://localhost:8080/declarations

### API Backend
- Authentification: http://localhost:8080/api/auth
- Déclarations: http://localhost:8080/api/declarations
- Fichiers: http://localhost:8080/api/attachments

## Résolution Rapide des Problèmes

### Erreur 404 sur /
**Cause:** Fichiers frontend pas copiés

**Solution:**
```bash
npm run build
mkdir -p backend/src/main/resources/static
cp -r dist/* backend/src/main/resources/static/
cd backend && ./mvnw clean package
```

### Erreur 404 sur /login ou /dashboard
**Cause:** SpaController manquant

**Solution:** Vérifier que `SpaController.java` existe dans `backend/src/main/java/com/cosmetovigilance/controller/`

### API ne répond pas
**Cause:** Routes API sans préfixe /api/

**Solution:** Vérifier que tous les contrôleurs utilisent `@RequestMapping("/api/...")`

### CORS errors
**Cause:** CORS mal configuré

**Solution:** Vérifier `cors.allowed-origins` dans `application-prod.properties`

## Checklist Avant Déploiement

- [ ] MySQL installé et démarré
- [ ] Base de données `cosmetovigilance` créée
- [ ] Variables d'environnement configurées (si production réelle)
- [ ] `npm run build` réussi
- [ ] Fichiers copiés dans `backend/src/main/resources/static/`
- [ ] `mvnw clean package` réussi
- [ ] Port 8080 disponible

## Variables d'Environnement (Production)

Pour un déploiement en production avec des paramètres personnalisés:

```bash
export DB_URL=jdbc:mysql://localhost:3306/cosmetovigilance
export DB_USERNAME=root
export DB_PASSWORD=votre_mot_de_passe
export JWT_SECRET=votre_secret_jwt_securise
export CORS_ORIGINS=https://votre-domaine.com

java -jar backend/target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## Support

- Guide complet: [DEPLOYMENT.md](DEPLOYMENT.md)
- Changelog: [CHANGELOG-DEPLOYMENT.md](CHANGELOG-DEPLOYMENT.md)
- README: [README.md](README.md)
