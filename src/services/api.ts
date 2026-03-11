import { encryptData, decryptData, createEncryptedPayload } from '../utils/encryption';

const API_URL = import.meta.env.VITE_API_URL ;

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: {
    id: string;
    email: string;
  };
}

interface ApiError {
  error?: string;
  message?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'X-Request-Encrypted': 'true',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    let result: unknown;
    try {
      const parsed = JSON.parse(text) as any;

      if (parsed?.encrypted === true && parsed?.data) {
        try {
          const decrypted = decryptData(parsed.data);
          result = decrypted;
        } catch (error) {
          console.error('❌ Decryption failed:', error);
          throw error;
        }
      } else {
        console.log('ℹ️ Response not encrypted, using as-is');
        result = parsed;
      }
    } catch (error) {
      console.error('❌ Error processing response:', error);
      throw new Error('Erreur lors du traitement de la réponse');
    }

    if (!response.ok) {
      const err = result as any;
      const errorMsg = err?.error ?? err?.message ?? 'Unknown error';
      throw new Error(errorMsg);
    }

    if (result && typeof result === 'object' && 'data' in result) {
      return (result as { data: T }).data;
    }
    return result as T;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const payload = createEncryptedPayload({ email, password });
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Encrypted': 'true'
      },
      body: JSON.stringify(payload)
    });

    const data = await this.handleResponse<AuthResponse>(response);

    if (data?.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
    }
    if (data?.refreshToken) {
      localStorage.setItem('refresh_token', data.refreshToken);
    }

    return data;
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    const payload = createEncryptedPayload({ email, password });
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Request-Encrypted': 'true'
      },
      body: JSON.stringify(payload)
    });

    const data = await this.handleResponse<AuthResponse>(response);
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    return data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async getDeclarations(type?: string) {
    const url = type
      ? `${API_URL}/declarations?type=${type}`
      : `${API_URL}/declarations`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async getDeclarationById(id: string) {
    const response = await fetch(`${API_URL}/declarations/${id}`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  async updateDeclarationStatus(id: string, statut: string) {
    const payload = createEncryptedPayload({ statut });
    const response = await fetch(`${API_URL}/declarations/${id}/statut`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return this.handleResponse(response);
  }

  async updateCommentaireAnmps(id: string, commentaireAnmps: string) {
    const payload = createEncryptedPayload({ commentaireAnmps });
    const response = await fetch(`${API_URL}/declarations/${id}/commentaire-anmps`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return this.handleResponse(response);
  }

  async createDeclaration(data: any) {
    const payload = createEncryptedPayload(data);
    const response = await fetch(`${API_URL}/declarations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return this.handleResponse(response);
  }

  async uploadFile(file: File, declarationId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (declarationId) {
      formData.append('declarationId', declarationId);
    }

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/attachments/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    return this.handleResponse(response);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const api = new ApiService();
