import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Beaker, Package, LogIn, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const productTypes = [
  {
    id: 'cosmetovigilance',
    title: 'Produits cosmétiques ou d\'hygiène corporelle',
    description: 'Déclaration d\'effets indésirables liés aux produits cosmétiques',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
    path: '/cosmetovigilance'
  },
  {
    id: 'test1',
    title: 'Dispositifs Médicaux',
    description: 'Déclaration d\'incidents liés aux dispositifs médicaux',
    icon: Beaker,
    color: 'from-blue-500 to-cyan-600',
    path: '/test1'
  },
  {
    id: 'test2',
    title: 'Diagnostic In Vitro',
    description: 'Déclaration d\'incidents liés aux diagnostics in vitro',
    icon: Package,
    color: 'from-amber-500 to-orange-600',
    path: '/test2'
  },
  {
    id: 'test3',
    title: 'Complément Alimentaire',
    description: 'Déclaration d\'incidents liés aux compléments alimentaires',
    icon: Shield,
    color: 'from-rose-500 to-pink-600',
    path: '/test3'
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <img
                src="/Designer_(2)_(1)_(1).png"
                alt="Logo"
                className="w-14 h-14 object-contain"
              />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Vigilances Sanitaires</h2>
                <p className="text-xs sm:text-sm text-emerald-600 font-medium">Gestion des Risques</p>
              </div>
            </div>
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg text-sm"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Tableau de bord</span>
                <span className="sm:hidden">Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg text-sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Connexion
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
            Système de Déclaration des Effets Indésirables
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
            Sélectionnez le type de produit concerné pour commencer votre déclaration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {productTypes.map((product) => {
            const Icon = product.icon;
            return (
              <button
                key={product.id}
                onClick={() => navigate(product.path)}
                className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-slate-200 hover:border-emerald-300 text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${product.color} shadow-md`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                    {product.title}
                  </h2>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-4 flex items-center text-emerald-600 group-hover:text-emerald-700 transition-colors">
                    <span className="text-sm font-semibold">Accéder au formulaire</span>
                    <svg
                      className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center pb-8">
          <div className="inline-flex items-center px-5 py-3 bg-white rounded-full shadow-md border border-slate-200">
            <Shield className="w-5 h-5 text-emerald-600 mr-2" />
            <span className="text-sm text-slate-700 font-medium">
              Toutes les déclarations sont traitées de manière confidentielle et sécurisée
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
