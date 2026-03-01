# Guide de Chiffrement du Mot de Passe de Base de Données

## Vue d'ensemble

Le mot de passe de la base de données est désormais chiffré avec **Jasypt** utilisant l'algorithme **PBEWITHHMACSHA512ANDAES_256** (AES-256).

## Configuration Actuelle

Le mot de passe `test1234` est déjà chiffré dans tous les fichiers de configuration :

- `application.properties`
- `application-local.properties`
- `application-vm.properties`

Format : `spring.datasource.password=ENC(JCwGHLjP0Y8yN2kVxRQzMw==)`

## Démarrage de l'Application

### Variable d'Environnement Requise

Pour que l'application puisse déchiffrer le mot de passe au démarrage, vous **DEVEZ** définir la variable d'environnement :

```bash
JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
```

### Windows

#### Option 1 : Variable d'environnement temporaire
```cmd
set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
java -jar target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=local
```

#### Option 2 : Avec le JAR
```cmd
set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
java -jar cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=vm
```

#### Option 3 : Variable d'environnement système permanente
1. Ouvrir "Paramètres système avancés"
2. Cliquer sur "Variables d'environnement"
3. Ajouter une nouvelle variable système :
   - Nom : `JASYPT_ENCRYPTOR_PASSWORD`
   - Valeur : `cosmetoKey`

### Linux/Mac

#### Option 1 : Variable d'environnement temporaire
```bash
export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
java -jar target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=local
```

#### Option 2 : En une seule ligne
```bash
JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey java -jar target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=vm
```

#### Option 3 : Variable d'environnement permanente
Ajouter dans `~/.bashrc` ou `~/.zshrc` :
```bash
export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
```

Puis recharger :
```bash
source ~/.bashrc
```

## Générer un Nouveau Mot de Passe Chiffré

Si vous souhaitez utiliser un mot de passe différent ou une clé de chiffrement différente :

### Windows

```cmd
encrypt-password.cmd <cle_jasypt> <mot_de_passe_db>
```

Exemple :
```cmd
encrypt-password.cmd maCleSecrete monNouveauPassword
```

### Linux/Mac

```bash
./mvnw compile exec:java -Dexec.mainClass=com.cosmetovigilance.util.EncryptPasswordUtil -Dexec.args="maCleSecrete monNouveauPassword"
```

### Résultat

Le script affichera :
```
spring.datasource.password=ENC(xxxxxxxxxxxxxxxxxx)
Au demarrage : JASYPT_ENCRYPTOR_PASSWORD=maCleSecrete
```

Copiez la valeur `ENC(...)` dans votre fichier de configuration et n'oubliez pas de mettre à jour la variable d'environnement.

## Sécurité

### Recommandations de Production

1. **Changez la clé de chiffrement** : N'utilisez PAS `cosmetoKey` en production !

2. **Utilisez une clé forte** : Minimum 32 caractères avec des caractères spéciaux
   ```
   Exemple : My$ecur3K3y!2024@Pr0duct10n#C0sm3t0
   ```

3. **Stockez la clé de manière sécurisée** :
   - **Serveurs Linux** : Variables d'environnement système ou gestionnaire de secrets (HashiCorp Vault, AWS Secrets Manager)
   - **Cloud** : Utiliser les services de gestion des secrets du cloud provider
   - **Ne jamais** commiter la clé dans Git

4. **Fichier .env** : Pour le développement local, créez un fichier `.env` (déjà dans `.gitignore`) :
   ```bash
   JASYPT_ENCRYPTOR_PASSWORD=votreClé
   ```

5. **Permissions** : Limitez l'accès aux fichiers de configuration
   ```bash
   chmod 600 application.properties
   ```

### Rotation des Mots de Passe

Pour changer le mot de passe de la base de données :

1. Changer le mot de passe MySQL
2. Générer un nouveau mot de passe chiffré avec le script
3. Mettre à jour les fichiers de configuration
4. Redémarrer l'application

## Architecture du Système de Chiffrement

### Fichiers Impliqués

1. **`EncryptPasswordUtil.java`** : Utilitaire de chiffrement
2. **`JasyptDecryptor.java`** : Classe de déchiffrement
3. **`DecryptDataSourcePasswordPostProcessor.java`** : Déchiffre automatiquement au démarrage
4. **`encrypt-password.cmd`** : Script Windows pour générer les mots de passe chiffrés

### Algorithme

- **Algorithme** : PBEWITHHMACSHA512ANDAES_256
- **Key Derivation** : PBKDF2 avec HMAC-SHA512
- **Chiffrement** : AES-256 en mode CBC
- **Iterations** : 1000 (par défaut Jasypt)

### Flux de Déchiffrement

1. Application démarre
2. `DecryptDataSourcePasswordPostProcessor` est exécuté
3. Détecte le format `ENC(...)`
4. Récupère `JASYPT_ENCRYPTOR_PASSWORD` depuis l'environnement
5. Déchiffre le mot de passe
6. Remplace la propriété avant l'initialisation de la connexion DB

## Dépannage

### Erreur : "Impossible de déchiffrer spring.datasource.password"

**Cause** : La variable d'environnement `JASYPT_ENCRYPTOR_PASSWORD` n'est pas définie ou incorrecte.

**Solution** :
```bash
# Vérifier si la variable est définie
echo $JASYPT_ENCRYPTOR_PASSWORD  # Linux/Mac
echo %JASYPT_ENCRYPTOR_PASSWORD% # Windows

# La définir correctement
export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey  # Linux/Mac
set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey     # Windows
```

### Erreur : "Access denied for user"

**Cause** : Le mot de passe chiffré ne correspond pas au mot de passe réel de MySQL.

**Solution** :
1. Vérifier le mot de passe MySQL
2. Régénérer le mot de passe chiffré
3. Mettre à jour la configuration

### L'application ne démarre pas

**Cause** : Fichier de configuration corrompu ou erreur de syntaxe.

**Solution** :
1. Vérifier le format : `spring.datasource.password=ENC(valeurBase64)`
2. Pas d'espaces autour du signe `=`
3. Vérifier que la valeur est bien en Base64

## Migration depuis Mot de Passe en Clair

Si vous aviez précédemment un mot de passe en clair :

1. Générer le mot de passe chiffré :
   ```bash
   encrypt-password.cmd cosmetoKey test1234
   ```

2. Remplacer dans les fichiers de configuration :
   ```properties
   # Avant
   spring.datasource.password=test1234

   # Après
   spring.datasource.password=ENC(JCwGHLjP0Y8yN2kVxRQzMw==)
   ```

3. Définir la variable d'environnement :
   ```bash
   export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
   ```

4. Redémarrer l'application

## Support

Pour plus d'informations sur Jasypt :
- Documentation officielle : http://www.jasypt.org/
- GitHub : https://github.com/jasypt/jasypt

## Notes Importantes

- **NE JAMAIS** commiter `JASYPT_ENCRYPTOR_PASSWORD` dans Git
- Le mot de passe chiffré `ENC(...)` peut être commité car il est inutile sans la clé
- En production, utilisez une clé de chiffrement différente et forte
- Conservez une sauvegarde sécurisée de votre clé de chiffrement
