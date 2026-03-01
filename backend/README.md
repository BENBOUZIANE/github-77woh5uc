# Cosmetovigilance Backend API

A comprehensive Spring Boot REST API for managing cosmetovigilance declarations.

## Architecture

### Technology Stack
- Java 17
- Spring Boot 3.2.1
- Spring Security with JWT Authentication
- Spring Data JPA
- MySQL 8
- Flyway for database migrations
- Swagger/OpenAPI for API documentation
- Lombok for reducing boilerplate code

### Project Structure

```
backend/
├── src/main/java/com/cosmetovigilance/
│   ├── config/                     # Configuration classes
│   │   ├── OpenApiConfig.java      # Swagger/OpenAPI configuration
│   │   ├── SecurityConfig.java     # Spring Security configuration
│   │   └── WebConfig.java          # Web/CORS configuration
│   ├── controller/                 # REST Controllers
│   │   ├── AuthController.java     # Authentication endpoints
│   │   └── DeclarationController.java # Declaration management endpoints
│   ├── dto/                        # Data Transfer Objects
│   │   ├── ApiResponse.java
│   │   ├── AuthResponse.java
│   │   ├── DeclarantDto.java
│   │   ├── DeclarationRequest.java
│   │   ├── DeclarationResponse.java
│   │   ├── EffetIndesirableDto.java
│   │   ├── LoginRequest.java
│   │   ├── PersonneExposeeDto.java
│   │   ├── PriseChargeMedicaleDto.java
│   │   ├── ProduitSuspecteDto.java
│   │   ├── RegisterRequest.java
│   │   └── UserDto.java
│   ├── exception/                  # Exception handling
│   │   └── GlobalExceptionHandler.java
│   ├── model/                      # JPA Entity classes
│   │   ├── AllergiesConnues.java
│   │   ├── AntecedentsMedical.java
│   │   ├── Attachment.java
│   │   ├── Declarant.java
│   │   ├── Declaration.java
│   │   ├── EffetIndesirable.java
│   │   ├── MedicamentProduitSimultanement.java
│   │   ├── PersonneExposee.java
│   │   ├── PriseChargeMedicale.java
│   │   ├── ProduitSuspecte.java
│   │   ├── ProfessionnelSante.java
│   │   ├── RepresentantLegal.java
│   │   ├── User.java
│   │   └── Utilisateur.java
│   ├── repository/                 # Spring Data JPA Repositories
│   │   ├── AllergiesConnuesRepository.java
│   │   ├── AntecedentsMedicalRepository.java
│   │   ├── AttachmentRepository.java
│   │   ├── DeclarantRepository.java
│   │   ├── DeclarationRepository.java
│   │   ├── EffetIndesirableRepository.java
│   │   ├── MedicamentProduitSimultanementRepository.java
│   │   ├── PersonneExposeeRepository.java
│   │   ├── PriseChargeMedicaleRepository.java
│   │   ├── ProduitSuspecteRepository.java
│   │   ├── ProfessionnelSanteRepository.java
│   │   ├── RepresentantLegalRepository.java
│   │   ├── UserRepository.java
│   │   └── UtilisateurRepository.java
│   ├── security/                   # Security components
│   │   ├── JwtAuthenticationEntryPoint.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── JwtTokenProvider.java
│   ├── service/                    # Business logic layer
│   │   ├── AuthService.java
│   │   ├── CustomUserDetailsService.java
│   │   └── DeclarationService.java
│   └── CosmetovigilanceApplication.java # Main application class
└── src/main/resources/
    ├── application.properties      # Application configuration
    └── db/migration/               # Flyway migrations
        └── V1__init_schema.sql

```

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

## Configuration

Le backend utilise des **profils Spring** ; chaque environnement a son fichier :

| Profil | Fichier | Usage |
|--------|---------|--------|
| **local** | `application-local.properties` | Tests sur votre PC (voir [README-LOCAL.md](../README-LOCAL.md) à la racine) |
| **vm** | `application-vm.properties` | VM / réseau local avec Nginx (voir [README-VM.md](../README-VM.md)) |
| **prod** | `application-prod.properties` | Production Linux (voir [README-PROD.md](../README-PROD.md)) |

### Lancer avec un profil

**IMPORTANT** : Le mot de passe de la base de données est maintenant **chiffré avec AES-256**. Vous devez définir la variable d'environnement `JASYPT_ENCRYPTOR_PASSWORD` pour démarrer l'application.

```bash
# Local (Windows)
set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Local (Linux/Mac)
export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# VM (Windows)
set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
java -jar target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=vm

# VM (Linux/Mac)
export JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey
java -jar target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=vm

# Production
JASYPT_ENCRYPTOR_PASSWORD=<votre_cle_production> java -jar target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=prod
```

### Mot de passe de la Base de Données (Chiffrement AES-256)

Le mot de passe `test1234` est maintenant **chiffré** dans tous les fichiers de configuration avec **Jasypt** et l'algorithme **AES-256** :

```properties
spring.datasource.password=ENC(JCwGHLjP0Y8yN2kVxRQzMw==)
```

**Clé de chiffrement** : `cosmetoKey` (à définir dans `JASYPT_ENCRYPTOR_PASSWORD`)

#### Générer un nouveau mot de passe chiffré

Si vous souhaitez changer le mot de passe de la base de données :

**Windows :**
```cmd
encrypt-password.cmd <cle_jasypt> <nouveau_mot_de_passe>
```

**Linux/Mac :**
```bash
./encrypt-password.sh <cle_jasypt> <nouveau_mot_de_passe>
```

Exemple :
```bash
./encrypt-password.sh cosmetoKey monNouveauPassword
```

Le script affichera la valeur chiffrée à copier dans les fichiers de configuration.

**Documentation complète** : Consultez [CHIFFREMENT-PASSWORD.md](CHIFFREMENT-PASSWORD.md) et [SECURITE.md](SECURITE.md)

En **production**, utilisez une clé de chiffrement **différente et forte** !

## Running the Application

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api` (with default config).

Swagger UI (when the profile enables it): `http://localhost:8080/api/swagger-ui.html`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)

### Declarations

All declaration endpoints require Bearer token authentication.

- `POST /api/declarations` - Create a new declaration
- `GET /api/declarations` - Get all declarations
- `GET /api/declarations/{id}` - Get declaration by ID
- `GET /api/declarations/my-declarations` - Get current user's declarations

## Security

### JWT Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Database Password Encryption

Le mot de passe de la base de données est chiffré avec **Jasypt** (AES-256). Pour plus d'informations :
- [CHIFFREMENT-PASSWORD.md](CHIFFREMENT-PASSWORD.md) - Guide complet du chiffrement
- [SECURITE.md](SECURITE.md) - Documentation de sécurité générale

**Important** : En production, changez la clé de chiffrement Jasypt et la clé JWT !

## Database Migrations

Database schema changes are managed using Flyway. Migration files are located in `src/main/resources/db/migration/`.

The initial schema is created automatically on first run.

## Error Handling

The API uses a consistent error response format:

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

Validation errors return a map of field errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Email should be valid",
    "password": "Password must be at least 6 characters"
  }
}
```
