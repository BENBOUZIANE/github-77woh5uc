# Migration Guide: Supabase to Spring Boot + MySQL

## Overview
This document outlines the migration of the Cosmetovigilance application from Supabase backend to Java Spring Boot REST API with MySQL database.

## Architecture

### Current Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

### Target Stack
- **Frontend**: React + Vite + TypeScript (unchanged)
- **Backend**: Java Spring Boot 3.x
- **Database**: MySQL 8.x
- **Authentication**: Spring Security + JWT
- **Storage**: Local file system or cloud storage (AWS S3, etc.)
- **API Documentation**: Springdoc OpenAPI 3 (Swagger UI)

## Project Structure

```
cosmetovigilance-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── cosmetovigilance/
│   │   │           ├── CosmetovigilanceApplication.java
│   │   │           ├── config/
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── JwtConfig.java
│   │   │           │   ├── OpenApiConfig.java
│   │   │           │   └── WebConfig.java
│   │   │           ├── controller/
│   │   │           │   ├── AuthController.java
│   │   │           │   ├── DeclarationController.java
│   │   │           │   └── AttachmentController.java
│   │   │           ├── service/
│   │   │           │   ├── AuthService.java
│   │   │           │   ├── DeclarationService.java
│   │   │           │   ├── UserService.java
│   │   │           │   └── AttachmentService.java
│   │   │           ├── repository/
│   │   │           │   ├── UserRepository.java
│   │   │           │   ├── DeclarationRepository.java
│   │   │           │   ├── DeclarantRepository.java
│   │   │           │   └── ...
│   │   │           ├── entity/
│   │   │           │   ├── User.java
│   │   │           │   ├── Declaration.java
│   │   │           │   ├── Declarant.java
│   │   │           │   ├── PersonneExposee.java
│   │   │           │   └── ...
│   │   │           ├── dto/
│   │   │           │   ├── request/
│   │   │           │   │   ├── LoginRequest.java
│   │   │           │   │   ├── RegisterRequest.java
│   │   │           │   │   └── DeclarationRequest.java
│   │   │           │   └── response/
│   │   │           │       ├── AuthResponse.java
│   │   │           │       ├── DeclarationResponse.java
│   │   │           │       └── DeclarationDetailResponse.java
│   │   │           ├── security/
│   │   │           │   ├── JwtTokenProvider.java
│   │   │           │   ├── JwtAuthenticationFilter.java
│   │   │           │   └── UserPrincipal.java
│   │   │           ├── exception/
│   │   │           │   ├── GlobalExceptionHandler.java
│   │   │           │   └── ResourceNotFoundException.java
│   │   │           └── util/
│   │   │               └── FileStorageUtil.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-prod.properties
│   │       └── db/
│   │           └── migration/
│   │               └── V1__init_schema.sql
│   └── test/
│       └── java/
│           └── com/
│               └── cosmetovigilance/
└── pom.xml
```

## Database Schema Migration

### PostgreSQL to MySQL Considerations

1. **UUID to VARCHAR(36)**: MySQL doesn't have native UUID type, use VARCHAR(36) or BINARY(16)
2. **TIMESTAMPTZ to DATETIME**: MySQL uses DATETIME instead of TIMESTAMPTZ
3. **Boolean**: MySQL uses TINYINT(1) for boolean
4. **Auto-increment**: Use `AUTO_INCREMENT` instead of `gen_random_uuid()`
5. **Text types**: TEXT type is similar in both

### Entity Relationships

```
User (auth_users)
  └── Declaration (1:many)
      ├── Declarant (1:1)
      │   └── Utilisateur (1:1)
      │       ├── ProfessionnelSante (1:1, optional)
      │       │   └── RepresentantLegal (1:1, optional)
      ├── PersonneExposee (1:1)
      │   ├── AllergiesConnues (1:many)
      │   ├── AntecedentsMedical (1:many)
      │   └── MedicamentProduitSimultanement (1:many)
      ├── EffetIndesirable (1:1)
      ├── PriseChargeMedicale (1:1)
      ├── ProduitSuspecte (1:1)
      └── Attachments (1:many)
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user info

### Declaration Endpoints
- `GET /api/declarations` - Get user's declarations (with pagination)
- `GET /api/declarations/{id}` - Get declaration details
- `POST /api/declarations` - Create new declaration
- `GET /api/declarations/view/{type}` - Get declarations by type

### Attachment Endpoints
- `POST /api/attachments/upload` - Upload file
- `GET /api/attachments/{id}` - Download file
- `DELETE /api/attachments/{id}` - Delete file

## Frontend Integration

### API Service Layer

Replace Supabase client calls with REST API calls using fetch or axios.

```typescript
// src/services/api.ts
import { AuthResponse, User, Declaration } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiService {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Login failed');
    return response.json();
  }

  async getDeclarations(): Promise<Declaration[]> {
    const response = await fetch(`${API_URL}/declarations`, {
      headers: { ...this.getAuthHeader() }
    });

    if (!response.ok) throw new Error('Failed to fetch declarations');
    return response.json();
  }

  // ... more methods
}

export const api = new ApiService();
```

### AuthContext Changes

```typescript
// Replace Supabase auth with REST API
const signIn = async (email: string, password: string) => {
  const response = await api.login(email, password);
  localStorage.setItem('access_token', response.access_token);
  localStorage.setItem('refresh_token', response.refresh_token);
  setUser(response.user);
};
```

## Migration Steps

### Phase 1: Backend Setup
1. Create Spring Boot project with dependencies
2. Configure MySQL database connection
3. Create JPA entities based on Supabase schema
4. Implement repositories
5. Create DTOs for request/response
6. Implement services with business logic
7. Create REST controllers
8. Configure Spring Security + JWT
9. Add Swagger/OpenAPI documentation
10. Test all endpoints with Postman/Swagger UI

### Phase 2: Frontend Integration
1. Create API service layer
2. Replace Supabase client in AuthContext
3. Update all Supabase calls to REST API calls
4. Update data models if needed
5. Test authentication flow
6. Test declaration creation
7. Test declaration listing and details
8. Test file upload

### Phase 3: Testing & Deployment
1. End-to-end testing
2. Performance testing
3. Security testing
4. Deploy backend (Docker, AWS, etc.)
5. Update frontend environment variables
6. Deploy frontend
7. Monitor and optimize

## Environment Variables

### Backend (.env or application.properties)
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/cosmetovigilance
spring.datasource.username=root
spring.datasource.password=your_password

# JWT
jwt.secret=your-secret-key-min-256-bits
jwt.expiration=86400000
jwt.refresh.expiration=604800000

# File Storage
file.upload-dir=./uploads
file.max-size=10485760
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
```

## Key Differences to Handle

1. **UUID Generation**: Spring Boot generates UUID differently than PostgreSQL
2. **File Storage**: Need to implement file storage (local or cloud)
3. **CORS**: Configure CORS properly in Spring Security
4. **Date Handling**: Ensure proper date serialization/deserialization
5. **Validation**: Use Jakarta Validation annotations
6. **Error Handling**: Consistent error responses across all endpoints

## Security Considerations

1. **Password Hashing**: Use BCryptPasswordEncoder
2. **JWT Security**: Use strong secret key (256+ bits)
3. **HTTPS**: Use HTTPS in production
4. **CORS**: Restrict CORS to specific origins
5. **Rate Limiting**: Implement rate limiting for auth endpoints
6. **Input Validation**: Validate all inputs
7. **SQL Injection**: Use JPA queries (no raw SQL)
8. **XSS Protection**: Sanitize user inputs

## Performance Optimization

1. **Database Indexing**: Add indexes on frequently queried columns
2. **Lazy Loading**: Use lazy loading for relationships
3. **Pagination**: Implement pagination for list endpoints
4. **Caching**: Use Spring Cache for frequently accessed data
5. **Connection Pooling**: Configure HikariCP properly
6. **Compression**: Enable GZIP compression

## Monitoring & Logging

1. **Logging**: Use SLF4J with Logback
2. **Metrics**: Use Spring Actuator
3. **Error Tracking**: Integrate Sentry or similar
4. **Performance**: Monitor with APM tools

## Next Steps

1. Review this migration guide
2. Set up Spring Boot project
3. Implement backend endpoints
4. Test with Swagger UI
5. Integrate with frontend
6. Deploy and monitor
