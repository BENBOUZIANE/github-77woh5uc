import { encryptData, decryptData, createEncryptedPayload } from '../utils/encryption';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const parseResponse = async (response: Response) => {
  const text = await response.text();
  const parsed = JSON.parse(text);
  if (parsed?.encrypted === true && parsed?.data) {
    return decryptData(parsed.data) as any;
  }
  return parsed;
};

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
    const token = localStorage.getItem('access_token');

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
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formDataToSend,
    });

    const result = await parseResponse(response);
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  },

  async getMesDeclarations() {
    const token = localStorage.getItem('access_token');
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
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/complements-alimentaires/${id}`, {
      headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
    });
    const result = await parseResponse(response);
    if (!result.success) throw new Error(result.message);
    return result.data;
  },

  async getAllDeclarations() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/complements-alimentaires`, {
      headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
    });
    const result = await parseResponse(response);
    if (!result.success) throw new Error(result.message);
    return result.data;
  },

  async updateStatut(id: number, statut: string) {
    const token = localStorage.getItem('access_token');
    const payload = createEncryptedPayload({ statut });
    const response = await fetch(`${API_URL}/complements-alimentaires/${id}/statut`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Request-Encrypted': 'true',
      },
      body: JSON.stringify(payload),
    });

    const result = await parseResponse(response);
    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  },

  async updateCommentaireAnmps(id: number, commentaire: string) {
    const token = localStorage.getItem('access_token');
    const payload = createEncryptedPayload({ commentaireAnmps: commentaire });
    const response = await fetch(`${API_URL}/complements-alimentaires/${id}/commentaire-anmps`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Request-Encrypted': 'true',
      },
      body: JSON.stringify(payload),
    });

    const result = await parseResponse(response);
    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  },

  async uploadAttachment(file: File, declarationId: string) {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('declarationId', declarationId);
    await fetch(`${API_URL}/attachments/upload`, {
      method: 'POST',
      headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
      body: formData,
    });
  },
};
