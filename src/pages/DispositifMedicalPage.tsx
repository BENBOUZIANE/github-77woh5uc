import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Beaker, Save, LayoutDashboard, LogIn } from 'lucide-react';
import { apiDM, DispositifMedicalRequest } from '../services/apiDM';
import { useAuth } from '../contexts/AuthContext';
import { villesMaroc } from '../data/villesMaroc';

export default function DispositifMedicalPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<DispositifMedicalRequest>({
    declarant: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      qualiteDeclarant: 'patient',
    },
    personneExposee: {
      nom: '',
      prenom: '',
      age: 0,
      ageUnite: 'ans',
      sexe: 'M',
      email: '',
      telephone: '',
      adresse: '',
      ville: '',
      grossesse: false,
      allaitement: false,
    },
    dispositifsSuspectes: [{
      nomSpecialite: '',
      posologie: '',
      numeroLot: '',
      motifPrise: '',
      lieuAchat: '',
    }],
    effetsIndesirables: [{
      description: '',
      localisation: '',
      gravite: 'non_grave',
      evolution: '',
    }],
    priseChargeMedicale: {
      hospitalisationRequise: false,
      traitementMedical: '',
      examensComplementaires: '',
    },
    professionnelSante: {},
    representantLegal: {},
    allergies: [],
    antecedents: [],
    medicamentsSimultanes: [],
    commentaire: '',
  });

  const sections = [
    { title: 'Déclarant', icon: '👤' },
    { title: 'Personne exposée', icon: '👥' },
    { title: 'Dispositif médical', icon: '🩺' },
    { title: 'Effet indésirable', icon: '⚠️' },
    { title: 'Commentaires', icon: '📝' },
  ];

  const handleInputChange = (section: string, field: string, value: any, index?: number) => {
    setFormData(prev => {
      const newData = { ...prev };

      if (section === 'dispositifsSuspectes' && typeof index === 'number') {
        const dispositifs = [...(prev.dispositifsSuspectes || [])];
        dispositifs[index] = { ...dispositifs[index], [field]: value };
        return { ...newData, dispositifsSuspectes: dispositifs };
      }

      if (section === 'effetsIndesirables' && typeof index === 'number') {
        const effets = [...(prev.effetsIndesirables || [])];
        effets[index] = { ...effets[index], [field]: value };
        return { ...newData, effetsIndesirables: effets };
      }

      return {
        ...newData,
        [section]: {
          ...(newData[section as keyof DispositifMedicalRequest] as any),
          [field]: value,
        },
      };
    });
  };

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiDM.createDeclaration(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/dispositif-medical');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la soumission');
      setIsSubmitting(false);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Informations du Déclarant</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.declarant?.nom || ''}
                  onChange={(e) => handleInputChange('declarant', 'nom', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={formData.declarant?.prenom || ''}
                  onChange={(e) => handleInputChange('declarant', 'prenom', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.declarant?.email || ''}
                  onChange={(e) => handleInputChange('declarant', 'email', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.declarant?.telephone || ''}
                  onChange={(e) => handleInputChange('declarant', 'telephone', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Qualité du déclarant</label>
                <select
                  value={formData.declarant?.qualiteDeclarant || 'patient'}
                  onChange={(e) => handleInputChange('declarant', 'qualiteDeclarant', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="patient">Patient</option>
                  <option value="professionnel_sante">Professionnel de santé</option>
                  <option value="representant_legal">Représentant légal</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Personne Exposée</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.personneExposee?.nom || ''}
                  onChange={(e) => handleInputChange('personneExposee', 'nom', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={formData.personneExposee?.prenom || ''}
                  onChange={(e) => handleInputChange('personneExposee', 'prenom', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Âge</label>
                <input
                  type="number"
                  value={formData.personneExposee?.age || 0}
                  onChange={(e) => handleInputChange('personneExposee', 'age', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Unité d'âge</label>
                <select
                  value={formData.personneExposee?.ageUnite || 'ans'}
                  onChange={(e) => handleInputChange('personneExposee', 'ageUnite', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ans">Ans</option>
                  <option value="mois">Mois</option>
                  <option value="jours">Jours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sexe</label>
                <select
                  value={formData.personneExposee?.sexe || 'M'}
                  onChange={(e) => handleInputChange('personneExposee', 'sexe', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ville</label>
                <select
                  value={formData.personneExposee?.ville || ''}
                  onChange={(e) => handleInputChange('personneExposee', 'ville', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une ville</option>
                  {villesMaroc.map(ville => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Dispositif Médical Suspecté</h2>

            {formData.dispositifsSuspectes?.map((dispositif, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nom du dispositif</label>
                    <input
                      type="text"
                      value={dispositif.nomSpecialite || ''}
                      onChange={(e) => handleInputChange('dispositifsSuspectes', 'nomSpecialite', e.target.value, index)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Mode d'emploi/Posologie</label>
                    <textarea
                      value={dispositif.posologie || ''}
                      onChange={(e) => handleInputChange('dispositifsSuspectes', 'posologie', e.target.value, index)}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">N° de lot</label>
                    <input
                      type="text"
                      value={dispositif.numeroLot || ''}
                      onChange={(e) => handleInputChange('dispositifsSuspectes', 'numeroLot', e.target.value, index)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Lieu d'achat</label>
                    <input
                      type="text"
                      value={dispositif.lieuAchat || ''}
                      onChange={(e) => handleInputChange('dispositifsSuspectes', 'lieuAchat', e.target.value, index)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Motif d'utilisation</label>
                    <textarea
                      value={dispositif.motifPrise || ''}
                      onChange={(e) => handleInputChange('dispositifsSuspectes', 'motifPrise', e.target.value, index)}
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Effet Indésirable / Incident</h2>

            {formData.effetsIndesirables?.map((effet, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description de l'incident</label>
                    <textarea
                      value={effet.description || ''}
                      onChange={(e) => handleInputChange('effetsIndesirables', 'description', e.target.value, index)}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Localisation</label>
                    <input
                      type="text"
                      value={effet.localisation || ''}
                      onChange={(e) => handleInputChange('effetsIndesirables', 'localisation', e.target.value, index)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Gravité</label>
                    <select
                      value={effet.gravite || 'non_grave'}
                      onChange={(e) => handleInputChange('effetsIndesirables', 'gravite', e.target.value, index)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="non_grave">Non grave</option>
                      <option value="grave">Grave</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Informations Complémentaires</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Commentaire additionnel</label>
              <textarea
                value={formData.commentaire || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ajoutez toute information supplémentaire pertinente..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                En soumettant cette déclaration, vous confirmez que les informations fournies sont exactes et complètes.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Déclaration enregistrée</h2>
          <p className="text-gray-600">Votre déclaration a été enregistrée avec succès.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg text-sm"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Tableau de bord</span>
                  <span className="sm:hidden">Dashboard</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg text-sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Connexion</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-8 py-6">
            <div className="flex items-center">
              <Beaker className="w-10 h-10 text-white mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Déclaration de Matériovigilance
                </h1>
                <p className="text-blue-100 mt-1">
                  Dispositifs médicaux
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 border-b border-slate-200">
            <div className="flex overflow-x-auto space-x-4 pb-2">
              {sections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSection(index)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    currentSection === index
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="px-8 py-8">
            {renderSection()}
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-between">
            <button
              onClick={handlePrevSection}
              disabled={currentSection === 0}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>

            {currentSection < sections.length - 1 ? (
              <button
                onClick={handleNextSection}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Envoi en cours...' : 'Soumettre la Déclaration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
