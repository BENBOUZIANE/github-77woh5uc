const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'An error occurred');
    }
    const result = await response.json();
    // Backend wraps payload in { success, message, data }; fallback to raw object otherwise
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data as T;
    }
    return result as T;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await this.handleResponse<AuthResponse>(response);
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    return data;
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
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
    const response = await fetch(`${API_URL}/declarations/${id}/statut`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ statut })
    });

    return this.handleResponse(response);
  }

  async createDeclaration(data: any) {
    const response = await fetch(`${API_URL}/declarations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
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
