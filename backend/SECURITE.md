# Sécurité - Application Cosmetovigilance

## Chiffrement du Mot de Passe de la Base de Données

### Configuration Actuelle

Le mot de passe de la base de données MySQL est chiffré avec **Jasypt** et l'algorithme **AES-256** (PBEWITHHMACSHA512ANDAES_256).

### Démarrage Rapide

Pour démarrer l'application avec le mot de passe chiffré :

**Windows :**
```cmd
set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
java -jar target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=local
```

**Linux/Mac :**
```bash
export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
java -jar target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=local
```

> **IMPORTANT** : Sans la variable `JASYPT_ENCRYPTOR_PASSWORD`, l'application ne pourra pas déchiffrer le mot de passe et ne démarrera pas.

### Documentation Complète

Consultez [CHIFFREMENT-PASSWORD.md](CHIFFREMENT-PASSWORD.md) pour :
- Instructions détaillées de configuration
- Guide de génération de nouveaux mots de passe chiffrés
- Recommandations de sécurité pour la production
- Dépannage des problèmes courants

## Autres Aspects de Sécurité

### JWT (JSON Web Tokens)

L'application utilise JWT pour l'authentification. La clé secrète JWT est configurée dans les fichiers de properties.

**Recommandation Production :** Changez la clé JWT et utilisez une variable d'environnement :
```properties
jwt.secret=${JWT_SECRET:valeur_par_defaut}
```

### CORS (Cross-Origin Resource Sharing)

La configuration CORS varie selon l'environnement :
- **local** : Localhost uniquement
- **vm** : Réseau local autorisé
- **prod** : Domaines spécifiques via variables d'environnement

### Content Security Policy (CSP)

Headers de sécurité configurés via `SecurityHeadersConfig.java` :
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Content-Security-Policy

### Uploads de Fichiers

- Taille maximale : 10MB
- Répertoire : `./uploads` (configurable)
- Types autorisés : PDF uniquement

### Base de Données

#### Validation des Migrations

L'application utilise Flyway avec `ddl-auto=validate` pour garantir que le schéma de base de données correspond exactement aux migrations.

#### Connexions Sécurisées

En production, activez SSL pour les connexions MySQL :
```properties
spring.datasource.url=jdbc:mysql://host:3306/db?useSSL=true&requireSSL=true
```

## Bonnes Pratiques de Sécurité

### En Développement

1. Utilisez les profils appropriés (`local`, `vm`, `prod`)
2. Ne commitez jamais les clés de chiffrement dans Git
3. Testez avec le mot de passe chiffré avant le déploiement

### En Production

1. **Changez toutes les clés secrètes** :
   - Clé Jasypt (`JASYPT_ENCRYPTOR_PASSWORD`)
   - Clé JWT (`JWT_SECRET`)

2. **Utilisez des variables d'environnement** pour toutes les informations sensibles

3. **Activez HTTPS uniquement** :
   ```properties
   server.ssl.enabled=true
   server.ssl.key-store=classpath:keystore.p12
   server.ssl.key-store-password=${KEYSTORE_PASSWORD}
   ```

4. **Limitez les permissions** :
   ```bash
   chmod 600 application-prod.properties
   chown appuser:appuser application-prod.properties
   ```

5. **Monitoring et Logs** :
   - Activez les actuators Spring Boot pour le monitoring
   - Configurez des alertes pour les tentatives de connexion échouées
   - Ne loguez JAMAIS les mots de passe ou tokens

6. **Mettez à jour régulièrement** :
   - Dépendances Maven
   - Version de Spring Boot
   - Driver MySQL

## Audit de Sécurité

### Vérification de la Configuration

```bash
# Vérifier que les mots de passe sont chiffrés
grep "password=ENC" src/main/resources/application*.properties

# Vérifier qu'aucun mot de passe en clair n'est présent
grep "password=" src/main/resources/application*.properties | grep -v "ENC"
```

### Tests de Sécurité

1. **Test d'authentification** : Vérifier que tous les endpoints sont protégés
2. **Test CORS** : Vérifier que seules les origines autorisées peuvent accéder à l'API
3. **Test de validation** : Vérifier la validation des entrées utilisateur
4. **Test d'upload** : Vérifier les restrictions de taille et de type de fichier

## Support et Contact

Pour toute question de sécurité, consultez d'abord :
- [CHIFFREMENT-PASSWORD.md](CHIFFREMENT-PASSWORD.md) - Chiffrement du mot de passe DB
- [README.md](README.md) - Documentation générale du projet

## Changelog de Sécurité

### Version 1.0.0
- Implémentation du chiffrement Jasypt pour les mots de passe DB
- Configuration de CORS restrictive par environnement
- Headers de sécurité HTTP
- Authentification JWT
- Validation Flyway stricte
