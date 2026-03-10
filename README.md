# Application Cosmetovigilance

Application web pour la gestion des déclarations de cosmétovigilance.

## Stack

- **Frontend** : React + TypeScript + Vite
- **Backend** : Spring Boot (Java 17)
- **Base de données** : MySQL 8

---

## Quel environnement utiliser ?

| Environnement | Fichier de config backend | Frontend | Serveur | Guide |
|---------------|---------------------------|----------|---------|--------|
| **Tests locaux** (votre PC) | `application-local.properties` | Vite (port 5137) | — | [README-LOCAL.md](README-LOCAL.md) |
| **VM / réseau local** (Windows) | `application-vm.properties` | Build + Nginx | Windows + Nginx | [README-VM.md](README-VM.md) |
| **Production** (Linux) | `application-prod.properties` | Build + Nginx | Linux + Nginx | [README-PROD.md](README-PROD.md) |

---

## Démarrage rapide (local, Windows)

1. Copier la config frontend : créer **`.env.local`** (voir `.env.example` pour les variables) pour le dev local.
2. Configurer la base dans `backend/src/main/resources/application-local.properties`
3. **Backend** : `cd backend && mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local`
4. **Frontend** : `npm install && npm run dev` → http://localhost:5137

Détails et dépannage : [README-LOCAL.md](README-LOCAL.md).

---

## Structure du projet

```
project/
├── backend/                          # Spring Boot
│   ├── src/main/resources/
│   │   ├── application.properties    # Config par défaut
│   │   ├── application-local.properties   # Profil local
│   │   ├── application-vm.properties      # Profil VM / réseau
│   │   └── application-prod.properties    # Profil production
│   └── pom.xml
├── src/                              # React (Vite)
├── public/
├── .env.example                      # Modèle config front (port, API, CSP)
├── README-LOCAL.md                   # Guide démarrage local
├── README-VM.md                      # Guide VM / réseau (Windows + Nginx)
├── README-PROD.md                   # Guide production (Linux + Nginx)
└── SECURITY-SETUP.md                # (supprimé ; voir en-têtes dans nginx-security-headers.conf)
```

---

## Prérequis communs

- **Node.js** 18+
- **Java JDK** 17+
- **Maven** 3.8+
- **MySQL** 8+

Pour Nginx (VM / prod) : voir les README dédiés.

---

## Documentation

### Guides de Déploiement (NOUVEAUX - Complets)
- **[README-DEPLOY-LOCAL.md](README-DEPLOY-LOCAL.md)** — Développement local (votre PC)
- **[README-DEPLOY-VM.md](README-DEPLOY-VM.md)** — Déploiement sur VM réseau local avec Nginx
- **[README-DEPLOY-SERVEUR.md](README-DEPLOY-SERVEUR.md)** — Déploiement serveur production avec HTTPS

### Guides Techniques
- [README-LOCAL.md](README-LOCAL.md) — Configuration locale détaillée
- [README-VM.md](README-VM.md) — Configuration VM Windows/Nginx
- [README-PROD.md](README-PROD.md) — Configuration production Linux
- [backend/README.md](backend/README.md) — Documentation API backend
- [backend/CHIFFREMENT-PASSWORD.md](backend/CHIFFREMENT-PASSWORD.md) — Chiffrement AES-256
- [backend/SECURITE.md](backend/SECURITE.md) — Sécurité et bonnes pratiques
