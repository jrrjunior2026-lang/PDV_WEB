import * as tokenService from './tokenService';

const API_BASE_URL = '/api'; // Using relative path for proxying

// FIX: Extracted request to a standalone function to resolve `this` context typing issues inside the object literal.
async function request<T>(
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
}

const apiClient = {
  request,

  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, 'GET');
  },

  post<T>(endpoint: string, body: any, isFormData: boolean = false): Promise<T> {
    return request<T>(endpoint, 'POST', body, isFormData);
  },

  put<T>(endpoint: string, body: any): Promise<T> {
    return request<T>(endpoint, 'PUT', body);
  },
  
  patch<T>(endpoint: string, body: any): Promise<T> {
    return request<T>(endpoint, 'PATCH', body);
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, 'DELETE');
  },
};

export default apiClient;
