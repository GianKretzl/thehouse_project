/**
 * Serviço de API - The House Frontend
 * Comunicação com o backend FastAPI
 */

// Usa a variável de ambiente ou fallback para localhost
// Em desenvolvimento, o frontend deve sempre apontar para http://localhost:8000
const API_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
  
const API_V1 = `${API_URL}/api/v1`;

// Log para debug (apenas em desenvolvimento)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[API] Configuração:', { API_URL, API_V1 });
}

/**
 * Tipos de resposta da API - The House Platform
 */
export interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  role: "DIRECTOR" | "PEDAGOGUE" | "SECRETARY" | "TEACHER";
  created_at: string;
  avatar?: string | null;
  // Campos compatíveis com o frontend legado
  username?: string;
  full_name?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiError {
  detail: string;
}

/**
 * Classe de erro customizada para API
 */
export class ApiException extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = 'ApiException';
  }
}

/**
 * Função auxiliar para fazer requisições HTTP
 * Exportada para uso em educational-api.ts
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('access_token') 
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Adiciona headers customizados
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  // Adiciona token de autenticação se existir
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Fazendo requisição: ${options.method || 'GET'} ${API_V1}${endpoint}`);
    }
    const response = await fetch(`${API_V1}${endpoint}`, config);
    
    if (!response.ok) {
      let errorDetail = 'An error occurred';
      
      try {
        const errorData: ApiError = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch {
        // Se não conseguir parsear JSON, usa mensagem padrão
        errorDetail = response.statusText || errorDetail;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API] Erro ${response.status}:`, errorDetail);
      }
      throw new ApiException(response.status, errorDetail);
    }

    // Se for 204 No Content, retorna objeto vazio
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Resposta recebida:`, data);
    }
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    
    // Erro de rede ou outro erro
    console.error('[API] Erro de rede:', error);
    console.error('[API] URL tentada:', `${API_V1}${endpoint}`);
    console.error('[API] API_URL configurada:', API_URL);
    
    throw new ApiException(0, `Network error. Please check your connection. (${error instanceof Error ? error.message : 'Unknown error'})`);
  }
}

/**
 * API de Autenticação
 */
export const authApi = {
  /**
   * Registra um novo usuário
   */
  async register(data: RegisterData): Promise<User> {
    return fetchApi<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Faz login do usuário
   */
  async login(data: LoginData): Promise<LoginResponse> {
    const response = await fetch(`${API_V1}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorDetail = 'Login failed';
      
      try {
        const errorData: ApiError = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch {
        errorDetail = response.statusText || errorDetail;
      }
      
      throw new ApiException(response.status, errorDetail);
    }

    const loginResponse: LoginResponse = await response.json();
    
    // Normaliza o usuário para compatibilidade
    if (loginResponse.user) {
      loginResponse.user.username = loginResponse.user.name;
      loginResponse.user.full_name = loginResponse.user.name;
    }
    
    return loginResponse;
  },

  /**
   * Faz logout (limpa tokens do localStorage)
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  },

  /**
   * Salva tokens no localStorage
   */
  saveTokens(accessToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
    }
  },

  /**
   * Obtém tokens do localStorage
   */
  getTokens() {
    if (typeof window !== 'undefined') {
      return {
        accessToken: localStorage.getItem('access_token'),
      };
    }
    return { accessToken: null };
  },
};

/**
 * API de Usuários
 */
export const usersApi = {
  /**
   * Obtém dados do usuário atual (autenticado)
   */
  async me(): Promise<User> {
    // In development you can point NEXT_PUBLIC_USE_MOCKS=true to use a local mock
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
      // fetch the mock user from public/mock/user.json
      const res = await fetch('/mock/user.json');
      if (!res.ok) {
        throw new ApiException(res.status, 'Failed to load mock user');
      }
      const data = await res.json();
      return data as User;
    }

    return fetchApi<User>('/auth/me');
  },

  /**
   * Obtém usuário por ID
   */
  async getById(id: number): Promise<User> {
    return fetchApi<User>(`/users/${id}`);
  },

  /**
   * Atualiza dados do usuário atual
   */
  async updateMe(data: { full_name?: string | null; username?: string; email?: string | null }): Promise<User> {
    return fetchApi<User>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Faz upload do avatar do usuário (multipart/form-data)
   * Retorna o usuário atualizado.
   */
  async uploadAvatar(file: File): Promise<User> {
    if (typeof window === 'undefined') {
      throw new ApiException(0, 'uploadAvatar must be called from browser');
    }

    const token = localStorage.getItem('access_token');
    const form = new FormData();
    form.append('file', file);

    const response = await fetch(`${API_V1}/users/me/avatar`, {
      method: 'POST',
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      let errorDetail = 'Upload failed';
      try {
        const errorData: ApiError = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch {
        errorDetail = response.statusText || errorDetail;
      }
      throw new ApiException(response.status, errorDetail);
    }

    return await response.json();
  },
};

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('access_token');
  return !!token;
}

/**
 * API de Verificação de URLs
 */
export interface URLVerifyRequest {
  url: string;
  force_refresh?: boolean;
}

export interface URLVerifyResponse {
  id: number;
  url: string;
  domain: string;
  status: 'safe' | 'warning' | 'danger';
  score: number;
  message: string;
  details: string[];
  tips: string[];
  ssl_valid: boolean | null;
  virustotal_score: number | null;
  is_phishing: boolean;
  is_malware: boolean;
  created_at: string;
  expires_at: string | null;
  from_cache: boolean;
}

export const urlsApi = {
  /**
   * Verifica a segurança de uma URL
   */
  async verify(data: URLVerifyRequest): Promise<URLVerifyResponse> {
    return fetchApi<URLVerifyResponse>('/urls/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Obtém histórico de verificações
   */
  async getHistory(skip: number = 0, limit: number = 50) {
    return fetchApi<{total: number, items: URLVerifyResponse[]}>(`/urls/history?skip=${skip}&limit=${limit}`);
  },

  /**
   * Obtém estatísticas de verificações
   */
  async getStats() {
    return fetchApi<{
      total_verifications: number;
      safe_count: number;
      warning_count: number;
      danger_count: number;
      recent_verifications: URLVerifyResponse[];
    }>('/urls/stats');
  },

  /**
   * Obtém verificações recentes
   */
  async getRecent(limit: number = 10) {
    return fetchApi<URLVerifyResponse[]>(`/urls/recent?limit=${limit}`);
  },

  /**
   * Obtém informações de uso (limites do plano)
   */
  async getUsage() {
    return fetchApi<{
      plan_type: string;
      monthly_limit: number | 'unlimited';
      used: number;
      remaining: number | 'unlimited';
      reset_at: string | null;
      last_verification_at: string | null;
      percentage_used: number;
    }>('/urls/usage');
  },
};


