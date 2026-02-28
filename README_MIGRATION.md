# Cosmetovigilance Migration: Supabase to Spring Boot

## Overview

This project has been migrated from Supabase backend to Java Spring Boot REST API with MySQL database.

## Directory Structure

```
project/
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/cosmetovigilance/
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/
│   │   └── test/
│   ├── pom.xml
│   ├── IMPLEMENTATION_CODE.md        # Complete Java code
│   └── README.md
├── src/                              # React Frontend
│   ├── services/
│   │   └── api.ts                    # NEW: REST API Service
│   ├── contexts/
│   │   └── AuthContext.tsx           # UPDATED: Uses REST API
│   └── ...
├── MIGRATION_GUIDE.md                # Complete migration guide
├── FRONTEND_INTEGRATION_GUIDE.md     # Frontend integration steps
└── README_MIGRATION.md               # This file
```

## Quick Start

### Prerequisites

- Java 17 or higher
- MySQL 8.x
- Node.js 18+ and npm
- Maven 3.6+

### Backend Setup

1. Create MySQL database:
```sql
CREATE DATABASE cosmetovigilance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Update database credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cosmetovigilance
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Build and run the backend:
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Install dependencies (if not already done):
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:8080/api
```

3. Update AuthContext to use REST API (see FRONTEND_INTEGRATION_GUIDE.md)

4. Start the frontend:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Documentation

Once the backend is running, access the interactive API documentation:

**Swagger UI**: http://localhost:8080/api/swagger-ui.html

## Migration Status

### ✅ Completed

- [x] Backend project structure
- [x] Maven configuration (pom.xml)
- [x] MySQL database schema
- [x] Spring Security configuration
- [x] JWT authentication implementation
- [x] User entity and repository
- [x] Auth endpoints (login, register)
- [x] Swagger/OpenAPI configuration
- [x] CORS configuration
- [x] Frontend API service layer
- [x] Database migration scripts

### 🚧 TODO

- [ ] Complete all entity implementations
- [ ] Declaration endpoints
- [ ] File upload functionality
- [ ] Update all frontend pages to use REST API
- [ ] Remove Supabase dependencies from frontend
- [ ] Integration testing
- [ ] Production deployment configuration

## Key Changes

### Authentication

**Before (Supabase):**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
```

**After (REST API):**
```typescript
const response = await api.login(email, password);
```

### Data Fetching

**Before (Supabase):**
```typescript
const { data } = await supabase
  .from('declaration')
  .select('*')
  .eq('user_id', user.id);
```

**After (REST API):**
```typescript
const data = await api.getDeclarations();
```

### File Upload

**Before (Supabase):**
```typescript
await supabase.storage.from('attachments').upload(path, file);
```

**After (REST API):**
```typescript
await api.uploadFile(file, declarationId);
```

## Architecture Comparison

### Before: Supabase

```
React Frontend
    ↓
Supabase Client SDK
    ↓
Supabase Cloud
    ├── PostgreSQL Database
    ├── Auth Service
    ├── Storage Service
    └── Row Level Security (RLS)
```

### After: Spring Boot

```
React Frontend
    ↓
REST API (fetch/axios)
    ↓
Spring Boot Backend
    ├── Spring Security + JWT
    ├── JPA/Hibernate
    ├── Business Logic
    └── MySQL Database
```

## Benefits of Migration

1. **Full Control**: Complete control over backend logic and database
2. **Type Safety**: Strong typing with Java and DTOs
3. **Scalability**: Easy to scale horizontally
4. **Documentation**: Auto-generated API docs with Swagger
5. **Enterprise Ready**: Industry-standard stack
6. **Custom Logic**: Implement complex business logic easily
7. **Cost**: Potentially lower costs at scale
8. **Security**: Fine-grained control over authentication and authorization

## Development Workflow

### Making Backend Changes

1. Update entity/DTO/controller
2. Restart Spring Boot application (or use Spring DevTools for hot reload)
3. Test endpoint in Swagger UI
4. Update frontend if API contract changes

### Making Frontend Changes

1. Update React components
2. Frontend hot-reloads automatically
3. Test in browser

## Testing

### Backend Testing

```bash
cd backend
./mvnw test
```

### Frontend Testing

```bash
npm run test
```

### API Testing

Use Swagger UI or tools like Postman:
- Swagger UI: http://localhost:8080/api/swagger-ui.html
- API Docs JSON: http://localhost:8080/api/api-docs

## Deployment

### Backend Deployment

1. Build production JAR:
```bash
cd backend
./mvnw clean package -DskipTests
```

2. Run JAR:
```bash
java -jar target/cosmetovigilance-backend-1.0.0.jar
```

3. Or use Docker:
```dockerfile
FROM openjdk:17-slim
COPY target/cosmetovigilance-backend-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

### Frontend Deployment

1. Build production bundle:
```bash
npm run build
```

2. Deploy `dist` folder to your hosting service (Netlify, Vercel, AWS S3, etc.)

## Environment Variables

### Backend

Create `application-prod.properties`:
```properties
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}
jwt.secret=${JWT_SECRET}
file.upload-dir=${UPLOAD_DIR}
```

### Frontend

Create `.env.production`:
```env
VITE_API_URL=https://your-api-domain.com/api
```

## Security Considerations

1. **JWT Secret**: Use a strong secret key (256+ bits)
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Restrict CORS to specific origins
4. **Rate Limiting**: Implement rate limiting for auth endpoints
5. **Input Validation**: All inputs are validated
6. **SQL Injection**: Protected by JPA/Hibernate
7. **Password Hashing**: BCrypt with 10 rounds

## Support and Documentation

- **Migration Guide**: See `MIGRATION_GUIDE.md`
- **Implementation Code**: See `backend/IMPLEMENTATION_CODE.md`
- **Frontend Integration**: See `FRONTEND_INTEGRATION_GUIDE.md`
- **API Documentation**: http://localhost:8080/api/swagger-ui.html

## Troubleshooting

### Backend won't start

1. Check MySQL is running
2. Verify database credentials
3. Check port 8081 is not in use
4. Review logs for errors

### Frontend can't connect to API

1. Verify backend is running
2. Check VITE_API_URL in .env
3. Check CORS configuration
4. Open browser DevTools Network tab

### Authentication issues

1. Check JWT token is being sent
2. Verify token format (Bearer <token>)
3. Check token expiration
4. Review backend security logs

## Next Steps

1. Complete remaining entity implementations
2. Implement all declaration endpoints
3. Add file upload/download functionality
4. Update all frontend pages
5. Remove Supabase dependencies
6. Add comprehensive error handling
7. Write unit and integration tests
8. Set up CI/CD pipeline
9. Deploy to production
10. Monitor and optimize

## Contact

For questions or issues, please contact the development team.
