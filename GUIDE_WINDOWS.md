# 📖 Guide de Déploiement Windows

Ce guide est spécifique pour les utilisateurs Windows. Pour le déploiement Linux, voir `GUIDE_DEPLOIEMENT.md`.

---

## 📋 Table des Matières

1. [Prérequis Windows](#-prérequis-windows)
2. [Environnement 1 : Développement Local (Windows)](#-environnement-1--développement-local-windows)
3. [Environnement 2 : Préparation pour VM Linux](#-environnement-2--préparation-pour-vm-linux)
4. [Environnement 3 : Production Cloud Linux](#-environnement-3--production-cloud-linux)
5. [Dépannage Windows](#-dépannage-windows)

---

## 🛠 Prérequis Windows

### Logiciels requis

1. **Java Development Kit (JDK) 17 ou supérieur**
   - Télécharger : https://adoptium.net/ ou https://www.oracle.com/java/technologies/downloads/
   - Vérifier l'installation : `java -version` dans CMD

2. **Node.js 18 ou supérieur**
   - Télécharger : https://nodejs.org/
   - Vérifier l'installation : `node --version` dans CMD

3. **MySQL 8.0 ou supérieur**
   - Télécharger : https://dev.mysql.com/downloads/installer/
   - Installer "MySQL Server" et "MySQL Workbench"

4. **Git** (optionnel mais recommandé)
   - Télécharger : https://git-scm.com/download/win

5. **Maven** (optionnel, inclus dans le projet)
   - Le projet inclut Maven Wrapper (`mvnw.cmd`), pas besoin d'installer Maven séparément

### Installation détaillée

#### 1. Installation de Java

1. Télécharger l'installateur depuis https://adoptium.net/
2. Exécuter l'installateur
3. Cocher "Set JAVA_HOME variable" et "Add to PATH"
4. Redémarrer l'invite de commande
5. Vérifier : `java -version`

#### 2. Installation de Node.js

1. Télécharger l'installateur LTS depuis https://nodejs.org/
2. Exécuter l'installateur (garder les options par défaut)
3. Redémarrer l'invite de commande
4. Vérifier : `node --version` et `npm --version`

#### 3. Installation de MySQL

1. Télécharger MySQL Installer depuis https://dev.mysql.com/downloads/installer/
2. Choisir "Custom" ou "Developer Default"
3. Installer "MySQL Server" et "MySQL Workbench"
4. Lors de la configuration :
   - Choisir "Development Computer"
   - Créer un mot de passe root (notez-le !)
   - Activer "Start MySQL Server at System Startup"
5. Terminer l'installation

---

## 🏠 Environnement 1 : Développement Local (Windows)

### Description
Développement sur votre PC Windows. Accessible uniquement depuis `localhost`.

### Étape 1 : Préparer la base de données

#### Option A : Avec MySQL Workbench (Interface graphique)

1. Ouvrir **MySQL Workbench**
2. Se connecter au serveur local (root)
3. Cliquer sur "Create Schema" (icône cylindre avec +)
4. Nom : `cosmetovigilance`
5. Cliquer "Apply"

#### Option B : En ligne de commande

1. Ouvrir **Invite de commandes** (CMD) en tant qu'administrateur
2. Se connecter à MySQL :
```cmd
mysql -u root -p
```
3. Entrer votre mot de passe root
4. Créer la base de données :
```sql
CREATE DATABASE cosmetovigilance;
EXIT;
```

### Étape 2 : Configurer le projet

1. Ouvrir l'invite de commandes dans le dossier du projet
2. Installer les dépendances frontend :
```cmd
npm install
```

3. Vérifier le fichier `.env.local` :
```
VITE_API_URL=http://localhost:8080/api
VITE_APP_URL=http://localhost:5173
```

4. Vérifier `backend\src\main\resources\application-local.properties` :
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cosmetovigilance
spring.datasource.username=root
spring.datasource.password=
```

Si vous avez un mot de passe MySQL, modifiez la ligne :
```properties
spring.datasource.password=votre_mot_de_passe
```

### Étape 3 : Lancer l'application

#### Option A : Script automatique (Recommandé)

Double-cliquer sur le fichier **`start-local.bat`**

Le script va :
- Vérifier que MySQL est démarré
- Configurer l'environnement
- Démarrer le backend dans une fenêtre
- Démarrer le frontend dans une autre fenêtre

#### Option B : Démarrage manuel

**Fenêtre CMD 1 - Backend :**
```cmd
cd backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

**Fenêtre CMD 2 - Frontend :**
```cmd
copy .env.local .env
npm run dev
```

### Accès à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:8080/api
- **Swagger UI** : http://localhost:8080/api/swagger-ui.html

### Arrêter l'application

- Fermer les fenêtres de commande
- OU appuyer sur `Ctrl+C` dans chaque fenêtre

---

## 🖥 Environnement 2 : Préparation pour VM Linux

### Description
Compiler l'application sur Windows pour la déployer ensuite sur une VM Linux de votre réseau.

### Étape 1 : Obtenir l'adresse IP de votre VM

Sur votre VM Linux, exécuter :
```bash
hostname -I
```
Notez l'adresse IP (exemple : `192.168.1.50`)

### Étape 2 : Préparer les fichiers sur Windows

#### Option A : Script automatique (Recommandé)

1. Double-cliquer sur **`start-vm.bat`**
2. Entrer l'adresse IP de votre VM quand demandé
3. Attendre la fin de la compilation

Le script va :
- Créer le fichier `.env` avec l'IP de la VM
- Configurer le backend
- Compiler le backend (fichier `.jar`)
- Compiler le frontend (dossier `dist`)

#### Option B : Préparation manuelle

1. **Créer le fichier `.env` :**
```cmd
copy .env.vm .env
notepad .env
```

Modifier avec l'IP de votre VM :
```
VITE_API_URL=http://192.168.1.50:8080/api
VITE_APP_URL=http://192.168.1.50:5173
```

2. **Configurer le backend :**
```cmd
notepad backend\src\main\resources\application-vm.properties
```

Remplacer `<VM_IP>` par votre IP et configurer le mot de passe MySQL :
```properties
spring.datasource.password=votre_mot_de_passe_securise
cors.allowed-origins=http://192.168.1.50:5173,http://192.168.1.50:3000
```

3. **Compiler le backend :**
```cmd
cd backend
mvnw.cmd clean package -DskipTests
cd ..
```

4. **Compiler le frontend :**
```cmd
npm run build
```

### Étape 3 : Transférer les fichiers vers la VM

#### Option A : Avec WinSCP (Interface graphique)

1. Télécharger WinSCP : https://winscp.net/
2. Se connecter à votre VM (SSH)
3. Transférer les fichiers :
   - `backend\target\cosmetovigilance-backend-1.0.0.jar` → `/home/votre_user/`
   - `dist\` (dossier complet) → `/home/votre_user/frontend/`

#### Option B : Avec SCP en ligne de commande

```cmd
scp backend\target\cosmetovigilance-backend-1.0.0.jar user@192.168.1.50:/home/user/
scp -r dist user@192.168.1.50:/home/user/frontend/
```

### Étape 4 : Sur la VM Linux

Se connecter à la VM via SSH (PuTTY ou terminal) :

```bash
# Se connecter via SSH
ssh user@192.168.1.50

# Installer Node.js si nécessaire
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer serve pour le frontend
npm install -g serve

# Démarrer le backend
nohup java -jar cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=vm > backend.log 2>&1 &

# Démarrer le frontend
nohup serve -s frontend -l 5173 --host 0.0.0.0 > frontend.log 2>&1 &

# Vérifier que les services sont démarrés
ps aux | grep java
ps aux | grep serve
```

### Étape 5 : Configurer le pare-feu de la VM

```bash
# Ubuntu/Debian
sudo ufw allow 8080/tcp
sudo ufw allow 5173/tcp
sudo ufw enable
```

### Accès à l'application

**Depuis n'importe quel PC du réseau :**
- Frontend : http://192.168.1.50:5173 (remplacer par votre IP)
- Backend : http://192.168.1.50:8080/api
- Swagger : http://192.168.1.50:8080/api/swagger-ui.html

### Arrêter l'application sur la VM

```bash
# Trouver les processus
ps aux | grep java
ps aux | grep serve

# Arrêter les processus (remplacer PID par le numéro du processus)
kill <PID_backend>
kill <PID_frontend>
```

---

## ☁️ Environnement 3 : Production Cloud Linux

### Description
Déploiement final sur un serveur Linux dans le cloud. Toutes les commandes sont exécutées sur le serveur Linux.

### Référence
Voir le fichier **`GUIDE_DEPLOIEMENT.md`** section "Environnement 3" pour les instructions complètes.

### Connexion au serveur

#### Option A : Avec PuTTY (Windows)

1. Télécharger PuTTY : https://www.putty.org/
2. Ouvrir PuTTY
3. Entrer l'IP de votre serveur
4. Port : 22
5. Cliquer "Open"
6. Se connecter avec vos identifiants

#### Option B : Avec OpenSSH (Windows 10+)

```cmd
ssh user@votre-serveur.com
```

### Déploiement

Une fois connecté au serveur Linux, suivre les instructions de `GUIDE_DEPLOIEMENT.md` pour la production.

---

## 🔧 Dépannage Windows

### Problème : "java n'est pas reconnu comme une commande interne"

**Solution :**
1. Vérifier que Java est installé : Ouvrir une nouvelle CMD et taper `java -version`
2. Si non reconnu, ajouter Java au PATH :
   - Ouvrir "Variables d'environnement système"
   - Chercher "JAVA_HOME" et "Path"
   - Ajouter : `C:\Program Files\Java\jdk-17\bin`
3. Redémarrer l'invite de commandes

### Problème : "node n'est pas reconnu comme une commande interne"

**Solution :**
1. Réinstaller Node.js depuis https://nodejs.org/
2. Cocher l'option "Add to PATH" pendant l'installation
3. Redémarrer l'invite de commandes

### Problème : MySQL ne démarre pas

**Solution 1 : Via Services Windows**
1. Appuyer sur `Win + R`
2. Taper `services.msc` et Enter
3. Chercher "MySQL80" (ou votre version)
4. Clic droit → Démarrer
5. Si échec, clic droit → Propriétés → Type de démarrage : "Automatique"

**Solution 2 : En ligne de commande (Admin)**
```cmd
net start MySQL80
```

**Solution 3 : Réinstaller MySQL**
Si le service n'existe pas, réinstaller MySQL depuis le site officiel.

### Problème : Le port 8080 est déjà utilisé

**Solution :**
```cmd
# Trouver le processus qui utilise le port 8080
netstat -ano | findstr :8080

# Tuer le processus (remplacer PID par le numéro)
taskkill /PID <PID> /F
```

### Problème : Erreur "Access Denied" dans MySQL

**Solution :**
```sql
-- Se connecter en root
mysql -u root -p

-- Donner tous les droits
GRANT ALL PRIVILEGES ON cosmetovigilance.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Problème : Le backend ne se compile pas

**Solution 1 : Nettoyer et recompiler**
```cmd
cd backend
mvnw.cmd clean install -U
cd ..
```

**Solution 2 : Supprimer le cache Maven**
```cmd
rmdir /s /q %USERPROFILE%\.m2\repository
cd backend
mvnw.cmd clean install
cd ..
```

### Problème : npm install échoue

**Solution :**
```cmd
# Nettoyer le cache npm
npm cache clean --force

# Supprimer node_modules
rmdir /s /q node_modules

# Réinstaller
npm install
```

### Problème : Le pare-feu Windows bloque l'accès

**Solution :**
1. Ouvrir "Pare-feu Windows Defender avec sécurité avancée"
2. Règles de trafic entrant → Nouvelle règle
3. Type : Port
4. Port TCP : 8080 et 5173
5. Autoriser la connexion
6. Profils : Tous
7. Nom : "Cosmetovigilance"

### Problème : Impossible d'exécuter les scripts .bat

**Solution :**
1. Vérifier que le fichier n'est pas bloqué :
   - Clic droit sur le fichier .bat
   - Propriétés
   - Si "Débloquer" est présent, le cocher
2. Exécuter en tant qu'administrateur :
   - Clic droit sur le .bat
   - "Exécuter en tant qu'administrateur"

---

## 💡 Conseils Windows

### Recommandations de développement

1. **Utiliser Windows Terminal** (au lieu de CMD classique)
   - Télécharger depuis le Microsoft Store
   - Plus moderne et confortable

2. **Éditeur de code recommandé**
   - Visual Studio Code : https://code.visualstudio.com/
   - IntelliJ IDEA Community : https://www.jetbrains.com/idea/download/

3. **Client MySQL graphique**
   - MySQL Workbench (inclus avec MySQL)
   - DBeaver : https://dbeaver.io/

4. **Client SSH pour Windows**
   - PuTTY : https://www.putty.org/
   - Windows Terminal + OpenSSH (intégré à Windows 10+)
   - MobaXterm : https://mobaxterm.mobatek.net/

5. **Transfert de fichiers vers Linux**
   - WinSCP : https://winscp.net/ (interface graphique)
   - FileZilla : https://filezilla-project.org/

### Raccourcis utiles

- `Win + R` → `cmd` : Ouvrir l'invite de commandes
- `Win + R` → `services.msc` : Ouvrir les services Windows
- `Ctrl + C` : Arrêter un processus dans CMD
- `cls` : Effacer l'écran de CMD
- `dir` : Lister les fichiers (équivalent de `ls` sur Linux)

---

## 📝 Notes importantes

### Différences Windows/Linux

| Commande | Windows | Linux |
|----------|---------|-------|
| Lister fichiers | `dir` | `ls` |
| Changer de dossier | `cd` | `cd` |
| Copier fichier | `copy` | `cp` |
| Supprimer fichier | `del` | `rm` |
| Variable d'env | `set VAR=value` | `export VAR=value` |
| Exécuter script | `script.bat` | `./script.sh` |
| Maven | `mvnw.cmd` | `./mvnw` |

### Chemins de fichiers

- Windows : `C:\Users\nom\projet\backend\src`
- Linux : `/home/nom/projet/backend/src`

### Séparateurs

- Windows : Backslash `\`
- Linux : Slash `/`

---

## 🔗 Liens utiles

- **Java (Adoptium)** : https://adoptium.net/
- **Node.js** : https://nodejs.org/
- **MySQL** : https://dev.mysql.com/downloads/
- **MySQL Workbench** : https://dev.mysql.com/downloads/workbench/
- **Visual Studio Code** : https://code.visualstudio.com/
- **Git pour Windows** : https://git-scm.com/download/win
- **PuTTY (SSH)** : https://www.putty.org/
- **WinSCP (SFTP)** : https://winscp.net/
- **Windows Terminal** : Microsoft Store

---

**Bon développement ! 🚀**
