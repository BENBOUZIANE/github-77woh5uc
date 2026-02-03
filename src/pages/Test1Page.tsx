import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Beaker } from 'lucide-react';

export default function Test1Page() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl mr-4">
              <Beaker className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Dispositifs Médicaux</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg text-slate-600 mb-6">
              Ce module est en cours de développement. Le formulaire de déclaration pour les dispositifs médicaux sera disponible prochainement.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Informations</h2>
              <p className="text-slate-700">
                Ce module permettra de déclarer et suivre les incidents liés aux dispositifs médicaux.
                Pour toute question, veuillez contacter le service de vigilance sanitaire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
