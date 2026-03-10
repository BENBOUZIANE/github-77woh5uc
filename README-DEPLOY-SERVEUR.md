# Guide de Déploiement SERVEUR (Production)

Ce guide explique comment déployer l'application sur un serveur Linux de production avec domaine, HTTPS et sécurité renforcée.

## Architecture Production

```
Internet
   ↓
Firewall
   ↓
Nginx (Port 443 HTTPS)
   ↓
├─→ Frontend (fichiers statiques)
└─→ Backend API (Port 8080 - localhost uniquement)
       ↓
   MySQL (Port 3306 - localhost uniquement)
```

## Prérequis

- Serveur Linux (Ubuntu 20.04+ ou CentOS 8+)
- Domaine configuré (ex: cosmetovigilance.ma)
- Accès root ou sudo
- Certificat SSL (Let's Encrypt recommandé)

## Étape 1 : Préparation du Serveur

### Mise à jour du système

```bash
sudo apt update && sudo apt upgrade -y
```

### Installation des dépendances

```bash
sudo apt install -y nginx mysql-server openjdk-17-jdk certbot python3-certbot-nginx
```

### Sécurisation initiale

```bash
# Configurer le firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Sécuriser MySQL
sudo mysql_secure_installation
```

## Étape 2 : Configuration MySQL

### Créer la base de données et l'utilisateur

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE cosmetovigilance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'cosmetouser'@'localhost' IDENTIFIED BY 'MotDePasseTresSecurise123!';
GRANT ALL PRIVILEGES ON cosmetovigilance.* TO 'cosmetouser'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### Configurer MySQL pour écouter uniquement sur localhost

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Vérifier :
```ini
bind-address = 127.0.0.1
```

```bash
sudo systemctl restart mysql
```

## Étape 3 : Générer Nouveau Mot de Passe Chiffré

Sur votre PC de développement, générez une nouvelle clé Jasypt forte :

```bash
cd backend

# Générer avec une clé FORTE
./encrypt-password.sh "MaCleProductionSecurise2024!" "MotDePasseTresSecurise123!"
```

Copiez le résultat `ENC(...)`.

## Étape 4 : Préparer l'Application

### Sur votre PC : Compiler avec le profil production

**Backend :**

Modifiez `application-prod.properties` :
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cosmetovigilance?useSSL=true
spring.datasource.username=cosmetouser
spring.datasource.password=ENC(VotreNouveauMotDePasseChiffré)

# CORS - Votre domaine
cors.allowed-origins=https://cosmetovigilance.ma,https://www.cosmetovigilance.ma
```

```bash
cd backend
./mvnw clean package -DskipTests
```

**Frontend :**

```bash
# Créer .env.production avec votre domaine
echo "VITE_API_URL=https://cosmetovigilance.ma/api" > .env.production

npm run build
```

## Étape 5 : Transférer les Fichiers

```bash
# Créer les répertoires
ssh user@serveur "sudo mkdir -p /var/www/cosmetovigilance/{backend,frontend,uploads}"

# Transférer
scp backend/target/cosmetovigilance-backend-1.0.0.jar user@serveur:/tmp/
scp -r dist/* user@serveur:/tmp/frontend/

# Sur le serveur
ssh user@serveur
sudo mv /tmp/cosmetovigilance-backend-1.0.0.jar /var/www/cosmetovigilance/backend/
sudo mv /tmp/frontend/* /var/www/cosmetovigilance/frontend/
```

## Étape 6 : Configurer le Service Backend

```bash
sudo nano /etc/systemd/system/cosmetovigilance-backend.service
```

```ini
[Unit]
Description=Cosmetovigilance Backend API
After=mysql.service network.target
Requires=mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/cosmetovigilance/backend

# Variables d'environnement - CHANGEZ CES VALEURS
Environment="JASYPT_ENCRYPTOR_PASSWORD=MaCleProductionSecurise2024!"
Environment="SPRING_PROFILES_ACTIVE=prod"

# Java options pour production
Environment="JAVA_OPTS=-Xms512m -Xmx2048m -XX:+UseG1GC"

ExecStart=/usr/bin/java $JAVA_OPTS -jar /var/www/cosmetovigilance/backend/cosmetovigilance-backend-1.0.0.jar

StandardOutput=journal
StandardError=journal
SyslogIdentifier=cosmetovigilance-backend

Restart=always
RestartSec=10

# Sécurité
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/www/cosmetovigilance/backend/uploads

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable cosmetovigilance-backend
sudo systemctl start cosmetovigilance-backend
```

## Étape 7 : Obtenir un Certificat SSL

### Avec Let's Encrypt (Gratuit)

```bash
sudo certbot certonly --nginx -d cosmetovigilance.ma -d www.cosmetovigilance.ma
```

Les certificats seront dans :
- `/etc/letsencrypt/live/cosmetovigilance.ma/fullchain.pem`
- `/etc/letsencrypt/live/cosmetovigilance.ma/privkey.pem`

### Renouvellement automatique

```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Le renouvellement automatique est déjà configuré via cron
```

## Étape 8 : Configurer Nginx avec HTTPS

```bash
sudo nano /etc/nginx/sites-available/cosmetovigilance
```

```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name cosmetovigilance.ma www.cosmetovigilance.ma;
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    server_name cosmetovigilance.ma www.cosmetovigilance.ma;

    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/cosmetovigilance.ma/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cosmetovigilance.ma/privkey.pem;

    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logs
    access_log /var/log/nginx/cosmetovigilance-access.log;
    error_log /var/log/nginx/cosmetovigilance-error.log;

    # Taille des uploads
    client_max_body_size 10M;

    # Timeouts
    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;

    # Frontend
    location / {
        root /var/www/cosmetovigilance/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;

        # Headers de sécurité
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Cache
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            expires 0;
        }
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;

        proxy_http_version 1.1;
        proxy_buffering off;
    }

    # Swagger UI (désactiver en production si nécessaire)
    location /api/swagger-ui {
        deny all;
    }

    # Uploads
    location /uploads {
        alias /var/www/cosmetovigilance/backend/uploads;

        location ~* \.(pdf)$ {
            add_header Content-Disposition "inline";
        }

        location ~* \.(?!pdf$) {
            deny all;
        }
    }

    # Sécurité
    location ~ /\. {
        deny all;
    }

    location ~* \.(conf|config|properties|yml|yaml|env)$ {
        deny all;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/cosmetovigilance /etc/nginx/sites-enabled/

# Supprimer le site par défaut
sudo rm /etc/nginx/sites-enabled/default

# Tester et redémarrer
sudo nginx -t
sudo systemctl restart nginx
```

## Étape 9 : Permissions et Sécurité

```bash
# Permissions
sudo chown -R www-data:www-data /var/www/cosmetovigilance
sudo chmod -R 755 /var/www/cosmetovigilance
sudo chmod 750 /var/www/cosmetovigilance/backend/uploads

# Sécuriser les fichiers de config
sudo chmod 600 /etc/systemd/system/cosmetovigilance-backend.service
```

## Étape 10 : Monitoring et Logs

### Configurer la rotation des logs

```bash
sudo nano /etc/logrotate.d/cosmetovigilance
```

```
/var/log/nginx/cosmetovigilance-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1
    endscript
}
```

### Monitoring

```bash
# Voir les logs en temps réel
sudo journalctl -u cosmetovigilance-backend -f

# Logs Nginx
sudo tail -f /var/log/nginx/cosmetovigilance-access.log

# Statistiques système
htop
df -h
free -h
```

## Étape 11 : Backups

### Backup MySQL automatique

```bash
sudo nano /usr/local/bin/backup-cosmetovigilance.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/cosmetovigilance"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MySQL
mysqldump -u cosmetouser -p'MotDePasseTresSecurise123!' cosmetovigilance | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/cosmetovigilance/backend/uploads

# Supprimer les backups de plus de 30 jours
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
sudo chmod +x /usr/local/bin/backup-cosmetovigilance.sh

# Ajouter au cron (tous les jours à 2h du matin)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-cosmetovigilance.sh >> /var/log/backup-cosmetovigilance.log 2>&1
```

## Vérifications Post-Déploiement

```bash
# Backend
sudo systemctl status cosmetovigilance-backend
curl https://localhost:8080/api/auth/login

# Nginx
sudo systemctl status nginx
curl -I https://cosmetovigilance.ma

# MySQL
sudo systemctl status mysql

# Ports ouverts (seulement 22, 80, 443 doivent être visibles)
sudo netstat -tlnp

# Firewall
sudo ufw status
```

## Mise à Jour en Production

```bash
# 1. Backup avant mise à jour
/usr/local/bin/backup-cosmetovigilance.sh

# 2. Arrêter le backend
sudo systemctl stop cosmetovigilance-backend

# 3. Transférer la nouvelle version
scp backend/target/cosmetovigilance-backend-1.0.0.jar user@serveur:/var/www/cosmetovigilance/backend/

# 4. Redémarrer
sudo systemctl start cosmetovigilance-backend

# 5. Vérifier
sudo journalctl -u cosmetovigilance-backend -f
```

## Sécurité en Production

### Checklist

- [ ] HTTPS activé avec certificat valide
- [ ] Redirection HTTP → HTTPS
- [ ] Clé Jasypt changée (pas cosmetoKey)
- [ ] Clé JWT changée
- [ ] Mot de passe MySQL fort
- [ ] Utilisateur MySQL dédié (pas root)
- [ ] MySQL écoute uniquement sur localhost
- [ ] Backend écoute uniquement sur localhost
- [ ] Firewall configuré (22, 80, 443 uniquement)
- [ ] Swagger UI désactivé en production
- [ ] Backups automatiques configurés
- [ ] Logs rotatifs configurés
- [ ] Headers de sécurité HTTPS
- [ ] Permissions fichiers correctes
- [ ] Monitoring en place

## Commandes Utiles

```bash
# Redémarrer tous les services
sudo systemctl restart cosmetovigilance-backend nginx

# Voir les logs
sudo journalctl -u cosmetovigilance-backend -n 100
sudo tail -f /var/log/nginx/cosmetovigilance-error.log

# Tester SSL
curl -I https://cosmetovigilance.ma
openssl s_client -connect cosmetovigilance.ma:443

# Vérifier le certificat
sudo certbot certificates
```

## Support

En cas de problème, vérifier :
1. Logs backend : `sudo journalctl -u cosmetovigilance-backend -f`
2. Logs Nginx : `sudo tail -f /var/log/nginx/cosmetovigilance-error.log`
3. Statut services : `sudo systemctl status cosmetovigilance-backend nginx mysql`
4. Firewall : `sudo ufw status`
5. Certificat SSL : `sudo certbot certificates`
