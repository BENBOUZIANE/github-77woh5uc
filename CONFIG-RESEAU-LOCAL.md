# Configuration pour Accès Réseau Local

Ce document explique comment configurer l'application pour qu'elle soit accessible depuis n'importe quel poste du réseau local (192.168.1.x).

## Configuration Résumée

### 1. Backend CORS (Déjà configuré)

Le fichier `backend/src/main/resources/application-vm.properties` est configuré pour accepter **toutes les origines** :

```properties
# CORS Configuration - Permet l'accès depuis tout le réseau local
cors.allow-any-origin=true
cors.allowed-origins=http://192.168.1.109:5137,http://192.168.1.109,http://localhost:5137
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
cors.allowed-headers=*
cors.max-age=3600
```

**IMPORTANT** : Le paramètre `cors.allow-any-origin=true` permet les connexions depuis **TOUTES les adresses** du réseau local.

### 2. Configuration Nginx (nginx.conf)

Le fichier `nginx.conf` est configuré pour écouter sur toutes les interfaces :

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name 192.168.1.109;  # Changez avec l'IP de votre VM

    # Permettre les connexions depuis tout le réseau local
    # allow 192.168.0.0/16;  # Décommenter pour limiter à 192.168.x.x
    # deny all;               # Décommenter pour bloquer les autres

    # ... reste de la configuration
}
```

Par défaut, **tous les accès sont autorisés**. Pour restreindre uniquement au réseau local, décommentez les lignes `allow` et `deny`.

## Accès depuis un Poste du Réseau

### Depuis n'importe quel PC du réseau 192.168.1.x

Les utilisateurs peuvent simplement accéder à l'application via :

```
http://192.168.1.109
```

Remplacez `192.168.1.109` par l'IP réelle de votre VM.

### Aucune Configuration Nécessaire Côté Client

Les utilisateurs n'ont RIEN à configurer. Ils ouvrent simplement leur navigateur et accèdent à l'URL de la VM.

## Vérification de la Configuration

### Test depuis un autre PC du réseau

```bash
# Tester l'accès à l'application
curl http://192.168.1.109

# Tester l'API
curl http://192.168.1.109/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### Test CORS depuis le navigateur

Ouvrez la console du navigateur (F12) et exécutez :

```javascript
fetch('http://192.168.1.109/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'test@test.com', password: 'test123'})
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Si vous voyez une erreur CORS, le backend n'est pas correctement configuré.

## Limiter l'Accès au Réseau Local

### Option 1 : Via Nginx (Recommandé)

Éditez `/etc/nginx/sites-available/cosmetovigilance` :

```nginx
server {
    listen 80;
    server_name 192.168.1.109;

    # Autoriser seulement le réseau local 192.168.x.x
    allow 192.168.0.0/16;
    deny all;

    # ... reste de la configuration
}
```

Redémarrez Nginx :
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2 : Via Firewall

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow from 192.168.0.0/16 to any port 80
sudo ufw deny 80

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.0.0/16" port port="80" protocol="tcp" accept'
sudo firewall-cmd --reload
```

### Option 3 : Via Backend CORS (Plus restrictif)

Dans `application-vm.properties`, changez :

```properties
# Désactiver allow-any-origin
cors.allow-any-origin=false

# Spécifier les origines autorisées
cors.allowed-origins=http://192.168.1.109,http://192.168.1.110,http://192.168.1.111
```

Cette option nécessite de lister TOUTES les adresses IP autorisées.

## Configuration par Type de Réseau

### Petit Réseau (< 20 postes)

**Recommandation** : Gardez la configuration actuelle (`cors.allow-any-origin=true`).

**Sécurité** : Utilisez le firewall pour limiter l'accès au réseau local uniquement.

### Réseau Moyen (20-100 postes)

**Recommandation** : Limitez via Nginx avec `allow 192.168.0.0/16`.

**Backend** : Gardez `cors.allow-any-origin=true` pour faciliter l'accès.

### Grand Réseau ou Production

**Recommandation** :
1. Activez HTTPS avec certificat SSL
2. Utilisez un reverse proxy avec authentification
3. Limitez CORS aux domaines spécifiques
4. Activez les logs d'audit

```properties
cors.allow-any-origin=false
cors.allowed-origins=https://intranet.entreprise.local
```

## Résolution des Problèmes

### Erreur CORS depuis un autre PC

**Symptôme** : "Access to fetch at 'http://192.168.1.109/api/...' from origin 'http://192.168.1.105' has been blocked by CORS policy"

**Solution** :

1. Vérifier que le backend est démarré avec le profil `vm` :
   ```bash
   sudo journalctl -u cosmetovigilance-backend | grep "active profile"
   # Devrait afficher : active profile: vm
   ```

2. Vérifier la configuration CORS :
   ```bash
   grep "cors.allow-any-origin" backend/src/main/resources/application-vm.properties
   # Devrait afficher : cors.allow-any-origin=true
   ```

3. Redémarrer le backend :
   ```bash
   sudo systemctl restart cosmetovigilance-backend
   ```

### Impossible d'accéder depuis un autre PC

**Symptôme** : Timeout ou "Site can't be reached"

**Solutions** :

1. **Vérifier le firewall sur la VM** :
   ```bash
   # Ubuntu/Debian
   sudo ufw status

   # CentOS/RHEL
   sudo firewall-cmd --list-all
   ```

2. **Autoriser le port 80** :
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 80/tcp

   # CentOS/RHEL
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --reload
   ```

3. **Vérifier que Nginx écoute sur toutes les interfaces** :
   ```bash
   sudo netstat -tlnp | grep :80
   # Devrait afficher : 0.0.0.0:80 (pas 127.0.0.1:80)
   ```

4. **Vérifier la configuration Nginx** :
   ```bash
   grep "listen" /etc/nginx/sites-available/cosmetovigilance
   # Devrait afficher :
   # listen 80;
   # listen [::]:80;
   ```

### L'application fonctionne en local mais pas depuis le réseau

**Symptôme** : `http://localhost` fonctionne sur la VM, mais `http://192.168.1.109` ne fonctionne pas depuis un autre PC.

**Solution** : Le firewall bloque probablement les connexions externes.

```bash
# Tester depuis la VM
curl http://localhost/api/auth/login

# Tester depuis l'IP
curl http://192.168.1.109/api/auth/login

# Si le premier fonctionne mais pas le second, c'est le firewall
sudo ufw allow 80/tcp
sudo systemctl restart nginx
```

## Commandes de Diagnostic

### Depuis la VM

```bash
# Vérifier les services
sudo systemctl status cosmetovigilance-backend nginx

# Vérifier les ports ouverts
sudo netstat -tlnp | grep -E '80|8080'

# Vérifier le firewall
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-all  # CentOS

# Tester l'API localement
curl http://localhost:8080/api/auth/login

# Tester via Nginx
curl http://localhost/api/auth/login
```

### Depuis un Autre PC du Réseau

```bash
# Tester la connectivité réseau
ping 192.168.1.109

# Tester le port 80
nc -zv 192.168.1.109 80

# Tester l'application
curl http://192.168.1.109
```

## Documentation Complète

Pour plus d'informations, consultez :
- [README-DEPLOY-VM.md](README-DEPLOY-VM.md) - Déploiement complet sur VM
- [nginx.conf](nginx.conf) - Configuration Nginx
- [backend/SECURITE.md](backend/SECURITE.md) - Sécurité et bonnes pratiques
