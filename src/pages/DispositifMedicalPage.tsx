import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Beaker, Save, Upload, Image as ImageIcon, File, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
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
  incident: {
    description: string;
    nombreDM: string;
    dateSurvenue: string;
    consequencesCliniques: string;
    structureSurvenue: string;
    adresseSurvenue: string;
  };
  dispositifSuspecte: {
    nomCommercial: string;
    marque: string;
    designation: string;
    reference: string;
    modele: string;
    numeroSerie: string;
    numeroLot: string;
    udi: string;
    versionLogiciel: string;
    nomFabricant: string;
    adresseFabricant: string;
    localisationActuelle: string;
    estImplantable: boolean;
    dateImplantation?: string;
    dateExplantation?: string;
  };
  commentaire: string;
}

export default function DispositifMedicalPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    utilisateurType: 'professionnel',
    declarant: { nom: '', prenom: '', email: '', tel: '' },
    personneExposee: { type: 'patient', nomPrenom: '', dateNaissance: '', age: undefined, ageUnite: 'Année', grossesse: false, allaitement: false, sexe: 'F', ville: '' },
    incident: { description: '', nombreDM: '', dateSurvenue: '', consequencesCliniques: '', structureSurvenue: '', adresseSurvenue: '' },
    dispositifSuspecte: { nomCommercial: '', marque: '', designation: '', reference: '', modele: '', numeroSerie: '', numeroLot: '', udi: '', versionLogiciel: '', nomFabricant: '', adresseFabricant: '', localisationActuelle: '', estImplantable: false },
    commentaire: ''
  });

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
      { title: 'Incident/Risque', icon: '⚠️' },
      { title: 'Dispositif Médical', icon: '🩺' },
      { title: 'Commentaires', icon: '💬' }
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
        if (!formData.incident.description.trim()) errors.incidentDescription = 'La description est obligatoire';
        if (!formData.incident.dateSurvenue) errors.dateSurvenue = 'La date de survenue est obligatoire';
        if (!formData.incident.structureSurvenue.trim()) errors.structureSurvenue = 'La structure de survenue est obligatoire';
        break;

      case 4:
        if (!formData.dispositifSuspecte.nomCommercial.trim()) errors.nomCommercial = 'Le nom commercial est obligatoire';
        if (!formData.dispositifSuspecte.nomFabricant.trim()) errors.nomFabricant = 'Le nom du fabricant est obligatoire';
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
    let adjustedIndex = sectionIndex;

    if (adjustedIndex === 0) return 0;
    adjustedIndex--;

    if (formData.utilisateurType === 'professionnel' || formData.utilisateurType === 'representant_legal') {
      if (adjustedIndex === 0) return 1;
      adjustedIndex--;
    }

    if (adjustedIndex === 0) return 2;
    adjustedIndex--;

    if (adjustedIndex === 0) return 3;
    adjustedIndex--;

    if (adjustedIndex === 0) return 4;
    adjustedIndex--;

    if (adjustedIndex === 0) return 5;

    return 0;
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Informations du Notificateur</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom*</label>
                <input
                  type="text"
                  value={formData.declarant.nom}
                  onChange={(e) => setFormData({ ...formData, declarant: { ...formData.declarant, nom: e.target.value } })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.declarantNom ? 'border-red-500' : 'border-slate-300'}`}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.declarantPrenom ? 'border-red-500' : 'border-slate-300'}`}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.declarantEmail ? 'border-red-500' : 'border-slate-300'}`}
                />
                <ErrorMessage error={validationErrors.declarantEmail} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone*</label>
                <input
                  type="tel"
                  value={formData.declarant.tel}
                  onChange={(e) => setFormData({ ...formData, declarant: { ...formData.declarant, tel: e.target.value } })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.declarantTel ? 'border-red-500' : 'border-slate-300'}`}
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.utilisateurTypeAutre ? 'border-red-500' : 'border-slate-300'}`}
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.profession ? 'border-red-500' : 'border-slate-300'}`}
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
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <span className="font-medium text-blue-600">Cliquez pour sélectionner</span> un fichier PDF
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={formData.personneExposee.dateNaissance?.split('-')[1] || ''}
                    onChange={(e) => {
                      const parts = formData.personneExposee.dateNaissance?.split('-') || ['', '', ''];
                      const newDate = `${parts[0] || ''}-${e.target.value}-${parts[2] || ''}`.replace(/^-+|-+$/g, '');
                      setFormData({ ...formData, personneExposee: { ...formData.personneExposee, dateNaissance: newDate } });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">L'âge au moment de l'apparition de l'incident</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Entrez l'âge"
                  value={formData.personneExposee.age || ''}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, age: parseInt(e.target.value) || undefined } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={formData.personneExposee.ageUnite || 'Année'}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, ageUnite: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">Grossesse</span>
                  </label>

                  {formData.personneExposee.grossesse && (
                    <div>
                      <select
                        value={formData.personneExposee.moisGrossesse || ''}
                        onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, moisGrossesse: parseInt(e.target.value) || undefined } })}
                        className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.moisGrossesse ? 'border-red-500' : 'border-slate-300'}`}
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
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Allaitement</span>
                </label>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Informations sur l'Incident ou le Risque d'Incident</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description de l'incident ou du risque d'incident*</label>
              <textarea
                value={formData.incident.description}
                onChange={(e) => setFormData({ ...formData, incident: { ...formData.incident, description: e.target.value } })}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez en détail l'incident ou le risque d'incident..."
                required
              />
              {validationErrors.incidentDescription && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.incidentDescription}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre de DM concernés</label>
                <input
                  type="text"
                  value={formData.incident.nombreDM}
                  onChange={(e) => setFormData({ ...formData, incident: { ...formData.incident, nombreDM: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 1, 2, plusieurs..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date de survenue*</label>
                <input
                  type="date"
                  value={formData.incident.dateSurvenue}
                  onChange={(e) => setFormData({ ...formData, incident: { ...formData.incident, dateSurvenue: e.target.value } })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {validationErrors.dateSurvenue && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.dateSurvenue}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Conséquences cliniques et état actuel du patient ou personne impliquée</label>
              <textarea
                value={formData.incident.consequencesCliniques}
                onChange={(e) => setFormData({ ...formData, incident: { ...formData.incident, consequencesCliniques: e.target.value } })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez les conséquences cliniques observées..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Structure de survenue*</label>
              <input
                type="text"
                value={formData.incident.structureSurvenue}
                onChange={(e) => setFormData({ ...formData, incident: { ...formData.incident, structureSurvenue: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Hôpital, clinique, cabinet..."
                required
              />
              {validationErrors.structureSurvenue && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.structureSurvenue}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Adresse de survenue</label>
              <textarea
                value={formData.incident.adresseSurvenue}
                onChange={(e) => setFormData({ ...formData, incident: { ...formData.incident, adresseSurvenue: e.target.value } })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Adresse complète du lieu de survenue..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Informations sur le Dispositif Médical Impliqué</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom Commercial*</label>
                <input
                  type="text"
                  value={formData.dispositifSuspecte.nomCommercial}
                  onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, nomCommercial: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {validationErrors.nomCommercial && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.nomCommercial}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Marque</label>
                <input
                  type="text"
                  value={formData.dispositifSuspecte.marque}
                  onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, marque: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Désignation</label>
                <input
                  type="text"
                  value={formData.dispositifSuspecte.designation}
                  onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, designation: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Référence</label>
                <input
                  type="text"
                  value={formData.dispositifSuspecte.reference}
                  onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, reference: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Modèle</label>
                <input
                  type="text"
                  value={formData.dispositifSuspecte.modele}
                  onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, modele: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Numéro de Série</label>
                <input
                  type="text"
                  value={formData.dispositifSuspecte.numeroSerie}
                  onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, numeroSerie: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Numéro de Lot</label>
                <input
                  type="text"
                  value={formData.dispositifSuspecte.numeroLot}
                  onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, numeroLot: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Unique Device Identifier (UDI), Si disponible</label>
                <input
                  type="text"
                  value={formData.dispositifSuspecte.udi}
                  onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, udi: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Version (Si Logiciel)</label>
                <input
                  type="text"
                  value={formData.dispositifSuspecte.versionLogiciel}
                  onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, versionLogiciel: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nom du fabricant*</label>
              <input
                type="text"
                value={formData.dispositifSuspecte.nomFabricant}
                onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, nomFabricant: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {validationErrors.nomFabricant && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.nomFabricant}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Adresse du fabricant</label>
              <textarea
                value={formData.dispositifSuspecte.adresseFabricant}
                onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, adresseFabricant: e.target.value } })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Localisation actuelle du DM</label>
              <input
                type="text"
                value={formData.dispositifSuspecte.localisationActuelle}
                onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, localisationActuelle: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: À l'hôpital, chez le patient..."
              />
            </div>

            <div className="border-t border-slate-200 pt-4 mt-6">
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={formData.dispositifSuspecte.estImplantable}
                  onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, estImplantable: e.target.checked } })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-slate-700">DM implantable</span>
              </label>

              {formData.dispositifSuspecte.estImplantable && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date d'implantation</label>
                    <input
                      type="date"
                      value={formData.dispositifSuspecte.dateImplantation || ''}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, dateImplantation: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date d'explantation</label>
                    <input
                      type="date"
                      value={formData.dispositifSuspecte.dateExplantation || ''}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, dispositifSuspecte: { ...formData.dispositifSuspecte, dateExplantation: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
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
                placeholder="Ajoutez ici toute information complémentaire qui pourrait être utile pour l'analyse de cette déclaration..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <span className="font-medium text-blue-600">Cliquez pour sélectionner</span> ou glissez-déposez
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
                              <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Récapitulatif de la Déclaration</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Déclarant:</strong> {formData.declarant.prenom} {formData.declarant.nom}</p>
                <p><strong>Personne exposée:</strong> {formData.personneExposee.nomPrenom}</p>
                <p><strong>Dispositif médical:</strong> {formData.dispositifSuspecte.nomCommercial || 'Non renseigné'}</p>
                <p><strong>Date survenue:</strong> {formData.incident.dateSurvenue || 'Non renseigné'}</p>
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
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-md text-sm"
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
