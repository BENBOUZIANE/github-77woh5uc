# Plateforme de Cosmétovigilance ANMPS

Application web pour la déclaration et la gestion des effets indésirables liés aux produits cosmétiques au Maroc.

## Documentation

### Guides de Déploiement
- **[README-DEPLOY-LOCAL.md](README-DEPLOY-LOCAL.md)** - Développement en local (votre PC)
- **[README-DEPLOY-VM.md](README-DEPLOY-VM.md)** - Déploiement sur VM réseau local
- **[README-DEPLOY-SERVEUR.md](README-DEPLOY-SERVEUR.md)** - Déploiement serveur production

### Documentation Technique
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture et outils utilisés
- **[ENCRYPTION_GUIDE.md](ENCRYPTION_GUIDE.md)** - Chiffrement AES-256 (frontend et backend)

## Démarrage Rapide Local

### Prérequis
- Node.js 18+
- Java 17+
- Maven 3.8+
- MySQL 8.0+

### Installation

1. **Démarrer MySQL** et créer la base de données `cosmetovigilance`

2. **Configurer la variable d'environnement OBLIGATOIRE** :
   ```bash
   # Windows
   set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey

   # Linux/Mac
   export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
   ```

3. **Démarrer le Backend** :
   ```bash
   cd backend
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
   ```
   Le backend démarre sur `http://localhost:8080/api`

4. **Démarrer le Frontend** :
   ```bash
   npm install
   npm run dev
   ```
   Le frontend s'ouvre sur `http://localhost:5173`

Pour plus de détails, consultez [README-DEPLOY-LOCAL.md](README-DEPLOY-LOCAL.md)

## Architecture

```
Frontend (React + TypeScript + Vite)
           ↓
    Chiffrement AES-256
           ↓
Backend (Spring Boot + JWT + AES)
           ↓
    MySQL 8.0 (mot de passe chiffré Jasypt)
```

Consultez [ARCHITECTURE.md](ARCHITECTURE.md) pour plus de détails.

## Sécurité

- **Chiffrement AES-256** des communications frontend ↔ backend
- **Jasypt** pour le chiffrement des mots de passe de base de données
- **JWT** pour l'authentification des utilisateurs
- **HTTPS** en production avec certificats SSL

Consultez [ENCRYPTION_GUIDE.md](ENCRYPTION_GUIDE.md) pour comprendre le chiffrement.
