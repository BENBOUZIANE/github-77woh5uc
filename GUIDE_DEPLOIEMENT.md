# 📖 Guide de Déploiement - Application Cosmetovigilance

Ce guide vous explique comment déployer l'application dans 3 environnements différents.

---

## 📋 Table des Matières

1. [Prérequis](#-prérequis)
2. [Environnement 1 : Développement Local](#-environnement-1--développement-local)
3. [Environnement 2 : VM Local (Réseau)](#-environnement-2--vm-local-réseau)
4. [Environnement 3 : Production Cloud Linux](#-environnement-3--production-cloud-linux)
5. [Dépannage](#-dépannage)

---

## 🛠 Prérequis

### Pour tous les environnements

- **Java 17+** : `java -version`
- **Node.js 18+** : `node --version`
- **MySQL 8.0+** : `mysql --version`
- **Maven 3.8+** : `mvn -version`

### Installation des prérequis (Ubuntu/Debian)

```bash
# Java 17
sudo apt update
sudo apt install openjdk-17-jdk

# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# MySQL
sudo apt install mysql-server
sudo mysql_secure_installation

# Maven
sudo apt install maven
```

### Installation des prérequis (Windows)

1. **Java** : Télécharger depuis [Oracle](https://www.oracle.com/java/technologies/downloads/) ou [Adoptium](https://adoptium.net/)
2. **Node.js** : Télécharger depuis [nodejs.org](https://nodejs.org/)
3. **MySQL** : Télécharger depuis [mysql.com](https://dev.mysql.com/downloads/installer/)
4. **Maven** : Télécharger depuis [maven.apache.org](https://maven.apache.org/download.cgi)

---

## 🏠 Environnement 1 : Développement Local

### Description
Utilisé quand vous développez sur votre propre PC. Accessible uniquement depuis `localhost`.

### Configuration

**Frontend** : Utilise `.env.local`
```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_URL=http://localhost:5173
```

**Backend** : Utilise `application-local.properties`
- Base de données : `localhost:3306`
- CORS : `http://localhost:5173`

### Étape 1 : Préparer la base de données

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE cosmetovigilance;

# Créer un utilisateur (optionnel)
CREATE USER 'cosmetovigi_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON cosmetovigilance.* TO 'cosmetovigi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Étape 2 : Installer les dépendances

```bash
# Dépendances frontend
npm install

# Vérifier que Maven est configuré (le backend téléchargera ses dépendances automatiquement)
cd backend
./mvnw clean install
cd ..
```

### Étape 3 : Lancer l'application

#### Option A : Script automatique (Linux/Mac)

```bash
# Rendre le script exécutable
chmod +x start-local.sh

# Lancer l'application
./start-local.sh
```

#### Option B : Démarrage manuel

**Terminal 1 - Backend :**
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**Terminal 2 - Frontend :**
```bash
# Copier le fichier de configuration
cp .env.local .env

# Démarrer le frontend
npm run dev
```

### Accès à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:8080/api
- **Swagger UI** : http://localhost:8080/api/swagger-ui.html

### Arrêter l'application

Appuyez sur `Ctrl+C` dans chaque terminal.

---

## 🖥 Environnement 2 : VM Local (Réseau)

### Description
Utilisé quand vous déployez sur une VM de votre réseau local. Accessible depuis tous les PC du réseau.

### Configuration

**Frontend** : Utilise `.env.vm`
```env
VITE_API_URL=http://192.168.1.50:8080/api  # Remplacer par l'IP de votre VM
VITE_APP_URL=http://192.168.1.50:5173
```

**Backend** : Utilise `application-vm.properties`
- Écoute sur toutes les interfaces : `0.0.0.0`
- CORS : Autoriser l'IP de la VM

### Étape 1 : Préparer la VM

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les prérequis (voir section Prérequis ci-dessus)

# Obtenir l'adresse IP de la VM
hostname -I
# Notez l'IP (exemple: 192.168.1.50)
```

### Étape 2 : Configurer MySQL

```bash
# Démarrer MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Se connecter et créer la base de données
sudo mysql -u root -p

CREATE DATABASE cosmetovigilance;
CREATE USER 'cosmetovigi_user'@'%' IDENTIFIED BY 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON cosmetovigilance.* TO 'cosmetovigi_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### Étape 3 : Configurer les fichiers d'environnement

```bash
# Éditer le fichier .env.vm avec l'IP de votre VM
nano .env.vm

# Remplacer <VM_IP_ADDRESS> par votre IP réelle
# Exemple: 192.168.1.50
VITE_API_URL=http://192.168.1.50:8080/api
VITE_APP_URL=http://192.168.1.50:5173

# Éditer le fichier application-vm.properties
nano backend/src/main/resources/application-vm.properties

# Remplacer <VM_IP> par votre IP réelle
# Mettre à jour le mot de passe de la base de données
spring.datasource.password=votre_mot_de_passe_securise
```

### Étape 4 : Configurer le pare-feu

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 8080/tcp   # Backend
sudo ufw allow 5173/tcp   # Frontend
sudo ufw allow 3306/tcp   # MySQL (si base de données externe)
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --reload
```

### Étape 5 : Installer les dépendances

```bash
# Frontend
npm install

# Backend (Maven téléchargera les dépendances)
cd backend
./mvnw clean install
cd ..
```

### Étape 6 : Lancer l'application

#### Option A : Script automatique (Recommandé)

```bash
# Rendre les scripts exécutables
chmod +x start-vm.sh stop-vm.sh

# Lancer l'application
./start-vm.sh
```

Le script va :
- Détecter automatiquement l'IP de la VM
- Configurer les fichiers d'environnement
- Compiler le backend et le frontend
- Démarrer les deux services

#### Option B : Démarrage manuel

```bash
# Copier le fichier de configuration
cp .env.vm .env

# Remplacer <VM_IP_ADDRESS> par votre IP dans .env
sed -i 's/<VM_IP_ADDRESS>/192.168.1.50/g' .env

# Compiler le backend
cd backend
./mvnw clean package -DskipTests
cd ..

# Compiler le frontend
npm run build

# Démarrer le backend
nohup java -jar backend/target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=vm > backend.log 2>&1 &
echo $! > backend.pid

# Démarrer le frontend
nohup npm run preview -- --host 0.0.0.0 --port 5173 > frontend.log 2>&1 &
echo $! > frontend.pid
```

### Accès à l'application

**Depuis la VM elle-même :**
- Frontend : http://localhost:5173
- Backend : http://localhost:8080/api

**Depuis un autre PC du réseau :**
- Frontend : http://192.168.1.50:5173 (remplacer par votre IP)
- Backend : http://192.168.1.50:8080/api
- Swagger : http://192.168.1.50:8080/api/swagger-ui.html

### Arrêter l'application

```bash
./stop-vm.sh
```

Ou manuellement :
```bash
# Arrêter le backend
kill $(cat backend.pid)
rm backend.pid

# Arrêter le frontend
kill $(cat frontend.pid)
rm frontend.pid
```

### Consulter les logs

```bash
# Logs backend
tail -f backend.log

# Logs frontend
tail -f frontend.log
```

---

## ☁️ Environnement 3 : Production Cloud Linux

### Description
Utilisé pour le déploiement final sur un serveur Linux dans le cloud (AWS, Azure, DigitalOcean, etc.).

### Configuration

**Frontend** : Utilise `.env.production`
```env
VITE_API_URL=https://votredomaine.com/api
VITE_APP_URL=https://votredomaine.com
```

**Backend** : Utilise `application-prod.properties`
- Configuration via variables d'environnement
- Logs écrits dans `/var/log/cosmetovigilance/`
- Swagger UI désactivé

### Étape 1 : Préparer le serveur

```bash
# Se connecter au serveur
ssh user@votre-serveur.com

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les prérequis
sudo apt install openjdk-17-jdk mysql-server nginx nodejs npm maven git -y

# Sécuriser MySQL
sudo mysql_secure_installation
```

### Étape 2 : Configurer MySQL

```bash
sudo mysql -u root -p

CREATE DATABASE cosmetovigilance;
CREATE USER 'cosmetovigi_prod'@'localhost' IDENTIFIED BY 'MOT_DE_PASSE_TRES_SECURISE';
GRANT ALL PRIVILEGES ON cosmetovigilance.* TO 'cosmetovigi_prod'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Étape 3 : Cloner le projet

```bash
cd /opt
sudo git clone https://github.com/votre-repo/cosmetovigilance.git
sudo chown -R $USER:$USER cosmetovigilance
cd cosmetovigilance
```

### Étape 4 : Configurer les variables d'environnement

```bash
# Créer un fichier pour les variables d'environnement
sudo nano /etc/environment.d/cosmetovigilance.conf
```

Ajouter les variables suivantes :
```bash
export DB_URL="jdbc:mysql://localhost:3306/cosmetovigilance?useSSL=true&serverTimezone=UTC"
export DB_USERNAME="cosmetovigi_prod"
export DB_PASSWORD="MOT_DE_PASSE_TRES_SECURISE"
export JWT_SECRET="GENERER_UNE_CLE_SECRETE_LONGUE_ET_ALEATOIRE_ICI"
export CORS_ORIGINS="https://votredomaine.com"
export MAIL_USERNAME="votre.email@gmail.com"
export MAIL_PASSWORD="votre_mot_de_passe_application"
```

**Générer une clé JWT secrète :**
```bash
openssl rand -base64 64
```

### Étape 5 : Configurer le fichier .env.production

```bash
nano .env.production
```

Modifier avec votre domaine :
```env
VITE_API_URL=https://votredomaine.com/api
VITE_APP_URL=https://votredomaine.com
```

### Étape 6 : Déployer l'application

#### Option A : Script automatique (Recommandé)

```bash
# Charger les variables d'environnement
source /etc/environment.d/cosmetovigilance.conf

# Rendre le script exécutable
chmod +x deploy-production.sh

# Lancer le déploiement
./deploy-production.sh
```

#### Option B : Déploiement manuel

```bash
# 1. Compiler le backend
cd backend
./mvnw clean package -DskipTests
cd ..

# 2. Compiler le frontend
cp .env.production .env
npm install
npm run build

# 3. Créer les répertoires
sudo mkdir -p /var/log/cosmetovigilance
sudo mkdir -p /opt/cosmetovigilance/uploads
sudo chown -R $USER:$USER /var/log/cosmetovigilance
sudo chown -R $USER:$USER /opt/cosmetovigilance

# 4. Copier les fichiers
sudo cp backend/target/cosmetovigilance-backend-1.0.0.jar /opt/cosmetovigilance/
sudo cp -r dist /opt/cosmetovigilance/frontend

# 5. Créer le service systemd
sudo nano /etc/systemd/system/cosmetovigilance-backend.service
```

Contenu du service :
```ini
[Unit]
Description=Cosmetovigilance Backend
After=syslog.target network.target mysql.service

[Service]
User=votre_user
WorkingDirectory=/opt/cosmetovigilance
ExecStart=/usr/bin/java -jar /opt/cosmetovigilance/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=prod
SuccessExitStatus=143
Restart=always
RestartSec=10

Environment="DB_URL=jdbc:mysql://localhost:3306/cosmetovigilance?useSSL=true&serverTimezone=UTC"
Environment="DB_USERNAME=cosmetovigi_prod"
Environment="DB_PASSWORD=MOT_DE_PASSE_TRES_SECURISE"
Environment="JWT_SECRET=VOTRE_CLE_JWT_SECRETE"
Environment="CORS_ORIGINS=https://votredomaine.com"
Environment="UPLOAD_DIR=/opt/cosmetovigilance/uploads"

[Install]
WantedBy=multi-user.target
```

```bash
# Démarrer le service
sudo systemctl daemon-reload
sudo systemctl enable cosmetovigilance-backend
sudo systemctl start cosmetovigilance-backend

# Vérifier le statut
sudo systemctl status cosmetovigilance-backend
```

### Étape 7 : Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/cosmetovigilance
```

Contenu :
```nginx
server {
    listen 80;
    server_name votredomaine.com www.votredomaine.com;

    # Frontend
    location / {
        root /opt/cosmetovigilance/frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/cosmetovigilance /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### Étape 8 : Configurer HTTPS avec Let's Encrypt (Recommandé)

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat SSL
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com

# Le certificat se renouvellera automatiquement
```

### Accès à l'application

- **Frontend** : https://votredomaine.com
- **Backend API** : https://votredomaine.com/api

### Commandes utiles

```bash
# Statut du backend
sudo systemctl status cosmetovigilance-backend

# Logs du backend
sudo journalctl -u cosmetovigilance-backend -f

# Redémarrer le backend
sudo systemctl restart cosmetovigilance-backend

# Arrêter le backend
sudo systemctl stop cosmetovigilance-backend

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 🔧 Dépannage

### Problème : Le backend ne démarre pas

**Solution 1 : Vérifier les logs**
```bash
# Local
cd backend
./mvnw spring-boot:run

# VM/Production
sudo journalctl -u cosmetovigilance-backend -n 50
```

**Solution 2 : Vérifier MySQL**
```bash
# Vérifier que MySQL est démarré
sudo systemctl status mysql

# Tester la connexion
mysql -u root -p -e "SHOW DATABASES;"
```

**Solution 3 : Vérifier le port**
```bash
# Vérifier si le port 8080 est déjà utilisé
sudo lsof -i :8080
# ou
sudo netstat -tulpn | grep 8080
```

### Problème : Le frontend ne charge pas

**Solution 1 : Vérifier la configuration**
```bash
# Vérifier que le fichier .env existe et contient les bonnes URLs
cat .env

# Vérifier que le backend est accessible
curl http://localhost:8080/api/health
```

**Solution 2 : Vérifier CORS**
```bash
# Tester depuis un autre PC
curl -H "Origin: http://192.168.1.100:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://192.168.1.50:8080/api/declarations
```

### Problème : Erreur "Access Denied" dans MySQL

**Solution :**
```bash
mysql -u root -p

# Donner tous les droits
GRANT ALL PRIVILEGES ON cosmetovigilance.* TO 'votre_user'@'%';
FLUSH PRIVILEGES;
```

### Problème : Le frontend n'est pas accessible depuis le réseau

**Solution 1 : Vérifier le pare-feu**
```bash
# Ubuntu
sudo ufw status
sudo ufw allow 5173/tcp

# CentOS
sudo firewall-cmd --list-ports
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --reload
```

**Solution 2 : Vérifier que Vite écoute sur 0.0.0.0**
```bash
# Vérifier vite.config.ts
cat vite.config.ts

# Doit contenir:
# server: {
#   host: '0.0.0.0',
#   port: 5173,
# }
```

### Problème : Erreur de compilation du backend

**Solution :**
```bash
# Nettoyer et recompiler
cd backend
./mvnw clean install -U

# Si problème de dépendances
rm -rf ~/.m2/repository
./mvnw clean install
```

### Problème : Les fichiers uploadés ne sont pas sauvegardés

**Solution :**
```bash
# Vérifier que le répertoire existe
mkdir -p uploads

# Vérifier les permissions
chmod 755 uploads

# Production
sudo mkdir -p /opt/cosmetovigilance/uploads
sudo chown -R votre_user:votre_user /opt/cosmetovigilance/uploads
```

---

## 📞 Support

Si vous rencontrez des problèmes non couverts par ce guide :

1. **Vérifier les logs** en premier
2. **Rechercher l'erreur** sur Google ou Stack Overflow
3. **Consulter la documentation** :
   - Spring Boot : https://spring.io/projects/spring-boot
   - Vite : https://vitejs.dev/
   - MySQL : https://dev.mysql.com/doc/

---

## 📝 Notes importantes

### Sécurité

- **Changez TOUS les mots de passe par défaut**
- **Générez une nouvelle clé JWT secrète pour la production**
- **N'exposez JAMAIS les fichiers `.env` dans Git**
- **Utilisez HTTPS en production (Let's Encrypt)**
- **Mettez à jour régulièrement les dépendances**

### Performance

- Pour la production, considérez :
  - Un reverse proxy (Nginx, Apache)
  - Un CDN pour les assets statiques
  - Une base de données optimisée avec index
  - Un monitoring (Prometheus, Grafana)

### Backup

```bash
# Sauvegarder la base de données
mysqldump -u root -p cosmetovigilance > backup_$(date +%Y%m%d).sql

# Sauvegarder les fichiers uploadés
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /opt/cosmetovigilance/uploads
```

---

**Bon déploiement ! 🚀**
