import { encryptData } from '../utils/encryption';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface ComplementAlimentaireFormData {
  utilisateurType: string;
  utilisateurTypeAutre?: string;
  declarant: any;
  professionnelSante?: any;
  representantLegal?: any;
  personneExposee: any;
  allergiesConnues: string[];
  antecedentsMedicaux: string[];
  medicamentsSimultanes: string[];
  effetIndesirable: any;
  priseChargeMedicale: any;
  complementSuspecte: any;
  commentaire?: string;
}

export const complementAlimentaireApi = {
  async createDeclaration(formData: ComplementAlimentaireFormData, documentEnregistrement?: File) {
    const token = localStorage.getItem('token');

    const encryptedData = {
      ...formData,
      declarant: {
        ...formData.declarant,
        nom: encryptData(formData.declarant.nom),
        prenom: encryptData(formData.declarant.prenom),
        email: encryptData(formData.declarant.email),
        tel: encryptData(formData.declarant.tel),
      },
      personneExposee: {
        ...formData.personneExposee,
        nomPrenom: encryptData(formData.personneExposee.nomPrenom),
      },
    };

    const formDataToSend = new FormData();
    formDataToSend.append('data', new Blob([JSON.stringify(encryptedData)], { type: 'application/json' }));

    if (documentEnregistrement) {
      formDataToSend.append('documentEnregistrement', documentEnregistrement);
    }

    const response = await fetch(`${API_URL}/complements-alimentaires`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formDataToSend,
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  },

  async getMesDeclarations() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/complements-alimentaires/mes-declarations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  },

  async getDeclarationById(id: number) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/complements-alimentaires/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  },

  async getAllDeclarations() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/complements-alimentaires`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  },

  async updateStatut(id: number, statut: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/complements-alimentaires/${id}/statut`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statut }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  },

  async updateCommentaireAnmps(id: number, commentaire: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/complements-alimentaires/${id}/commentaire-anmps`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commentaire }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  },
};
