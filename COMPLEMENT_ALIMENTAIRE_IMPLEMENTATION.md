# Implémentation du Module Compléments Alimentaires

## Vue d'ensemble

Ce document décrit l'implémentation complète du module de nutrivigilance pour les compléments alimentaires, en complément du module existant de cosmétovigilance.

## Architecture

L'implémentation suit une architecture MVC stricte avec une séparation totale entre les modules cosmétiques et compléments alimentaires :

```
backend/
├── model/                      # Entités JPA
│   ├── ComplementAlimentaire.java
│   ├── DeclarantCA.java
│   ├── ProfessionnelSanteCA.java
│   ├── RepresentantLegalCA.java
│   ├── PersonneExposeeCA.java
│   ├── AllergiesConnuesCA.java
│   ├── AntecedentsMedicalCA.java
│   ├── MedicamentProduitSimultanementCA.java
│   ├── EffetIndesirableCA.java
│   ├── PriseChargeMedicaleCA.java
│   └── ComplementSuspecte.java
│
├── repository/                 # Repositories Spring Data JPA
│   ├── ComplementAlimentaireRepository.java
│   ├── DeclarantCARepository.java
│   ├── ProfessionnelSanteCARepository.java
│   ├── RepresentantLegalCARepository.java
│   ├── PersonneExposeeCARepository.java
│   ├── AllergiesConnuesCARepository.java
│   ├── AntecedentsMedicalCARepository.java
│   ├── MedicamentProduitSimultanementCARepository.java
│   ├── EffetIndesirableCARepository.java
│   ├── PriseChargeMedicaleCARepository.java
│   └── ComplementSuspecteRepository.java
│
├── dto/                        # Data Transfer Objects
│   ├── ComplementAlimentaireRequest.java
│   ├── ComplementAlimentaireResponse.java
│   ├── DeclarantCADto.java
│   ├── ProfessionnelSanteCADto.java
│   ├── RepresentantLegalCADto.java
│   ├── PersonneExposeeCADto.java
│   ├── EffetIndesirableCADto.java
│   ├── PriseChargeMedicaleCADto.java
│   └── ComplementSuspecteDto.java
│
├── service/                    # Services métier
│   └── ComplementAlimentaireService.java
│
└── controller/                 # Contrôleurs REST
    └── ComplementAlimentaireController.java
```

## Base de Données

### Schéma

La migration `V2__complement_alimentaire_schema.sql` crée 12 tables :

1. **complement_alimentaire** - Table principale
2. **declarant_ca** - Informations du déclarant (cryptées)
3. **professionnel_sante_ca** - Professionnel de santé
4. **representant_legal_ca** - Représentant légal
5. **personne_exposee_ca** - Personne exposée (cryptée)
6. **allergies_connues_ca** - Allergies
7. **antecedents_medical_ca** - Antécédents médicaux
8. **medicament_produit_simultanement_ca** - Médicaments simultanés
9. **effet_indesirable_ca** - Effets indésirables
10. **criteres_gravite_ca** - Critères de gravité
11. **prise_charge_medicale_ca** - Prise en charge
12. **complement_suspecte** - Complément suspecté

### Sécurité

- **RLS (Row Level Security)** activé sur toutes les tables
- **Chiffrement AES** des données personnelles
- **Politiques restrictives** par défaut
- **Séparation stricte** des données par utilisateur

## API REST

### Endpoints

```
POST   /api/complements-alimentaires              # Créer une déclaration
GET    /api/complements-alimentaires/mes-declarations  # Mes déclarations
GET    /api/complements-alimentaires              # Toutes (ANMPS)
GET    /api/complements-alimentaires/{id}         # Déclaration par ID
PUT    /api/complements-alimentaires/{id}/statut  # Modifier statut (ANMPS)
PUT    /api/complements-alimentaires/{id}/commentaire-anmps  # Ajouter commentaire (ANMPS)
```

### Exemple de Requête

```json
{
  "utilisateurType": "professionnel",
  "declarant": {
    "nom": "Dupont",
    "prenom": "Marie",
    "email": "marie.dupont@example.com",
    "tel": "0612345678"
  },
  "professionnelSante": {
    "profession": "medecin",
    "structure": "CHU Hassan II",
    "ville": "Casablanca"
  },
  "personneExposee": {
    "type": "patient",
    "nomPrenom": "Patient A",
    "age": 45,
    "ageUnite": "Année",
    "sexe": "F",
    "ville": "Casablanca"
  },
  "allergiesConnues": ["Gluten"],
  "antecedentsMedicaux": ["Diabète"],
  "medicamentsSimultanes": ["Metformine"],
  "effetIndesirable": {
    "localisation": "Abdomen",
    "descriptionSymptomes": "Douleurs abdominales",
    "dateApparition": "2024-01-15",
    "delaiSurvenue": "24h",
    "gravite": false,
    "evolutionEffet": "EN_COURS"
  },
  "priseChargeMedicale": {
    "consultationMedicale": true,
    "diagnosticMedecin": "Intolérance alimentaire"
  },
  "complementSuspecte": {
    "nomCommercial": "Vitamine D Plus",
    "marque": "NutriSanté",
    "fabricant": "BioLab",
    "numeroLot": "LOT2024-001",
    "formeGalenique": "Gélule",
    "posologie": "1 gélule par jour",
    "frequenceUtilisation": "Quotidienne",
    "dateDebutUtilisation": "2024-01-01"
  }
}
```

## Statistiques

### Service de Statistiques

Il faut étendre le `StatisticsService` existant pour inclure les statistiques des compléments alimentaires :

```java
// À ajouter dans StatisticsService.java

public Map<String, Object> getComplementAlimentaireStats() {
    Map<String, Object> stats = new HashMap<>();

    // Total des déclarations
    long total = complementAlimentaireRepository.count();
    stats.put("totalDeclarations", total);

    // Par statut
    List<Object[]> byStatut = complementAlimentaireRepository.countByStatutGrouped();
    Map<String, Long> statutMap = new HashMap<>();
    for (Object[] row : byStatut) {
        statutMap.put(row[0].toString(), (Long) row[1]);
    }
    stats.put("parStatut", statutMap);

    // Effets graves
    long effetsGraves = effetIndesirableCARepository.countByGraviteTrue();
    stats.put("effetsGraves", effetsGraves);

    // Par forme galénique
    List<Object[]> byForme = complementSuspecteRepository.countByFormeGaleniqueGrouped();
    Map<String, Long> formeMap = new HashMap<>();
    for (Object[] row : byForme) {
        if (row[0] != null) {
            formeMap.put(row[0].toString(), (Long) row[1]);
        }
    }
    stats.put("parFormeGalenique", formeMap);

    // Par sexe
    List<Object[]> bySexe = personneExposeeCARepository.countBySexeGrouped();
    Map<String, Long> sexeMap = new HashMap<>();
    for (Object[] row : bySexe) {
        if (row[0] != null) {
            sexeMap.put(row[0].toString(), (Long) row[1]);
        }
    }
    stats.put("parSexe", sexeMap);

    // Par ville (top 10)
    List<Object[]> byVille = personneExposeeCARepository.countByVilleGrouped();
    List<Map<String, Object>> villeList = new ArrayList<>();
    int count = 0;
    for (Object[] row : byVille) {
        if (count >= 10) break;
        if (row[0] != null) {
            Map<String, Object> villeData = new HashMap<>();
            villeData.put("ville", row[0]);
            villeData.put("count", row[1]);
            villeList.add(villeData);
            count++;
        }
    }
    stats.put("parVille", villeList);

    return stats;
}

// Statistiques globales combinées
public Map<String, Object> getStatistiquesGlobales() {
    Map<String, Object> stats = new HashMap<>();

    // Cosmétiques
    stats.put("cosmetiques", getCosmetiqueStats());

    // Compléments alimentaires
    stats.put("complementsAlimentaires", getComplementAlimentaireStats());

    // Totaux agrégés
    long totalDeclarations = declarationRepository.count() +
                            complementAlimentaireRepository.count();
    stats.put("totalDeclarationsGlobal", totalDeclarations);

    return stats;
}
```

### Contrôleur de Statistiques

```java
// À ajouter dans StatisticsController.java

@GetMapping("/complements-alimentaires")
@PreAuthorize("hasRole('ANMPS')")
@SecurityRequirement(name = "Bearer Authentication")
@Operation(summary = "Obtenir les statistiques des compléments alimentaires")
public ResponseEntity<ApiResponse<Map<String, Object>>> getComplementAlimentaireStats() {
    Map<String, Object> stats = statisticsService.getComplementAlimentaireStats();
    return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
            .success(true)
            .message("Statistiques récupérées avec succès")
            .data(stats)
            .build());
}

@GetMapping("/globales")
@PreAuthorize("hasRole('ANMPS')")
@SecurityRequirement(name = "Bearer Authentication")
@Operation(summary = "Obtenir les statistiques globales (cosmétiques + compléments)")
public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistiquesGlobales() {
    Map<String, Object> stats = statisticsService.getStatistiquesGlobales();
    return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
            .success(true)
            .message("Statistiques globales récupérées avec succès")
            .data(stats)
            .build());
}
```

## Frontend React

### Structure

```
src/
├── pages/
│   ├── ComplementAlimentairePage.tsx      # Formulaire de déclaration
│   ├── MesDeclarationsCAPage.tsx          # Liste des déclarations utilisateur
│   └── DashboardPage.tsx                   # Dashboard avec stats globales
│
├── services/
│   └── apiCA.ts                            # Service API dédié
│
└── components/
    └── ... (composants réutilisables)
```

### Service API

Créer `src/services/apiCA.ts` :

```typescript
import { aesEncrypt, aesDecrypt } from '../utils/encryption';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface ComplementAlimentaireFormData {
  utilisateurType: string;
  declarant: any;
  professionnelSante?: any;
  representantLegal?: any;
  personneExposee: any;
  allergiesConnues: string[];
  antecedentsMedicaux: string[];
  medicamentsSimultanes: string[];
  effetIndesirable: any;
  priseChargeMedicale: any;
  complementSuspecte: any;
  commentaire?: string;
}

export const complementAlimentaireApi = {
  async createDeclaration(formData: ComplementAlimentaireFormData, documentEnregistrement?: File) {
    const token = localStorage.getItem('token');

    const encryptedData = {
      ...formData,
      declarant: {
        ...formData.declarant,
        nom: await aesEncrypt(formData.declarant.nom),
        prenom: await aesEncrypt(formData.declarant.prenom),
        email: await aesEncrypt(formData.declarant.email),
        tel: await aesEncrypt(formData.declarant.tel),
      },
      personneExposee: {
        ...formData.personneExposee,
        nomPrenom: await aesEncrypt(formData.personneExposee.nomPrenom),
      },
    };

    const formDataToSend = new FormData();
    formDataToSend.append('data', new Blob([JSON.stringify(encryptedData)], { type: 'application/json' }));

    if (documentEnregistrement) {
      formDataToSend.append('documentEnregistrement', documentEnregistrement);
    }

    const response = await fetch(`${API_URL}/complements-alimentaires`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formDataToSend,
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  },

  async getMesDeclarations() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/complements-alimentaires/mes-declarations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  },

  async getDeclarationById(id: number) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/complements-alimentaires/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  },

  async getAllDeclarations() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/complements-alimentaires`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  },

  async updateStatut(id: number, statut: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/complements-alimentaires/${id}/statut`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statut }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  },

  async updateCommentaireAnmps(id: number, commentaire: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/complements-alimentaires/${id}/commentaire-anmps`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commentaire }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  },
};
```

## Tests et Validation

### Tests Backend

```bash
# Dans le dossier backend
mvn clean test
mvn clean package
```

### Tests de l'API

```bash
# Créer une déclaration
curl -X POST http://localhost:8080/api/complements-alimentaires \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "data=@request.json"

# Obtenir mes déclarations
curl -X GET http://localhost:8080/api/complements-alimentaires/mes-declarations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Statistiques (ANMPS)
curl -X GET http://localhost:8080/api/statistiques/complements-alimentaires \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Déploiement

### Étapes

1. **Migration de la base de données**
   ```bash
   # Flyway appliquera automatiquement V2__complement_alimentaire_schema.sql
   mvn clean install
   ```

2. **Build backend**
   ```bash
   cd backend
   mvn clean package
   ```

3. **Build frontend**
   ```bash
   npm run build
   ```

4. **Démarrage**
   ```bash
   # Backend
   java -jar backend/target/cosmetovigilance-backend-1.0.0.jar

   # Frontend (développement)
   npm run dev
   ```

## Sécurité

### Données Chiffrées

Les champs suivants sont chiffrés en AES-256 :
- Nom et prénom du déclarant
- Email et téléphone du déclarant
- Nom/prénom de la personne exposée

### Politiques RLS

- Utilisateurs : accès à leurs propres déclarations uniquement
- ANMPS : accès à toutes les déclarations
- Pas d'accès sans authentification

## Maintenance

### Logs

Les logs sont générés dans :
- `backend/logs/application.log`

### Backups

Sauvegarder régulièrement :
- Base de données PostgreSQL
- Fichiers uploadés dans `backend/uploads/`

## Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les logs
3. Tester les endpoints avec curl/Postman

## Conclusion

Cette implémentation fournit un système complet et indépendant pour la gestion des déclarations de compléments alimentaires, tout en maintenant la cohérence avec le module existant de cosmétovigilance.

Les deux modules :
- Partagent la même architecture
- Utilisent les mêmes mécanismes de sécurité
- Restent totalement indépendants
- Peuvent être étendus séparément
