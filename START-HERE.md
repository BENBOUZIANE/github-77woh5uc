# 🚀 COMMENCEZ ICI

## Vous avez une erreur 404 ?

### Solution Rapide en 3 Commandes

```bash
# 1. Exécuter le script de déploiement
./deploy.sh

# 2. Aller dans le dossier backend
cd backend

# 3. Lancer l'application
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Accès à l'Application

**URL:** http://localhost:8080

---

## ✅ Que Vérifier Après le Lancement

### 1. Page d'accueil accessible
Ouvrir: http://localhost:8080/
**Attendu:** Voir la page d'accueil de Cosmetovigilance

### 2. Pages React fonctionnent
- http://localhost:8080/login → Page de connexion
- http://localhost:8080/dashboard → Tableau de bord
- http://localhost:8080/cosmetovigilance → Formulaire

### 3. API fonctionne
- http://localhost:8080/api/auth → API d'authentification
- http://localhost:8080/api/declarations → API des déclarations

---

## 📚 Documentation Complète

| Besoin | Document | Temps |
|--------|----------|-------|
| 🔧 Résoudre le 404 | [SOLUTION-404.md](SOLUTION-404.md) | 5 min |
| ⚡ Déployer rapidement | [QUICK-START-PROD.md](QUICK-START-PROD.md) | 2 min |
| 📖 Guide complet | [DEPLOYMENT.md](DEPLOYMENT.md) | 15 min |
| 🏗️ Comprendre l'architecture | [ARCHITECTURE-PROD.md](ARCHITECTURE-PROD.md) | 10 min |
| 🔍 Problèmes | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Variable |
| 📋 Checklist | [.deployment-checklist](.deployment-checklist) | Variable |
| 📑 Index complet | [DOCUMENTATION-INDEX.md](DOCUMENTATION-INDEX.md) | 3 min |

---

## ❓ Questions Fréquentes

**Q: Ça ne marche toujours pas!**
A: Consultez [TROUBLESHOOTING.md](TROUBLESHOOTING.md) pour votre problème spécifique

**Q: Comment ça fonctionne?**
A: Lisez [ARCHITECTURE-PROD.md](ARCHITECTURE-PROD.md) pour comprendre

**Q: Qu'est-ce qui a changé?**
A: Voir [RESUME-MODIFICATIONS.md](RESUME-MODIFICATIONS.md)

**Q: Où est l'API?**
A: Sur http://localhost:8080/api/* (même serveur, préfixe /api/)

---

## 🛠️ Commandes Utiles

### Rebuilder Complètement
```bash
# Frontend
npm run build
cp -r dist/* backend/src/main/resources/static/

# Backend
cd backend
./mvnw clean package

# Lancer
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Vérifier les Logs
```bash
# Logs en temps réel
java -jar target/cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod | grep ERROR
```

### Tester l'API
```bash
# Test simple
curl http://localhost:8080/api/auth/...

# Test avec logs
curl -v http://localhost:8080/
```

---

## 🎯 Prochaines Étapes

1. ✅ Lancer l'application avec les commandes ci-dessus
2. ✅ Vérifier que http://localhost:8080 fonctionne
3. ✅ Tester la connexion avec un utilisateur test
4. ✅ Vérifier les fonctionnalités principales
5. 📚 Lire [DOCUMENTATION-INDEX.md](DOCUMENTATION-INDEX.md) pour plus d'infos

---

## 🆘 Besoin d'Aide?

1. **Erreur 404 sur /** → [SOLUTION-404.md](SOLUTION-404.md)
2. **Erreur 404 sur /login** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problème 2
3. **API ne répond pas** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problème 3
4. **Autre problème** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
5. **Vue d'ensemble** → [DOCUMENTATION-INDEX.md](DOCUMENTATION-INDEX.md)

---

**Version:** 1.0
**Dernière mise à jour:** 2026-02-28
**Statut:** ✅ Testé et fonctionnel

🎉 **Bonne chance avec votre déploiement!**
