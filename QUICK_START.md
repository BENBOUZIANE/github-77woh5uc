# Quick Start Guide

Get your migrated Cosmetovigilance application up and running in 10 minutes.

## Prerequisites Check

```bash
# Check Java version (need 17+)
java -version

# Check Maven
mvn -version

# Check MySQL
mysql --version

# Check Node.js (need 18+)
node --version
```

## Step 1: Database Setup (2 minutes)

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE cosmetovigilance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

## Step 2: Backend Configuration (1 minute)

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

## Step 3: Start Backend (2 minutes)

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

Wait for: `Started CosmetovigilanceApplication in X seconds`

## Step 4: Verify Backend (1 minute)

Open in browser: http://localhost:8080/api/swagger-ui.html

You should see the Swagger API documentation.

## Step 5: Frontend Configuration (1 minute)

Create `project/.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

## Step 6: Install Frontend Dependencies (2 minutes)

```bash
# From project root
npm install
```

## Step 7: Start Frontend (1 minute)

```bash
npm run dev
```

Open: http://localhost:5173

## Step 8: Test the Application

### Test Registration

1. Go to http://localhost:5173/login
2. Click "Register" (or create registration UI)
3. Enter email: test@example.com
4. Enter password: password123
5. Click Register

### Test Login

1. Enter same credentials
2. Click Login
3. You should be redirected to dashboard

### Test API in Swagger

1. Go to http://localhost:8080/api/swagger-ui.html
2. Click "auth-controller"
3. Try "/auth/login" endpoint
4. Click "Try it out"
5. Enter credentials:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
6. Click "Execute"
7. You should see 200 response with tokens

## Verify Everything is Working

### Backend Health Check

```bash
curl http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": "...",
    "email": "test@example.com"
  }
}
```

### Frontend Check

Open browser DevTools (F12):
- Network tab should show successful API calls
- Console should have no errors
- localStorage should contain 'access_token'

## Common Issues

### Port 8080 already in use

```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### MySQL Connection Error

Check:
1. MySQL is running: `mysql.server status`
2. Credentials are correct in application.properties
3. Database exists: `SHOW DATABASES;`

### Frontend can't reach backend

Check:
1. Backend is running (http://localhost:8080/api/swagger-ui.html)
2. VITE_API_URL is set correctly in .env
3. No CORS errors in browser console

### Build Errors

```bash
# Backend: Clean and rebuild
cd backend
./mvnw clean install -U

# Frontend: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. ✅ Backend and frontend are running
2. ✅ Authentication works
3. 📝 Complete remaining entity implementations
4. 📝 Implement declaration endpoints
5. 📝 Update all frontend pages to use REST API
6. 📝 Remove Supabase dependencies
7. 📝 Test all functionality
8. 📝 Deploy to production

## Useful Commands

### Backend

```bash
# Run backend
cd backend && ./mvnw spring-boot:run

# Run tests
cd backend && ./mvnw test

# Build JAR
cd backend && ./mvnw clean package

# Run JAR
java -jar backend/target/cosmetovigilance-backend-1.0.0.jar
```

### Frontend

```bash
# Dev mode
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

### Database

```bash
# Access MySQL
mysql -u root -p cosmetovigilance

# Show tables
SHOW TABLES;

# Check users
SELECT * FROM users;

# Check declarations
SELECT * FROM declaration;
```

## Development Workflow

1. Make changes to Java code
2. Stop backend (Ctrl+C)
3. Restart: `./mvnw spring-boot:run`
4. Test in Swagger UI
5. Update frontend if needed
6. Frontend hot-reloads automatically
7. Test in browser

## Getting Help

- **Migration Guide**: `MIGRATION_GUIDE.md`
- **Implementation Details**: `backend/IMPLEMENTATION_CODE.md`
- **Frontend Integration**: `FRONTEND_INTEGRATION_GUIDE.md`
- **Full Documentation**: `README_MIGRATION.md`
- **API Docs**: http://localhost:8080/api/swagger-ui.html

## Success Checklist

- [ ] Java 17+ installed
- [ ] MySQL 8.x running
- [ ] Database created
- [ ] Backend starts without errors
- [ ] Swagger UI accessible
- [ ] Frontend starts without errors
- [ ] Can register new user
- [ ] Can login
- [ ] JWT tokens stored in localStorage
- [ ] API calls succeed
- [ ] No CORS errors

If all checkboxes are checked, you're ready to continue the migration!
