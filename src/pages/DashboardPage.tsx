import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LogIn, LayoutDashboard, Sparkles, Beaker, Package, Shield, FileText, TrendingUp, BarChart3, PieChart as PieChartIcon, Users, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import PieChart from '../components/PieChart';
import BarChart from '../components/BarChart';
import StackedBarChart from '../components/StackedBarChart';

const declarationTypes = [
  {
    id: 'cosmetovigilance',
    title: 'Produits cosmétiques',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    path: '/dashboard/cosmetovigilance'
  },
  {
    id: 'dispositifs-medicaux',
    title: 'Dispositifs Médicaux',
    icon: Beaker,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    path: '/dashboard/dispositifs-medicaux'
  },
  {
    id: 'diagnostic-in-vitro',
    title: 'Diagnostic In Vitro',
    icon: Package,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    path: '/dashboard/diagnostic-in-vitro'
  },
  {
    id: 'complement-alimentaire',
    title: 'Complément Alimentaire',
    icon: Shield,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    path: '/dashboard/complement-alimentaire'
  }
];

interface StatsByStatus {
  nouveau: number;
  en_cours: number;
  traite: number;
  rejete: number;
  cloture: number;
}

interface StatsByType {
  [key: string]: StatsByStatus;
}

interface AdvancedStats {
  ageGravite: any;
  sexeGravite: any;
  notifiantGravite: any;
  criteresGravite: any;
  typeProduitGravite: any;
  classification: any;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<StatsByType>({});
  const [loading, setLoading] = useState(true);
  const [advancedStats, setAdvancedStats] = useState<AdvancedStats | null>(null);
  const [totalStats, setTotalStats] = useState<StatsByStatus>({
    nouveau: 0,
    en_cours: 0,
    traite: 0,
    rejete: 0,
    cloture: 0
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await api.getDeclarations();

      const statsByType: StatsByType = {};
      const totals: StatsByStatus = {
        nouveau: 0,
        en_cours: 0,
        traite: 0,
        rejete: 0,
        cloture: 0
      };

      declarationTypes.forEach(type => {
        statsByType[type.id] = {
          nouveau: 0,
          en_cours: 0,
          traite: 0,
          rejete: 0,
          cloture: 0
        };
      });

      if (Array.isArray(data)) {
        data.forEach((decl: any) => {
          const status = decl.statut?.toLowerCase() || 'nouveau';
          const type = 'cosmetovigilance';

          if (statsByType[type] && status in statsByType[type]) {
            statsByType[type][status as keyof StatsByStatus]++;
            totals[status as keyof StatsByStatus]++;
          }
        });
      }

      setStats(statsByType);
      setTotalStats(totals);

      try {
        const advancedData = await api.getAllStatistics();
        setAdvancedStats(advancedData);
      } catch (error) {
        console.error('Error fetching advanced statistics:', error);
      }
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      // Erreur silencieuse
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
                className="w-20 h-20 object-contain"
              />
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-slate-900">Vigilances Sanitaires</h2>
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
                  onClick={handleSignOut}
                  className="flex items-center px-4 py-2 bg-white text-slate-700 rounded-lg shadow-sm hover:shadow-md transition-all text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-md text-sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Connexion</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900">Tableau de bord</h1>
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

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-slate-900">Statistiques globales</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-slate-900">
                {loading ? '...' : Object.values(totalStats).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Nouveau</p>
              <p className="text-3xl font-bold text-blue-900">
                {loading ? '...' : totalStats.nouveau}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
              <p className="text-sm text-amber-700 mb-1">En cours</p>
              <p className="text-3xl font-bold text-amber-900">
                {loading ? '...' : totalStats.en_cours}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-green-700 mb-1">Traité</p>
              <p className="text-3xl font-bold text-green-900">
                {loading ? '...' : totalStats.traite}
              </p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Clôturé</p>
              <p className="text-3xl font-bold text-slate-900">
                {loading ? '...' : totalStats.cloture + totalStats.rejete}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-bold text-slate-900">Distribution par statut par type d'activité</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {declarationTypes.map((type) => {
              const Icon = type.icon;
              const typeStats = stats[type.id] || {
                nouveau: 0,
                en_cours: 0,
                traite: 0,
                rejete: 0,
                cloture: 0
              };

              return (
                <div key={type.id} className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className={`p-3 ${type.bgColor} rounded-lg mr-3`}>
                      <Icon className={`w-6 h-6 ${type.textColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{type.title}</h3>
                  </div>
                  {!loading && (
                    <div className="flex justify-center">
                      <PieChart
                        data={[
                          { label: 'Nouveau', value: typeStats.nouveau, color: '#3b82f6' },
                          { label: 'En cours', value: typeStats.en_cours, color: '#f59e0b' },
                          { label: 'Traité', value: typeStats.traite, color: '#10b981' },
                          { label: 'Rejeté', value: typeStats.rejete, color: '#ef4444' },
                          { label: 'Clôturé', value: typeStats.cloture, color: '#64748b' },
                        ]}
                        size={280}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {advancedStats && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center mb-6">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900">Statistiques par tranche d'âge et gravité</h2>
              </div>
              <div className="flex justify-center">
                <StackedBarChart
                  data={advancedStats.ageGravite}
                  width={800}
                  height={400}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center mb-6">
                <Users className="w-8 h-8 text-pink-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900">Statistiques par sexe et gravité</h2>
              </div>
              <div className="flex justify-center">
                <StackedBarChart
                  data={advancedStats.sexeGravite}
                  width={500}
                  height={400}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center mb-6">
                <FileText className="w-8 h-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900">Statistiques par qualité du notifiant et gravité</h2>
              </div>
              <div className="flex justify-center">
                <StackedBarChart
                  data={advancedStats.notifiantGravite}
                  width={700}
                  height={400}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900">Nombre d'EIG par critères de gravité</h2>
              </div>
              <div className="flex justify-center">
                <BarChart
                  data={Object.entries(advancedStats.criteresGravite).map(([label, value]) => ({
                    label,
                    value: value as number,
                    color: '#ef4444'
                  }))}
                  width={800}
                  height={400}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center mb-6">
                <Package className="w-8 h-8 text-amber-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900">Statistiques par type de produit et gravité</h2>
              </div>
              <div className="flex justify-center">
                <StackedBarChart
                  data={advancedStats.typeProduitGravite}
                  width={800}
                  height={400}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center mb-6">
                <PieChartIcon className="w-8 h-8 text-teal-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900">Répartition des déclarations selon leur classification</h2>
              </div>
              <div className="flex justify-center">
                <PieChart
                  data={Object.entries(advancedStats.classification).map(([label, value], index) => {
                    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#64748b'];
                    return {
                      label,
                      value: value as number,
                      color: colors[index % colors.length]
                    };
                  })}
                  size={400}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
