import * as tokenService from './tokenService';

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust to your backend URL

const apiClient = {
  async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: any,
    isFormData: boolean = false
  ): Promise<T> {
    const headers = new Headers();
    if (!isFormData) {
        headers.append('Content-Type', 'application/json');
    }

    const token = tokenService.getToken();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Ocorreu um erro na comunicação com o servidor.');
      }
      
      // Handle responses with no content
      if (response.status === 204) {
        return null as T;
      }
      
      return response.json();

    } catch (error) {
      console.error(`API Error on ${method} ${endpoint}:`, error);
      throw error;
    }
  },

  // FIX: Changed method syntax to function expression to fix generic type error.
  get: function<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'GET');
  },

  // FIX: Changed method syntax to function expression to fix generic type error.
  post: function<T>(endpoint: string, body: any, isFormData: boolean = false): Promise<T> {
    return this.request<T>(endpoint, 'POST', body, isFormData);
  },

  // FIX: Changed method syntax to function expression to fix generic type error.
  put: function<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, 'PUT', body);
  },
  
  // FIX: Changed method syntax to function expression to fix generic type error.
  patch: function<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', body);
  },

  // FIX: Changed method syntax to function expression to fix generic type error.
  delete: function<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'DELETE');
  },
};

export default apiClient;