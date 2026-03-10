# Guide de Test du Chiffrement Bidirectionnel AES

## Vue d'ensemble
Le système implémente maintenant un chiffrement AES-256 bidirectionnel entre le frontend React et le backend Spring Boot. Toutes les requêtes et réponses API sont chiffrées pour protéger les données sensibles dans l'inspecteur réseau.

## Configuration
- **Algorithme**: AES-256 avec mode ECB et padding PKCS7
- **Clé**: 32 caractères partagée entre frontend et backend
- **Bibliothèques**: CryptoJS (frontend), Java AES (backend)

## Tests Automatisés

### 1. Tests de Chiffrement dans le Frontend
Sur la page de connexion, cliquez sur les boutons de test :
- **"Test Chiffrement"**: Teste le chiffrement/déchiffrement basique
- **"Test Réponses"**: Teste le chiffrement des réponses API simulées

Les résultats s'affichent dans la console du navigateur (F12 → Console).

### 2. Test Manuel du Flux Complet

#### Démarrage des Serveurs
```bash
# Terminal 1: Backend Spring Boot
cd backend
./mvnw spring-boot:run

# Terminal 2: Frontend React
npm run dev
```

#### Test de l'Authentification
1. Ouvrez http://localhost:5173
2. Ouvrez l'inspecteur réseau (F12 → Network)
3. Essayez de vous connecter avec des identifiants valides
4. Vérifiez que :
   - La requête POST vers `/api/auth/login` contient des données chiffrées
   - La réponse contient aussi des données chiffrées
   - Aucun JSON lisible n'est visible dans l'inspecteur

#### Test d'une API Protégée
1. Connectez-vous avec succès
2. Naviguez vers le tableau de bord
3. Ouvrez l'inspecteur réseau
4. Vérifiez que toutes les requêtes API sont chiffrées

## Validation du Chiffrement

### Dans l'Inspecteur Réseau
- **Avant chiffrement**: JSON visible comme `{"email":"user@example.com","password":"secret"}`
- **Après chiffrement**: Données chiffrées comme `U2FsdGVkX1+...` (texte encodé en base64)

### Headers Importants
- **Requêtes**: `X-Request-Encrypted: true`
- **Réponses**: `X-Response-Encrypted: true`

## Dépannage

### Erreur de déchiffrement
Si vous voyez des erreurs de déchiffrement :
1. Vérifiez que la clé AES est identique dans tous les fichiers de configuration
2. Vérifiez les logs du backend pour les erreurs de déchiffrement
3. Testez avec les boutons de test dans la page de connexion

### Clé de chiffrement
La clé est configurée dans :
- `backend/src/main/resources/application*.properties` : `app.encryption.key`
- `src/utils/encryption.ts` : `ENCRYPTION_KEY`

### Logs Utiles
- Backend: Cherchez les logs de `RequestDecryptionFilter` et `ApiResponseEncodingFilter`
- Frontend: Console du navigateur pour les tests de chiffrement

## Points de Test

### ✅ Tests Réussis
- [ ] Chiffrement des requêtes fonctionne
- [ ] Chiffrement des réponses fonctionne
- [ ] Authentification fonctionne avec données chiffrées
- [ ] Aucune donnée JSON visible dans l'inspecteur réseau
- [ ] Tests automatisés passent

### 🔧 Configuration Vérifiée
- [ ] Clé AES identique frontend/backend
- [ ] `app.api.encrypt-responses=true` dans toutes les configs
- [ ] Filtres Spring activés
- [ ] Headers de chiffrement présents

## Sécurité
- Les mots de passe sont hashés avec BCrypt (pas seulement chiffrés)
- Le JWT reste en texte clair pour l'authentification
- Seules les données JSON du body sont chiffrées