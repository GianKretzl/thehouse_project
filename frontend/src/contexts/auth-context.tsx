"use client"

/**
 * Context de Autenticação - The House Platform
 * Gerencia estado de autenticação, usuário logado e tokens
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'
import { authApi, usersApi, User, LoginData, RegisterData, ApiException } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  isAuthenticated: boolean;
  // Recarrega os dados do usuário (útil após atualizações)
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Carrega usuário ao montar o componente
  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Carrega dados do usuário autenticado
   */
  async function loadUser() {
    try {
      setLoading(true);
      const tokens = authApi.getTokens();

      if (!tokens.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await usersApi.me();

        // Normaliza o usuário para compatibilidade
        const normalizedUser = {
          ...userData,
          username: userData.name,
          full_name: userData.name,
          avatar:
            (userData as any).avatar ??
            (userData as any).avatar_url ??
            null,
        } as unknown as User;

        // Se não houver avatar no backend, gera um avatar SVG inline com iniciais
        if (!normalizedUser.avatar) {
          const nameSeed = normalizedUser.name ?? normalizedUser.email ?? 'User'
          normalizedUser.avatar = generateInitialsDataUri(nameSeed)
        }

        setUser(normalizedUser);
      } catch (err) {
        // Erro ao obter usuário — pode ser rede/CORS ou 401
        console.error('Erro ao carregar usuário (me):', err);

        // Se for uma falha de autenticação explícita, limpa tokens; caso contrário,
        // não limpamos imediatamente (evita logout por erro de rede temporário).
        if (err instanceof ApiException && (err.status === 401 || err.status === 403)) {
          console.warn('[Auth] Token inválido ou expirado. Fazendo logout...');
          authApi.logout();
          setUser(null);
        } else {
          // Mantém possíveis tokens no localStorage e apenas não popula `user`.
          console.warn('[Auth] Erro de rede ao carregar usuário. Mantendo sessão...');
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar usuário:', err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Faz login do usuário
   */
  async function login(data: LoginData) {
    try {
      setLoading(true);
      setError(null);

      const response = await authApi.login(data);
      
      // Salva token
      authApi.saveTokens(response.access_token);
      
      // Usa os dados do usuário que já vêm na resposta
      const userData = response.user;

      const normalizedUser = {
        ...userData,
        username: userData.name,
        full_name: userData.name,
        avatar:
          (userData as any).avatar ??
          (userData as any).avatar_url ??
          null,
      } as unknown as User;

      if (!normalizedUser.avatar) {
        const nameSeed = normalizedUser.name ?? normalizedUser.email ?? 'User'
        normalizedUser.avatar = generateInitialsDataUri(nameSeed)
      }

      setUser(normalizedUser);

      // Redireciona para dashboard
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof ApiException 
        ? err.detail 
        : 'Erro ao fazer login. Tente novamente.';
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Registra novo usuário
   */
  async function register(data: RegisterData) {
    try {
      setLoading(true);
      setError(null);

      // Registra o usuário
      await authApi.register(data);

      // Faz login automaticamente
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (err) {
      const errorMessage = err instanceof ApiException 
        ? err.detail 
        : 'Erro ao criar conta. Tente novamente.';
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Faz logout do usuário
   */
  function logout() {
    // Remove tokens and clear user state
    authApi.logout();
    setUser(null);

    // Inform the user and redirect to landing page
    try {
      toast.success('Usuário deslogado', { description: 'Você saiu da sua conta.' })
    } catch (err) {
      // ignore toast errors
    }

    // Redirect to public landing page
    router.push('/')
  }

  /**
   * Limpa mensagem de erro
   */
  function clearError() {
    setError(null);
  }

  // Gera um data URI SVG com iniciais do nome e cor de fundo derivada do nome.
  function generateInitialsDataUri(name: string) {
    const initials = (name || 'U')
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .slice(0,2)
      .join('')
      .toUpperCase()

    // gera cor a partir do nome
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    const color = `hsl(${hue} 65% 45%)`

    const svg = `<?xml version='1.0' encoding='UTF-8'?>` +
      `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>` +
      `<rect width='100%' height='100%' fill='${color}'/>` +
      `<text x='50%' y='50%' dy='.1em' font-family='Inter, Roboto, sans-serif' font-size='56' text-anchor='middle' fill='white'>${initials}</text>` +
      `</svg>`

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
    refreshUser: async () => {
      // Expondo uma pequena função para recarregar o usuário a partir do servidor.
      setLoading(true);
      try {
        await loadUser();
      } finally {
        setLoading(false);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}
