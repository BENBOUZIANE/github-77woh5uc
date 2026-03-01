# Démarrage en VM (réseau local, Windows)

Environnement : **Windows** (VM ou PC accessible sur le réseau local).  
Frontend : servi par **nginx** (build `npm run build`).  
Backend : profil **vm** (`application-vm.properties`).  
Commandes nginx pour **Windows**.

---

## 1. Prérequis

- **Node.js** 18+, **Java JDK 17+**, **Maven** 3.8+, **MySQL** 8+
- **Nginx pour Windows** : [téléchargement](https://nginx.org/en/download.html) — extraire dans un dossier (ex. `C:\nginx`).

---

## 2. Configuration

### Backend : `backend/src/main/resources/application-vm.properties`

Remplacer **`<VM_IP>`** par l’IP de la machine sur le réseau (ex. `192.168.1.50`) :

```properties
# Écoute sur toutes les interfaces
server.address=0.0.0.0
server.port=8080
server.servlet.context-path=/api

# Base de données (adapter si MySQL est sur une autre machine)
spring.datasource.url=jdbc:mysql://localhost:3306/cosmetovigilance?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=VOTRE_MOT_DE_PASSE

# CORS / CSP : <VM_IP> remplacé par l’IP réelle (ex. 192.168.1.50)
# Si vous utilisez cors.allow-any-origin=true, la liste allowed-origins est secondaire.
app.csp.allowed-http-hosts=localhost,127.0.0.1,<VM_IP>
app.csp.allow-private-network-http=true
```

### Frontend : build avec la bonne URL d’API

Utiliser le fichier **`.env.vm`** à la racine du projet. Remplacer **`<VM_IP>`** par l’IP de la VM (ex. `192.168.1.50`) :

```env
VITE_API_URL=http://<VM_IP>:8080/api
VITE_CSP_ALLOWED_HTTP_HOSTS=localhost,127.0.0.1,<VM_IP>
VITE_CSP_ALLOW_PRIVATE_NETWORK_HTTP=true
```

Puis lancer le build pour la VM (charge `.env.vm`) :

```cmd
npm run build:vm
```

### Nginx : configuration

Dans le dossier nginx (ex. `C:\nginx`), éditer `conf\nginx.conf` (ou un fichier inclus). Exemple de bloc `server` :

```nginx
server {
    listen 80;
    server_name localhost;
    root   C:/chemin/vers/project/dist;
    index  index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Adapter `root` vers le chemin réel de votre dossier `dist` (résultat de `npm run build`).

---

## 3. Démarrer les services (Windows)

### Démarrer Nginx

```cmd
cd C:\nginx
start nginx
```

Ou si nginx est installé comme service Windows :

```cmd
net start nginx
```

### Démarrer le backend

```cmd
cd backend
mvnw.cmd clean package -DskipTests
java -jar target\cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=vm
```

Pour tourner en arrière-plan, utilisez un outil comme NSSM ou un script.

### Vérifier que le front est bien servi

Ouvrir **http://localhost** (ou **http://&lt;VM_IP&gt;** depuis une autre machine du réseau).

---

## 4. Arrêter les services (Windows)

### Arrêter Nginx

```cmd
cd C:\nginx
nginx -s stop
```

Ou :

```cmd
net stop nginx
```

### Arrêter le backend

`Ctrl+C` dans le terminal où le JAR tourne, ou terminer le processus Java (Gestionnaire des tâches ou `taskkill`).

---

## 5. Résumé des commandes (Windows)

| Action        | Commande |
|---------------|----------|
| Démarrer nginx | `cd C:\nginx && start nginx` |
| Arrêter nginx  | `cd C:\nginx && nginx -s stop` |
| Recharger nginx | `cd C:\nginx && nginx -s reload` |
| Tester la config nginx | `cd C:\nginx && nginx -t` |

---

## 6. Accès depuis le réseau

- Depuis la machine : **http://localhost** ou **http://&lt;VM_IP&gt;**  
- Depuis une autre machine du même réseau : **http://&lt;VM_IP&gt;**  
- Backend direct (pour debug) : **http://&lt;VM_IP&gt;:8080/api**

Assurez-vous que le pare-feu Windows autorise les ports 80 (nginx) et 8080 (backend) si vous accédez depuis d’autres postes.
