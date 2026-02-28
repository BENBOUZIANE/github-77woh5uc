# Index de la Documentation - Cosmetovigilance

## 🚀 Démarrage Rapide

Pour déployer l'application en production immédiatement:

**Commande unique:**
```bash
./deploy.sh && cd backend && java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

**Accès:** http://localhost:8080

---

## 📚 Documentation Disponible

### 1. Solution au Problème 404
📄 **[SOLUTION-404.md](SOLUTION-404.md)**
- Explication du problème rencontré
- La solution mise en place
- Commandes de déploiement
- Vérification post-déploiement
- **COMMENCEZ ICI si vous avez le problème 404**

### 2. Guide de Démarrage Rapide
📄 **[QUICK-START-PROD.md](QUICK-START-PROD.md)**
- Commande de déploiement en une ligne
- Accès aux URLs de l'application
- Résolution rapide des problèmes courants
- Checklist avant déploiement
- **UTILISEZ CECI pour un déploiement rapide**

### 3. Guide de Déploiement Complet
📄 **[DEPLOYMENT.md](DEPLOYMENT.md)**
- Guide pas à pas détaillé
- Option automatisée vs manuelle
- Vérification du déploiement
- Résolution des problèmes
- Configuration CORS, JWT, Base de données
- **LISEZ CECI pour comprendre le processus complet**

### 4. Architecture de Production
📄 **[ARCHITECTURE-PROD.md](ARCHITECTURE-PROD.md)**
- Schémas ASCII de l'architecture
- Flux des requêtes (Frontend + API)
- Structure des fichiers
- Configuration clé
- Avantages de l'architecture
- **CONSULTEZ CECI pour comprendre comment tout fonctionne**

### 5. Guide de Dépannage
📄 **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**
- 10 problèmes courants et leurs solutions
- Diagnostic étape par étape
- Commandes de debug
- Workflow de débogage
- **RÉFÉREZ-VOUS À CECI en cas de problème**

### 6. Changelog
📄 **[CHANGELOG-DEPLOYMENT.md](CHANGELOG-DEPLOYMENT.md)**
- Problème résolu (404)
- Solution implémentée
- Modifications du backend
- Nouveaux scripts de déploiement
- Architecture avant/après
- **LISEZ CECI pour comprendre ce qui a changé**

### 7. Checklist de Déploiement
📄 **[.deployment-checklist](.deployment-checklist)**
- Liste de vérification complète
- Prérequis système
- Étapes de build
- Tests post-déploiement
- Résolution des problèmes
- **UTILISEZ CECI comme guide de référence**

### 8. README Principal
📄 **[README.md](README.md)**
- Vue d'ensemble du projet
- Prérequis d'installation
- Architecture générale
- Instructions de développement et production
- **COMMENCEZ ICI pour une vue d'ensemble**

---

## 🛠️ Scripts de Déploiement

### Script Linux/Mac
📜 **[deploy.sh](deploy.sh)**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Script Windows
📜 **[deploy.bat](deploy.bat)**
```cmd
deploy.bat
```

Ces scripts font:
1. Build du frontend (npm run build)
2. Copie des fichiers vers backend/static
3. Build du backend (mvnw clean package)
4. Affichage des instructions de lancement

---

## 📖 Guide de Navigation

### Je veux juste déployer rapidement
→ **[QUICK-START-PROD.md](QUICK-START-PROD.md)**

### J'ai une erreur 404
→ **[SOLUTION-404.md](SOLUTION-404.md)** puis **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

### Je veux comprendre l'architecture
→ **[ARCHITECTURE-PROD.md](ARCHITECTURE-PROD.md)**

### Je veux un guide complet
→ **[DEPLOYMENT.md](DEPLOYMENT.md)**

### J'ai un problème spécifique
→ **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

### Je veux voir ce qui a changé
→ **[CHANGELOG-DEPLOYMENT.md](CHANGELOG-DEPLOYMENT.md)**

### Je veux une checklist
→ **[.deployment-checklist](.deployment-checklist)**

---

## 🎯 Parcours Recommandés

### Pour un Nouvel Utilisateur
1. **[README.md](README.md)** - Vue d'ensemble
2. **[ARCHITECTURE-PROD.md](ARCHITECTURE-PROD.md)** - Comprendre le système
3. **[QUICK-START-PROD.md](QUICK-START-PROD.md)** - Déployer
4. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - En cas de problème

### Pour Résoudre le 404
1. **[SOLUTION-404.md](SOLUTION-404.md)** - Comprendre le problème
2. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Problème 1
3. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guide complet
4. **[.deployment-checklist](.deployment-checklist)** - Vérifier tout

### Pour un Déploiement en Production
1. **[.deployment-checklist](.deployment-checklist)** - Préparer
2. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Suivre le guide
3. **[QUICK-START-PROD.md](QUICK-START-PROD.md)** - Exécuter
4. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - En backup

---

## 📝 Fichiers Modifiés (Backend)

### Configuration
- `backend/src/main/resources/application-prod.properties`
  - Supprimé: `server.servlet.context-path=/api`

### Contrôleurs
- `backend/src/main/java/com/cosmetovigilance/controller/AuthController.java`
  - Changé: `/auth` → `/api/auth`

- `backend/src/main/java/com/cosmetovigilance/controller/DeclarationController.java`
  - Changé: `/declarations` → `/api/declarations`

- `backend/src/main/java/com/cosmetovigilance/controller/AttachmentController.java`
  - Changé: `/attachments` → `/api/attachments`

- `backend/src/main/java/com/cosmetovigilance/controller/SpaController.java`
  - **NOUVEAU** - Gère les routes frontend

### Configuration Web
- `backend/src/main/java/com/cosmetovigilance/config/WebConfig.java`
  - Ajouté: Configuration des ressources statiques

---

## 🔗 Liens Utiles

| Document | Usage | Temps de Lecture |
|----------|-------|-----------------|
| [SOLUTION-404.md](SOLUTION-404.md) | Comprendre le problème 404 | 5 min |
| [QUICK-START-PROD.md](QUICK-START-PROD.md) | Déployer rapidement | 2 min |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Guide complet | 15 min |
| [ARCHITECTURE-PROD.md](ARCHITECTURE-PROD.md) | Comprendre l'architecture | 10 min |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Résoudre les problèmes | Variable |
| [CHANGELOG-DEPLOYMENT.md](CHANGELOG-DEPLOYMENT.md) | Voir les changements | 7 min |
| [.deployment-checklist](.deployment-checklist) | Checklist de référence | Variable |

---

## ❓ FAQ Rapide

**Q: Comment déployer en production?**
A: `./deploy.sh` puis `cd backend && java -jar target/*.jar --spring.profiles.active=prod`

**Q: J'ai une erreur 404 sur /?**
A: Voir [SOLUTION-404.md](SOLUTION-404.md) et [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problème 1

**Q: Comment accéder à l'application?**
A: http://localhost:8080 (Frontend et API sur le même port)

**Q: Où est l'API?**
A: http://localhost:8080/api/* (toutes les routes API ont le préfixe /api/)

**Q: Les routes React ne fonctionnent pas?**
A: Vérifier que SpaController.java existe et rebuilder le backend

**Q: Comment vérifier que tout fonctionne?**
A: Suivre [.deployment-checklist](.deployment-checklist)

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Consultez **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** pour votre problème spécifique
2. Vérifiez **[.deployment-checklist](.deployment-checklist)** pour les étapes manquées
3. Lisez **[SOLUTION-404.md](SOLUTION-404.md)** si vous avez des erreurs 404
4. Suivez **[DEPLOYMENT.md](DEPLOYMENT.md)** pour un guide complet

---

**Version de la documentation:** 1.0
**Dernière mise à jour:** 2026-02-28
**Statut:** ✅ Complet et testé
