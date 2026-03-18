import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, Save, Plus, X, Upload, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { complementAlimentaireApi } from '../services/apiCA';
import { useAuth } from '../contexts/AuthContext';
import { villesMaroc } from '../data/villesMaroc';

interface FormData {
  utilisateurType: string;
  utilisateurTypeAutre?: string;
  professionnelSante?: {
    profession: string;
    professionAutre?: string;
    structure: string;
    ville: string;
  };
  representantLegal?: {
    nomEtablissement: string;
    numeroDeclarationEtablissement: string;
    numeroDocumentEnregistrementProduit: string;
    dateReceptionNotification: string;
  };
  declarant: {
    nom: string;
    prenom: string;
    email: string;
    tel: string;
  };
  personneExposee: {
    type: string;
    nomPrenom: string;
    dateNaissance?: string;
    age?: number;
    ageUnite?: string;
    grossesse: boolean;
    moisGrossesse?: number;
    allaitement: boolean;
    sexe: string;
    ville: string;
  };
  allergiesConnues: string[];
  antecedentsMedicaux: string[];
  medicamentsSimultanes: string[];
  effetIndesirable: {
    localisation: string;
    descriptionSymptomes: string;
    dateApparition: string;
    delaiSurvenue: string;
    gravite: boolean;
    criteresGravite: string[];
    evolutionEffet: string;
  };
  priseChargeMedicale: {
    consultationMedicale: boolean;
    diagnosticMedecin: string;
    mesuresPriseType: string;
    mesuresPriseAutre: string;
    examensRealise: string;
  };
  complementSuspecte: {
    nomCommercial: string;
    marque: string;
    fabricant: string;
    numeroLot: string;
    formeGalenique: string;
    posologie: string;
    frequenceUtilisation: string;
    dateDebutUtilisation: string;
    arretUtilisation: string;
    reexpositionProduit: boolean;
    reapparitionEffetIndesirable: boolean;
    compositionProduit: string;
  };
  commentaire: string;
}

export default function ComplementAlimentairePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    utilisateurType: 'professionnel',
    declarant: { nom: '', prenom: '', email: '', tel: '' },
    personneExposee: { type: 'patient', nomPrenom: '', dateNaissance: '', age: undefined, ageUnite: 'Année', grossesse: false, allaitement: false, sexe: 'F', ville: '' },
    allergiesConnues: [],
    antecedentsMedicaux: [],
    medicamentsSimultanes: [],
    effetIndesirable: { localisation: '', descriptionSymptomes: '', dateApparition: '', delaiSurvenue: '', gravite: false, criteresGravite: [], evolutionEffet: '' },
    priseChargeMedicale: { consultationMedicale: false, diagnosticMedecin: '', mesuresPriseType: '', mesuresPriseAutre: '', examensRealise: '' },
    complementSuspecte: { nomCommercial: '', marque: '', fabricant: '', numeroLot: '', formeGalenique: '', posologie: '', frequenceUtilisation: '', dateDebutUtilisation: '', arretUtilisation: '', reexpositionProduit: false, reapparitionEffetIndesirable: false, compositionProduit: '' },
    commentaire: ''
  });

  const [newAllergie, setNewAllergie] = useState('');
  const [newAntecedent, setNewAntecedent] = useState('');
  const [newMedicament, setNewMedicament] = useState('');
  const [documentEnregistrement, setDocumentEnregistrement] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const getSections = () => {
    const baseSections = [{ title: 'Notificateur', icon: '👤' }];

    if (formData.utilisateurType === 'professionnel') {
      baseSections.push({ title: 'Professionnel de Santé', icon: '⚕️' });
    } else if (formData.utilisateurType === 'representant_legal') {
      baseSections.push({ title: 'Représentant Légal', icon: '🏢' });
    }

    baseSections.push(
      { title: 'Personne Exposée', icon: '🧑' },
      { title: 'Effet Indésirable', icon: '⚠️' },
      { title: 'Prise en Charge', icon: '🏥' },
      { title: 'Complément Suspect', icon: '💊' },
      { title: 'Commentaires', icon: '💬' }
    );

    return baseSections;
  };

  const sections = getSections();

  const getSectionCaseNumber = (sectionIndex: number): number => {
    if (sectionIndex === 0) return 0;
    if (formData.utilisateurType === 'consommateur' || formData.utilisateurType === 'autre') {
      return sectionIndex + 1;
    }
    return sectionIndex;
  };

  const validateSection = (sectionIndex: number): boolean => {
    const errors: Record<string, string> = {};
    const caseNumber = getSectionCaseNumber(sectionIndex);

    switch (caseNumber) {
      case 0:
        if (!formData.declarant.nom.trim()) errors.declarantNom = 'Le nom est obligatoire';
        if (!formData.declarant.prenom.trim()) errors.declarantPrenom = 'Le prénom est obligatoire';
        if (!formData.declarant.tel.trim()) errors.declarantTel = 'Le téléphone est obligatoire';
        if (formData.utilisateurType === 'autre' && !formData.utilisateurTypeAutre?.trim()) {
          errors.utilisateurTypeAutre = 'Veuillez préciser le type de notificateur';
        }
        break;

      case 1:
        if (formData.utilisateurType === 'professionnel') {
          if (!formData.professionnelSante?.profession) errors.profession = 'La profession est obligatoire';
          if (formData.professionnelSante?.profession === 'autre' && !formData.professionnelSante.professionAutre?.trim()) {
            errors.professionAutre = 'Veuillez préciser la profession';
          }
        } else if (formData.utilisateurType === 'representant_legal') {
          if (!formData.representantLegal?.nomEtablissement.trim()) errors.nomEtablissement = 'Le nom de l\'établissement est obligatoire';
          if (!formData.representantLegal?.numeroDeclarationEtablissement.trim()) errors.numeroDeclaration = 'Le numéro de déclaration est obligatoire';
          if (!formData.representantLegal?.numeroDocumentEnregistrementProduit.trim()) errors.numeroDocument = 'Le numéro du document est obligatoire';
          if (!formData.representantLegal?.dateReceptionNotification) errors.dateReception = 'La date de réception est obligatoire';
          if (!documentEnregistrement) errors.documentEnregistrement = 'Le document d\'enregistrement est obligatoire';
        }
        break;

      case 2:
        if (!formData.personneExposee.nomPrenom.trim()) errors.nomPrenom = 'Le nom et prénom sont obligatoires';
        if (!formData.personneExposee.ville) errors.personneVille = 'La ville est obligatoire';
        if (!formData.personneExposee.dateNaissance && !formData.personneExposee.age) {
          errors.dateNaissanceOuAge = 'La date de naissance ou l\'âge est obligatoire';
        }
        if (formData.personneExposee.grossesse && !formData.personneExposee.moisGrossesse) {
          errors.moisGrossesse = 'Le mois de grossesse est obligatoire';
        }
        break;

      case 3:
        if (!formData.effetIndesirable.localisation.trim()) errors.localisation = 'La localisation est obligatoire';
        if (!formData.effetIndesirable.descriptionSymptomes.trim()) errors.descriptionSymptomes = 'La description est obligatoire';
        if (!formData.effetIndesirable.dateApparition) errors.dateApparition = 'La date d\'apparition est obligatoire';
        if (!formData.effetIndesirable.delaiSurvenue.trim()) errors.delaiSurvenue = 'Le délai de survenue est obligatoire';
        if (!formData.effetIndesirable.evolutionEffet) errors.evolutionEffet = 'L\'évolution de l\'effet est obligatoire';
        if (formData.effetIndesirable.gravite && formData.effetIndesirable.criteresGravite.length === 0) {
          errors.criteresGravite = 'Veuillez sélectionner au moins un critère de gravité';
        }
        break;

      case 4:
        if (formData.priseChargeMedicale?.mesuresPriseType === 'autre' && !formData.priseChargeMedicale.mesuresPriseAutre?.trim()) {
          errors.mesuresPriseAutre = 'Veuillez préciser les autres mesures';
        }
        break;

      case 5:
        if (!formData.complementSuspecte.nomCommercial.trim()) errors.nomCommercial = 'Le nom commercial est obligatoire';
        if (!formData.complementSuspecte.marque.trim()) errors.marque = 'La marque est obligatoire';
        if (!formData.complementSuspecte.numeroLot.trim()) errors.numeroLot = 'Le numéro de lot est obligatoire';
        if (!formData.complementSuspecte.formeGalenique) errors.formeGalenique = 'La forme galénique est obligatoire';
        if (!formData.complementSuspecte.frequenceUtilisation) errors.frequenceUtilisation = 'La fréquence d\'utilisation est obligatoire';
        if (!formData.complementSuspecte.dateDebutUtilisation) errors.dateDebutUtilisation = 'La date de début d\'utilisation est obligatoire';
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextSection = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const previousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo(0, 0);
    }
  };

  const addItem = (list: string[], setList: (items: string[]) => void, newItem: string, setNewItem: (val: string) => void) => {
    if (newItem.trim()) {
      setList([...list, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (list: string[], setList: (items: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateSection(currentSection)) {
      return;
    }

    if (!user) {
      alert('Vous devez être connecté pour soumettre une déclaration');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await complementAlimentaireApi.createDeclaration(formData, documentEnregistrement || undefined);
      alert('Déclaration soumise avec succès!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de la soumission: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSection = () => {
    const caseNumber = getSectionCaseNumber(currentSection);
    switch (caseNumber) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Informations du Notificateur</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom*</label>
                <input
                  type="text"
                  value={formData.declarant.nom}
                  onChange={(e) => setFormData({ ...formData, declarant: { ...formData.declarant, nom: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {validationErrors.declarantNom && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.declarantNom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prénom*</label>
                <input
                  type="text"
                  value={formData.declarant.prenom}
                  onChange={(e) => setFormData({ ...formData, declarant: { ...formData.declarant, prenom: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {validationErrors.declarantPrenom && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.declarantPrenom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.declarant.email}
                  onChange={(e) => setFormData({ ...formData, declarant: { ...formData.declarant, email: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone*</label>
                <input
                  type="tel"
                  value={formData.declarant.tel}
                  onChange={(e) => setFormData({ ...formData, declarant: { ...formData.declarant, tel: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {validationErrors.declarantTel && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.declarantTel}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type de notificateur*</label>
              <select
                value={formData.utilisateurType}
                onChange={(e) => setFormData({ ...formData, utilisateurType: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="professionnel">Professionnel de santé</option>
                <option value="consommateur">Consommateur</option>
                <option value="representant_legal">Représentant légal de l'établissement</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {formData.utilisateurType === 'autre' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Précisez*</label>
                <input
                  type="text"
                  value={formData.utilisateurTypeAutre || ''}
                  onChange={(e) => setFormData({ ...formData, utilisateurTypeAutre: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {validationErrors.utilisateurTypeAutre && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.utilisateurTypeAutre}</p>
                )}
              </div>
            )}
          </div>
        );

      case 1:
        if (formData.utilisateurType === 'professionnel') {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Informations du Professionnel de Santé</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Profession*</label>
                <select
                  value={formData.professionnelSante?.profession || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    professionnelSante: { ...formData.professionnelSante!, profession: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une profession</option>
                  <option value="medecin">Médecin</option>
                  <option value="pharmacien">Pharmacien</option>
                  <option value="infirmier">Infirmier</option>
                  <option value="dentiste">Dentiste</option>
                  <option value="autre">Autre</option>
                </select>
                {validationErrors.profession && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.profession}</p>
                )}
              </div>

              {formData.professionnelSante?.profession === 'autre' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Précisez la profession*</label>
                  <input
                    type="text"
                    value={formData.professionnelSante?.professionAutre || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      professionnelSante: { ...formData.professionnelSante!, professionAutre: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  {validationErrors.professionAutre && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.professionAutre}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Structure</label>
                <input
                  type="text"
                  value={formData.professionnelSante?.structure || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    professionnelSante: { ...formData.professionnelSante!, structure: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ville</label>
                <select
                  value={formData.professionnelSante?.ville || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    professionnelSante: { ...formData.professionnelSante!, ville: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une ville</option>
                  {villesMaroc.map((ville) => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        } else if (formData.utilisateurType === 'representant_legal') {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Informations du Représentant Légal</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom de l'établissement*</label>
                <input
                  type="text"
                  value={formData.representantLegal?.nomEtablissement || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    representantLegal: { ...formData.representantLegal!, nomEtablissement: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {validationErrors.nomEtablissement && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.nomEtablissement}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Numéro de déclaration d'établissement*</label>
                <input
                  type="text"
                  value={formData.representantLegal?.numeroDeclarationEtablissement || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    representantLegal: { ...formData.representantLegal!, numeroDeclarationEtablissement: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {validationErrors.numeroDeclaration && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.numeroDeclaration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Numéro du document d'enregistrement du produit*</label>
                <input
                  type="text"
                  value={formData.representantLegal?.numeroDocumentEnregistrementProduit || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    representantLegal: { ...formData.representantLegal!, numeroDocumentEnregistrementProduit: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {validationErrors.numeroDocument && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.numeroDocument}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date de réception de la notification*</label>
                <input
                  type="date"
                  value={formData.representantLegal?.dateReceptionNotification || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    representantLegal: { ...formData.representantLegal!, dateReceptionNotification: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {validationErrors.dateReception && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.dateReception}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Document d'enregistrement (PDF)*</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center px-4 py-2 bg-white border-2 border-emerald-500 text-emerald-600 rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors">
                    <Upload className="w-5 h-5 mr-2" />
                    Choisir un fichier
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setDocumentEnregistrement(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {documentEnregistrement && (
                    <span className="text-sm text-slate-600">{documentEnregistrement.name}</span>
                  )}
                </div>
                {validationErrors.documentEnregistrement && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.documentEnregistrement}</p>
                )}
              </div>
            </div>
          );
        }
        return null;

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Informations de la Personne Exposée</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type*</label>
                <select
                  value={formData.personneExposee.type}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, type: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="patient">Patient</option>
                  <option value="proche">Proche</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sexe*</label>
                <select
                  value={formData.personneExposee.sexe}
                  onChange={(e) => setFormData({
                    ...formData,
                    personneExposee: {
                      ...formData.personneExposee,
                      sexe: e.target.value,
                      grossesse: e.target.value === 'F' ? formData.personneExposee.grossesse : false,
                      moisGrossesse: e.target.value === 'F' ? formData.personneExposee.moisGrossesse : undefined
                    }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="F">Féminin</option>
                  <option value="M">Masculin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom / Prénom (ou initiales)*</label>
                <input
                  type="text"
                  value={formData.personneExposee.nomPrenom}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, nomPrenom: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {validationErrors.nomPrenom && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.nomPrenom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ville*</label>
                <select
                  value={formData.personneExposee.ville}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, ville: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une ville</option>
                  {villesMaroc.map((ville) => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
                {validationErrors.personneVille && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.personneVille}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date de naissance</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="jj"
                    min="1"
                    max="31"
                    value={formData.personneExposee.dateNaissance?.split('-')[2] || ''}
                    onChange={(e) => {
                      const parts = formData.personneExposee.dateNaissance?.split('-') || ['', '', ''];
                      const day = e.target.value.padStart(2, '0');
                      const newDate = `${parts[0] || ''}-${parts[1] || ''}-${day}`.replace(/^-+|-+$/g, '');
                      setFormData({ ...formData, personneExposee: { ...formData.personneExposee, dateNaissance: newDate } });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <select
                    value={formData.personneExposee.dateNaissance?.split('-')[1] || ''}
                    onChange={(e) => {
                      const parts = formData.personneExposee.dateNaissance?.split('-') || ['', '', ''];
                      const newDate = `${parts[0] || ''}-${e.target.value}-${parts[2] || ''}`.replace(/^-+|-+$/g, '');
                      setFormData({ ...formData, personneExposee: { ...formData.personneExposee, dateNaissance: newDate } });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">mois</option>
                    <option value="01">Janvier</option>
                    <option value="02">Février</option>
                    <option value="03">Mars</option>
                    <option value="04">Avril</option>
                    <option value="05">Mai</option>
                    <option value="06">Juin</option>
                    <option value="07">Juillet</option>
                    <option value="08">Août</option>
                    <option value="09">Septembre</option>
                    <option value="10">Octobre</option>
                    <option value="11">Novembre</option>
                    <option value="12">Décembre</option>
                  </select>
                  <input
                    type="number"
                    placeholder="aaaa"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.personneExposee.dateNaissance?.split('-')[0] || ''}
                    onChange={(e) => {
                      const parts = formData.personneExposee.dateNaissance?.split('-') || ['', '', ''];
                      const newDate = `${e.target.value}-${parts[1] || ''}-${parts[2] || ''}`.replace(/^-+|-+$/g, '');
                      setFormData({ ...formData, personneExposee: { ...formData.personneExposee, dateNaissance: newDate } });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">L'âge au moment de l'apparition de l'effet indésirable</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Entrez l'âge"
                  value={formData.personneExposee.age || ''}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, age: parseInt(e.target.value) || undefined } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <select
                  value={formData.personneExposee.ageUnite || 'Année'}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, ageUnite: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="Année">Année</option>
                  <option value="Mois">Mois</option>
                  <option value="Semaine">Semaine</option>
                  <option value="Jour">Jour</option>
                  <option value="Heure">Heure</option>
                </select>
              </div>
              {validationErrors.dateNaissanceOuAge && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.dateNaissanceOuAge}</p>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-2">
                <span className="font-medium">Note:</span> La date de naissance complète ou l'âge doivent être saisis
              </p>
            </div>

            {formData.personneExposee.sexe === 'F' && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.personneExposee.grossesse}
                      onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, grossesse: e.target.checked } })}
                      className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">Grossesse</span>
                  </label>

                  {formData.personneExposee.grossesse && (
                    <div>
                      <select
                        value={formData.personneExposee.moisGrossesse || ''}
                        onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, moisGrossesse: parseInt(e.target.value) || undefined } })}
                        className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.moisGrossesse ? 'border-red-500' : 'border-slate-300'}`}
                      >
                        <option value="">Mois de grossesse</option>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mois) => (
                          <option key={mois} value={mois}>{mois} {mois === 0 || mois === 1 ? 'mois' : 'mois'}</option>
                        ))}
                      </select>
                      {validationErrors.moisGrossesse && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.moisGrossesse}</p>
                      )}
                    </div>
                  )}
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.personneExposee.allaitement}
                    onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, allaitement: e.target.checked } })}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Allaitement</span>
                </label>
              </div>
            )}

            <div className="mt-8 pt-8 border-t-2 border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Antécédents Médicaux</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Allergies Connues</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newAllergie}
                      onChange={(e) => setNewAllergie(e.target.value)}
                      placeholder="Ajouter une allergie"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => addItem(formData.allergiesConnues, (items) => setFormData({ ...formData, allergiesConnues: items }), newAllergie, setNewAllergie)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.allergiesConnues.map((allergie, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-lg">
                        <span>{allergie}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(formData.allergiesConnues, (items) => setFormData({ ...formData, allergiesConnues: items }), index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Antécédents Médicaux</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newAntecedent}
                      onChange={(e) => setNewAntecedent(e.target.value)}
                      placeholder="Ajouter un antécédent"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => addItem(formData.antecedentsMedicaux, (items) => setFormData({ ...formData, antecedentsMedicaux: items }), newAntecedent, setNewAntecedent)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.antecedentsMedicaux.map((antecedent, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-lg">
                        <span>{antecedent}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(formData.antecedentsMedicaux, (items) => setFormData({ ...formData, antecedentsMedicaux: items }), index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Médicaments/Produits Utilisés Simultanément</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newMedicament}
                      onChange={(e) => setNewMedicament(e.target.value)}
                      placeholder="Ajouter un médicament ou produit"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => addItem(formData.medicamentsSimultanes, (items) => setFormData({ ...formData, medicamentsSimultanes: items }), newMedicament, setNewMedicament)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.medicamentsSimultanes.map((medicament, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-lg">
                        <span>{medicament}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(formData.medicamentsSimultanes, (items) => setFormData({ ...formData, medicamentsSimultanes: items }), index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Effet Indésirable</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Localisation*</label>
              <input
                type="text"
                value={formData.effetIndesirable.localisation}
                onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, localisation: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
              {validationErrors.localisation && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.localisation}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description des symptômes observés*</label>
              <textarea
                value={formData.effetIndesirable.descriptionSymptomes}
                onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, descriptionSymptomes: e.target.value } })}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Décrivez les symptômes observés..."
                required
              />
              {validationErrors.descriptionSymptomes && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.descriptionSymptomes}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date d'Apparition*</label>
                <input
                  type="date"
                  value={formData.effetIndesirable.dateApparition}
                  onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, dateApparition: e.target.value } })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {validationErrors.dateApparition && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.dateApparition}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Délai de Survenue*</label>
                <input
                  type="text"
                  value={formData.effetIndesirable.delaiSurvenue}
                  onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, delaiSurvenue: e.target.value } })}
                  placeholder="Ex: 24h, 2 jours..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {validationErrors.delaiSurvenue && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.delaiSurvenue}</p>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={formData.effetIndesirable.gravite}
                  onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, gravite: e.target.checked } })}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm font-medium text-slate-700">Effet grave</span>
              </label>

              {formData.effetIndesirable.gravite && (
                <div className="ml-6 space-y-2">
                  <p className="text-sm text-slate-600 mb-2">Sélectionnez les critères de gravité:</p>
                  {['Décès', 'Mise en jeu du pronostic vital', 'Hospitalisation ou prolongation d\'hospitalisation', 'Incapacité ou invalidité', 'Anomalie congénitale', 'Autre'].map((critere) => (
                    <label key={critere} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.effetIndesirable.criteresGravite.includes(critere)}
                        onChange={(e) => {
                          const criteres = e.target.checked
                            ? [...formData.effetIndesirable.criteresGravite, critere]
                            : formData.effetIndesirable.criteresGravite.filter(c => c !== critere);
                          setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, criteresGravite: criteres } });
                        }}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">{critere}</span>
                    </label>
                  ))}
                  {validationErrors.criteresGravite && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.criteresGravite}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Évolution de l'effet*</label>
              <select
                value={formData.effetIndesirable.evolutionEffet}
                onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, evolutionEffet: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner une évolution</option>
                <option value="EN_COURS">En cours</option>
                <option value="GUERI">Guéri</option>
                <option value="SEQUELLES">Guéri avec séquelles</option>
                <option value="NON_GUERI">Non guéri</option>
                <option value="DECES">Décès</option>
                <option value="INCONNU">Inconnu</option>
              </select>
              {validationErrors.evolutionEffet && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.evolutionEffet}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Prise en Charge Médicale</h2>

            <div>
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={formData.priseChargeMedicale.consultationMedicale}
                  onChange={(e) => setFormData({ ...formData, priseChargeMedicale: { ...formData.priseChargeMedicale, consultationMedicale: e.target.checked } })}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm font-medium text-slate-700">Consultation médicale effectuée</span>
              </label>
            </div>

            {formData.priseChargeMedicale.consultationMedicale && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Diagnostic du médecin</label>
                  <textarea
                    value={formData.priseChargeMedicale.diagnosticMedecin}
                    onChange={(e) => setFormData({ ...formData, priseChargeMedicale: { ...formData.priseChargeMedicale, diagnosticMedecin: e.target.value } })}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Diagnostic posé par le médecin..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Examens réalisés</label>
                  <textarea
                    value={formData.priseChargeMedicale.examensRealise}
                    onChange={(e) => setFormData({ ...formData, priseChargeMedicale: { ...formData.priseChargeMedicale, examensRealise: e.target.value } })}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Décrivez les examens réalisés..."
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mesures de prise en charge</label>
              <select
                value={formData.priseChargeMedicale.mesuresPriseType}
                onChange={(e) => setFormData({ ...formData, priseChargeMedicale: { ...formData.priseChargeMedicale, mesuresPriseType: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Sélectionner une mesure</option>
                <option value="ARRET_PRODUIT">Arrêt du produit</option>
                <option value="TRAITEMENT_SYMPTOMATIQUE">Traitement symptomatique</option>
                <option value="HOSPITALISATION">Hospitalisation</option>
                <option value="SURVEILLANCE">Surveillance</option>
                <option value="AUCUNE">Aucune mesure</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {formData.priseChargeMedicale.mesuresPriseType === 'autre' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Précisez les autres mesures*</label>
                <textarea
                  value={formData.priseChargeMedicale.mesuresPriseAutre}
                  onChange={(e) => setFormData({ ...formData, priseChargeMedicale: { ...formData.priseChargeMedicale, mesuresPriseAutre: e.target.value } })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Décrivez les autres mesures prises..."
                />
                {validationErrors.mesuresPriseAutre && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.mesuresPriseAutre}</p>
                )}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Complément Alimentaire Suspecté</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom Commercial*</label>
                <input
                  type="text"
                  value={formData.complementSuspecte.nomCommercial}
                  onChange={(e) => setFormData({ ...formData, complementSuspecte: { ...formData.complementSuspecte, nomCommercial: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {validationErrors.nomCommercial && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.nomCommercial}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Marque*</label>
                <input
                  type="text"
                  value={formData.complementSuspecte.marque}
                  onChange={(e) => setFormData({ ...formData, complementSuspecte: { ...formData.complementSuspecte, marque: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {validationErrors.marque && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.marque}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fabricant</label>
                <input
                  type="text"
                  value={formData.complementSuspecte.fabricant}
                  onChange={(e) => setFormData({ ...formData, complementSuspecte: { ...formData.complementSuspecte, fabricant: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Numéro de Lot*</label>
                <input
                  type="text"
                  value={formData.complementSuspecte.numeroLot}
                  onChange={(e) => setFormData({ ...formData, complementSuspecte: { ...formData.complementSuspecte, numeroLot: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {validationErrors.numeroLot && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.numeroLot}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Forme Galénique*</label>
                <select
                  value={formData.complementSuspecte.formeGalenique}
                  onChange={(e) => setFormData({ ...formData, complementSuspecte: { ...formData.complementSuspecte, formeGalenique: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une forme</option>
                  <option value="Gélule">Gélule</option>
                  <option value="Comprimé">Comprimé</option>
                  <option value="Poudre">Poudre</option>
                  <option value="Sirop">Sirop</option>
                  <option value="Ampoule">Ampoule</option>
                  <option value="Sachet">Sachet</option>
                  <option value="Autre">Autre</option>
                </select>
                {validationErrors.formeGalenique && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.formeGalenique}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fréquence d'Utilisation*</label>
                <select
                  value={formData.complementSuspecte.frequenceUtilisation}
                  onChange={(e) => setFormData({ ...formData, complementSuspecte: { ...formData.complementSuspecte, frequenceUtilisation: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une fréquence</option>
                  <option value="Quotidienne">Quotidienne</option>
                  <option value="Hebdomadaire">Hebdomadaire</option>
                  <option value="Mensuelle">Mensuelle</option>
                  <option value="Occasionnelle">Occasionnelle</option>
                </select>
                {validationErrors.frequenceUtilisation && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.frequenceUtilisation}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Posologie</label>
              <input
                type="text"
                value={formData.complementSuspecte.posologie}
                onChange={(e) => setFormData({ ...formData, complementSuspecte: { ...formData.complementSuspecte, posologie: e.target.value } })}
                placeholder="Ex: 1 gélule par jour"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Composition du produit</label>
              <textarea
                value={formData.complementSuspecte.compositionProduit}
                onChange={(e) => setFormData({ ...formData, complementSuspecte: { ...formData.complementSuspecte, compositionProduit: e.target.value } })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Listez les ingrédients principaux..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date de Début d'Utilisation*</label>
                <input
                  type="date"
                  value={formData.complementSuspecte.dateDebutUtilisation}
                  onChange={(e) => setFormData({ ...formData, complementSuspecte: { ...formData.complementSuspecte, dateDebutUtilisation: e.target.value } })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {validationErrors.dateDebutUtilisation && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.dateDebutUtilisation}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Arrêt d'Utilisation</label>
                <select
                  value={formData.complementSuspecte.arretUtilisation}
                  onChange={(e) => setFormData({ ...formData, complementSuspecte: { ...formData.complementSuspecte, arretUtilisation: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une option</option>
                  <option value="OUI">Oui</option>
                  <option value="NON">Non</option>
                  <option value="INCONNU">Inconnu</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.complementSuspecte.reexpositionProduit}
                  onChange={(e) => setFormData({ ...formData, complementSuspecte: { ...formData.complementSuspecte, reexpositionProduit: e.target.checked } })}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-slate-700">Réexposition au produit</span>
              </label>

              {formData.complementSuspecte.reexpositionProduit && (
                <label className="flex items-center ml-6">
                  <input
                    type="checkbox"
                    checked={formData.complementSuspecte.reapparitionEffetIndesirable}
                    onChange={(e) => setFormData({ ...formData, complementSuspecte: { ...formData.complementSuspecte, reapparitionEffetIndesirable: e.target.checked } })}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Réapparition de l'effet indésirable</span>
                </label>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Commentaires Additionnels</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Commentaires ou informations complémentaires
              </label>
              <textarea
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Ajoutez toute information complémentaire que vous jugez utile..."
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Note importante :</span> Assurez-vous que toutes les informations fournies sont exactes et complètes. Cette déclaration sera examinée par l'ANMPS.
              </p>
            </div>
          </div>
        );

      default:
        return null;
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
                <h2 className="text-lg font-bold text-slate-900">Nutrivigilance</h2>
                <p className="text-sm text-slate-600">Déclaration Compléments Alimentaires</p>
              </div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img
                src="/logo_ammps.png"
                alt="Logo AMMPS"
                className="w-40 h-40 object-contain"
              />
            </div>
            <div className="flex gap-2">
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center px-4 py-2 bg-white border border-emerald-600 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors text-sm"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mr-4">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Déclaration d'Effet Indésirable
                </h1>
                <p className="text-white/90">
                  Complément Alimentaire
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              {sections.map((section, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${index <= currentSection ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white' : 'bg-slate-200 text-slate-600'} font-medium text-sm transition-all`}>
                    {index < currentSection ? '✓' : index + 1}
                  </div>
                  {index < sections.length - 1 && (
                    <div className={`w-12 h-1 mx-2 ${index < currentSection ? 'bg-gradient-to-r from-rose-500 to-pink-600' : 'bg-slate-200'} transition-all`} />
                  )}
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {sections[currentSection].title}
              </h3>
              <div className="w-20 h-1 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full" />
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              {renderSection()}

              <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={previousSection}
                  disabled={currentSection === 0}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${currentSection === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                >
                  Précédent
                </button>

                {currentSection < sections.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextSection}
                    className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-medium hover:from-rose-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-medium hover:from-rose-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>Envoi en cours...</>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Soumettre
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
