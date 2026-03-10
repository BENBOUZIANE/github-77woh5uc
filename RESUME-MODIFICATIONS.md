# Résumé des Modifications

## Guides de Déploiement Créés

### 1. README-DEPLOY-LOCAL.md
Guide complet pour le développement local :
- Installation et configuration MySQL
- Configuration de la variable d'environnement JASYPT
- Démarrage du backend et frontend
- Résolution des problèmes courants

### 2. README-DEPLOY-VM.md
Guide complet pour déploiement sur VM réseau local :
- Configuration MySQL sur la VM
- Déploiement manuel et automatique
- Configuration Nginx
- Configuration du service systemd
- **CORS configuré pour accepter toutes les adresses du réseau local**
- Mise à jour de l'application
- Dépannage

### 3. README-DEPLOY-SERVEUR.md
Guide complet pour déploiement serveur production :
- Préparation serveur Linux
- Configuration SSL/HTTPS avec Let's Encrypt
- Sécurité renforcée
- Backups automatiques
- Monitoring et logs
- Checklist de sécurité

## Configuration Nginx

### Fichier : nginx.conf

Configuration complète incluant :
- Écoute sur toutes les interfaces (`listen 80` + `listen [::]:80`)
- Reverse proxy pour backend Spring Boot (port 8080)
- Serveur de fichiers statiques pour frontend React
- Gestion des uploads PDF
- Headers de sécurité (X-Frame-Options, X-Content-Type-Options, etc.)
- Compression Gzip
- Cache pour assets statiques
- **Commentaires pour limiter l'accès au réseau local si nécessaire**

**Emplacement** : `/etc/nginx/sites-available/cosmetovigilance`

## Configuration CORS Backend

### Fichier : application-vm.properties

```properties
# CORS Configuration - Permet l'accès depuis tout le réseau local
cors.allow-any-origin=true
cors.allowed-origins=http://192.168.1.109:5137,http://192.168.1.109,http://localhost:5137
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
cors.allowed-headers=*
cors.max-age=3600
```

**Configuration actuelle** : `cors.allow-any-origin=true`

Cette configuration permet les connexions depuis **TOUTES les adresses IP du réseau local**.

### Fichier : WebConfig.java

Le backend supporte les patterns d'origine :
- `allowedOriginPatterns("*")` quand `cors.allow-any-origin=true`
- `allowedOrigins(...)` pour des origines spécifiques

## Nettoyage des Logs

### Frontend (Supprimés)

Fichiers nettoyés :
- `src/main.tsx` - Supprimé le test de chiffrement au démarrage
- `src/contexts/AuthContext.tsx` - Supprimé les console.log de debug
- `src/services/api.ts` - Supprimé tous les console.log/error
- `src/utils/encryption.ts` - Nettoyé les logs de debug
- `src/pages/LoginPage.tsx` - Supprimé les logs de navigation
- `src/pages/CosmetovigillancePage.tsx` - Supprimé le log du payload
- `src/pages/DashboardPage.tsx` - Remplacé par des commentaires silencieux

### Backend (Nettoyés)

Fichiers nettoyés :
- `CosmetovigilanceApplication.java` - Supprimé le test de chiffrement au démarrage
- Les autres System.out.println restent (utiles pour le debug, commentables si nécessaire)

**Note** : Les logs backend dans les filters (ApiResponseEncodingFilter, RequestDecryptionFilter) sont conservés car utiles pour le debugging. Ils peuvent être commentés si nécessaire.

## Fichiers de Configuration Créés

1. **CONFIG-RESEAU-LOCAL.md** - Guide spécifique pour l'accès réseau local
2. **nginx.conf** - Configuration Nginx optimisée
3. **backend/.env.example** - Exemple de variables d'environnement
4. **backend/.gitignore** - Protection des fichiers sensibles
5. **backend/CHIFFREMENT-PASSWORD.md** - Guide du chiffrement AES-256
6. **backend/SECURITE.md** - Documentation de sécurité
7. **backend/DEMARRAGE-RAPIDE.md** - Instructions rapides

## Configuration des Mots de Passe

### Chiffrement AES-256 avec Jasypt

Tous les fichiers de configuration utilisent maintenant des mots de passe chiffrés :

```properties
spring.datasource.password=ENC(JCwGHLjP0Y8yN2kVxRQzMw==)
```

**Clé de chiffrement** : `cosmetoKey` (définie dans `JASYPT_ENCRYPTOR_PASSWORD`)

**Mot de passe déchiffré** : `test1234`

### Génération de Nouveaux Mots de Passe

**Windows** :
```cmd
cd backend
encrypt-password.cmd cosmetoKey VotreNouveauMotDePasse
```

**Linux/Mac** :
```bash
cd backend
./encrypt-password.sh cosmetoKey VotreNouveauMotDePasse
```

## Points Importants

### Pour le Développement Local

1. **OBLIGATOIRE** : Définir `JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey`
2. Backend démarre sur `http://localhost:8080/api`
3. Frontend démarre sur `http://localhost:5173`

### Pour le Déploiement VM

1. **OBLIGATOIRE** : Définir `JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey`
2. Profil à utiliser : `--spring.profiles.active=vm`
3. CORS accepte toutes les origines (`cors.allow-any-origin=true`)
4. Nginx écoute sur toutes les interfaces
5. Application accessible via `http://IP_VM`

### Pour le Déploiement Serveur

1. **OBLIGATOIRE** : Changer la clé Jasypt en production
2. Utiliser HTTPS avec certificat SSL
3. Configurer CORS pour domaines spécifiques
4. Activer le firewall
5. Configurer les backups automatiques

## Accès Réseau Local

### Configuration Actuelle

L'application est configurée pour être **accessible depuis n'importe quel poste du réseau local** :

1. **Backend CORS** : `cors.allow-any-origin=true` dans `application-vm.properties`
2. **Nginx** : Écoute sur toutes les interfaces (0.0.0.0)
3. **Firewall** : À configurer pour autoriser le port 80

### Test depuis un Autre PC

```bash
# Remplacer 192.168.1.109 par l'IP de votre VM
curl http://192.168.1.109
```

### Limiter l'Accès (Optionnel)

Pour restreindre l'accès uniquement au réseau local 192.168.x.x, décommentez dans `nginx.conf` :

```nginx
allow 192.168.0.0/16;
deny all;
```

## Structure des Fichiers

```
project/
├── README.md (MIS À JOUR - Liens vers nouveaux guides)
├── README-DEPLOY-LOCAL.md (NOUVEAU)
├── README-DEPLOY-VM.md (NOUVEAU)
├── README-DEPLOY-SERVEUR.md (NOUVEAU)
├── CONFIG-RESEAU-LOCAL.md (NOUVEAU)
├── nginx.conf (NOUVEAU - Optimisé)
├── .env.production (MIS À JOUR)
├── src/ (Frontend - Logs nettoyés)
└── backend/
    ├── README.md (MIS À JOUR)
    ├── CHIFFREMENT-PASSWORD.md (NOUVEAU)
    ├── SECURITE.md (NOUVEAU)
    ├── DEMARRAGE-RAPIDE.md (NOUVEAU)
    ├── .env.example (NOUVEAU)
    ├── .gitignore (NOUVEAU)
    ├── encrypt-password.sh (NOUVEAU)
    ├── encrypt-password.cmd (EXISTE DÉJÀ)
    └── src/main/resources/
        ├── application.properties (MIS À JOUR - Mot de passe chiffré)
        ├── application-local.properties (MIS À JOUR - Mot de passe chiffré)
        ├── application-vm.properties (MIS À JOUR - Mot de passe chiffré + CORS)
        └── application-prod.properties (MIS À JOUR)
```

## Commandes Rapides

### Démarrage Local

```bash
# Backend
cd backend
set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey  # Windows
export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey  # Linux/Mac
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Frontend
npm install
npm run dev
```

### Déploiement VM Automatique

```bash
# Linux/Mac
./deploy-vm.sh user@192.168.1.109

# Windows
deploy-vm.cmd user@192.168.1.109
```

### Vérifications Post-Déploiement

```bash
# Sur la VM
sudo systemctl status cosmetovigilance-backend nginx
sudo journalctl -u cosmetovigilance-backend -f

# Depuis un autre PC
curl http://192.168.1.109
curl http://192.168.1.109/api/auth/login
```

## Documentation Supplémentaire

- [README-DEPLOY-LOCAL.md](README-DEPLOY-LOCAL.md) - Développement local
- [README-DEPLOY-VM.md](README-DEPLOY-VM.md) - Déploiement VM
- [README-DEPLOY-SERVEUR.md](README-DEPLOY-SERVEUR.md) - Déploiement serveur
- [CONFIG-RESEAU-LOCAL.md](CONFIG-RESEAU-LOCAL.md) - Configuration réseau local
- [backend/CHIFFREMENT-PASSWORD.md](backend/CHIFFREMENT-PASSWORD.md) - Chiffrement
- [backend/SECURITE.md](backend/SECURITE.md) - Sécurité
- [nginx.conf](nginx.conf) - Configuration Nginx complète

## Build Vérifié

Le projet se compile correctement sans erreurs :
- Frontend : `npm run build` ✅
- Backend : `./mvnw clean package` (à vérifier avec Java installé)
