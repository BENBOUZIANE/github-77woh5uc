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

Lancer avec un profil :

```bash
# Local
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# VM
java -jar target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=vm

# Production
java -jar target/cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=prod
```

Exemple pour le **profil local** dans `src/main/resources/application-local.properties` :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cosmetovigilance?...
spring.datasource.username=root
spring.datasource.password=test1234
```

**Mot de passe DB (profils local et vm)**  
- Par défaut le mot de passe est en **clair** (`test1234`) pour que la config fonctionne sans étape supplémentaire.
- Pour le **chiffrer** (optionnel) : lancer `mvn compile exec:java -Dexec.mainClass=com.cosmetovigilance.util.EncryptPasswordUtil -Dexec.args="cosmetoKey test1234"`, copier la ligne `spring.datasource.password=ENC(...)` affichée dans le fichier, et au démarrage définir `JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey`.

En **production**, la configuration passe par des variables d'environnement (voir `application-prod.properties` et [README-PROD.md](../README-PROD.md)).

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

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

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
