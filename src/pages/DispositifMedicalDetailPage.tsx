import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiDM } from '../services/apiDM';
import {
  ArrowLeft, AlertCircle, User, Package, FileText,
  Calendar, LayoutDashboard, LogIn, LogOut,
  Stethoscope, Building2, ShieldAlert, HeartPulse
} from 'lucide-react';

// ─── Status helpers ────────────────────────────────────────────────────────────

type DmStatus = 'nouveau' | 'en_cours' | 'traite' | 'rejete' | 'cloture';

const STATUS_LABEL: Record<string, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  traite: 'Traité',
  rejete: 'Rejeté',
  cloture: 'Clôturé',
};

const STATUS_BADGE: Record<string, string> = {
  nouveau: 'bg-blue-100 text-blue-700 border-blue-200',
  en_cours: 'bg-amber-100 text-amber-800 border-amber-200',
  traite: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejete: 'bg-red-100 text-red-700 border-red-200',
  cloture: 'bg-slate-100 text-slate-700 border-slate-200',
};

const normalizeStatut = (s: string): DmStatus => {
  const map: Record<string, DmStatus> = {
    EN_ATTENTE: 'nouveau',
    EN_COURS: 'en_cours',
    TRAITEE: 'traite',
    REJETEE: 'rejete',
    CLOTUREE: 'cloture',
  };
  return (map[s] ?? s?.toLowerCase() ?? 'nouveau') as DmStatus;
};

// ─── Reusable field component ──────────────────────────────────────────────────

const InfoField = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) => {
  const display =
    (value === null || value === undefined || value === '')
      ? '-'
      : typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : String(value);
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-slate-900">{display}</p>
    </div>
  );
};

// ─── Section wrapper ───────────────────────────────────────────────────────────

const Section = ({
  icon: Icon,
  iconColor,
  title,
  children,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section>
    <div className="flex items-center mb-4">
      <Icon className={`w-6 h-6 ${iconColor} mr-2`} />
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>
    <div className="bg-slate-50 rounded-lg p-6">{children}</div>
  </section>
);

// ─── Tag list (allergies / antécédents / médicaments) ────────────────────────

const TagList = ({
  label,
  items,
  color,
}: {
  label: string;
  items?: string[];
  color: string;
}) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-medium text-slate-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className={`px-3 py-1 rounded-full text-sm ${color}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

export default function DispositifMedicalDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, signOut } = useAuth();

  const [declaration, setDeclaration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [commentaireAnmps, setCommentaireAnmps] = useState('');
  const [commentaireSaving, setCommentaireSaving] = useState(false);

  // ── Load data ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await apiDM.getDeclarationById(Number(id));
        setDeclaration({ ...data, statut: normalizeStatut(data.statut) });
        setCommentaireAnmps(data.commentaireAnmps ?? '');
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const onChangeStatut = async (newStatus: DmStatus) => {
    if (!declaration || statusSaving) return;
    const previous = declaration.statut;
    setDeclaration({ ...declaration, statut: newStatus });
    try {
      setStatusSaving(true);
      await apiDM.updateStatut(Number(id), newStatus);
    } catch {
      setDeclaration({ ...declaration, statut: previous });
    } finally {
      setStatusSaving(false);
    }
  };

  const onSaveCommentaire = async () => {
    if (!declaration || commentaireSaving) return;
    const previous = declaration.commentaireAnmps;
    try {
      setCommentaireSaving(true);
      await apiDM.updateCommentaireAnmps(Number(id), commentaireAnmps);
      setDeclaration((curr: any) =>
        curr ? { ...curr, commentaireAnmps: commentaireAnmps } : curr
      );
      alert('Commentaire AMMPS sauvegardé');
    } catch (e: any) {
      setCommentaireAnmps(previous);
      alert('Erreur: ' + (e?.message || 'Erreur inconnue'));
    } finally {
      setCommentaireSaving(false);
    }
  };

  // ── Loading / Error states ───────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );

  if (error || !declaration)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {error || 'Déclaration non trouvée'}
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );

  // ── Shortcuts ────────────────────────────────────────────────────────────────
  const statut = declaration.statut as DmStatus;
  const dec = declaration.declarant;
  const ps = declaration.professionnelSante;
  const rl = declaration.representantLegal;
  const pe = declaration.personneExposee;

  // One DM & one incident (same as form which uses first element of arrays)
  const dm = declaration.dispositifsSuspectes?.[0];
  const incident = declaration.effetsIndesirables?.[0];
  const prise = declaration.priseChargeMedicale;

  const allergies: string[] = (declaration.allergies ?? []).map(
    (a: any) => [a.typeAllergie, a.description].filter(Boolean).join(' – ')
  );
  const antecedents: string[] = (declaration.antecedents ?? []).map(
    (a: any) => a.description ?? ''
  );
  const medicaments: string[] = (declaration.medicamentsSimultanes ?? []).map(
    (m: any) => [m.nom, m.posologie].filter(Boolean).join(' – ')
  );

  const qualiteDeclarant = dec?.qualiteDeclarant ?? '';
  const isProfessionnel =
    qualiteDeclarant === 'professionnel' ||
    qualiteDeclarant === 'Professionnel de santé';
  const isRepresentantLegal =
    qualiteDeclarant === 'representant_legal' ||
    qualiteDeclarant === 'Représentant légal de l\'établissement';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
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
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md text-sm"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Tableau de bord</span>
                </button>
                <button
                  onClick={() => { signOut?.(); navigate('/'); }}
                  className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium text-sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Connexion
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* ── Banner ── */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-8 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Déclaration #{String(declaration.id).slice(0, 8)}
                </h1>
                <div className="flex items-center text-blue-100">
                  <Calendar className="w-4 h-4 mr-2" />
                  {declaration.createdAt
                    ? new Date(declaration.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-white/90 ${STATUS_BADGE[statut]}`}
                >
                  {STATUS_LABEL[statut]}
                </span>
                <select
                  value={statut}
                  disabled={statusSaving}
                  onChange={(e) => onChangeStatut(e.target.value as DmStatus)}
                  className="rounded-lg border border-white/40 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60 disabled:opacity-60"
                >
                  {(Object.keys(STATUS_LABEL) as DmStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Sections ── */}
          <div className="p-8 space-y-8">

            {/* ══ SECTION 1 : Notificateur ══ */}
            <Section icon={User} iconColor="text-blue-600" title="Notificateur">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Nom" value={dec?.nom} />
                <InfoField label="Prénom" value={dec?.prenom} />
                <InfoField label="Email" value={dec?.email} />
                <InfoField label="Téléphone" value={dec?.telephone} />
                <InfoField
                  label="Type de notificateur"
                  value={
                    qualiteDeclarant === 'professionnel'
                      ? 'Professionnel de santé'
                      : qualiteDeclarant === 'representant_legal'
                      ? "Représentant légal de l'établissement"
                      : qualiteDeclarant === 'particulier'
                      ? 'Utilisateur'
                      : qualiteDeclarant || '—'
                  }
                />
              </div>

              {/* Sub-section : Professionnel de Santé */}
              {isProfessionnel && ps && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center mb-4">
                    <Stethoscope className="w-5 h-5 text-blue-500 mr-2" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Professionnel de Santé
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Spécialité / Profession" value={ps.specialite} />
                    <InfoField label="Établissement / Structure" value={ps.etablissement} />
                    <InfoField label="Ville" value={ps.ville} />
                    {ps.adresse && (
                      <div className="md:col-span-2">
                        <InfoField label="Adresse" value={ps.adresse} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-section : Responsable matériovigilance */}
              {isRepresentantLegal && rl && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center mb-4">
                    <Building2 className="w-5 h-5 text-cyan-600 mr-2" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Responsable de la matériovigilance
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Nom" value={rl.nom} />
                    <InfoField label="Prénom" value={rl.prenom} />
                    <InfoField label="Email" value={rl.email} />
                    <InfoField label="Téléphone" value={rl.telephone} />
                    <InfoField label="Qualité / Lien" value={rl.lienParente} />
                    {rl.adresse && (
                      <div className="md:col-span-2">
                        <InfoField label="Adresse" value={rl.adresse} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Section>

            {/* ══ SECTION 2 : Personne Exposée ══ */}
            <Section icon={User} iconColor="text-cyan-600" title="Personne Exposée">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Type" value={pe?.type} />
                <InfoField
                  label="Sexe"
                  value={
                    pe?.sexe === 'F'
                      ? 'Féminin'
                      : pe?.sexe === 'M'
                      ? 'Masculin'
                      : pe?.sexe
                  }
                />
                {(pe?.nom || pe?.prenom) && (
                  <InfoField
                    label="Nom / Prénom (ou initiales)"
                    value={`${pe?.nom ?? ''} ${pe?.prenom ?? ''}`.trim() || undefined}
                  />
                )}
                <InfoField label="Ville" value={pe?.ville} />
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Âge / Date de naissance
                  </p>
                  <p className="text-slate-900">
                    {pe?.age
                      ? `${pe.age} ${pe.ageUnite || 'ans'}`
                      : pe?.dateNaissance
                      ? `Né(e) le ${new Date(pe.dateNaissance).toLocaleDateString('fr-FR')}`
                      : '—'}
                  </p>
                </div>
                {pe?.grossesse !== undefined && (
                  <InfoField label="Grossesse" value={pe.grossesse} />
                )}
                {pe?.allaitement !== undefined && (
                  <InfoField label="Allaitement" value={pe.allaitement} />
                )}
              </div>

              {/* Antécédents médicaux / Allergies / Médicaments */}
              {(allergies.length > 0 ||
                antecedents.length > 0 ||
                medicaments.length > 0) && (
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                  <TagList
                    label="Allergies connues"
                    items={allergies}
                    color="bg-rose-100 text-rose-700"
                  />
                  <TagList
                    label="Antécédents médicaux"
                    items={antecedents}
                    color="bg-blue-100 text-blue-700"
                  />
                  <TagList
                    label="Médicaments / Produits utilisés simultanément"
                    items={medicaments}
                    color="bg-amber-100 text-amber-700"
                  />
                </div>
              )}
            </Section>

            {/* ══ SECTION 3 : Incident / Risque d'incident ══ */}
            {incident && (
              <Section
                icon={ShieldAlert}
                iconColor="text-red-600"
                title="Informations sur l'Incident ou le Risque d'Incident"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <InfoField
                      label="Description de l'incident ou du risque d'incident"
                      value={incident.descriptionIncident ?? incident.description}
                    />
                  </div>
                  <InfoField label="Nombre de dispositifs concernés" value={incident.nombreDM} />
                  <InfoField
                    label="Date de survenue"
                    value={(incident.dateSurvenue ?? incident.dateApparition)
                      ? new Date(incident.dateSurvenue ?? incident.dateApparition).toLocaleDateString('fr-FR')
                      : null}
                  />
                  <div className="md:col-span-2">
                    <InfoField
                      label="Conséquences cliniques et état actuel du patient ou personne impliquée"
                      value={incident.consequencesCliniques ?? incident.evolution}
                    />
                  </div>
                  <InfoField label="Structure de survenue" value={incident.structureSurvenue} />
                  <div className="md:col-span-2">
                    <InfoField label="Adresse de survenue" value={incident.adresseSurvenue} />
                  </div>
                </div>
              </Section>
            )}

            {/* ══ SECTION 4 : Dispositif Médical Impliqué ══ */}
            {dm && (
              <Section
                icon={Package}
                iconColor="text-blue-600"
                title="Informations sur le Dispositif Médical Impliqué"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField
                    label="Nom Commercial"
                    value={dm.nomCommercial ?? dm.nomSpecialite}
                  />
                  <InfoField label="Marque" value={dm.marque} />
                  <InfoField label="Désignation" value={dm.designation} />
                  <InfoField label="Référence" value={dm.reference} />
                  <InfoField label="Modèle" value={dm.modele} />
                  <InfoField label="Numéro de Série" value={dm.numeroSerie} />
                  <InfoField label="Numéro de Lot" value={dm.numeroLot} />
                  <InfoField label="Unique Device Identifier (UDI)" value={dm.udi} />
                  <InfoField
                    label="Version (Si Logiciel)"
                    value={dm.versionLogiciel}
                  />
                  <InfoField label="Nom du fabricant" value={dm.nomFabricant} />
                  {dm.adresseFabricant && (
                    <div className="md:col-span-2">
                      <InfoField
                        label="Adresse du fabricant"
                        value={dm.adresseFabricant}
                      />
                    </div>
                  )}
                  <InfoField
                    label="Localisation actuelle du DM"
                    value={dm.localisationActuelle}
                  />
                  <InfoField label="DM implantable" value={dm.estImplantable} />
                  {dm.dateImplantation && (
                    <InfoField
                      label="Date d'implantation"
                      value={new Date(dm.dateImplantation).toLocaleDateString('fr-FR')}
                    />
                  )}
                  {dm.dateExplantation && (
                    <InfoField
                      label="Date d'explantation"
                      value={new Date(dm.dateExplantation).toLocaleDateString('fr-FR')}
                    />
                  )}
                </div>
              </Section>
            )}

            {/* ══ SECTION 5 : Prise en Charge Médicale (if present) ══ */}
            {prise && (
              <Section
                icon={HeartPulse}
                iconColor="text-teal-600"
                title="Prise en Charge Médicale"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField
                    label="Hospitalisation requise"
                    value={prise.hospitalisationRequise}
                  />
                  {prise.hospitalisationRequise && (
                    <InfoField
                      label="Durée d'hospitalisation (jours)"
                      value={prise.dureeHospitalisation}
                    />
                  )}
                  {prise.traitementMedical && (
                    <div className="md:col-span-2">
                      <InfoField
                        label="Traitement médical mis en place"
                        value={prise.traitementMedical}
                      />
                    </div>
                  )}
                  {prise.examensComplementaires && (
                    <div className="md:col-span-2">
                      <InfoField
                        label="Examens complémentaires réalisés"
                        value={prise.examensComplementaires}
                      />
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* ══ SECTION 6 : Informations complémentaires + Commentaire AMMPS ══ */}
            <Section
              icon={FileText}
              iconColor="text-slate-600"
              title="Informations complémentaires et Commentaire AMMPS"
            >
              <div className="space-y-6">
                {/* Commentaire AMMPS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-500">
                      Commentaire AMMPS
                    </p>
                    <button
                      onClick={onSaveCommentaire}
                      disabled={commentaireSaving}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {commentaireSaving ? 'Envoi en cours…' : 'Sauvegarder'}
                    </button>
                  </div>
                  <textarea
                    value={commentaireAnmps}
                    onChange={(e) => setCommentaireAnmps(e.target.value)}
                    rows={4}
                    placeholder="Ajoutez un commentaire AMMPS qui sera envoyé au déclarant par email…"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Informations complémentaires saisies par le déclarant */}
                {declaration.commentaire && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-2">
                      Informations complémentaires (déclarant)
                    </p>
                    <p className="text-slate-900 whitespace-pre-wrap">
                      {declaration.commentaire}
                    </p>
                  </div>
                )}
              </div>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
}