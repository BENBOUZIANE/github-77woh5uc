# Guide de Déploiement VM (Réseau Local)

Ce guide explique comment déployer l'application sur une VM Windows/Linux accessible sur votre réseau local (ex: 192.168.1.109).

## Architecture

```
Clients Réseau Local (192.168.1.x)
        ↓
    Nginx (Port 80)
        ↓
    ├─→ Frontend (fichiers statiques)
    └─→ Backend API (Port 8080)
            ↓
        MySQL (Port 3306)
```

## Prérequis

- VM Windows/Linux sur le réseau local
- MySQL 8.0+ installé
- Java 17+ installé
- Nginx installé
- Accès SSH ou Bureau à distance

## Méthode 1 : Déploiement Automatique (Recommandé)

### Depuis votre PC de développement

**Linux/Mac :**
```bash
./deploy-vm.sh user@192.168.1.109
```

**Windows :**
```cmd
deploy-vm.cmd user@192.168.1.109
```

Le script va tout faire automatiquement :
- Compiler backend et frontend
- Transférer les fichiers
- Configurer Nginx
- Configurer le service systemd
- Démarrer l'application

Accédez ensuite à : `http://192.168.1.109`

## Méthode 2 : Déploiement Manuel

### 1. Préparer MySQL sur la VM

```bash
# Démarrer MySQL
sudo systemctl start mysql

# Créer la base de données
mysql -u root -p
CREATE DATABASE IF NOT EXISTS cosmetovigilance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Compiler sur votre PC

**Backend :**
```bash
cd backend
./mvnw clean package -DskipTests
```

**Frontend :**
```bash
# Mettre à jour .env.production avec l'IP de la VM
echo "VITE_API_URL=http://192.168.1.109/api" > .env.production

npm run build
```

### 3. Transférer les fichiers vers la VM

```bash
# Créer les répertoires sur la VM
ssh user@192.168.1.109 "sudo mkdir -p /var/www/cosmetovigilance/{backend,frontend}"

# Transférer le backend
scp backend/target/cosmetovigilance-backend-1.0.0.jar user@192.168.1.109:/var/www/cosmetovigilance/backend/

# Transférer le frontend
scp -r dist/* user@192.168.1.109:/var/www/cosmetovigilance/frontend/

# Transférer la config Nginx
scp nginx.conf user@192.168.1.109:/tmp/
```

### 4. Configurer Nginx sur la VM

```bash
# Se connecter à la VM
ssh user@192.168.1.109

# Modifier l'IP dans la config si nécessaire
sudo nano /tmp/nginx.conf
# Ligne 6: server_name 192.168.1.109;

# Copier la config
sudo cp /tmp/nginx.conf /etc/nginx/sites-available/cosmetovigilance

# Activer le site
sudo ln -s /etc/nginx/sites-available/cosmetovigilance /etc/nginx/sites-enabled/

# Tester et redémarrer
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Configurer le Service Backend

Créer le fichier service :

```bash
sudo nano /etc/systemd/system/cosmetovigilance-backend.service
```

Contenu :

```ini
[Unit]
Description=Cosmetovigilance Backend API
After=mysql.service
Requires=mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/cosmetovigilance/backend

Environment="JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey"
Environment="SPRING_PROFILES_ACTIVE=vm"

ExecStart=/usr/bin/java -jar /var/www/cosmetovigilance/backend/cosmetovigilance-backend-1.0.0.jar

StandardOutput=journal
StandardError=journal
SyslogIdentifier=cosmetovigilance-backend

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Démarrer le service :

```bash
sudo systemctl daemon-reload
sudo systemctl enable cosmetovigilance-backend
sudo systemctl start cosmetovigilance-backend
```

### 6. Configurer les Permissions

```bash
sudo chown -R www-data:www-data /var/www/cosmetovigilance
sudo chmod -R 755 /var/www/cosmetovigilance
```

## Configuration CORS Backend

Le fichier `application-vm.properties` doit autoriser les connexions depuis tout le réseau local :

```properties
# Autoriser toutes les adresses du réseau local 192.168.1.x
cors.allowed-origins=http://192.168.1.109,http://192.168.1.*
```

Pour accepter TOUTES les adresses du réseau, modifiez `WebConfig.java` :

```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOriginPatterns("http://192.168.1.*", "http://192.168.*.*")
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
}
```

## Accès depuis le Réseau Local

### Depuis n'importe quel PC du réseau

```
http://192.168.1.109
```

### Configuration des Clients

Les utilisateurs n'ont rien à configurer. Ils accèdent simplement à l'URL via leur navigateur.

## Vérifications

### Backend
```bash
# Statut du service
sudo systemctl status cosmetovigilance-backend

# Logs en temps réel
sudo journalctl -u cosmetovigilance-backend -f

# Tester l'API
curl http://localhost:8080/api/auth/login
```

### Nginx
```bash
# Statut
sudo systemctl status nginx

# Logs
sudo tail -f /var/log/nginx/cosmetovigilance-access.log
sudo tail -f /var/log/nginx/cosmetovigilance-error.log
```

### Depuis un autre PC du réseau
```bash
# Tester la connexion
curl http://192.168.1.109

# Tester l'API
curl http://192.168.1.109/api/auth/login
```

## Mise à Jour de l'Application

### Backend

```bash
# Sur votre PC : recompiler
cd backend
./mvnw clean package -DskipTests

# Transférer le nouveau JAR
scp target/cosmetovigilance-backend-1.0.0.jar user@192.168.1.109:/var/www/cosmetovigilance/backend/

# Sur la VM : redémarrer
ssh user@192.168.1.109 "sudo systemctl restart cosmetovigilance-backend"
```

### Frontend

```bash
# Sur votre PC : rebuild
npm run build

# Transférer
scp -r dist/* user@192.168.1.109:/var/www/cosmetovigilance/frontend/

# Pas besoin de redémarrer Nginx
```

## Résolution des Problèmes

### Erreur 502 Bad Gateway

Le backend n'est pas démarré :
```bash
sudo systemctl start cosmetovigilance-backend
sudo journalctl -u cosmetovigilance-backend -n 50
```

### CORS Error depuis un autre PC

Vérifier la configuration CORS dans `application-vm.properties` et `WebConfig.java`.

### Impossible d'accéder depuis un autre PC

**Vérifier le firewall sur la VM :**

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw status

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

### Page blanche

Vérifier les permissions :
```bash
ls -la /var/www/cosmetovigilance/frontend/
sudo chown -R www-data:www-data /var/www/cosmetovigilance/frontend
```

## Commandes Utiles

```bash
# Redémarrer tous les services
sudo systemctl restart cosmetovigilance-backend nginx mysql

# Voir tous les logs
sudo journalctl -u cosmetovigilance-backend -f
sudo tail -f /var/log/nginx/cosmetovigilance-error.log

# Vérifier les ports ouverts
sudo netstat -tlnp | grep -E '80|8080|3306'
```

## Sécurité

### En environnement de développement/test :

1. Firewall : autoriser seulement le réseau local (192.168.1.0/24)
2. Changer le mot de passe MySQL par défaut
3. Ne PAS exposer sur Internet

### Pour un réseau de production :

1. Activer HTTPS avec certificat SSL
2. Changer la clé Jasypt (`JASYPT_ENCRYPTOR_PASSWORD`)
3. Changer la clé JWT
4. Utiliser un utilisateur MySQL dédié (pas root)
5. Configurer des backups automatiques

## Documentation

- [nginx.conf](nginx.conf) - Configuration Nginx complète
- [backend/SECURITE.md](backend/SECURITE.md) - Guide de sécurité
- [backend/CHIFFREMENT-PASSWORD.md](backend/CHIFFREMENT-PASSWORD.md) - Chiffrement
