# Configuration de l'envoi d'emails

## Aperçu

Le système envoie automatiquement un email au déclarant lorsque le commentaire ANMPS est sauvegardé. L'email contient:
- Le commentaire ANMPS
- Le statut actuel de la déclaration
- L'identifiant de la déclaration

## Configuration SMTP

### Utilisation de Gmail

1. **Créer un mot de passe d'application Gmail**:
   - Connectez-vous à votre compte Gmail
   - Allez dans "Gérer votre compte Google" → "Sécurité"
   - Activez la validation en deux étapes si ce n'est pas déjà fait
   - Recherchez "Mots de passe des applications"
   - Sélectionnez "Autre" et entrez "Cosmétovigilance"
   - Copiez le mot de passe généré (16 caractères)

2. **Configurer les variables d'environnement**:
   ```bash
   export MAIL_USERNAME=votre-email@gmail.com
   export MAIL_PASSWORD=votre-mot-de-passe-application
   ```

### Utilisation d'un autre fournisseur SMTP

Modifiez `application.properties`:

```properties
spring.mail.host=smtp.votre-fournisseur.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
```

## Test de l'envoi d'email

1. Démarrez le backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. Connectez-vous au dashboard

3. Ouvrez une déclaration

4. Dans la section "Commentaires et Pièces Jointes":
   - Entrez un commentaire dans le champ "Commentaire ANMPS"
   - Cliquez sur "Sauvegarder et envoyer email"

5. Le déclarant devrait recevoir un email à l'adresse enregistrée

## Gestion des erreurs

Si l'envoi d'email échoue, le système:
- Enregistre une erreur dans les logs
- Continue le traitement (le commentaire est quand même sauvegardé)
- N'interrompt pas l'application

Vérifiez les logs pour diagnostiquer les problèmes d'envoi d'email.

## Format de l'email

```
Objet: Mise à jour de votre déclaration - [ID]

Bonjour,

Votre déclaration #[ID] a été mise à jour.

Statut actuel: [STATUT]

Commentaire de l'ANMPS:
[COMMENTAIRE]

Cordialement,
L'équipe de Cosmétovigilance
```

## Sécurité

⚠️ **Important**:
- Ne commitez JAMAIS les identifiants SMTP dans Git
- Utilisez toujours des variables d'environnement
- Utilisez des mots de passe d'application, pas votre mot de passe principal
- Pour la production, utilisez un service d'envoi d'emails dédié (SendGrid, AWS SES, etc.)
