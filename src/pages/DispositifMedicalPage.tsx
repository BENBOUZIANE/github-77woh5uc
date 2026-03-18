import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { apiDM, DispositifMedicalRequest } from '../services/apiDM';
import { villesMaroc } from '../data/villesMaroc';

export default function DispositifMedicalPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiDM.createDeclaration(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-declarations');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la soumission');
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Déclaration de Matériovigilance</h1>
          <p className="text-gray-600 mb-6">Signalement d'incident lié à un dispositif médical</p>

          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Erreur</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Informations du déclarant</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={formData.declarant?.nom || ''}
                      onChange={(e) => handleInputChange('declarant', 'nom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={formData.declarant?.prenom || ''}
                      onChange={(e) => handleInputChange('declarant', 'prenom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.declarant?.email || ''}
                      onChange={(e) => handleInputChange('declarant', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.declarant?.telephone || ''}
                      onChange={(e) => handleInputChange('declarant', 'telephone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualité du déclarant</label>
                    <select
                      value={formData.declarant?.qualiteDeclarant || 'patient'}
                      onChange={(e) => handleInputChange('declarant', 'qualiteDeclarant', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="patient">Patient</option>
                      <option value="professionnel_sante">Professionnel de santé</option>
                      <option value="representant_legal">Représentant légal</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Personne exposée</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={formData.personneExposee?.nom || ''}
                      onChange={(e) => handleInputChange('personneExposee', 'nom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={formData.personneExposee?.prenom || ''}
                      onChange={(e) => handleInputChange('personneExposee', 'prenom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
                    <input
                      type="number"
                      value={formData.personneExposee?.age || 0}
                      onChange={(e) => handleInputChange('personneExposee', 'age', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unité d'âge</label>
                    <select
                      value={formData.personneExposee?.ageUnite || 'ans'}
                      onChange={(e) => handleInputChange('personneExposee', 'ageUnite', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ans">Ans</option>
                      <option value="mois">Mois</option>
                      <option value="jours">Jours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
                    <select
                      value={formData.personneExposee?.sexe || 'M'}
                      onChange={(e) => handleInputChange('personneExposee', 'sexe', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <select
                      value={formData.personneExposee?.ville || ''}
                      onChange={(e) => handleInputChange('personneExposee', 'ville', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner une ville</option>
                      {villesMaroc.map(ville => (
                        <option key={ville} value={ville}>{ville}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Dispositif médical suspecté</h2>

                {formData.dispositifsSuspectes?.map((dispositif, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du dispositif</label>
                        <input
                          type="text"
                          value={dispositif.nomSpecialite || ''}
                          onChange={(e) => handleInputChange('dispositifsSuspectes', 'nomSpecialite', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mode d'emploi/Posologie</label>
                        <textarea
                          value={dispositif.posologie || ''}
                          onChange={(e) => handleInputChange('dispositifsSuspectes', 'posologie', e.target.value, index)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">N° de lot</label>
                        <input
                          type="text"
                          value={dispositif.numeroLot || ''}
                          onChange={(e) => handleInputChange('dispositifsSuspectes', 'numeroLot', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lieu d'achat</label>
                        <input
                          type="text"
                          value={dispositif.lieuAchat || ''}
                          onChange={(e) => handleInputChange('dispositifsSuspectes', 'lieuAchat', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Motif d'utilisation</label>
                        <textarea
                          value={dispositif.motifPrise || ''}
                          onChange={(e) => handleInputChange('dispositifsSuspectes', 'motifPrise', e.target.value, index)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Effet indésirable / Incident</h2>

                {formData.effetsIndesirables?.map((effet, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description de l'incident</label>
                        <textarea
                          value={effet.description || ''}
                          onChange={(e) => handleInputChange('effetsIndesirables', 'description', e.target.value, index)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                        <input
                          type="text"
                          value={effet.localisation || ''}
                          onChange={(e) => handleInputChange('effetsIndesirables', 'localisation', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gravité</label>
                        <select
                          value={effet.gravite || 'non_grave'}
                          onChange={(e) => handleInputChange('effetsIndesirables', 'gravite', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="non_grave">Non grave</option>
                          <option value="grave">Grave</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Informations complémentaires</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire additionnel</label>
                  <textarea
                    value={formData.commentaire || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ajoutez toute information supplémentaire pertinente..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    En soumettant cette déclaration, vous confirmez que les informations fournies sont exactes et complètes.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Précédent
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Soumettre la déclaration'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
