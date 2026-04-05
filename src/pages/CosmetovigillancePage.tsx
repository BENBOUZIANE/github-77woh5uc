import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, Plus, X, Upload, Image as ImageIcon, File, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { villesMaroc } from '../data/villesMaroc';
import { validateTelMaroc } from '../utils/validation';

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
    delaiSurvenueHeures: string;
    delaiSurvenueJours: string;
    delaiSurvenuesMois: string;
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
  produitSuspecte: {
    nomCommercial: string;
    marque: string;
    fabricant: string;
    typeProduit: string;
    numeroLot: string;
    zoneApplication: string;
    frequenceUtilisation: string;
    frequenceUtilisationAutre: string;
    dateDebutUtilisation: string;
    arretUtilisation: string;
    reexpositionProduit: boolean;
    reapparitionEffetIndesirable: boolean;
  };
  commentaire: string;
}

export default function CosmetovigillancePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    utilisateurType: 'professionnel',
    declarant: { nom: '', prenom: '', email: '', tel: '' },
    personneExposee: { type: '', nomPrenom: '', dateNaissance: '', age: undefined, ageUnite: '', grossesse: false, allaitement: false, sexe: 'F', ville: '' },
    allergiesConnues: [],
    antecedentsMedicaux: [],
    medicamentsSimultanes: [],
    effetIndesirable: { localisation: '', descriptionSymptomes: '', dateApparition: '', delaiSurvenueHeures: '', delaiSurvenueJours: '', delaiSurvenuesMois: '', gravite: false, criteresGravite: [], evolutionEffet: '' },
    priseChargeMedicale: { consultationMedicale: false, diagnosticMedecin: '', mesuresPriseType: '', mesuresPriseAutre: '', examensRealise: '' },
    produitSuspecte: { nomCommercial: '', marque: '', fabricant: '', typeProduit: '', numeroLot: '', zoneApplication: '', frequenceUtilisation: '', frequenceUtilisationAutre: '', dateDebutUtilisation: '', arretUtilisation: '', reexpositionProduit: false, reapparitionEffetIndesirable: false },
    commentaire: ''
  });

  const [newAllergie, setNewAllergie] = useState('');
  const [newAntecedent, setNewAntecedent] = useState('');
  const [newMedicament, setNewMedicament] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
      { title: 'Produit suspecté', icon: '🧴' },
      { title: 'Informations complémentaires', icon: '💬' }
    );

    return baseSections;
  };

  const sections = getSections();

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    );
  };

  const validateSection = (sectionIndex: number): boolean => {
    const errors: Record<string, string> = {};
    const caseNumber = getSectionCaseNumber(sectionIndex);

    switch (caseNumber) {
      case 0: // Notificateur
        if (!formData.declarant.nom.trim()) errors.declarantNom = 'Le nom est obligatoire';
        if (!formData.declarant.prenom.trim()) errors.declarantPrenom = 'Le prénom est obligatoire';
        if (!formData.declarant.tel.trim()) errors.declarantTel = 'Le téléphone est obligatoire';
        else { const telErr = validateTelMaroc(formData.declarant.tel); if (telErr) errors.declarantTel = telErr; }
        if (formData.utilisateurType === 'autre' && !formData.utilisateurTypeAutre?.trim()) {
          errors.utilisateurTypeAutre = 'Veuillez préciser le type de notificateur';
        }
        break;

      case 1: // Professionnel de Santé ou Représentant Légal
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

      case 2: // Personne Exposée (avec antécédents intégrés)
        if (!formData.personneExposee.type) errors.personneType = 'Le type de personne exposée est obligatoire';
        if (!formData.personneExposee.nomPrenom.trim()) errors.nomPrenom = 'Le nom et prénom sont obligatoires';
        if (!formData.personneExposee.ville) errors.personneVille = 'La ville est obligatoire';
        if (!formData.personneExposee.dateNaissance && !formData.personneExposee.age) {
          errors.dateNaissanceOuAge = 'La date de naissance ou l\'âge est obligatoire';
        }
        if (formData.personneExposee.age && !formData.personneExposee.ageUnite) {
          errors.ageUnite = 'L\'unité de l\'âge est obligatoire';
        }
        if (formData.personneExposee.grossesse && !formData.personneExposee.moisGrossesse) {
          errors.moisGrossesse = 'Le mois de grossesse est obligatoire';
        }
        break;

      case 3: // Effet Indésirable
        if (!formData.effetIndesirable.localisation.trim()) errors.localisation = 'La localisation est obligatoire';
        if (!formData.effetIndesirable.descriptionSymptomes.trim()) errors.descriptionSymptomes = 'La description est obligatoire';
        if (!formData.effetIndesirable.dateApparition) errors.dateApparition = 'La date d\'apparition est obligatoire';
        if (!formData.effetIndesirable.delaiSurvenueHeures.trim()) errors.delaiSurvenueHeures = 'Les heures sont obligatoires';
        if (!formData.effetIndesirable.delaiSurvenueJours.trim()) errors.delaiSurvenueJours = 'Les jours sont obligatoires';
        if (!formData.effetIndesirable.delaiSurvenuesMois.trim()) errors.delaiSurvenuesMois = 'Les mois sont obligatoires';
        if (!formData.effetIndesirable.evolutionEffet) errors.evolutionEffet = 'L\'évolution de l\'effet est obligatoire';
        if (formData.effetIndesirable.gravite && formData.effetIndesirable.criteresGravite.length === 0) {
          errors.criteresGravite = 'Veuillez sélectionner au moins un critère de gravité';
        }
        break;

      case 4: // Prise en Charge
        if (formData.priseChargeMedicale?.mesuresPriseType === 'autre' && !formData.priseChargeMedicale.mesuresPriseAutre?.trim()) {
          errors.mesuresPriseAutre = 'Veuillez préciser les autres mesures';
        }
        break;

      case 5: // Produit suspecté
        if (!formData.produitSuspecte.nomCommercial.trim()) errors.nomCommercial = 'Le nom commercial est obligatoire';
        if (!formData.produitSuspecte.marque.trim()) errors.marque = 'La marque est obligatoire';
        if (!formData.produitSuspecte.typeProduit) errors.typeProduit = 'Le type de produit est obligatoire';
        if (!formData.produitSuspecte.zoneApplication.trim()) errors.zoneApplication = 'La zone d\'application est obligatoire';
        if (!formData.produitSuspecte.frequenceUtilisation) errors.frequenceUtilisation = 'La fréquence d\'utilisation est obligatoire';
        if (formData.produitSuspecte.frequenceUtilisation === 'autre' && !formData.produitSuspecte.frequenceUtilisationAutre.trim()) errors.frequenceUtilisationAutre = 'Veuillez préciser la fréquence';
        if (!formData.produitSuspecte.dateDebutUtilisation) errors.dateDebutUtilisation = 'La date de début est obligatoire';
        if (!formData.produitSuspecte.arretUtilisation) errors.arretUtilisation = 'Ce champ est obligatoire';
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, sections.length - 1));
      setValidationErrors({});
    }
  };

  const handlePrevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 0));
    setValidationErrors({});
  };

  const getSectionCaseNumber = (sectionIndex: number): number => {
    let caseNumber = 0;
    let adjustedIndex = sectionIndex;

    // Compte les sections conditionnelles avant l'index actuel
    const sectionTitles = sections.map(s => s.title);

    // Case 0: Notificateur (toujours présent)
    if (adjustedIndex === 0) return 0;
    caseNumber = 1;
    adjustedIndex--;

    // Case 1: Professionnel ou Représentant (conditionnel)
    if (formData.utilisateurType === 'professionnel' || formData.utilisateurType === 'representant_legal') {
      if (adjustedIndex === 0) return 1;
      caseNumber = 2;
      adjustedIndex--;
    } else {
      caseNumber = 2;
    }

    // Case 2: Personne Exposée (toujours présent)
    if (adjustedIndex === 0) return 2;
    caseNumber = 3;
    adjustedIndex--;

    // Case 3: Antécédents Médicaux (toujours présent)
    if (adjustedIndex === 0) return 3;
    caseNumber = 4;
    adjustedIndex--;

    // Case 4: Effet Indésirable (toujours présent)
    if (adjustedIndex === 0) return 4;
    caseNumber = 5;
    adjustedIndex--;

    // Case 5: Prise en Charge (toujours présent)
    if (adjustedIndex === 0) return 5;
    caseNumber = 6;
    adjustedIndex--;

    // Case 6: Produit suspecté (toujours présent)
    if (adjustedIndex === 0) return 6;
    caseNumber = 7;
    adjustedIndex--;

    // Case 7: Informations complémentaires (toujours présent)
    if (adjustedIndex === 0) return 7;

    return caseNumber;
  };

  const addItem = (list: string[], setList: (items: string[]) => void, item: string, setItem: (val: string) => void) => {
    if (item.trim()) {
      setList([...list, item.trim()]);
      setItem('');
    }
  };

  const removeItem = (list: string[], setList: (items: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const type = file.type;
        const isValid = type.startsWith('image/') || type === 'application/pdf';
        const isUnder10MB = file.size <= 10485760;
        return isValid && isUnder10MB;
      });

      if (validFiles.length !== files.length) {
        alert('Certains fichiers ont été ignorés. Seuls les images et PDF de moins de 10MB sont acceptés.');
      }

      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDocumentEnregistrementSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' && file.size <= 10485760) {
        setDocumentEnregistrement(file);
      } else {
        alert('Veuillez sélectionner un fichier PDF de moins de 10MB.');
      }
    }
  };

  const handleSubmit = async () => {
    const hasDateNaissance = formData.personneExposee.dateNaissance &&
                             formData.personneExposee.dateNaissance.split('-').filter(p => p).length === 3;
    const hasAge = formData.personneExposee.age !== undefined && formData.personneExposee.age > 0;

    if (!hasDateNaissance && !hasAge) {
      alert('Veuillez remplir au moins un des champs: Date de naissance ou Âge');
      return;
    }

    setIsSubmitting(true);
    try {
      const declarationPayload: any = {
        utilisateurType: formData.utilisateurType === 'autre' && formData.utilisateurTypeAutre
          ? formData.utilisateurTypeAutre
          : formData.utilisateurType,
        declarant: formData.declarant,
        personneExposee: {
          ...formData.personneExposee,
          allergies: formData.allergiesConnues,
          antecedents: formData.antecedentsMedicaux,
          medicaments: formData.medicamentsSimultanes,
        },
        effetsIndesirables: formData.effetIndesirable?.descriptionSymptomes
          ? [{
              localisation: formData.effetIndesirable.localisation,
              descriptionSymptomes: formData.effetIndesirable.descriptionSymptomes,
              dateApparition: formData.effetIndesirable.dateApparition,
              delaiSurvenue: [
                formData.effetIndesirable.delaiSurvenueHeures ? `${formData.effetIndesirable.delaiSurvenueHeures} Heures` : '',
                formData.effetIndesirable.delaiSurvenueJours ? `${formData.effetIndesirable.delaiSurvenueJours} Jours` : '',
                formData.effetIndesirable.delaiSurvenuesMois ? `${formData.effetIndesirable.delaiSurvenuesMois} Mois` : '',
              ].filter(Boolean).join(', '),
              gravite: formData.effetIndesirable.gravite,
              criteresGravite: formData.effetIndesirable.criteresGravite.join(', '),
              evolutionEffet: formData.effetIndesirable.evolutionEffet,
            }]
          : [],
        produitsSuspectes: formData.produitSuspecte?.nomCommercial
          ? [{
              nomCommercial: formData.produitSuspecte.nomCommercial,
              marque: formData.produitSuspecte.marque,
              fabricant: formData.produitSuspecte.fabricant,
              typeProduit: formData.produitSuspecte.typeProduit,
              numeroLot: formData.produitSuspecte.numeroLot,
              zoneApplication: formData.produitSuspecte.zoneApplication,
              frequenceUtilisation: formData.produitSuspecte.frequenceUtilisation === 'autre'
                ? formData.produitSuspecte.frequenceUtilisationAutre
                : formData.produitSuspecte.frequenceUtilisation,
              dateDebutUtilisation: formData.produitSuspecte.dateDebutUtilisation,
              arretUtilisation: formData.produitSuspecte.arretUtilisation || null,
              reexpositionProduit: formData.produitSuspecte.reexpositionProduit,
              reapparitionEffetIndesirable: formData.produitSuspecte.reapparitionEffetIndesirable,
            }]
          : [],
        prisesChargeMedicales: formData.priseChargeMedicale.consultationMedicale
          ? [{
              diagnostic: formData.priseChargeMedicale.diagnosticMedecin,
              mesuresPrise: formData.priseChargeMedicale.mesuresPriseType === 'traitement_symptomatique'
                ? 'Traitement symptomatique'
                : formData.priseChargeMedicale.mesuresPriseAutre,
              examensRealise: formData.priseChargeMedicale.examensRealise,
            }]
          : [],
        commentaire: formData.commentaire,
      };

      // Ajouter professionnelSante seulement si c'est un professionnel ET les champs sont remplis
      if (formData.utilisateurType === 'professionnel' && formData.professionnelSante?.profession) {
        declarationPayload.professionnelSante = formData.professionnelSante;
      }

      // Ajouter representantLegal seulement si c'est un représentant ET les champs sont remplis
      if (formData.utilisateurType === 'representant_legal' && formData.representantLegal?.nomEtablissement) {
        declarationPayload.representantLegal = formData.representantLegal;
      }

      const declaration = await api.createDeclaration(declarationPayload) as { id: string };

      // Upload du document d'enregistrement même sans connexion
      if (documentEnregistrement && (formData.utilisateurType === 'professionnel' || formData.utilisateurType === 'representant_legal')) {
        await api.uploadFile(documentEnregistrement, declaration.id);
      }

      // Upload des autres pièces jointes même sans connexion
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await api.uploadFile(file, declaration.id);
        }
      }

      alert('Déclaration soumise avec succès!');
      navigate('/');
    } catch (error) {
      alert('Erreur lors de la soumission du formulaire. Veuillez réessayer.');
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Informations sur le notificateur </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom*</label>
                <input
                  type="text"
                  value={formData.declarant.nom}
                  onChange={(e) => setFormData({ ...formData, declarant: { ...formData.declarant, nom: e.target.value } })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.declarantNom ? 'border-red-500' : 'border-slate-300'}`}
                  required
                />
                <ErrorMessage error={validationErrors.declarantNom} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prénom*</label>
                <input
                  type="text"
                  value={formData.declarant.prenom}
                  onChange={(e) => setFormData({ ...formData, declarant: { ...formData.declarant, prenom: e.target.value } })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.declarantPrenom ? 'border-red-500' : 'border-slate-300'}`}
                  required
                />
                <ErrorMessage error={validationErrors.declarantPrenom} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.declarant.email}
                  onChange={(e) => setFormData({ ...formData, declarant: { ...formData.declarant, email: e.target.value } })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.declarantEmail ? 'border-red-500' : 'border-slate-300'}`}
                  
                />
                <ErrorMessage error={validationErrors.declarantEmail} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone*</label>
                <input
                  type="tel"
                  value={formData.declarant.tel}
                  onChange={(e) => setFormData({ ...formData, declarant: { ...formData.declarant, tel: e.target.value } })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.declarantTel ? 'border-red-500' : 'border-slate-300'}`}
                  required
                />
                <ErrorMessage error={validationErrors.declarantTel} />
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
                <option value="representant_legal">Représentant légal de l'établissement</option>
                <option value="particulier">Utilisateur</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {formData.utilisateurType === 'autre' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Précisez le type de notificateur*</label>
                <input
                  type="text"
                  value={formData.utilisateurTypeAutre || ''}
                  onChange={(e) => setFormData({ ...formData, utilisateurTypeAutre: e.target.value })}
                  placeholder="Veuillez préciser votre type d'utilisateur..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.utilisateurTypeAutre ? 'border-red-500' : 'border-slate-300'}`}
                  required
                />
                <ErrorMessage error={validationErrors.utilisateurTypeAutre} />
              </div>
            )}
          </div>
        );

      case 1:
        if (formData.utilisateurType === 'professionnel') {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Professionnel de Santé</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Profession*</label>
                  <select
                    value={formData.professionnelSante?.profession || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      professionnelSante: { ...formData.professionnelSante!, profession: e.target.value, structure: formData.professionnelSante?.structure || '', ville: formData.professionnelSante?.ville || '' }
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.profession ? 'border-red-500' : 'border-slate-300'}`}
                  >
                    <option value="">Sélectionnez une profession</option>
                    <option value="Médecin">Médecin</option>
                    <option value="Pharmacien">Pharmacien</option>
                    <option value="Infirmier">Infirmier</option>
                    <option value="Autre">Autre</option>
                  </select>
                  <ErrorMessage error={validationErrors.profession} />
                </div>

                {formData.professionnelSante?.profession === 'Autre' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Précisez la profession*</label>
                    <input
                      type="text"
                      value={formData.professionnelSante?.professionAutre || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        professionnelSante: {
                          ...formData.professionnelSante!,
                          professionAutre: e.target.value
                        }
                      })}
                      placeholder="Veuillez préciser votre profession..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Structure</label>
                  <input
                    type="text"
                    value={formData.professionnelSante?.structure || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      professionnelSante: { ...formData.professionnelSante!, structure: e.target.value, profession: formData.professionnelSante?.profession || '', ville: formData.professionnelSante?.ville || '' }
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
                      professionnelSante: { ...formData.professionnelSante!, ville: e.target.value, profession: formData.professionnelSante?.profession || '', structure: formData.professionnelSante?.structure || '' }
                    })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez une ville</option>
                    {villesMaroc.map((ville) => (
                      <option key={ville} value={ville}>
                        {ville}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        } else if (formData.utilisateurType === 'representant_legal') {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Représentant Légal</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom de l'Établissement*</label>
                  <input
                    type="text"
                    value={formData.representantLegal?.nomEtablissement || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      representantLegal: {
                        ...formData.representantLegal!,
                        nomEtablissement: e.target.value,
                        numeroDeclarationEtablissement: formData.representantLegal?.numeroDeclarationEtablissement || '',
                        numeroDocumentEnregistrementProduit: formData.representantLegal?.numeroDocumentEnregistrementProduit || '',
                        dateReceptionNotification: formData.representantLegal?.dateReceptionNotification || ''
                      }
                    })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                  {validationErrors.nomEtablissement && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.nomEtablissement}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">N° de Déclaration de l'Établissement*</label>
                  <input
                    type="text"
                    value={formData.representantLegal?.numeroDeclarationEtablissement || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      representantLegal: {
                        ...formData.representantLegal!,
                        numeroDeclarationEtablissement: e.target.value,
                        nomEtablissement: formData.representantLegal?.nomEtablissement || '',
                        numeroDocumentEnregistrementProduit: formData.representantLegal?.numeroDocumentEnregistrementProduit || '',
                        dateReceptionNotification: formData.representantLegal?.dateReceptionNotification || ''
                      }
                    })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                  {validationErrors.numeroDeclaration && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.numeroDeclaration}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">N° du Document d'Enregistrement du Produit*</label>
                  <input
                    type="text"
                    value={formData.representantLegal?.numeroDocumentEnregistrementProduit || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      representantLegal: {
                        ...formData.representantLegal!,
                        numeroDocumentEnregistrementProduit: e.target.value,
                        nomEtablissement: formData.representantLegal?.nomEtablissement || '',
                        numeroDeclarationEtablissement: formData.representantLegal?.numeroDeclarationEtablissement || '',
                        dateReceptionNotification: formData.representantLegal?.dateReceptionNotification || ''
                      }
                    })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                  {validationErrors.numeroDocument && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.numeroDocument}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date de Réception de la Notification*</label>
                  <input
                    type="date"
                    value={formData.representantLegal?.dateReceptionNotification || ''}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({
                      ...formData,
                      representantLegal: {
                        ...formData.representantLegal!,
                        dateReceptionNotification: e.target.value,
                        nomEtablissement: formData.representantLegal?.nomEtablissement || '',
                        numeroDeclarationEtablissement: formData.representantLegal?.numeroDeclarationEtablissement || '',
                        numeroDocumentEnregistrementProduit: formData.representantLegal?.numeroDocumentEnregistrementProduit || ''
                      }
                    })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                  {validationErrors.dateReception && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.dateReception}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document d'Enregistrement (PDF)*
                </label>
                <div className="space-y-4">
                  <label className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-slate-50 transition-colors ${validationErrors.documentEnregistrement ? 'border-red-500' : 'border-slate-300'}`}>
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-emerald-600">Cliquez pour sélectionner</span> un fichier PDF
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PDF uniquement - Max 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleDocumentEnregistrementSelect}
                      className="hidden"
                    />
                  </label>
                  {validationErrors.documentEnregistrement && (
                    <p className="text-sm text-red-600">{validationErrors.documentEnregistrement}</p>
                  )}

                  {documentEnregistrement && (
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <File className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {documentEnregistrement.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(documentEnregistrement.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDocumentEnregistrement(null)}
                        type="button"
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-slate-700">
                  <strong>Note:</strong> En tant que représentant légal d'un établissement, veuillez fournir toutes les informations relatives à la déclaration de l'établissement et du produit concerné.
                </p>
              </div>
            </div>
          );
        } else {
          setCurrentSection(2);
          return null;
        }

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Personne Exposée</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type*</label>
                <select
                  value={formData.personneExposee.type}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, type: e.target.value } })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.personneType ? 'border-red-500' : 'border-slate-300'}`}
                >
                  <option value="">-- Sélectionnez un type --</option>
                  <option value="patient">Patient</option>
                  <option value="proche">Proche</option>
                  <option value="autre">Autre</option>
                </select>
                {validationErrors.personneType && <p className="mt-1 text-sm text-red-600">{validationErrors.personneType}</p>}
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
                    value={formData.personneExposee.dateNaissance?.split('-')[2]?.replace(/^0/, '') || ''}
                    onChange={(e) => {
                      const parts = (formData.personneExposee.dateNaissance || '--').split('-');
                      const day = e.target.value ? e.target.value.padStart(2, '0') : '';
                      setFormData({ ...formData, personneExposee: { ...formData.personneExposee, dateNaissance: `${parts[0]}-${parts[1]}-${day}` } });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <select
                    value={formData.personneExposee.dateNaissance?.split('-')[1] || ''}
                    onChange={(e) => {
                      const parts = (formData.personneExposee.dateNaissance || '--').split('-');
                      setFormData({ ...formData, personneExposee: { ...formData.personneExposee, dateNaissance: `${parts[0]}-${e.target.value}-${parts[2]}` } });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Mois</option>
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
                  <select
                    value={formData.personneExposee.dateNaissance?.split('-')[0] || ''}
                    onChange={(e) => {
                      const parts = (formData.personneExposee.dateNaissance || '--').split('-');
                      setFormData({ ...formData, personneExposee: { ...formData.personneExposee, dateNaissance: `${e.target.value}-${parts[1]}-${parts[2]}` } });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Année</option>
                    {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
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
                  value={formData.personneExposee.ageUnite || ''}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, ageUnite: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">-- Unité --</option>
                  <option value="Année">Année</option>
                  <option value="Mois">Mois</option>
                  <option value="Semaine">Semaine</option>
                  <option value="Jour">Jour</option>
                  <option value="Heure">Heure</option>
                </select>
              </div>
              {validationErrors.ageUnite && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.ageUnite}</p>
              )}
              {validationErrors.dateNaissanceOuAge && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.dateNaissanceOuAge}</p>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-2">
                <span className="font-medium">Note:</span> Saisissez soit la date de naissance ou l'âge en heure/mois ou année
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Délai de survenue*</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      value={formData.effetIndesirable.delaiSurvenueHeures}
                      onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, delaiSurvenueHeures: e.target.value } })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <span className="text-xs text-slate-500 mt-1 block text-center">Heures</span>
                    {validationErrors.delaiSurvenueHeures && <p className="mt-1 text-xs text-red-600">{validationErrors.delaiSurvenueHeures}</p>}
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      value={formData.effetIndesirable.delaiSurvenueJours}
                      onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, delaiSurvenueJours: e.target.value } })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <span className="text-xs text-slate-500 mt-1 block text-center">Jours</span>
                    {validationErrors.delaiSurvenueJours && <p className="mt-1 text-xs text-red-600">{validationErrors.delaiSurvenueJours}</p>}
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      value={formData.effetIndesirable.delaiSurvenuesMois}
                      onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, delaiSurvenuesMois: e.target.value } })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <span className="text-xs text-slate-500 mt-1 block text-center">Mois</span>
                    {validationErrors.delaiSurvenuesMois && <p className="mt-1 text-xs text-red-600">{validationErrors.delaiSurvenuesMois}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.effetIndesirable.gravite}
                  onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, gravite: e.target.checked } })}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm font-medium text-slate-700">Effet grave</span>
              </label>
            </div>

            {formData.effetIndesirable.gravite && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Critères de Gravité*</label>
                <div className="space-y-2">
                  {[
                    'Incapacité fonctionnelle temporaire ou permanente',
                    'Handicap',
                    'Risque vital immédiat',
                    'Hospitalisation',
                    'Décès'
                  ].map((critere) => (
                    <label key={critere} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.effetIndesirable.criteresGravite.includes(critere)}
                        onChange={(e) => {
                          const newCriteres = e.target.checked
                            ? [...formData.effetIndesirable.criteresGravite, critere]
                            : formData.effetIndesirable.criteresGravite.filter(c => c !== critere);
                          setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, criteresGravite: newCriteres } });
                        }}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">{critere}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.criteresGravite && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.criteresGravite}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Évolution de l'Effet*</label>
              <select
                value={formData.effetIndesirable.evolutionEffet}
                onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, evolutionEffet: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner</option>
                <option value="guerison">Guérison</option>
                <option value="amelioration_en_cours">Amélioration en cours</option>
                <option value="sequelles">Séquelles</option>
                <option value="persistance">Persistance de l'effet</option>
                <option value="inconnue">Inconnue</option>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Diagnostic du médecin</label>
              <textarea
                value={formData.priseChargeMedicale.diagnosticMedecin}
                onChange={(e) => setFormData({ ...formData, priseChargeMedicale: { ...formData.priseChargeMedicale, diagnosticMedecin: e.target.value } })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Décrivez le diagnostic médical..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mesures prises</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mesuresPriseType"
                    value="traitement_symptomatique"
                    checked={formData.priseChargeMedicale.mesuresPriseType === 'traitement_symptomatique'}
                    onChange={(e) => setFormData({ ...formData, priseChargeMedicale: { ...formData.priseChargeMedicale, mesuresPriseType: e.target.value, mesuresPriseAutre: '' } })}
                    className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Traitement symptomatique</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mesuresPriseType"
                    value="autre"
                    checked={formData.priseChargeMedicale.mesuresPriseType === 'autre'}
                    onChange={(e) => setFormData({ ...formData, priseChargeMedicale: { ...formData.priseChargeMedicale, mesuresPriseType: e.target.value } })}
                    className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Autre à préciser</span>
                </label>

                {formData.priseChargeMedicale.mesuresPriseType === 'autre' && (
                  <div>
                    <textarea
                      value={formData.priseChargeMedicale.mesuresPriseAutre}
                      onChange={(e) => setFormData({ ...formData, priseChargeMedicale: { ...formData.priseChargeMedicale, mesuresPriseAutre: e.target.value } })}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Précisez les autres mesures prises..."
                    />
                    {validationErrors.mesuresPriseAutre && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.mesuresPriseAutre}</p>
                    )}
                  </div>
                )}
              </div>
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
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Produit suspecté</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom Commercial*</label>
                <input
                  type="text"
                  value={formData.produitSuspecte.nomCommercial}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, nomCommercial: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {validationErrors.nomCommercial && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.nomCommercial}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Marque*</label>
                <input
                  type="text"
                  value={formData.produitSuspecte.marque}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, marque: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {validationErrors.marque && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.marque}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fabricant</label>
                <input
                  type="text"
                  value={formData.produitSuspecte.fabricant}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, fabricant: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type de Produit*</label>
                <input
                  type="text"
                  value={formData.produitSuspecte.typeProduit}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, typeProduit: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {validationErrors.typeProduit && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.typeProduit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Numéro de Lot</label>
                <input
                  type="text"
                  value={formData.produitSuspecte.numeroLot}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, numeroLot: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {validationErrors.numeroLot && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.numeroLot}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Zone d'Application*</label>
                <input
                  type="text"
                  value={formData.produitSuspecte.zoneApplication}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, zoneApplication: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ex: Visage, Corps, Cheveux..."
                />
                {validationErrors.zoneApplication && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.zoneApplication}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fréquence d'Utilisation*</label>
                <select
                  value={formData.produitSuspecte.frequenceUtilisation}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, frequenceUtilisation: e.target.value, frequenceUtilisationAutre: '' } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="Quotidienne">Quotidienne</option>
                  <option value="Occasionnelle">Occasionnelle</option>
                  <option value="autre">Autre</option>
                </select>
                {validationErrors.frequenceUtilisation && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.frequenceUtilisation}</p>
                )}
                {formData.produitSuspecte.frequenceUtilisation === 'autre' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={formData.produitSuspecte.frequenceUtilisationAutre}
                      onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, frequenceUtilisationAutre: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Précisez la fréquence..."
                    />
                    {validationErrors.frequenceUtilisationAutre && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.frequenceUtilisationAutre}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date de Début d'Utilisation*</label>
                <input
                  type="date"
                  value={formData.produitSuspecte.dateDebutUtilisation}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, dateDebutUtilisation: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {validationErrors.dateDebutUtilisation && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.dateDebutUtilisation}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Arrêt d'Utilisation*</label>
                <input
                  type="date"
                  value={formData.produitSuspecte.arretUtilisation}
                  min={formData.produitSuspecte.dateDebutUtilisation || new Date().toISOString().split('T')[0]}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, arretUtilisation: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {validationErrors.arretUtilisation && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.arretUtilisation}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.produitSuspecte.reexpositionProduit}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, reexpositionProduit: e.target.checked } })}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-slate-700">Réexposition au produit</span>
              </label>

              {formData.produitSuspecte.reexpositionProduit && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.produitSuspecte.reapparitionEffetIndesirable}
                    onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, reapparitionEffetIndesirable: e.target.checked } })}
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Informations complémentaires
              </label>
              <textarea
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                rows={6}
                placeholder="Ajoutez ici toute information complémentaire qui pourrait être utile pour l'analyse de cette déclaration..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pièces Jointes
              </label>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-emerald-600">Cliquez pour sélectionner</span> ou glissez-déposez
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Images (JPG, PNG, GIF) ou PDF - Max 10MB par fichier
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Fichiers sélectionnés ({selectedFiles.length})
                    </p>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {file.type.startsWith('image/') ? (
                              <ImageIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <File className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeSelectedFile(index)}
                            type="button"
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                          >
                            <X className="w-5 h-5 text-slate-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Récapitulatif de la Déclaration</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Déclarant:</strong> {formData.declarant.prenom} {formData.declarant.nom}</p>
                <p><strong>Personne exposée:</strong> {formData.personneExposee.nomPrenom}</p>
                <p><strong>Produit:</strong> {formData.produitSuspecte.nomCommercial || 'Non renseigné'}</p>
                <p><strong>Effet indésirable:</strong> {formData.effetIndesirable.localisation || 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg text-sm"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Tableau de bord</span>
                  <span className="sm:hidden">Dashboard</span>
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
            <div className="flex items-center">
              <Sparkles className="w-10 h-10 text-white mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Déclaration de Cosmétovigilance
                </h1>
                <p className="text-emerald-100 mt-1">
                  Produits cosmétiques ou d'hygiène corporelle
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
                      ? 'bg-emerald-100 text-emerald-700'
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
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
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
