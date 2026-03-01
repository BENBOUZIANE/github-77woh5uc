# Déploiement PRODUCTION (serveur Linux, Nginx)

Environnement : **Linux** (serveur de production).  
Frontend : servi par **Nginx**.  
Backend : profil **prod** (`application-prod.properties`).  
Commandes nginx pour **Linux** (systemd).

---

## 1. Prérequis

- **Java JDK 17+**, **MySQL** 8+
- **Nginx** installé (`apt install nginx` / `dnf install nginx`)

---

## 2. Configuration

### Backend : `backend/src/main/resources/application-prod.properties`

La production utilise des **variables d’environnement**. À définir sur le serveur (fichier env, systemd, etc.) :

```bash
# Base de données
export DB_URL="jdbc:mysql://localhost:3306/cosmetovigilance?useSSL=true&serverTimezone=UTC"
export DB_USERNAME="root"
export DB_PASSWORD="MOT_DE_PASSE_SECURISE"

# JWT (générer des secrets forts en prod)
export JWT_SECRET="VOTRE_SECRET_JWT_TRES_LONG"
export JWT_EXPIRATION=86400000
export JWT_REFRESH_EXPIRATION=604800000

# CORS : domaine(s) du front (séparés par des virgules)
export CORS_ORIGINS="https://votredomaine.com"

# Optionnel : répertoire des uploads
export UPLOAD_DIR="/var/lib/cosmetovigilance/uploads"
```

CORS et CSP sont pilotés par ces variables (pas d’IP en dur).

### Frontend : build pour la prod

À la racine du projet, configurer `.env.production` :

```env
VITE_API_URL=https://votredomaine.com/api
VITE_CSP_ALLOWED_HTTP_HOSTS=
VITE_CSP_ALLOW_PRIVATE_NETWORK_HTTP=false
```

Puis :

```bash
npm ci
npm run build
```

Déployer le contenu de `dist/` sur le serveur (ex. `/var/www/cosmetovigilance`).

### Nginx : configuration (Linux)

Fichier type : `/etc/nginx/sites-available/cosmetovigilance` (ou dans `conf.d/`) :

```nginx
server {
    listen 80;
    server_name votredomaine.com;
    root /var/www/cosmetovigilance;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activer le site et tester :

```bash
sudo ln -sf /etc/nginx/sites-available/cosmetovigilance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Pour HTTPS, ajouter un bloc `listen 443 ssl` et les certificats (Let’s Encrypt, etc.).

---

## 3. Démarrer les services (Linux)

### Nginx

```bash
sudo systemctl start nginx
```

Vérifier le statut :

```bash
sudo systemctl status nginx
```

### Backend (JAR)

Exemple en ligne de commande :

```bash
cd /opt/cosmetovigilance
java -jar cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=prod
```

Recommandation : utiliser **systemd** pour le backend. Exemple `/etc/systemd/system/cosmetovigilance.service` :

```ini
[Unit]
Description=Cosmetovigilance Backend
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/cosmetovigilance
EnvironmentFile=/opt/cosmetovigilance/env
ExecStart=/usr/bin/java -jar /opt/cosmetovigilance/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=prod
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Puis :

```bash
sudo systemctl daemon-reload
sudo systemctl start cosmetovigilance
sudo systemctl enable cosmetovigilance
```

---

## 4. Arrêter les services (Linux)

### Nginx

```bash
sudo systemctl stop nginx
```

### Backend (systemd)

```bash
sudo systemctl stop cosmetovigilance
```

Si le backend a été lancé à la main : `Ctrl+C` ou `kill <PID>`.

---

## 5. Résumé des commandes (Linux)

| Action            | Commande |
|-------------------|----------|
| Démarrer nginx    | `sudo systemctl start nginx` |
| Arrêter nginx     | `sudo systemctl stop nginx` |
| Recharger nginx   | `sudo systemctl reload nginx` |
| Statut nginx      | `sudo systemctl status nginx` |
| Tester la config  | `sudo nginx -t` |
| Démarrer backend  | `sudo systemctl start cosmetovigilance` |
| Arrêter backend   | `sudo systemctl stop cosmetovigilance` |

---

## 6. Sécurité

- Utiliser **HTTPS** en production (certificat SSL/TLS).
- Ne pas exposer le port 8080 sur Internet ; seul Nginx (80/443) doit être public.
- Garder les secrets (DB, JWT) dans des variables d’environnement ou un coffre, jamais en dur dans les fichiers.

Pour HTTPS et en-têtes de sécurité, configurer Nginx (voir `nginx-security-headers.conf` et les README VM/PROD).
