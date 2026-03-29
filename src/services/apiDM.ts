import { API_BASE_URL } from './api';

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
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create declaration');
    }

    const result = await response.json();
    return result.data;
  },

  getMyDeclarations: async (): Promise<DispositifMedicalResponse[]> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/dispositif-medical/my-declarations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch declarations');
    }

    const result = await response.json();
    return result.data;
  },

  getAllDeclarations: async (): Promise<DispositifMedicalResponse[]> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/dispositif-medical`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all declarations');
    }

    const result = await response.json();
    return result.data;
  },

  getDeclarationById: async (id: number): Promise<DispositifMedicalResponse> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/dispositif-medical/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch declaration');
    }

    const result = await response.json();
    return result.data;
  },

  updateStatut: async (id: number, statut: string): Promise<DispositifMedicalResponse> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/dispositif-medical/${id}/statut`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ statut }),
    });

    if (!response.ok) {
      throw new Error('Failed to update status');
    }

    const result = await response.json();
    return result.data;
  },

  updateCommentaireAnmps: async (id: number, commentaireAnmps: string): Promise<DispositifMedicalResponse> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/dispositif-medical/${id}/commentaire-anmps`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ commentaireAnmps }),
    });

    if (!response.ok) {
      throw new Error('Failed to update comment');
    }

    const result = await response.json();
    return result.data;
  },
};
