# Frontend Integration Guide

This guide explains how to integrate the new REST API with your existing React frontend.

## Step 1: Environment Variables

Update your `.env` file:

```env
VITE_API_URL=http://localhost:8080/api
```

## Step 2: Update AuthContext

Replace the Supabase auth implementation with REST API calls.

### src/contexts/AuthContext.tsx

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (api.isAuthenticated()) {
          const userData = await api.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await api.register(email, password);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## Step 3: Update Declaration Pages

### MyDeclarationsPage.tsx

Replace the Supabase query:

```typescript
// OLD CODE:
const { data, error } = await supabase
  .from(config.view)
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

// NEW CODE:
const data = await api.getDeclarations(type);
```

### DeclarationDetailPage.tsx

Replace complex Supabase joins:

```typescript
// OLD CODE:
const { data: declarationData, error: declarationError } = await supabase
  .from('declaration')
  .select(`
    id,
    created_at,
    commentaire,
    user_id,
    declarant:declarant_id (...)
  `)
  .eq('id', id)
  .maybeSingle();

// NEW CODE:
const declarationData = await api.getDeclarationById(id);
```

## Step 4: Update CosmetovigillancePage

### File Upload

Replace Supabase storage with REST API:

```typescript
// OLD CODE:
const { error: uploadError } = await supabase.storage
  .from('attachments')
  .upload(fileName, file);

// NEW CODE:
await api.uploadFile(file, declarationData.id);
```

### Form Submission

Replace the complex Supabase transaction with a single API call:

```typescript
// OLD CODE:
const { data: utilisateurData, error: utilisateurError } = await supabase
  .from('utilisateur')
  .insert({ type: utilisateurTypeToSave })
  .select()
  .maybeSingle();

// NEW CODE:
const declaration = await api.createDeclaration({
  utilisateurType: formData.utilisateurType,
  declarant: formData.declarant,
  personneExposee: formData.personneExposee,
  allergiesConnues: formData.allergiesConnues,
  antecedentsMedicaux: formData.antecedentsMedicaux,
  medicamentsSimultanes: formData.medicamentsSimultanes,
  effetIndesirable: formData.effetIndesirable,
  priseChargeMedicale: formData.priseChargeMedicale,
  produitSuspecte: formData.produitSuspecte,
  commentaire: formData.commentaire,
  professionnelSante: formData.professionnelSante,
  representantLegal: formData.representantLegal
});
```

## Step 5: Remove Supabase Dependencies

1. Remove Supabase client file:
```bash
rm src/lib/supabaseClient.ts
```

2. Update package.json - remove `@supabase/supabase-js`:
```bash
npm uninstall @supabase/supabase-js
```

3. Remove Supabase environment variables from `.env`:
```bash
# Remove these:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

## Step 6: Data Model Adjustments

The API responses match the Supabase structure, so minimal changes are needed. However, note these differences:

### Date Handling

The API returns ISO date strings. Ensure proper parsing:

```typescript
new Date(declaration.created_at).toLocaleDateString('fr-FR')
```

### User Object

The user object is simpler:

```typescript
// OLD: Supabase User
user.id
user.email
user.created_at
user.app_metadata
user.user_metadata

// NEW: REST API User
user.id
user.email
```

## Step 7: Error Handling

Update error handling to match REST API responses:

```typescript
try {
  const data = await api.getDeclarations();
  setDeclarations(data);
} catch (err: any) {
  setError(err.message || 'An error occurred');
}
```

## Step 8: Testing Checklist

- [ ] Login works correctly
- [ ] Registration works correctly
- [ ] Logout works correctly
- [ ] Protected routes redirect to login
- [ ] Dashboard loads user declarations
- [ ] Declaration form submission works
- [ ] File upload works
- [ ] Declaration detail page loads correctly
- [ ] All API calls use proper authentication headers
- [ ] Error messages display correctly

## Step 9: Development Workflow

1. Start the Spring Boot backend:
```bash
cd backend
./mvnw spring-boot:run
```

2. Start the frontend dev server:
```bash
npm run dev
```

3. Access Swagger UI for API documentation:
```
http://localhost:8080/api/swagger-ui.html
```

## Common Issues and Solutions

### CORS Errors

If you see CORS errors, ensure the backend CORS configuration includes your frontend URL:

```properties
# backend/src/main/resources/application.properties
cors.allowed-origins=http://localhost:5173,http://localhost:3000
```

### Authentication Errors

If authentication fails:
1. Check JWT token is being sent in headers
2. Verify token is not expired
3. Check backend logs for authentication errors

### 404 Errors

Ensure API_URL is correct:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
```

### Data Not Loading

1. Open browser DevTools Network tab
2. Check API calls are being made
3. Verify response data structure
4. Check for JavaScript errors in console

## Production Deployment

### Backend

1. Build the JAR file:
```bash
cd backend
./mvnw clean package
```

2. Deploy to your server (AWS, Heroku, etc.)

3. Set production environment variables

### Frontend

1. Update `.env.production`:
```env
VITE_API_URL=https://your-api-domain.com/api
```

2. Build the frontend:
```bash
npm run build
```

3. Deploy the `dist` folder to your hosting service

## Next Steps

1. Test all functionality thoroughly
2. Implement additional endpoints as needed
3. Add proper logging and monitoring
4. Set up CI/CD pipeline
5. Configure production database
6. Implement rate limiting
7. Add comprehensive error handling
8. Set up backup strategy
