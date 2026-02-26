import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Sparkles, Beaker, Package, Shield, FileText, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import PieChart from '../components/PieChart';
import BarChart from '../components/BarChart';

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

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<StatsByType>({});
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

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
              className="w-20 h-20 object-contain mr-4"
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

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-slate-900">Statistiques globales</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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

          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Répartition par statut</h3>
            {!loading && (
              <BarChart
                data={[
                  { label: 'Nouveau', value: totalStats.nouveau, color: '#3b82f6' },
                  { label: 'En cours', value: totalStats.en_cours, color: '#f59e0b' },
                  { label: 'Traité', value: totalStats.traite, color: '#10b981' },
                  { label: 'Rejeté', value: totalStats.rejete, color: '#ef4444' },
                  { label: 'Clôturé', value: totalStats.cloture, color: '#64748b' },
                ]}
                height={250}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <PieChartIcon className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900">Distribution par statut</h2>
            </div>
            {!loading && (
              <div className="flex justify-center">
                <PieChart
                  data={[
                    { label: 'Nouveau', value: totalStats.nouveau, color: '#3b82f6' },
                    { label: 'En cours', value: totalStats.en_cours, color: '#f59e0b' },
                    { label: 'Traité', value: totalStats.traite, color: '#10b981' },
                    { label: 'Rejeté', value: totalStats.rejete, color: '#ef4444' },
                    { label: 'Clôturé', value: totalStats.cloture, color: '#64748b' },
                  ]}
                  size={280}
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <PieChartIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900">Distribution par type</h2>
            </div>
            {!loading && (
              <div className="flex justify-center">
                <PieChart
                  data={[
                    {
                      label: 'Produits cosmétiques',
                      value: Object.values(stats['cosmetovigilance'] || {}).reduce((a, b) => a + b, 0),
                      color: '#10b981'
                    },
                    {
                      label: 'Dispositifs Médicaux',
                      value: Object.values(stats['dispositifs-medicaux'] || {}).reduce((a, b) => a + b, 0),
                      color: '#3b82f6'
                    },
                    {
                      label: 'Diagnostic In Vitro',
                      value: Object.values(stats['diagnostic-in-vitro'] || {}).reduce((a, b) => a + b, 0),
                      color: '#f59e0b'
                    },
                    {
                      label: 'Complément Alimentaire',
                      value: Object.values(stats['complement-alimentaire'] || {}).reduce((a, b) => a + b, 0),
                      color: '#ec4899'
                    },
                  ]}
                  size={280}
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-8 h-8 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-bold text-slate-900">Répartition par type d'activité</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-4 px-4 font-semibold text-slate-700">Type d'activité</th>
                  <th className="text-center py-4 px-4 font-semibold text-blue-700">Nouveau</th>
                  <th className="text-center py-4 px-4 font-semibold text-amber-700">En cours</th>
                  <th className="text-center py-4 px-4 font-semibold text-green-700">Traité</th>
                  <th className="text-center py-4 px-4 font-semibold text-red-700">Rejeté</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-700">Clôturé</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-900 bg-slate-50">Total</th>
                </tr>
              </thead>
              <tbody>
                {declarationTypes.map((type) => {
                  const Icon = type.icon;
                  const typeStats = stats[type.id] || {
                    nouveau: 0,
                    en_cours: 0,
                    traite: 0,
                    rejete: 0,
                    cloture: 0
                  };
                  const total = Object.values(typeStats).reduce((a, b) => a + b, 0);

                  return (
                    <tr key={type.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className={`p-2 ${type.bgColor} rounded-lg mr-3`}>
                            <Icon className={`w-5 h-5 ${type.textColor}`} />
                          </div>
                          <span className="font-medium text-slate-900">{type.title}</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-900 rounded-lg font-semibold">
                          {loading ? '...' : typeStats.nouveau}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-900 rounded-lg font-semibold">
                          {loading ? '...' : typeStats.en_cours}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-900 rounded-lg font-semibold">
                          {loading ? '...' : typeStats.traite}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-900 rounded-lg font-semibold">
                          {loading ? '...' : typeStats.rejete}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 text-slate-900 rounded-lg font-semibold">
                          {loading ? '...' : typeStats.cloture}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4 bg-slate-50">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-slate-200 text-slate-900 rounded-lg font-bold">
                          {loading ? '...' : total}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td className="py-4 px-4 font-bold text-slate-900">Total général</td>
                  <td className="text-center py-4 px-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-blue-200 text-blue-900 rounded-lg font-bold">
                      {loading ? '...' : totalStats.nouveau}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-amber-200 text-amber-900 rounded-lg font-bold">
                      {loading ? '...' : totalStats.en_cours}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-green-200 text-green-900 rounded-lg font-bold">
                      {loading ? '...' : totalStats.traite}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-red-200 text-red-900 rounded-lg font-bold">
                      {loading ? '...' : totalStats.rejete}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-slate-200 text-slate-900 rounded-lg font-bold">
                      {loading ? '...' : totalStats.cloture}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4 bg-slate-100">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-slate-300 text-slate-900 rounded-lg font-bold">
                      {loading ? '...' : Object.values(totalStats).reduce((a, b) => a + b, 0)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
