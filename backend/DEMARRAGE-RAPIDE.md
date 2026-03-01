# Démarrage Rapide - Cosmetovigilance Backend

## Configuration du Mot de Passe Chiffré

Le mot de passe de la base de données est chiffré avec AES-256. Pour démarrer l'application, vous **DEVEZ** définir la variable d'environnement `JASYPT_ENCRYPTOR_PASSWORD`.

## Démarrage en 3 Étapes

### 1. Assurez-vous que MySQL est démarré

```bash
# Vérifier que MySQL est actif
# Windows : Ouvrir Services et vérifier "MySQL80"
# Linux/Mac : systemctl status mysql
```

### 2. Définir la variable d'environnement

**Windows (CMD):**
```cmd
set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
```

**Windows (PowerShell):**
```powershell
$env:JASYPT_ENCRYPTOR_PASSWORD="cosmetoKey"
```

**Linux/Mac:**
```bash
export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
```

### 3. Démarrer l'application

**Option A : Avec Maven (développement)**
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**Option B : Avec le JAR (après compilation)**
```bash
cd backend
java -jar target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=local
```

## Vérification

Une fois l'application démarrée, vous devriez voir :

```
Started CosmetovigilanceApplication in X.XXX seconds
```

L'API est disponible sur : `http://localhost:8080/api`

Swagger UI : `http://localhost:8080/api/swagger-ui.html`

## Résolution des Problèmes

### Erreur : "Impossible de déchiffrer spring.datasource.password"

**Cause :** La variable `JASYPT_ENCRYPTOR_PASSWORD` n'est pas définie ou incorrecte.

**Solution :**
```bash
# Vérifier que la variable est définie
echo $JASYPT_ENCRYPTOR_PASSWORD  # Linux/Mac
echo %JASYPT_ENCRYPTOR_PASSWORD% # Windows CMD

# Si vide, la définir
export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey  # Linux/Mac
set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey     # Windows
```

### Erreur : "Access denied for user 'root'@'localhost'"

**Cause :** Le mot de passe MySQL n'est pas `test1234` ou MySQL n'accepte pas la connexion.

**Solution :**
1. Vérifier le mot de passe MySQL : `mysql -u root -p`
2. Si différent, générer un nouveau mot de passe chiffré :
   ```bash
   ./encrypt-password.sh cosmetoKey votreVraiPassword
   ```
3. Copier le résultat `ENC(...)` dans les fichiers `application-*.properties`

### Erreur : "Table doesn't exist"

**Cause :** La base de données n'est pas initialisée.

**Solution :** Flyway créera automatiquement les tables au premier démarrage. Vérifiez que :
```properties
spring.flyway.enabled=true
spring.datasource.url=jdbc:mysql://localhost:3306/cosmetovigilance?createDatabaseIfNotExist=true
```

## Commandes Utiles

### Compiler le projet
```bash
./mvnw clean install
```

### Générer un nouveau mot de passe chiffré
```bash
# Windows
encrypt-password.cmd cosmetoKey nouveauPassword

# Linux/Mac
./encrypt-password.sh cosmetoKey nouveauPassword
```

### Voir les logs en détail
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local -Dlogging.level.root=DEBUG
```

## Profils Disponibles

| Profil | Usage | Fichier de configuration |
|--------|-------|--------------------------|
| `local` | Développement sur PC | `application-local.properties` |
| `vm` | VM réseau local | `application-vm.properties` |
| `prod` | Production | `application-prod.properties` |

Pour changer de profil :
```bash
java -jar target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=vm
```

## Documentation Complète

- [README.md](README.md) - Documentation générale
- [CHIFFREMENT-PASSWORD.md](CHIFFREMENT-PASSWORD.md) - Guide du chiffrement
- [SECURITE.md](SECURITE.md) - Sécurité et bonnes pratiques

## Configuration par Défaut

- **Port** : 8080
- **Context Path** : `/api`
- **Base de données** : `cosmetovigilance` (créée automatiquement)
- **Utilisateur MySQL** : `root`
- **Mot de passe MySQL** : `test1234` (chiffré)
- **Clé de chiffrement Jasypt** : `cosmetoKey`

**IMPORTANT** : En production, changez toutes ces valeurs par défaut !
