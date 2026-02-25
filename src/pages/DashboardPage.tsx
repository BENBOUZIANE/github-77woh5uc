import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Sparkles, Beaker, Package, Shield, FileText } from 'lucide-react';

const declarationTypes = [
  {
    id: 'cosmetovigilance',
    title: 'Produits cosmétiques',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
    path: '/dashboard/cosmetovigilance'
  },
  {
    id: 'dispositifs-medicaux',
    title: 'Dispositifs Médicaux',
    icon: Beaker,
    color: 'from-blue-500 to-cyan-600',
    path: '/dashboard/dispositifs-medicaux'
  },
  {
    id: 'diagnostic-in-vitro',
    title: 'Diagnostic In Vitro',
    icon: Package,
    color: 'from-amber-500 to-orange-600',
    path: '/dashboard/diagnostic-in-vitro'
  },
  {
    id: 'complement-alimentaire',
    title: 'Complément Alimentaire',
    icon: Shield,
    color: 'from-rose-500 to-pink-600',
    path: '/dashboard/complement-alimentaire'
  }
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center">
            <img
              src="/Designer_(2)_(1).png"
              alt="Logo"
              className="w-16 h-16 object-contain mr-4"
            />
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Tableau de bord</h1>
              <p className="text-lg text-slate-600">
                Bienvenue, <span className="font-medium">{user?.email}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center px-4 py-2 text-slate-700 hover:text-slate-900 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Déconnexion
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-bold text-slate-900">Mes déclarations</h2>
          </div>
          <p className="text-slate-600 mb-8">
            Consultez vos déclarations par type de produit
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {declarationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => navigate(type.path)}
                  className="group relative overflow-hidden rounded-xl bg-white border-2 border-slate-200 hover:border-transparent hover:shadow-xl transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                  <div className="relative p-6">
                    <div className={`inline-flex p-3 bg-gradient-to-br ${type.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {type.title}
                    </h3>

                    <p className="text-sm text-slate-600">
                      Voir mes déclarations
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Statistiques</h3>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">0</p>
            <p className="text-sm text-slate-600">Déclarations totales</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">En cours</h3>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">0</p>
            <p className="text-sm text-slate-600">Déclarations en traitement</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Traitées</h3>
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">0</p>
            <p className="text-sm text-slate-600">Déclarations complétées</p>
          </div>
        </div>
      </div>
    </div>
  );
}
