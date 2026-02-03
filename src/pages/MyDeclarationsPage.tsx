import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ArrowLeft, FileText, Calendar, AlertCircle } from 'lucide-react';

type DeclarationStatus = 'nouveau' | 'en_cours' | 'traite' | 'rejete' | 'cloture';

const STATUS_LABEL: Record<DeclarationStatus, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  traite: 'Traité',
  rejete: 'Rejeté',
  cloture: 'Clôturé',
};

const STATUS_BADGE: Record<DeclarationStatus, string> = {
  nouveau: 'bg-blue-100 text-blue-700 border-blue-200',
  en_cours: 'bg-amber-100 text-amber-800 border-amber-200',
  traite: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejete: 'bg-red-100 text-red-700 border-red-200',
  cloture: 'bg-slate-100 text-slate-700 border-slate-200',
};

interface Declaration {
  id: string;
  created_at: string;
  statut: DeclarationStatus;
  patient_nom?: string;
  patient_prenom?: string;
  produit_nom_commercial?: string;
  effet_localisation?: string;
}

const productTypeConfig: Record<string, { title: string; view: string; color: string }> = {
  'cosmetovigilance': {
    title: 'Produits cosmétiques',
    view: 'cosmetovigilance_declarations',
    color: 'from-emerald-500 to-teal-600'
  },
  'dispositifs-medicaux': {
    title: 'Dispositifs Médicaux',
    view: 'cosmetovigilance_declarations',
    color: 'from-blue-500 to-cyan-600'
  },
  'diagnostic-in-vitro': {
    title: 'Diagnostic In Vitro',
    view: 'cosmetovigilance_declarations',
    color: 'from-amber-500 to-orange-600'
  },
  'complement-alimentaire': {
    title: 'Complément Alimentaire',
    view: 'cosmetovigilance_declarations',
    color: 'from-rose-500 to-pink-600'
  }
};

export default function MyDeclarationsPage() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const { user } = useAuth();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const config = type ? productTypeConfig[type] : null;

  useEffect(() => {
    if (!config || !user) return;

    const fetchDeclarations = async () => {
      try {
        setLoading(true);
        const data = await api.getDeclarations(type);
        const mapped: Declaration[] = Array.isArray(data)
          ? data.map((d: any) => ({
              id: d.id,
              created_at: d.createdAt ?? new Date().toISOString(),
              statut: (d.statut ?? 'nouveau') as DeclarationStatus,
              patient_nom: d.personneExposee?.nom,
              patient_prenom: d.personneExposee?.prenom,
              produit_nom_commercial: d.produitsSuspectes?.[0]?.nomCommercial,
              effet_localisation: d.effetsIndesirables?.[0]?.localisation,
            }))
          : [];

        const priority = (s: DeclarationStatus) => {
          if (s === 'nouveau') return 0;
          if (s === 'en_cours') return 1;
          return 2;
        };

        const sorted = [...mapped].sort((a, b) => {
          const pa = priority(a.statut);
          const pb = priority(b.statut);
          if (pa !== pb) return pa - pb;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setDeclarations(sorted);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des déclarations');
      } finally {
        setLoading(false);
      }
    };

    fetchDeclarations();
  }, [config, user, type]);

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Type de produit invalide</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour au tableau de bord
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div className={`p-3 bg-gradient-to-br ${config.color} rounded-xl mr-4`}>
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{config.title}</h1>
              <p className="text-slate-600">Mes déclarations</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          ) : declarations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Aucune déclaration
              </h3>
              <p className="text-slate-600 mb-6">
                Vous n'avez pas encore de déclarations pour ce type de produit.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {declarations.map((declaration) => (
                <button
                  key={declaration.id}
                  onClick={() => navigate(`/declaration/${declaration.id}`)}
                  className="w-full text-left border border-slate-200 rounded-lg p-6 hover:shadow-md hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Déclaration #{declaration.id.slice(0, 8)}
                      </h3>
                      <div className="mb-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_BADGE[declaration.statut]}`}
                        >
                          {STATUS_LABEL[declaration.statut]}
                        </span>
                      </div>
                      {declaration.patient_nom && declaration.patient_prenom && (
                        <p className="text-slate-700 mb-1">
                          Patient: {declaration.patient_prenom} {declaration.patient_nom}
                        </p>
                      )}
                      {declaration.produit_nom_commercial && (
                        <p className="text-slate-700 mb-1">
                          Produit: {declaration.produit_nom_commercial}
                        </p>
                      )}
                      {declaration.effet_localisation && (
                        <p className="text-slate-700">
                          Localisation: {declaration.effet_localisation}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(declaration.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
