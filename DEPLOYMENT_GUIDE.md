# Guide de Déploiement - Frontend React

## Problème Identifié

Le frontend est une **Single Page Application (SPA)** React. Les SPAs nécessitent une configuration serveur spéciale pour fonctionner correctement, car toutes les routes doivent servir le fichier `index.html`.

## Solutions de Déploiement

### Option 1 : Serveur Node Express (Simple et Rapide)

**Étapes :**

1. Construire le projet :
```bash
npm run build
```

2. Installer Express (si pas déjà fait) :
```bash
npm install
```

3. Démarrer le serveur :
```bash
npm run serve
```

Le serveur écoute sur le port 3000 par défaut. Pour changer le port :
```bash
PORT=8081 npm run serve
```

**Pour le déploiement en production :**
```bash
npm install
npm run build
NODE_ENV=production PORT=80 npm run serve
```

---

### Option 2 : Nginx (Recommandé pour Production)

**Configuration Nginx (`/etc/nginx/sites-available/votre-site`) :**

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    root /chemin/vers/votre/projet/dist;
    index index.html;

    # CRUCIAL : Servir index.html pour toutes les routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1000;
}
```

**Étapes :**

1. Construire le projet :
```bash
npm run build
```

2. Copier les fichiers `dist/` vers votre serveur

3. Créer le fichier de configuration Nginx

4. Activer le site :
```bash
sudo ln -s /etc/nginx/sites-available/votre-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Option 3 : Apache

**Fichier `.htaccess` (à placer dans le dossier `dist/`) :**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Étapes :**

1. Activer mod_rewrite :
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

2. Construire le projet :
```bash
npm run build
```

3. Copier le contenu de `dist/` (y compris le `.htaccess`) vers `/var/www/html/`

4. Configurer Apache pour autoriser `.htaccess` :
```apache
<Directory /var/www/html>
    AllowOverride All
</Directory>
```

---

### Option 4 : Services d'Hébergement Cloud

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## Configuration de l'API Backend

**Important :** Le frontend doit connaître l'URL du backend.

Créez un fichier `.env.production` :

```env
VITE_API_URL=https://votre-api.com/api
```

Ou définissez la variable d'environnement lors du build :
```bash
VITE_API_URL=https://votre-api.com/api npm run build
```

---

## Checklist de Déploiement

- [ ] Build réussi (`npm run build`)
- [ ] Dossier `dist/` généré avec `index.html`
- [ ] Configuration serveur pour SPA (redirect toutes les routes vers index.html)
- [ ] Variable d'environnement `VITE_API_URL` configurée
- [ ] CORS configuré sur le backend pour accepter l'origine du frontend
- [ ] Test de toutes les routes (/, /login, /dashboard, etc.)

---

## Dépannage

### Erreur 404 sur les routes
**Problème :** Le serveur ne redirige pas vers `index.html`
**Solution :** Vérifiez la configuration du serveur (voir options ci-dessus)

### API non accessible
**Problème :** CORS ou mauvaise URL d'API
**Solution :**
- Vérifiez `VITE_API_URL` dans `.env.production`
- Configurez CORS sur le backend (voir `WebConfig.java`)

### Page blanche
**Problème :** Fichiers JS/CSS non chargés
**Solution :** Vérifiez que les fichiers `dist/assets/` sont accessibles

### Connexion refusée
**Problème :** Serveur non accessible de l'extérieur
**Solution :**
- Vérifiez le firewall (ouvrez le port)
- Vérifiez que le serveur écoute sur `0.0.0.0` et non `127.0.0.1`
