import { API_BASE_URL } from './api';
import { createEncryptedPayload, decryptData } from '../utils/encryption';

export interface DispositifMedicalRequest {
  commentaire?: string;
  declarant?: DeclarantDMDto;
  personneExposee?: PersonneExposeeDMDto;
  dispositifsSuspectes?: DispositifSuspecteDto[];
  effetsIndesirables?: EffetIndesirableDMDto[];
  priseChargeMedicale?: PriseChargeMedicaleDMDto;
  professionnelSante?: ProfessionnelSanteDMDto;
  representantLegal?: RepresentantLegalDMDto;
  allergies?: AllergiesConnuesDMDto[];
  antecedents?: AntecedentsMedicalDMDto[];
  medicamentsSimultanes?: MedicamentProduitSimultanementDMDto[];
}

export interface DeclarantDMDto {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  qualiteDeclarant?: string;
}

export interface PersonneExposeeDMDto {
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  age?: number;
  ageUnite?: string;
  sexe?: string;
  poids?: number;
  taille?: number;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  grossesse?: boolean;
  allaitement?: boolean;
}

export interface DispositifSuspecteDto {
  nomSpecialite?: string;
  posologie?: string;
  numeroLot?: string;
  dateDebutPrise?: string;
  dateArretPrise?: string;
  motifPrise?: string;
  lieuAchat?: string;
}

export interface EffetIndesirableDMDto {
  description?: string;
  localisation?: string;
  dateApparition?: string;
  gravite?: string;
  evolution?: string;
}

export interface PriseChargeMedicaleDMDto {
  hospitalisationRequise?: boolean;
  dureeHospitalisation?: number;
  traitementMedical?: string;
  examensComplementaires?: string;
}

export interface ProfessionnelSanteDMDto {
  nom?: string;
  prenom?: string;
  specialite?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  etablissement?: string;
  ville?: string;
}

export interface RepresentantLegalDMDto {
  nom?: string;
  prenom?: string;
  lienParente?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

export interface AllergiesConnuesDMDto {
  typeAllergie?: string;
  description?: string;
}

export interface AntecedentsMedicalDMDto {
  description?: string;
}

export interface MedicamentProduitSimultanementDMDto {
  nom?: string;
  posologie?: string;
}

export interface DispositifMedicalResponse {
  id: number;
  numeroDeclaration: string;
  statut: string;
  commentaire?: string;
  commentaireAnmps?: string;
  createdAt: string;
  updatedAt: string;
  declarant?: DeclarantDMDto;
  personneExposee?: PersonneExposeeDMDto;
  dispositifsSuspectes?: DispositifSuspecteDto[];
  effetsIndesirables?: EffetIndesirableDMDto[];
  priseChargeMedicale?: PriseChargeMedicaleDMDto;
  professionnelSante?: ProfessionnelSanteDMDto;
  representantLegal?: RepresentantLegalDMDto;
  allergies?: AllergiesConnuesDMDto[];
  antecedents?: AntecedentsMedicalDMDto[];
  medicamentsSimultanes?: MedicamentProduitSimultanementDMDto[];
}

export const apiDM = {
  createDeclaration: async (data: DispositifMedicalRequest): Promise<DispositifMedicalResponse> => {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${API_BASE_URL}/dispositif-medical`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Encrypted': 'true',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(createEncryptedPayload(data)),
    });

    const text = await response.text();
    let result: any;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.encrypted === true && parsed?.data) {
        result = decryptData(parsed.data);
      } else {
        result = parsed;
      }
    } catch {
      throw new Error('Erreur lors du traitement de la réponse');
    }

    if (!response.ok || result?.success === false) {
      throw new Error(result?.message || 'Failed to create declaration');
    }

    return (result as any)?.data ?? result;
  },

  getMyDeclarations: async (): Promise<DispositifMedicalResponse[]> => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/dispositif-medical/my-declarations`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const text = await response.text();
    let result: any;
    try {
      const parsed = JSON.parse(text);
      result = parsed?.encrypted === true && parsed?.data ? decryptData(parsed.data) : parsed;
    } catch { throw new Error('Erreur lors du traitement de la réponse'); }

    if (!response.ok) throw new Error('Failed to fetch declarations');
    return (result as any)?.data ?? result;
  },

  getAllDeclarations: async (): Promise<DispositifMedicalResponse[]> => {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${API_BASE_URL}/dispositif-medical`, {
      method: 'GET',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    const text = await response.text();
    let result: any;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.encrypted === true && parsed?.data) {
        result = decryptData(parsed.data);
      } else {
        result = parsed;
      }
    } catch {
      throw new Error('Erreur lors du traitement de la réponse');
    }

    if (!response.ok) throw new Error('Failed to fetch all declarations');
    return (result as any)?.data ?? result;
  },

  getDeclarationById: async (id: number): Promise<DispositifMedicalResponse> => {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${API_BASE_URL}/dispositif-medical/${id}`, {
      method: 'GET',
      headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
    });

    const text = await response.text();
    let result: any;
    try {
      const parsed = JSON.parse(text);
      result = parsed?.encrypted === true && parsed?.data ? decryptData(parsed.data) : parsed;
    } catch { throw new Error('Erreur lors du traitement de la réponse'); }

    if (!response.ok) throw new Error('Failed to fetch declaration');
    return (result as any)?.data ?? result;
  },

  updateStatut: async (id: number, statut: string): Promise<DispositifMedicalResponse> => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/dispositif-medical/${id}/statut`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Request-Encrypted': 'true', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(createEncryptedPayload({ statut })),
    });

    const text = await response.text();
    let result: any;
    try {
      const parsed = JSON.parse(text);
      result = parsed?.encrypted === true && parsed?.data ? decryptData(parsed.data) : parsed;
    } catch { throw new Error('Erreur lors du traitement de la réponse'); }

    if (!response.ok) throw new Error('Failed to update status');
    return (result as any)?.data ?? result;
  },

  updateCommentaireAnmps: async (id: number, commentaireAnmps: string): Promise<DispositifMedicalResponse> => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/dispositif-medical/${id}/commentaire-anmps`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Request-Encrypted': 'true', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(createEncryptedPayload({ commentaireAnmps })),
    });

    const text = await response.text();
    let result: any;
    try {
      const parsed = JSON.parse(text);
      result = parsed?.encrypted === true && parsed?.data ? decryptData(parsed.data) : parsed;
    } catch { throw new Error('Erreur lors du traitement de la réponse'); }

    if (!response.ok) throw new Error('Failed to update comment');
    return (result as any)?.data ?? result;
  },
};
