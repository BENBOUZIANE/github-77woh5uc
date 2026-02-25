import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, Plus, X, Upload, Image as ImageIcon, File } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
    nom: string;
    prenom: string;
    age: number;
    grossesse: boolean;
    moisGrossesse?: number;
    allaitement: boolean;
    email: string;
    tel: string;
    sexe: string;
  };
  allergiesConnues: string[];
  antecedentsMedicaux: string[];
  medicamentsSimultanes: string[];
  effetIndesirable: {
    localisation: string;
    dateApparition: string;
    dateFin: string;
    gravite: boolean;
    criteresGravite: string[];
    evolutionEffet: string;
    priseChargeMedicale: boolean;
  };
  priseChargeMedicale: {
    diagnostic: string;
    mesuresPrise: string;
    examensRealise: string;
  };
  produitSuspecte: {
    nomCommercial: string;
    marque: string;
    fabricant: string;
    typeProduit: string;
    numeroLot: string;
    frequenceUtilisation: string;
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
    personneExposee: { type: 'patient', nom: '', prenom: '', age: 0, grossesse: false, allaitement: false, email: '', tel: '', sexe: 'F' },
    allergiesConnues: [],
    antecedentsMedicaux: [],
    medicamentsSimultanes: [],
    effetIndesirable: { localisation: '', dateApparition: '', dateFin: '', gravite: false, criteresGravite: [], evolutionEffet: '', priseChargeMedicale: false },
    priseChargeMedicale: { diagnostic: '', mesuresPrise: '', examensRealise: '' },
    produitSuspecte: { nomCommercial: '', marque: '', fabricant: '', typeProduit: '', numeroLot: '', frequenceUtilisation: '', dateDebutUtilisation: '', arretUtilisation: '', reexpositionProduit: false, reapparitionEffetIndesirable: false },
    commentaire: ''
  });

  const [newAllergie, setNewAllergie] = useState('');
  const [newAntecedent, setNewAntecedent] = useState('');
  const [newMedicament, setNewMedicament] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentEnregistrement, setDocumentEnregistrement] = useState<File | null>(null);

  const getSections = () => {
    const baseSections = [{ title: 'Déclarant', icon: '👤' }];

    if (formData.utilisateurType === 'professionnel') {
      baseSections.push({ title: 'Professionnel de Santé', icon: '⚕️' });
    } else if (formData.utilisateurType === 'representant_legal') {
      baseSections.push({ title: 'Représentant Légal', icon: '🏢' });
    }

    baseSections.push(
      { title: 'Personne Exposée', icon: '🧑' },
      { title: 'Antécédents Médicaux', icon: '📋' },
      { title: 'Effet Indésirable', icon: '⚠️' }
    );

    if (formData.effetIndesirable.priseChargeMedicale) {
      baseSections.push({ title: 'Prise en Charge', icon: '🏥' });
    }

    baseSections.push(
      { title: 'Produit Suspecté', icon: '🧴' },
      { title: 'Commentaires', icon: '💬' }
    );

    return baseSections;
  };

  const sections = getSections();

  const getSectionCaseNumber = (sectionIndex: number): number => {
    let caseNumber = 0;
    let adjustedIndex = sectionIndex;

    // Compte les sections conditionnelles avant l'index actuel
    const sectionTitles = sections.map(s => s.title);

    // Case 0: Déclarant (toujours présent)
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

    // Case 5: Prise en Charge (conditionnel)
    if (formData.effetIndesirable.priseChargeMedicale) {
      if (adjustedIndex === 0) return 5;
      caseNumber = 6;
      adjustedIndex--;
    } else {
      caseNumber = 6;
    }

    // Case 6: Produit Suspecté (toujours présent)
    if (adjustedIndex === 0) return 6;
    caseNumber = 7;
    adjustedIndex--;

    // Case 7: Commentaires (toujours présent)
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
    setIsSubmitting(true);
    try {
      const declarationPayload = {
        utilisateurType: formData.utilisateurType === 'autre' && formData.utilisateurTypeAutre
          ? formData.utilisateurTypeAutre
          : formData.utilisateurType,
        declarant: formData.declarant,
        professionnelSante: formData.professionnelSante,
        representantLegal: formData.representantLegal,
        personneExposee: {
          ...formData.personneExposee,
          allergies: formData.allergiesConnues,
          antecedents: formData.antecedentsMedicaux,
          medicaments: formData.medicamentsSimultanes,
        },
        effetsIndesirables: formData.effetIndesirable
          ? [{
              localisation: formData.effetIndesirable.localisation,
              dateApparition: formData.effetIndesirable.dateApparition,
              dateFin: formData.effetIndesirable.dateFin || null,
              gravite: formData.effetIndesirable.gravite,
              criteresGravite: formData.effetIndesirable.criteresGravite.join(', '),
              evolutionEffet: formData.effetIndesirable.evolutionEffet,
            }]
          : [],
        produitsSuspectes: formData.produitSuspecte
          ? [{
              nomCommercial: formData.produitSuspecte.nomCommercial,
              marque: formData.produitSuspecte.marque,
              fabricant: formData.produitSuspecte.fabricant,
              typeProduit: formData.produitSuspecte.typeProduit,
              numeroLot: formData.produitSuspecte.numeroLot,
              frequenceUtilisation: formData.produitSuspecte.frequenceUtilisation,
              dateDebutUtilisation: formData.produitSuspecte.dateDebutUtilisation,
              arretUtilisation: formData.produitSuspecte.arretUtilisation || null,
              reexpositionProduit: formData.produitSuspecte.reexpositionProduit,
              reapparitionEffetIndesirable: formData.produitSuspecte.reapparitionEffetIndesirable,
            }]
          : [],
        prisesChargeMedicales: formData.effetIndesirable.priseChargeMedicale
          ? [{
              diagnostic: formData.priseChargeMedicale.diagnostic,
              mesuresPrise: formData.priseChargeMedicale.mesuresPrise,
              examensRealise: formData.priseChargeMedicale.examensRealise,
            }]
          : [],
        commentaire: formData.commentaire,
      };

      const declaration = await api.createDeclaration(declarationPayload);

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
      console.error('Error submitting form:', error);
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Informations du Déclarant</h2>

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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez une profession</option>
                    <option value="Médecin">Médecin</option>
                    <option value="Pharmacien">Pharmacien</option>
                    <option value="Infirmier">Infirmier</option>
                    <option value="Autre">Autre</option>
                  </select>
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
                  <input
                    type="text"
                    value={formData.professionnelSante?.ville || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      professionnelSante: { ...formData.professionnelSante!, ville: e.target.value, profession: formData.professionnelSante?.profession || '', structure: formData.professionnelSante?.structure || '' }
                    })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
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
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document d'Enregistrement (PDF)
                </label>
                <div className="space-y-4">
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-white hover:bg-slate-50 transition-colors">
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
                  <option value="A">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom*</label>
                <input
                  type="text"
                  value={formData.personneExposee.nom}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, nom: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prénom*</label>
                <input
                  type="text"
                  value={formData.personneExposee.prenom}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, prenom: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Âge*</label>
                <input
                  type="number"
                  value={formData.personneExposee.age}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, age: parseInt(e.target.value) || 0 } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.personneExposee.email}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, email: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.personneExposee.tel}
                  onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, tel: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {formData.personneExposee.sexe === 'F' && (
              <div className="space-y-3">
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
                      <input
                        type="number"
                        placeholder="Mois de grossesse"
                        value={formData.personneExposee.moisGrossesse || ''}
                        onChange={(e) => setFormData({ ...formData, personneExposee: { ...formData.personneExposee, moisGrossesse: parseInt(e.target.value) || undefined } })}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Antécédents Médicaux</h2>

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
        );

      case 4:
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date d'Apparition*</label>
                <input
                  type="date"
                  value={formData.effetIndesirable.dateApparition}
                  onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, dateApparition: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date de Fin</label>
                <input
                  type="date"
                  value={formData.effetIndesirable.dateFin}
                  onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, dateFin: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
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
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Évolution de l'Effet*</label>
              <select
                value={formData.effetIndesirable.evolutionEffet}
                onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, evolutionEffet: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Sélectionner</option>
                <option value="guerison">Guérison</option>
                <option value="amelioration_en_cours">Amélioration en cours</option>
                <option value="sequelles">Séquelles</option>
                <option value="persistance">Persistance de l'effet</option>
                <option value="inconnue">Inconnue</option>
              </select>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.effetIndesirable.priseChargeMedicale}
                  onChange={(e) => setFormData({ ...formData, effetIndesirable: { ...formData.effetIndesirable, priseChargeMedicale: e.target.checked } })}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm font-medium text-slate-700">Prise en charge médicale</span>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Prise en Charge Médicale</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Diagnostic*</label>
              <textarea
                value={formData.priseChargeMedicale.diagnostic}
                onChange={(e) => setFormData({ ...formData, priseChargeMedicale: { ...formData.priseChargeMedicale, diagnostic: e.target.value } })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mesures Prises</label>
              <textarea
                value={formData.priseChargeMedicale.mesuresPrise}
                onChange={(e) => setFormData({ ...formData, priseChargeMedicale: { ...formData.priseChargeMedicale, mesuresPrise: e.target.value } })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Examens Réalisés</label>
              <textarea
                value={formData.priseChargeMedicale.examensRealise}
                onChange={(e) => setFormData({ ...formData, priseChargeMedicale: { ...formData.priseChargeMedicale, examensRealise: e.target.value } })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Produit Suspecté</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom Commercial*</label>
                <input
                  type="text"
                  value={formData.produitSuspecte.nomCommercial}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, nomCommercial: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Marque*</label>
                <input
                  type="text"
                  value={formData.produitSuspecte.marque}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, marque: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
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
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Numéro de Lot*</label>
                <input
                  type="text"
                  value={formData.produitSuspecte.numeroLot}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, numeroLot: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fréquence d'Utilisation*</label>
                <input
                  type="text"
                  value={formData.produitSuspecte.frequenceUtilisation}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, frequenceUtilisation: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date de Début d'Utilisation*</label>
                <input
                  type="date"
                  value={formData.produitSuspecte.dateDebutUtilisation}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, dateDebutUtilisation: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Arrêt d'Utilisation</label>
                <input
                  type="date"
                  value={formData.produitSuspecte.arretUtilisation}
                  onChange={(e) => setFormData({ ...formData, produitSuspecte: { ...formData.produitSuspecte, arretUtilisation: e.target.value } })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
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

      case 7:
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
                <p><strong>Personne exposée:</strong> {formData.personneExposee.prenom} {formData.personneExposee.nom}</p>
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
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>

            {currentSection < sections.length - 1 ? (
              <button
                onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
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
