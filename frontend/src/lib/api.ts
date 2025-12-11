/**
 * Serviço de API - NetSaber Frontend
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
    console.log(`[API] Fazendo requisição: ${options.method || 'GET'} ${API_V1}${endpoint}`);
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
      
      console.error(`[API] Erro ${response.status}:`, errorDetail);
      throw new ApiException(response.status, errorDetail);
    }

    // Se for 204 No Content, retorna objeto vazio
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    console.log(`[API] Resposta recebida:`, data);
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

/**
 * API de Assinaturas e Planos
 */
export interface PlanInfo {
  name: string;
  price: number;
  monthly_verifications: number; // -1 = ilimitado
  max_family_members: number;
  support_priority: string;
  features: string[];
}

export interface SubscriptionInfo {
  plan_type: string;
  plan_name: string;
  price: number;
  subscription_expires_at: string | null;
  is_active: boolean;
  monthly_verifications_used: number;
  monthly_verifications_limit: number; // -1 = ilimitado
  verifications_remaining: number | null; // null = ilimitado
  usage_reset_at: string | null;
  days_until_renewal: number | null;
}

export interface SubscriptionHistoryItem {
  id: number;
  old_plan: string | null;
  new_plan: string;
  action: string; // upgrade, downgrade, cancel, renew
  amount: number | null;
  notes: string | null;
  created_at: string;
}

export const subscriptionsApi = {
  /**
   * Obtém informações da assinatura atual
   */
  async getCurrent(): Promise<SubscriptionInfo> {
    return fetchApi<SubscriptionInfo>('/subscriptions/current');
  },

  /**
   * Obtém lista de todos os planos disponíveis
   */
  async getPlans() {
    return fetchApi<{
      plans: Record<string, PlanInfo>;
      current_plan: string;
      recommendations: string[];
    }>('/subscriptions/plans');
  },

  /**
   * Muda o plano do usuário
   */
  async changePlan(newPlan: 'free' | 'family' | 'premium') {
    return fetchApi<{
      success: boolean;
      message: string;
      new_plan: string;
    }>('/subscriptions/change-plan', {
      method: 'POST',
      body: JSON.stringify({ new_plan: newPlan }),
    });
  },

  /**
   * Cancela a assinatura
   */
  async cancel(immediate: boolean = false, reason?: string) {
    return fetchApi<{
      success: boolean;
      message: string;
    }>('/subscriptions/cancel', {
      method: 'POST',
      body: JSON.stringify({ immediate, reason }),
    });
  },

  /**
   * Obtém histórico de mudanças de assinatura
   */
  async getHistory(skip: number = 0, limit: number = 50) {
    return fetchApi<{
      total: number;
      items: SubscriptionHistoryItem[];
    }>(`/subscriptions/history?skip=${skip}&limit=${limit}`);
  },

  /**
   * Obtém estatísticas de assinatura
   */
  async getStats() {
    return fetchApi<{
      total_changes: number;
      total_spent: number;
      latest_change: {
        action: string;
        new_plan: string;
        created_at: string;
      } | null;
    }>('/subscriptions/stats');
  },
};

/**
 * API de Notificações
 */
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  url: string | null;
  extra_data: Record<string, any> | null;
  read: boolean;
  read_at: string | null;
  sent_email: boolean;
  sent_whatsapp: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  danger_url: boolean;
  phishing: boolean;
  limit_warning: boolean;
  limit_reached: boolean;
  subscription_changed: boolean;
  subscription_expired: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  whatsapp_number: string | null;
  notification_email: boolean;
  notification_whatsapp: boolean;
}

export const notificationsApi = {
  /**
   * Obtém notificações do usuário
   */
  async getAll(skip: number = 0, limit: number = 50, unreadOnly: boolean = false) {
    return fetchApi<{
      total: number;
      unread_count: number;
      items: Notification[];
    }>(`/notifications/?skip=${skip}&limit=${limit}&unread_only=${unreadOnly}`);
  },

  /**
   * Marca notificações como lidas
   */
  async markAsRead(notificationIds: number[]) {
    return fetchApi<{
      success: boolean;
      marked_count: number;
      message: string;
    }>('/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ notification_ids: notificationIds }),
    });
  },

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead() {
    return fetchApi<{
      success: boolean;
      marked_count: number;
      message: string;
    }>('/notifications/mark-all-read', {
      method: 'POST',
    });
  },

  /**
   * Deleta uma notificação
   */
  async delete(notificationId: number) {
    return fetchApi<{
      success: boolean;
      message: string;
    }>(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Obtém contagem de notificações não lidas
   */
  async getUnreadCount() {
    return fetchApi<{
      unread_count: number;
    }>('/notifications/unread-count');
  },

  /**
   * Obtém estatísticas de notificações
   */
  async getStats() {
    return fetchApi<{
      total: number;
      unread: number;
      by_severity: Record<string, number>;
      recent: Notification[];
    }>('/notifications/stats');
  },

  /**
   * Obtém preferências de notificação
   */
  async getPreferences(): Promise<NotificationPreferences> {
    return fetchApi<NotificationPreferences>('/notifications/preferences');
  },

  /**
   * Atualiza preferências de notificação
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    return fetchApi<NotificationPreferences>('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },
};

/**
 * API de Sites Confiáveis
 */

// Interfaces
export interface TrustedSite {
  id: number;
  name: string;
  url: string;
  domain: string;
  description: string | null;
  logo_url: string | null;
  category: string;
  tags: string[] | null;
  trust_score: number;
  total_reviews: number;
  average_rating: number;
  is_verified: boolean;
  verification_date: string | null;
  seal_level: string;
  view_count: number;
  click_count: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  is_user_favorite?: boolean;
  user_verification_count?: number;
}

export interface TrustedSiteReview {
  id: number;
  site_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  purchase_made: boolean;
  would_recommend: boolean;
  is_approved: boolean;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  user_name?: string;
}

export interface UserTrustedSite {
  id: number;
  user_id: number;
  site_id: number;
  custom_name: string | null;
  notes: string | null;
  is_favorite: boolean;
  verification_count: number;
  last_verified_at: string | null;
  added_at: string;
  site: TrustedSite;
}

export interface TrustedSiteStats {
  total_sites: number;
  total_reviews: number;
  average_rating: number;
  verified_sites: number;
  featured_sites: number;
  categories: Record<string, number>;
  top_rated_sites: TrustedSite[];
}

export interface UserTrustedSiteStats {
  total_sites: number;
  favorite_sites: number;
  total_verifications: number;
  categories: Record<string, number>;
  most_verified_sites: UserTrustedSite[];
}

export const trustedSitesApi = {
  /**
   * Obtém lista de sites confiáveis
   */
  async getAll(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    is_verified?: boolean;
    is_featured?: boolean;
    min_rating?: number;
    seal_level?: string;
    search?: string;
  }): Promise<{ total: number; items: TrustedSite[] }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return fetchApi<{ total: number; items: TrustedSite[] }>(
      `/trusted-sites?${queryParams.toString()}`
    );
  },

  /**
   * Obtém detalhes de um site confiável
   */
  async getById(siteId: number): Promise<TrustedSite> {
    return fetchApi<TrustedSite>(`/trusted-sites/${siteId}`);
  },

  /**
   * Registra um clique no site
   */
  async registerClick(siteId: number): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/trusted-sites/${siteId}/click`, {
      method: 'POST',
    });
  },

  /**
   * Obtém avaliações de um site
   */
  async getReviews(siteId: number, skip = 0, limit = 20): Promise<{ total: number; items: TrustedSiteReview[] }> {
    return fetchApi<{ total: number; items: TrustedSiteReview[] }>(
      `/trusted-sites/${siteId}/reviews?skip=${skip}&limit=${limit}`
    );
  },

  /**
   * Cria uma avaliação
   */
  async createReview(data: {
    site_id: number;
    rating: number;
    title?: string;
    comment?: string;
    purchase_made?: boolean;
    would_recommend?: boolean;
  }): Promise<TrustedSiteReview> {
    return fetchApi<TrustedSiteReview>('/trusted-sites/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Obtém lista pessoal de sites confiáveis
   */
  async getMyList(params?: {
    skip?: number;
    limit?: number;
    favorites_only?: boolean;
  }): Promise<{ total: number; items: UserTrustedSite[] }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return fetchApi<{ total: number; items: UserTrustedSite[] }>(
      `/trusted-sites/my-list/all?${queryParams.toString()}`
    );
  },

  /**
   * Adiciona site à lista pessoal
   */
  async addToMyList(data: {
    site_id: number;
    custom_name?: string;
    notes?: string;
    is_favorite?: boolean;
  }): Promise<UserTrustedSite> {
    return fetchApi<UserTrustedSite>('/trusted-sites/my-list', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza site na lista pessoal
   */
  async updateMyListSite(siteId: number, data: {
    custom_name?: string;
    notes?: string;
    is_favorite?: boolean;
  }): Promise<UserTrustedSite> {
    return fetchApi<UserTrustedSite>(`/trusted-sites/my-list/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove site da lista pessoal
   */
  async removeFromMyList(siteId: number): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/trusted-sites/my-list/${siteId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Obtém estatísticas globais
   */
  async getGlobalStats(): Promise<TrustedSiteStats> {
    return fetchApi<TrustedSiteStats>('/trusted-sites/stats/global');
  },

  /**
   * Obtém estatísticas da lista pessoal
   */
  async getMyListStats(): Promise<UserTrustedSiteStats> {
    return fetchApi<UserTrustedSiteStats>('/trusted-sites/stats/my-list');
  },
};

/**
 * API de Produtos e Comparação de Preços
 */

// Interfaces de Favoritos e Alertas
export interface FavoriteProduct {
  id: number;
  user_id: number;
  product_id: string;
  product_name: string;
  product_image?: string;
  product_brand?: string;
  product_category?: string;
  initial_price: number;
  current_price?: number;
  lowest_price_seen?: number;
  price_drop?: number;
  initial_store: string;
  initial_store_url: string;
  initial_product_url: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_checked_at?: string;
}

export interface PriceAlert {
  id: number;
  user_id: number;
  favorite_product_id: number;
  target_price: number;
  alert_type: "below" | "above" | "exact";
  is_active: boolean;
  is_triggered: boolean;
  triggered_at?: string;
  triggered_price?: number;
  notification_sent: boolean;
  notification_sent_at?: string;
  notification_channels?: string[];
  created_at: string;
  updated_at?: string;
  favorite_product?: FavoriteProduct;
}

export interface ProductComparison {
  products: FavoriteProduct[];
  comparison: {
    best_price: {
      product_id: string;
      price: number;
      store: string;
    };
    price_range: {
      min: number;
      max: number;
      difference: number;
    };
    average_price: number;
    total_products: number;
  };
}

export interface ProductSearchRequest {
  query: string;
  max_results?: number;
  min_price?: number;
  max_price?: number;
  category?: string;
  sort_by?: "relevance" | "lowest_price" | "highest_price" | "rating";
}

export interface StoreOffer {
  id: string;
  store_name: string;
  store_url: string;
  product_url: string;
  price: number;
  original_price?: number;
  discount?: number;
  is_trusted: boolean;
  store_rating?: number;
  installments?: string;
  shipping?: string;
  in_stock: boolean;
  seller_name?: string;
}

export interface Product {
  id: string;
  name: string;
  image?: string;
  brand?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  description?: string;
  lowest_price: number;
  highest_price: number;
  offers: StoreOffer[];
  is_recommended?: boolean;
}

export interface ProductSearchResponse {
  query: string;
  total_products: number;
  total_stores: number;
  max_discount: number;
  products: Product[];
  search_time: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
}

export const productsApi = {
  /**
   * Busca produtos em múltiplos marketplaces
   */
  async search(request: ProductSearchRequest): Promise<ProductSearchResponse> {
    return fetchApi<ProductSearchResponse>('/products/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Busca produtos via GET (para links diretos)
   */
  async searchGet(params: {
    query: string;
    max_results?: number;
    min_price?: number;
    max_price?: number;
    category?: string;
    sort_by?: string;
  }): Promise<ProductSearchResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    return fetchApi<ProductSearchResponse>(`/products/search?${queryParams.toString()}`);
  },

  /**
   * Obtém produtos em alta / mais buscados
   */
  async getTrending(limit: number = 10): Promise<{ trending_searches: string[]; last_updated: string }> {
    return fetchApi<{ trending_searches: string[]; last_updated: string }>(
      `/products/trending?limit=${limit}`
    );
  },

  /**
   * Obtém categorias disponíveis
   */
  async getCategories(): Promise<{ categories: ProductCategory[] }> {
    return fetchApi<{ categories: ProductCategory[] }>('/products/categories');
  },

  /**
   * Adiciona produto aos favoritos
   */
  async addFavorite(data: {
    product_id: string;
    product_name: string;
    product_image?: string;
    product_brand?: string;
    product_category?: string;
    initial_price: number;
    initial_store: string;
    initial_store_url: string;
    initial_product_url: string;
    notes?: string;
  }): Promise<FavoriteProduct> {
    return fetchApi<FavoriteProduct>('/products/favorites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Obtém lista de favoritos
   */
  async getFavorites(params?: {
    skip?: number;
    limit?: number;
    active_only?: boolean;
  }): Promise<{ total: number; items: FavoriteProduct[] }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return fetchApi<{ total: number; items: FavoriteProduct[] }>(
      `/products/favorites?${queryParams.toString()}`
    );
  },

  /**
   * Obtém detalhes de um favorito
   */
  async getFavorite(favoriteId: number): Promise<FavoriteProduct> {
    return fetchApi<FavoriteProduct>(`/products/favorites/${favoriteId}`);
  },

  /**
   * Atualiza um favorito
   */
  async updateFavorite(favoriteId: number, data: {
    notes?: string;
    is_active?: boolean;
  }): Promise<FavoriteProduct> {
    return fetchApi<FavoriteProduct>(`/products/favorites/${favoriteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove favorito
   */
  async removeFavorite(productId: string): Promise<{ message: string }> {
    // Busca o favorito pelo product_id primeiro
    const favorites = await this.getFavorites({ active_only: true });
    const favorite = favorites.items.find(f => f.product_id === productId);
    
    if (!favorite) {
      throw new ApiException(404, 'Produto não encontrado nos favoritos');
    }

    return fetchApi<{ message: string }>(`/products/favorites/${favorite.id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Compara produtos favoritos
   */
  async compareFavorites(favoriteIds: number[]): Promise<ProductComparison> {
    return fetchApi<ProductComparison>('/products/favorites/compare', {
      method: 'POST',
      body: JSON.stringify({ favorite_ids: favoriteIds }),
    });
  },

  /**
   * Cria alerta de preço
   */
  async createPriceAlert(data: {
    favorite_product_id: number;
    target_price: number;
    alert_type?: "below" | "above" | "exact";
    notification_channels?: string[];
  }): Promise<PriceAlert> {
    return fetchApi<PriceAlert>('/products/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Obtém lista de alertas
   */
  async getPriceAlerts(params?: {
    skip?: number;
    limit?: number;
    active_only?: boolean;
  }): Promise<{ 
    total: number; 
    active_count: number;
    triggered_count: number;
    items: PriceAlert[];
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return fetchApi<{ 
      total: number; 
      active_count: number;
      triggered_count: number;
      items: PriceAlert[];
    }>(`/products/alerts?${queryParams.toString()}`);
  },

  /**
   * Obtém detalhes de um alerta
   */
  async getPriceAlert(alertId: number): Promise<PriceAlert> {
    return fetchApi<PriceAlert>(`/products/alerts/${alertId}`);
  },

  /**
   * Atualiza um alerta
   */
  async updatePriceAlert(alertId: number, data: {
    target_price?: number;
    alert_type?: "below" | "above" | "exact";
    is_active?: boolean;
    notification_channels?: string[];
  }): Promise<PriceAlert> {
    return fetchApi<PriceAlert>(`/products/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove alerta
   */
  async deletePriceAlert(alertId: number): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/products/alerts/${alertId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Obtém alertas de um favorito
   */
  async getFavoriteAlerts(favoriteId: number): Promise<{ alerts: PriceAlert[] }> {
    return fetchApi<{ alerts: PriceAlert[] }>(`/products/favorites/${favoriteId}/alerts`);
  },

  /**
   * Compara produtos
   */
  async compareProducts(favoriteIds: number[]): Promise<{ products: FavoriteProduct[] }> {
    return fetchApi<{ products: FavoriteProduct[] }>('/products/favorites/compare', {
      method: 'POST',
      body: JSON.stringify({ favorite_ids: favoriteIds }),
    });
  },

  /**
   * Obtém histórico de preços de um produto
   */
  async getPriceHistory(productId: string, days: number = 30): Promise<any> {
    return fetchApi<any>(`/products/history/${productId}?days=${days}`);
  },

  /**
   * Obtém estatísticas de preço de um produto
   */
  async getPriceStatistics(productId: string, days: number = 30): Promise<any> {
    return fetchApi<any>(`/products/statistics/${productId}?days=${days}`);
  },

  /**
   * Obtém produtos com maior queda de preço
   */
  async getTrendingPrices(limit: number = 10): Promise<any[]> {
    return fetchApi<any[]>(`/products/trending-prices?limit=${limit}`);
  },

  /**
   * Executa monitoramento de preços manualmente
   */
  async runPriceMonitor(params?: {
    batch_size?: number;
    max_age_hours?: number;
  }): Promise<{ status: string; message: string; timestamp: string }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return fetchApi<{ status: string; message: string; timestamp: string }>(
      `/products/monitor/run?${queryParams.toString()}`,
      { method: 'POST' }
    );
  },

  /**
   * Obtém mensagem inicial do agente IA
   */
  async getAgentInitialMessage(): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/products/agent/initial');
  },

  /**
   * Envia mensagem para o agente IA
   */
  async chatWithAgent(messages: Array<{ role: string; content: string }>): Promise<{
    message: string;
    action: "chat" | "search" | "recommend";
    products?: Product[];
    analysis?: Record<string, {
      pros: string[];
      cons: string[];
      score: number;
    }>;
  }> {
    return fetchApi<{
      message: string;
      action: "chat" | "search" | "recommend";
      products?: Product[];
      analysis?: Record<string, {
        pros: string[];
        cons: string[];
        score: number;
      }>;
    }>('/products/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  },
};
