import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ArrowLeft, AlertCircle, User, Heart, Package, FileText, Calendar, Download, Image as ImageIcon, File } from 'lucide-react';

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

interface DeclarationDetail {
  id: string;
  created_at: string;
  statut: DeclarationStatus;
  commentaire: string;
  commentaire_anmps: string;
  declarant: {
    nom?: string;
    prenom?: string;
    email?: string;
    tel?: string;
  };
  personne_exposee: {
    nom?: string;
    prenom?: string;
    age?: number;
    sexe?: string;
    type?: string;
    email?: string;
    tel?: string;
    grossesse?: boolean;
    mois_grossesse?: number;
    allaitement?: boolean;
  };
  effet_indesirable?: {
    localisation?: string;
    date_apparition?: string;
    date_fin?: string;
    gravite?: boolean;
    criteres_gravite?: string;
    evolution_effet?: string;
  };
  produit_suspecte?: {
    nom_commercial?: string;
    marque?: string;
    fabricant?: string;
    type_produit?: string;
    numero_lot?: string;
    frequence_utilisation?: string;
    date_debut_utilisation?: string;
    arret_utilisation?: string;
    reexposition_produit?: boolean;
    reapparition_effet_indesirable?: boolean;
  };
  prise_charge_medicale?: {
    diagnostic?: string;
    mesures_prise?: string;
    examens_realise?: string;
  };
  allergies: string[];
  antecedents: string[];
  medicaments: string[];
  attachments: {
    id: string;
    file: string;
    file_name: string;
    file_type: string;
    attachment_category: string;
    created_at: string;
  }[];
  utilisateur_type: string;
  professionnel_sante?: {
    profession: string;
    structure: string;
    ville: string;
  };
  representant_legal?: {
    nom_etablissement: string;
    numero_declaration_etablissement: string;
    numero_document_enregistrement_produit: string;
    date_reception_notification: string;
  };
}

export default function DeclarationDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [declaration, setDeclaration] = useState<DeclarationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [commentaireAnmps, setCommentaireAnmps] = useState('');
  const [commentaireSaving, setCommentaireSaving] = useState(false);

  const getFileType = (filename: string): 'image' | 'pdf' | 'other' => {
    const ext = filename.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    return 'other';
  };

  const getFileName = (filePath: string): string => {
    return filePath.split('/').pop() || filePath;
  };

  useEffect(() => {
    if (!id) return;

    const fetchDeclaration = async () => {
      try {
        setLoading(true);
        const apiData: any = await api.getDeclarationById(id);

        const declarationMapped: DeclarationDetail = {
          id: apiData.id,
          created_at: apiData.createdAt ?? new Date().toISOString(),
          statut: (apiData.statut ?? 'nouveau') as DeclarationStatus,
          commentaire: apiData.commentaire ?? '',
          commentaire_anmps: apiData.commentaireAnmps ?? '',
          declarant: {
            nom: apiData.declarant?.nom,
            prenom: apiData.declarant?.prenom,
            email: apiData.declarant?.email,
            tel: apiData.declarant?.tel,
          },
          personne_exposee: {
            nomPrenom: apiData.personneExposee?.nomPrenom,
            age: apiData.personneExposee?.age,
            sexe: apiData.personneExposee?.sexe,
            type: apiData.personneExposee?.type,
            ville: apiData.personneExposee?.ville,
            grossesse: apiData.personneExposee?.grossesse,
            mois_grossesse: apiData.personneExposee?.moisGrossesse,
            allaitement: apiData.personneExposee?.allaitement,
          },
          effet_indesirable: apiData.effetsIndesirables && apiData.effetsIndesirables.length > 0
            ? {
                localisation: apiData.effetsIndesirables[0].localisation,
                date_apparition: apiData.effetsIndesirables[0].dateApparition,
                date_fin: apiData.effetsIndesirables[0].dateFin,
                gravite: apiData.effetsIndesirables[0].gravite,
                criteres_gravite: apiData.effetsIndesirables[0].criteresGravite,
                evolution_effet: apiData.effetsIndesirables[0].evolutionEffet,
              }
            : undefined,
          produit_suspecte: apiData.produitsSuspectes && apiData.produitsSuspectes.length > 0
            ? {
                nom_commercial: apiData.produitsSuspectes[0].nomCommercial,
                marque: apiData.produitsSuspectes[0].marque,
                fabricant: apiData.produitsSuspectes[0].fabricant,
                type_produit: apiData.produitsSuspectes[0].typeProduit,
                numero_lot: apiData.produitsSuspectes[0].numeroLot,
                frequence_utilisation: apiData.produitsSuspectes[0].frequenceUtilisation,
                date_debut_utilisation: apiData.produitsSuspectes[0].dateDebutUtilisation,
                arret_utilisation: apiData.produitsSuspectes[0].arretUtilisation,
                reexposition_produit: apiData.produitsSuspectes[0].reexpositionProduit,
                reapparition_effet_indesirable: apiData.produitsSuspectes[0].reapparitionEffetIndesirable,
              }
            : undefined,
          prise_charge_medicale: apiData.prisesChargeMedicales && apiData.prisesChargeMedicales.length > 0
            ? {
                diagnostic: apiData.prisesChargeMedicales[0].diagnostic,
                mesures_prise: apiData.prisesChargeMedicales[0].mesuresPrise,
                examens_realise: apiData.prisesChargeMedicales[0].examensRealise,
              }
            : undefined,
          allergies: apiData.personneExposee?.allergies ?? [],
          antecedents: apiData.personneExposee?.antecedents ?? [],
          medicaments: apiData.personneExposee?.medicaments ?? [],
          // Attachments and utilisateur_type are not yet provided by backend in DeclarationResponse
          attachments: [],
          utilisateur_type: apiData.utilisateurType ?? 'particulier',
          professionnel_sante: apiData.professionnelSante
            ? {
                profession: apiData.professionnelSante.profession,
                structure: apiData.professionnelSante.structure,
                ville: apiData.professionnelSante.ville,
              }
            : undefined,
          representant_legal: apiData.representantLegal
            ? {
                nom_etablissement: apiData.representantLegal.nomEtablissement,
                numero_declaration_etablissement: apiData.representantLegal.numeroDeclarationEtablissement,
                numero_document_enregistrement_produit: apiData.representantLegal.numeroDocumentEnregistrementProduit,
                date_reception_notification: apiData.representantLegal.dateReceptionNotification,
              }
            : undefined,
        };

        setDeclaration(declarationMapped);
        setCommentaireAnmps(declarationMapped.commentaire_anmps);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement de la déclaration');
      } finally {
        setLoading(false);
      }
    };

    fetchDeclaration();
  }, [id, user]);

  const onChangeStatut = async (newStatus: DeclarationStatus) => {
    if (!declaration || statusSaving) return;
    const previous = declaration.statut;
    setDeclaration({ ...declaration, statut: newStatus });
    try {
      setStatusSaving(true);
      const updated: any = await api.updateDeclarationStatus(declaration.id, newStatus);
      const serverStatus = (updated?.statut ?? newStatus) as DeclarationStatus;
      setDeclaration((curr) => (curr ? { ...curr, statut: serverStatus } : curr));
    } catch (e: any) {
      setDeclaration((curr) => (curr ? { ...curr, statut: previous } : curr));
      setError(e?.message || 'Erreur lors de la mise à jour du statut');
    } finally {
      setStatusSaving(false);
    }
  };

  const onSaveCommentaireAnmps = async () => {
    if (!declaration || commentaireSaving) return;
    const previous = declaration.commentaire_anmps;
    try {
      setCommentaireSaving(true);
      const updated: any = await api.updateCommentaireAnmps(declaration.id, commentaireAnmps);
      setDeclaration((curr) => (curr ? { ...curr, commentaire_anmps: updated?.commentaireAnmps ?? commentaireAnmps } : curr));
      alert('Commentaire ANMPS sauvegardé et email envoyé au déclarant!');
    } catch (e: any) {
      setCommentaireAnmps(previous);
      alert('Erreur lors de la sauvegarde du commentaire: ' + (e?.message || 'Erreur inconnue'));
    } finally {
      setCommentaireSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !declaration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{error || 'Déclaration non trouvée'}</h1>
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Déclaration #{declaration.id.slice(0, 8)}
                </h1>
                <div className="flex items-center text-emerald-100">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(declaration.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-white/90 ${STATUS_BADGE[declaration.statut]}`}
                >
                  {STATUS_LABEL[declaration.statut]}
                </span>
                <select
                  value={declaration.statut}
                  disabled={statusSaving}
                  onChange={(e) => onChangeStatut(e.target.value as DeclarationStatus)}
                  className="rounded-lg border border-white/40 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60 disabled:opacity-60"
                  aria-label="Modifier le statut"
                >
                  {(Object.keys(STATUS_LABEL) as DeclarationStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <section>
              <div className="flex items-center mb-4">
                <User className="w-6 h-6 text-emerald-600 mr-2" />
                <h2 className="text-2xl font-bold text-slate-900">Déclarant</h2>
              </div>
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Nom complet</p>
                    <p className="text-slate-900">{declaration.declarant.prenom} {declaration.declarant.nom}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Type</p>
                    <p className="text-slate-900 capitalize">
                      {declaration.utilisateur_type === 'professionnel' ? 'Professionnel de santé' :
                       declaration.utilisateur_type === 'professionnel_sante' ? 'Professionnel de santé' :
                       declaration.utilisateur_type === 'representant_legal' ? 'Représentant légal' :
                       declaration.utilisateur_type === 'particulier' ? 'Particulier' :
                       declaration.utilisateur_type || 'Non renseigné'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Email</p>
                    <p className="text-slate-900">{declaration.declarant.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Téléphone</p>
                    <p className="text-slate-900">{declaration.declarant.tel}</p>
                  </div>
                </div>

                {((declaration.utilisateur_type === 'professionnel' || declaration.utilisateur_type === 'professionnel_sante') && declaration.professionnel_sante) && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations Professionnel de Santé</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {declaration.professionnel_sante.profession && (
                        <div>
                          <p className="text-sm font-medium text-slate-500">Profession</p>
                          <p className="text-slate-900">{declaration.professionnel_sante.profession}</p>
                        </div>
                      )}
                      {declaration.professionnel_sante.structure && (
                        <div>
                          <p className="text-sm font-medium text-slate-500">Structure</p>
                          <p className="text-slate-900">{declaration.professionnel_sante.structure}</p>
                        </div>
                      )}
                      {declaration.professionnel_sante.ville && (
                        <div>
                          <p className="text-sm font-medium text-slate-500">Ville</p>
                          <p className="text-slate-900">{declaration.professionnel_sante.ville}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {declaration.utilisateur_type === 'representant_legal' && declaration.representant_legal && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations Représentant Légal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {declaration.representant_legal.nom_etablissement && (
                        <div>
                          <p className="text-sm font-medium text-slate-500">Établissement</p>
                          <p className="text-slate-900">{declaration.representant_legal.nom_etablissement}</p>
                        </div>
                      )}
                      {declaration.representant_legal.numero_declaration_etablissement && (
                        <div>
                          <p className="text-sm font-medium text-slate-500">N° déclaration établissement</p>
                          <p className="text-slate-900">{declaration.representant_legal.numero_declaration_etablissement}</p>
                        </div>
                      )}
                      {declaration.representant_legal.numero_document_enregistrement_produit && (
                        <div>
                          <p className="text-sm font-medium text-slate-500">N° document enregistrement produit</p>
                          <p className="text-slate-900">{declaration.representant_legal.numero_document_enregistrement_produit}</p>
                        </div>
                      )}
                      {declaration.representant_legal.date_reception_notification && (
                        <div>
                          <p className="text-sm font-medium text-slate-500">Date réception notification</p>
                          <p className="text-slate-900">
                            {new Date(declaration.representant_legal.date_reception_notification).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </div>

                    {declaration.attachments.some(a => a.attachment_category === 'document_enregistrement') && (
                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <h4 className="text-md font-semibold text-slate-900 mb-4">Document d'Enregistrement</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {declaration.attachments
                            .filter(a => a.attachment_category === 'document_enregistrement')
                            .map((attachment) => {
                              const fileName = attachment.file_name || getFileName(attachment.file);

                              return (
                                <div
                                  key={attachment.id}
                                  className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                                >
                                  <div className="p-6 flex items-center justify-center bg-slate-100">
                                    <File className="w-16 h-16 text-red-500" />
                                  </div>
                                  <div className="p-4">
                                    <p className="text-sm font-medium text-slate-900 truncate mb-1">
                                      {fileName}
                                    </p>
                                    <p className="text-xs text-slate-500 mb-3">
                                      {new Date(attachment.created_at).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </p>
                                    <div className="flex gap-2">
                                      <a
                                        href={attachment.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                      >
                                        <ImageIcon className="w-4 h-4" />
                                        Ouvrir
                                      </a>
                                      <span className="text-slate-300">•</span>
                                      <a
                                        href={attachment.file}
                                        download
                                        className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                      >
                                        <Download className="w-4 h-4" />
                                        Télécharger
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <User className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-slate-900">Personne Exposée</h2>
              </div>
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Nom / Prénom</p>
                    <p className="text-slate-900">{declaration.personne_exposee.nomPrenom}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Type</p>
                    <p className="text-slate-900 capitalize">{declaration.personne_exposee.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Âge</p>
                    <p className="text-slate-900">{declaration.personne_exposee.age} ans</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Sexe</p>
                    <p className="text-slate-900">
                      {declaration.personne_exposee.sexe === 'F' ? 'Féminin' : 'Masculin'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Ville</p>
                    <p className="text-slate-900">{declaration.personne_exposee.ville}</p>
                  </div>
                  {declaration.personne_exposee.grossesse && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Grossesse</p>
                      <p className="text-slate-900">
                        Oui{declaration.personne_exposee.mois_grossesse ? ` (${declaration.personne_exposee.mois_grossesse} mois)` : ''}
                      </p>
                    </div>
                  )}
                  {declaration.personne_exposee.allaitement && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Allaitement</p>
                      <p className="text-slate-900">Oui</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-rose-600 mr-2" />
                <h2 className="text-2xl font-bold text-slate-900">Antécédents Médicaux</h2>
              </div>
              <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Allergies Connues</p>
                  {declaration.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {declaration.allergies.map((allergie, index) => (
                        <span key={index} className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                          {allergie}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Aucune allergie déclarée</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Antécédents Médicaux</p>
                  {declaration.antecedents.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {declaration.antecedents.map((antecedent, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {antecedent}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Aucun antécédent déclaré</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Médicaments/Produits Simultanés</p>
                  {declaration.medicaments.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {declaration.medicaments.map((medicament, index) => (
                        <span key={index} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                          {medicament}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Aucun médicament/produit déclaré</p>
                  )}
                </div>
              </div>
            </section>

            {declaration.effet_indesirable && (
              <section>
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                  <h2 className="text-2xl font-bold text-slate-900">Effet Indésirable</h2>
                </div>
                <div className="bg-slate-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Localisation</p>
                      <p className="text-slate-900">{declaration.effet_indesirable.localisation}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Gravité</p>
                      <p className="text-slate-900">
                        {declaration.effet_indesirable.gravite ? (
                          <span className="text-red-600 font-semibold">Grave</span>
                        ) : (
                          <span className="text-green-600">Non grave</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Date d'apparition</p>
                      <p className="text-slate-900">
                        {new Date(declaration.effet_indesirable.date_apparition).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {declaration.effet_indesirable.date_fin && (
                      <div>
                        <p className="text-sm font-medium text-slate-500">Date de fin</p>
                        <p className="text-slate-900">
                          {new Date(declaration.effet_indesirable.date_fin).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-500">Évolution</p>
                      <p className="text-slate-900 capitalize">{declaration.effet_indesirable.evolution_effet}</p>
                    </div>
                    {declaration.effet_indesirable.gravite && declaration.effet_indesirable.criteres_gravite && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-slate-500">Critères de gravité</p>
                        <p className="text-slate-900">{declaration.effet_indesirable.criteres_gravite}</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {declaration.prise_charge_medicale && (
              <section>
                <div className="flex items-center mb-4">
                  <Heart className="w-6 h-6 text-teal-600 mr-2" />
                  <h2 className="text-2xl font-bold text-slate-900">Prise en Charge Médicale</h2>
                </div>
                <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Diagnostic</p>
                    <p className="text-slate-900">{declaration.prise_charge_medicale.diagnostic}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Mesures prises</p>
                    <p className="text-slate-900">{declaration.prise_charge_medicale.mesures_prise}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Examens réalisés</p>
                    <p className="text-slate-900">{declaration.prise_charge_medicale.examens_realise}</p>
                  </div>
                </div>
              </section>
            )}

            {declaration.produit_suspecte && (
              <section>
                <div className="flex items-center mb-4">
                  <Package className="w-6 h-6 text-amber-600 mr-2" />
                  <h2 className="text-2xl font-bold text-slate-900">Produit Suspecté</h2>
                </div>
                <div className="bg-slate-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Nom commercial</p>
                      <p className="text-slate-900">{declaration.produit_suspecte.nom_commercial}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Marque</p>
                      <p className="text-slate-900">{declaration.produit_suspecte.marque}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Fabricant</p>
                      <p className="text-slate-900">{declaration.produit_suspecte.fabricant}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Type de produit</p>
                      <p className="text-slate-900">{declaration.produit_suspecte.type_produit}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Numéro de lot</p>
                      <p className="text-slate-900">{declaration.produit_suspecte.numero_lot}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Fréquence d'utilisation</p>
                      <p className="text-slate-900">{declaration.produit_suspecte.frequence_utilisation}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Date de début d'utilisation</p>
                      <p className="text-slate-900">
                        {new Date(declaration.produit_suspecte.date_debut_utilisation).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {declaration.produit_suspecte.arret_utilisation && (
                      <div>
                        <p className="text-sm font-medium text-slate-500">Date d'arrêt d'utilisation</p>
                        <p className="text-slate-900">
                          {new Date(declaration.produit_suspecte.arret_utilisation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                    <div className="md:col-span-2 flex gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Réexposition au produit</p>
                        <p className="text-slate-900">
                          {declaration.produit_suspecte.reexposition_produit ? 'Oui' : 'Non'}
                        </p>
                      </div>
                      {declaration.produit_suspecte.reexposition_produit && (
                        <div>
                          <p className="text-sm font-medium text-slate-500">Réapparition de l'effet indésirable</p>
                          <p className="text-slate-900">
                            {declaration.produit_suspecte.reapparition_effet_indesirable ? 'Oui' : 'Non'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-slate-600 mr-2" />
                <h2 className="text-2xl font-bold text-slate-900">Commentaires et Pièces Jointes</h2>
              </div>
                <div className="bg-slate-50 rounded-lg p-6 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-500">Commentaire ANMPS</p>
                      <button
                        onClick={onSaveCommentaireAnmps}
                        disabled={commentaireSaving}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {commentaireSaving ? 'Envoi en cours...' : 'Sauvegarder et envoyer email'}
                      </button>
                    </div>
                    <textarea
                      value={commentaireAnmps}
                      onChange={(e) => setCommentaireAnmps(e.target.value)}
                      rows={4}
                      placeholder="Ajoutez un commentaire ANMPS qui sera envoyé au déclarant par email..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      En sauvegardant, un email sera automatiquement envoyé au déclarant avec ce commentaire et le statut actuel de la déclaration.
                    </p>
                  </div>

                  {declaration.commentaire && (
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-2">Commentaires du déclarant</p>
                      <p className="text-slate-900 whitespace-pre-wrap">{declaration.commentaire}</p>
                    </div>
                  )}

                  {declaration.attachments.filter(a => a.attachment_category !== 'document_enregistrement').length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-3">
                        Pièces Jointes ({declaration.attachments.filter(a => a.attachment_category !== 'document_enregistrement').length})
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {declaration.attachments
                          .filter(a => a.attachment_category !== 'document_enregistrement')
                          .map((attachment) => {
                            const fileType = getFileType(attachment.file_name || attachment.file);
                            const fileName = attachment.file_name || getFileName(attachment.file);

                            return (
                              <div
                                key={attachment.id}
                                className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                              >
                                {fileType === 'image' ? (
                                  <div className="group relative">
                                    <img
                                      src={attachment.file}
                                      alt={fileName}
                                      className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                      <a
                                        href={attachment.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="opacity-0 group-hover:opacity-100 bg-white text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 transition-opacity"
                                      >
                                        <ImageIcon className="w-4 h-4" />
                                        Ouvrir
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-6 flex items-center justify-center bg-slate-100">
                                    {fileType === 'pdf' ? (
                                      <File className="w-16 h-16 text-red-500" />
                                    ) : (
                                      <File className="w-16 h-16 text-slate-400" />
                                    )}
                                  </div>
                                )}
                                <div className="p-4">
                                  <p className="text-sm font-medium text-slate-900 truncate mb-1">
                                    {fileName}
                                  </p>
                                  <p className="text-xs text-slate-500 mb-3">
                                    {new Date(attachment.created_at).toLocaleDateString('fr-FR', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  <a
                                    href={attachment.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                  >
                                    <Download className="w-4 h-4" />
                                    Télécharger
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </section>
          </div>
        </div>
      </div>
    </div>
  );
}
