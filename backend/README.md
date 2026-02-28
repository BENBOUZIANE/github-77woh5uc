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
│   │   └── WebConfig.java          # Web/CORS + Static resources
│   ├── controller/                 # REST Controllers
│   │   ├── SpaController.java      # Frontend routing (NEW)
│   │   ├── AuthController.java     # /api/auth endpoints
│   │   ├── DeclarationController.java # /api/declarations endpoints
│   │   └── AttachmentController.java  # /api/attachments endpoints
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

Update `src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cosmetovigilance?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
```

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

The API will be available at `http://localhost:8080/api`

## API Documentation

Once the application is running, access the Swagger UI documentation at:
```
http://localhost:8081/api/swagger-ui.html
```

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
