# Guide de Chiffrement des Données Frontend-Backend

## Vue d'ensemble

Ce système chiffre automatiquement **TOUTES** les données entre le frontend (React) et le backend (Spring Boot) avec AES-256 :
- ✅ **Requêtes** : Frontend → Backend (POST/PATCH)
- ✅ **Réponses** : Backend → Frontend (toutes les réponses JSON)

Lorsque vous inspectez le network dans les DevTools du navigateur, vous verrez uniquement des données chiffrées au lieu du JSON en clair.

## Architecture

```
Frontend (React)                    Backend (Spring Boot)
  ↓ (chiffre les données avec AES)     ↑ (chiffre les réponses avec AES)
  { "e": "donneesChiffrees..." } ←→ { "e": "reponseChiffree..." }
  ↓ (HTTP POST/PATCH)                  ↓ (HTTP Response)
  ↓ (reçoit réponse chiffrée)          ↓ (envoie réponse chiffrée)
  ↓ (déchiffre automatiquement)        ↓ (déchiffre automatiquement)
  { "email": "user@example.com" } ←→ { "data": {...}, "message": "..." }
  ↓                                     ↓
Contrôleur REST ←─────────────────→ Services métier
```

## Installation

### 1. Frontend (React/TypeScript) ✅ DÉJÀ FAIT

**Dépendances:**
```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
```

**Fichiers créés:**
- `src/utils/encryption.ts` - Module de chiffrement AES

**Modifications:**
- `src/services/api.ts` - Chiffre automatiquement les requêtes POST/PATCH

### 2. Backend (Spring Boot) ✅ DÉJÀ FAIT

**Fichiers créés:**
- `backend/src/main/java/com/cosmetovigilance/util/AesEncryptionUtil.java` - Utilitaire de déchiffrement
- `backend/src/main/java/com/cosmetovigilance/config/RequestDecryptionFilter.java` - Filtre qui déchiffre les requêtes
- `backend/src/main/java/com/cosmetovigilance/config/BufferingRequestWrapper.java` - Wrapper pour relire le body

**Configuration:**
- Mise à jour de `application.properties`, `application-local.properties`, `application-vm.properties`, `application-prod.properties`

## Configuration de la Clé AES

### ⚠️ IMPORTANT: La clé DOIT être identique côté frontend ET backend

La clé peut être fournie :

- **Frontend** via une variable d'environnement VITE_ENCRYPTION_KEY (fichier `.env`).
- **Backend** via `app.encryption.key` dans `application-*.properties` ou variable d'environnement `ENCRYPTION_KEY`.

Par défaut, la clé de secours est :
```
Qf1ZkB8yLp0DxT3vSnM6Hr4cWuPaY9gE
```

### Générer une clé AES-256 sécurisée

**Linux/Mac:**
```bash
openssl rand -base64 24 | head -c 32
```

**Windows (PowerShell):**
```powershell
$randomBytes = [System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(24)
[Convert]::ToBase64String($randomBytes).Substring(0, 32)
```

### Changer la clé

1. **Frontend** - Modifier `src/utils/encryption.ts`:
```typescript
const ENCRYPTION_KEY = 'VOTRE-CLE-32-CARACTERES-ICI!!';
```

2. **Backend** - Modifier les fichiers `application-*.properties`:
```properties
app.encryption.key=VOTRE-CLE-32-CARACTERES-ICI!!
```

## Déploiement

### Développement Local
- Clé: `your-32-char-secret-key-here!!`
- Activé par défaut

### Production
**⚠️ IMPORTANT:** En production, utilisez des variables d'environnement:

1. **Frontend .env:**
```
VITE_ENCRYPTION_KEY=votre-clé-secrète-32-caractères
```

2. **Backend (variable d'environnement):**
```bash
export ENCRYPTION_KEY="votre-clé-secrète-32-caractères"
java -jar cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=prod
```

Ou via Docker:
```dockerfile
ENV ENCRYPTION_KEY="votre-clé-secrète-32-caractères"
```

## Vérification dans le Network Inspector

### Requêtes (Frontend → Backend)
```json
// AVANT (visible en clair)
{
  "email": "user@example.com",
  "password": "monMotDePasse123"
}

// APRÈS (chiffré)
{
  "e": "U2FsdGVkX1/...longeStringChiffrée...=="
}
```

### Réponses (Backend → Frontend)
```json
// AVANT (visible en clair)
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "user": { "id": "123", "email": "user@example.com" }
  },
  "message": "Login successful"
}

// APRÈS (chiffré)
{
  "e": "U2FsdGVkX1/...autreStringChiffrée...=="
}
```

## Endpoints affectés

Toutes les requêtes **POST/PATCH** reçoivent des données chiffrées :

- `POST /auth/login` ✅
- `POST /auth/register` ✅
- `POST /declarations` ✅
- `PATCH /declarations/{id}/statut` ✅
- `PATCH /declarations/{id}/commentaire-anmps` ✅
- Tous les autres POST/PATCH ✅

Toutes les **réponses JSON** sont chiffrées :

- `GET /auth/me` ✅
- `GET /declarations` ✅
- `GET /declarations/{id}` ✅
- `POST /auth/login` ✅
- `POST /auth/register` ✅
- Toutes les autres réponses JSON ✅

## Dépannage

### Erreur: "Erreur lors du déchiffrement"
- Vérifiez que la clé est identique côté frontend ET backend- **Assurez-vous que le front utilise la clé comme clé brute**, pas comme passphrase.
  CryptoJS doit recevoir `CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY)` ; sinon le
  backend ne pourra pas déchiffrer (erreur « final block not properly padded »).- Vérifiez que le payload commence par `{ "e": "..." }`
- Vérifiez les logs du serveur: `tail -f /var/log/cosmetovigilance/application.log`

### Les requêtes ne sont pas chiffrées
- Vérifiez que l'en-tête `X-Request-Encrypted: true` est présent
- Vérifiez que `app.encryption.key` est configurée correctement

### Performance
- AES est très rapide (< 1ms pour la plupart des payloads)
- Le chiffrement côté frontend n'impacte pas les performances

## Sécurité supplémentaire

Pour encore plus de sécurité:

1. **Utilisez HTTPS en production** (obligatoire)
2. **Renouvelez la clé régulièrement** (tous les 6-12 mois)
3. **Stockez la clé dans un gestionnaire de secrets** (Vault, AWS Secrets Manager, etc.)
4. **Ne commettez JAMAIS la clé en clair** dans Git (utilisez .gitignore)

## Support

Pour plus d'informations sur AES:
- [OWASP Encryption Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Encryption_Cheat_Sheet.html)
- [MDN Web Docs - Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
