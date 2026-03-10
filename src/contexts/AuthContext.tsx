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
        console.log('🔐 Initialisation de l\'authentification...');
        console.log('🔐 Token présent:', !!localStorage.getItem('access_token'));
        if (api.isAuthenticated()) {
          console.log('🔐 Utilisateur authentifié, récupération des données...');
          const userData = await api.getCurrentUser();
          console.log('🔐 Données utilisateur reçues:', userData);
          setUser(userData);
        } else {
          console.log('ℹ️ Aucun token d\'authentification trouvé');
        }
      } catch (error) {
        console.error('❌ Erreur d\'initialisation auth:', error);
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
      console.log('🔐 Démarrage du login...');
      const response = await api.login(email, password);
      console.log('🔐 Réponse du login reçue:', response);
      console.log('🔐 User dans la réponse:', response.user);
      setUser(response.user);
      console.log('✅ User setUser avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du login:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    const response = await api.register(email, password);
    setUser(response.user);
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
