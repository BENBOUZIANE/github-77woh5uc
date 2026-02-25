import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Beaker, Package, LogIn, LayoutDashboard } from 'lucide-react';
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-end mb-8">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Tableau de bord
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Connexion
            </button>
          )}
        </div>
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
              <img
                src="/Designer_(2)_(1).png"
                alt="Logo Cosmétovigilance"
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Vigilances Sanitaires et Gestions des Risques
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Système de déclaration et de surveillance des effets indésirables.
            Sélectionnez le type de produit concerné pour commencer votre déclaration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {productTypes.map((product) => {
            const Icon = product.icon;
            return (
              <button
                key={product.id}
                onClick={() => navigate(product.path)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="p-8">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${product.color} mb-6 shadow-lg`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                    {product.title}
                  </h2>

                  <p className="text-slate-600 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-6 flex items-center text-slate-500 group-hover:text-slate-700 transition-colors">
                    <span className="text-sm font-semibold">Accéder au formulaire</span>
                    <svg
                      className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform"
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

        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-md">
            <Shield className="w-5 h-5 text-slate-600 mr-2" />
            <span className="text-sm text-slate-600 font-medium">
              Toutes les déclarations sont traitées de manière confidentielle
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
