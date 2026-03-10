import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, LogIn, LayoutDashboard } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('📝 Démarrage du handleSubmit avec email:', email);
      await signIn(email, password);
      console.log('✅ signIn terminé avec succès');
      console.log('📍 Navigation vers /dashboard');
      navigate('/dashboard');
      console.log('📍 Navigate appelé');
    } catch (err: any) {
      console.error('❌ Erreur dans handleSubmit:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-slate-900">Vigilances Sanitaires</h2>
                <p className="text-sm text-slate-600">Gestion des Risques</p>
              </div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img
                src="/logo_ammps.png"
                alt="Logo AMMPS"
                className="w-40 h-40 object-contain"
              />
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">Bienvenue, {user.email}</span>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg text-sm"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Tableau de bord</span>
                  <span className="sm:hidden">Dashboard</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg text-sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Connexion</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center space-x-4">
              <img
                src="/logo.png"
                alt="Logo Cosmétovigilance"
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
            Connexion
          </h1>
          <p className="text-slate-600 text-center mb-8">
            Connectez-vous pour accéder à votre tableau de bord
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Chargement...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Se connecter
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
