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
    descriptionSymptomes: string;
    dateApparition: string;
    delaiSurvenue: string;
    gravite: boolean;
    criteresGravite: string[];
    evolutionEffet: string;
    reexposition?: boolean;
    reapparition?: boolean;
  };
  complementsSuspectes: {
    nomSpecialite: string;
    posologie: string;
    numeroLot: string;
    dateDebutPrise: string;
    dateArretPrise: string;
    motifPrise: string;
    lieuAchat: string;
  }[];
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
    effetIndesirable: { descriptionSymptomes: '', dateApparition: '', delaiSurvenue: '', gravite: false, criteresGravite: [], evolutionEffet: '', reexposition: false, reapparition: false },
    complementsSuspectes: [],
    commentaire: ''
  });

  const [newAllergie, setNewAllergie] = useState('');
  const [newAntecedent, setNewAntecedent] = useState('');
  const [newMedicament, setNewMedicament] = useState('');
  const [documentEnregistrement, setDocumentEnregistrement] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentComplement, setCurrentComplement] = useState({
    nomSpecialite: '',
    posologie: '',
    numeroLot: '',
    dateDebutPrise: '',
    dateArretPrise: '',
    motifPrise: '',
    lieuAchat: ''
  });
  const [isEditingComplement, setIsEditingComplement] = useState(false);
  const [editingComplementIndex, setEditingComplementIndex] = useState<number | null>(null);

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

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.effetIndesirable.reexposition || false}
                  onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, reexposition: e.target.checked, reapparition: e.target.checked ? formData.effetIndesirable.reapparition : false } })}
                  className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
                />
                <span className="ml-2 text-sm font-medium text-slate-700">Complément alimentaire réadministré</span>
              </label>

              {formData.effetIndesirable.reexposition && (
                <label className="flex items-center ml-6">
                  <input
                    type="checkbox"
                    checked={formData.effetIndesirable.reapparition || false}
                    onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, reapparition: e.target.checked } })}
                    className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Réapparition de l'évènement indésirable</span>
                </label>
              )}
            </div>
          </div>
        );

      case 4:
        const addOrUpdateComplement = () => {
          if (!currentComplement.nomSpecialite || !currentComplement.numeroLot || !currentComplement.dateDebutPrise) {
            alert('Veuillez remplir tous les champs obligatoires (Nom de spécialité, N° de lot, Date début de prise)');
            return;
          }

          if (isEditingComplement && editingComplementIndex !== null) {
            const updatedComplements = [...formData.complementsSuspectes];
            updatedComplements[editingComplementIndex] = currentComplement;
            setFormData({ ...formData, complementsSuspectes: updatedComplements });
            setIsEditingComplement(false);
            setEditingComplementIndex(null);
          } else {
            setFormData({ ...formData, complementsSuspectes: [...formData.complementsSuspectes, currentComplement] });
          }

          setCurrentComplement({
            nomSpecialite: '',
            posologie: '',
            numeroLot: '',
            dateDebutPrise: '',
            dateArretPrise: '',
            motifPrise: '',
            lieuAchat: ''
          });
        };

        const editComplement = (index: number) => {
          setCurrentComplement(formData.complementsSuspectes[index]);
          setIsEditingComplement(true);
          setEditingComplementIndex(index);
        };

        const removeComplement = (index: number) => {
          const updatedComplements = formData.complementsSuspectes.filter((_, i) => i !== index);
          setFormData({ ...formData, complementsSuspectes: updatedComplements });
        };

        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Compléments Alimentaires Suspectés</h2>

            {formData.complementsSuspectes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Informations sur le complément alimentaire suspecté</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-800">
                          Nom de la spécialité/<br/>présentation
                        </th>
                        <th className="border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-800">
                          Posologie / voie<br/>d'administration
                        </th>
                        <th className="border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-800">
                          N° de<br/>lot
                        </th>
                        <th className="border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-800">
                          Date Début<br/>de prise
                        </th>
                        <th className="border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-800">
                          Date<br/>Arrêt<br/><span className="underline">de prise</span>
                        </th>
                        <th className="border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-800">
                          Motif de la prise
                        </th>
                        <th className="border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-800">
                          Lieu<br/>d'achat<br/>(**)
                        </th>
                        <th className="border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-800">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.complementsSuspectes.map((complement, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="border border-slate-300 px-3 py-2 text-sm">
                            {complement.nomSpecialite}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-sm">
                            {complement.posologie || '-'}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-sm text-center">{complement.numeroLot || '-'}</td>
                          <td className="border border-slate-300 px-3 py-2 text-sm text-center">
                            {complement.dateDebutPrise ? new Date(complement.dateDebutPrise).toLocaleDateString('fr-FR') : '-'}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-sm text-center">
                            {complement.dateArretPrise ? new Date(complement.dateArretPrise).toLocaleDateString('fr-FR') : '-'}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-sm">{complement.motifPrise || '-'}</td>
                          <td className="border border-slate-300 px-3 py-2 text-sm text-center">{complement.lieuAchat || '-'}</td>
                          <td className="border border-slate-300 px-3 py-2 text-center">
                            <div className="flex gap-1 justify-center">
                              <button
                                type="button"
                                onClick={() => editComplement(index)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Modifier"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeComplement(index)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Supprimer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-slate-600 mt-2">
                    **Précisez si : 1 : Pharmacie &nbsp;&nbsp; 2 : Parapharmacie &nbsp;&nbsp; 3 : Internet &nbsp;&nbsp; 4 : Inconnu
                  </p>
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                {isEditingComplement ? 'Modifier le complément' : 'Ajouter un complément alimentaire'}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nom de la spécialité/présentation*</label>
                    <input
                      type="text"
                      value={currentComplement.nomSpecialite}
                      onChange={(e) => setCurrentComplement({ ...currentComplement, nomSpecialite: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Posologie / voie d'administration</label>
                    <input
                      type="text"
                      value={currentComplement.posologie}
                      onChange={(e) => setCurrentComplement({ ...currentComplement, posologie: e.target.value })}
                      placeholder="Ex: 1 gélule par jour, voie orale"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">N° de lot*</label>
                    <input
                      type="text"
                      value={currentComplement.numeroLot}
                      onChange={(e) => setCurrentComplement({ ...currentComplement, numeroLot: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date Début de prise*</label>
                    <input
                      type="date"
                      value={currentComplement.dateDebutPrise}
                      onChange={(e) => setCurrentComplement({ ...currentComplement, dateDebutPrise: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date Arrêt de prise</label>
                    <input
                      type="date"
                      value={currentComplement.dateArretPrise}
                      onChange={(e) => setCurrentComplement({ ...currentComplement, dateArretPrise: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Motif de la prise</label>
                    <input
                      type="text"
                      value={currentComplement.motifPrise}
                      onChange={(e) => setCurrentComplement({ ...currentComplement, motifPrise: e.target.value })}
                      placeholder="Ex: Renforcement immunitaire"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Lieu d'achat**</label>
                    <select
                      value={currentComplement.lieuAchat}
                      onChange={(e) => setCurrentComplement({ ...currentComplement, lieuAchat: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner</option>
                      <option value="1">1 - Pharmacie</option>
                      <option value="2">2 - Parapharmacie</option>
                      <option value="3">3 - Internet</option>
                      <option value="4">4 - Inconnu</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addOrUpdateComplement}
                  className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-medium hover:from-rose-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                >
                  {isEditingComplement ? 'Mettre à jour le complément' : 'Ajouter à la liste'}
                </button>
              </div>
            </div>

            {formData.complementsSuspectes.length === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                Vous devez ajouter au moins un complément alimentaire suspecté.
              </p>
            )}
          </div>
        );

      case 5:
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-8 py-6">
            <div className="flex items-center">
              <Pill className="w-10 h-10 text-white mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Déclaration de Nutrivigilance
                </h1>
                <p className="text-rose-100 mt-1">
                  Compléments alimentaires
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
                  type="button"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    currentSection === index
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-8 py-8">
            <form onSubmit={(e) => e.preventDefault()}>
              {renderSection()}

            </form>
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-between">
            <button
              type="button"
              onClick={previousSection}
              disabled={currentSection === 0}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>

            {currentSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={nextSection}
                className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                Suivant
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors"
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
