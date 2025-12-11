/**
 * Hook para gerenciar uso mensal de verificações
 */
import { useState, useEffect, useCallback } from 'react';
import { urlsApi } from '@/lib/api';

interface UsageData {
  plan_type: string;
  monthly_limit: number | 'unlimited';
  used: number;
  remaining: number | 'unlimited';
  reset_at: string | null;
  last_verification_at: string | null;
  percentage_used: number;
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca informações de uso
  const fetchUsage = useCallback(async () => {
    // Verifica se o usuário está autenticado
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await urlsApi.getUsage();
      setUsage(data);
    } catch (err: any) {
      console.error('Erro ao buscar uso:', err);
      // Não mostra erro se for não autenticado
      if (err.status !== 401) {
        setError(err.detail || 'Erro ao carregar informações de uso');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helpers
  const isUnlimited = usage?.monthly_limit === 'unlimited';
  const isNearLimit = !isUnlimited && (usage?.percentage_used || 0) >= 80;
  const hasReachedLimit = !isUnlimited && usage?.remaining === 0;

  // Formata data de reset
  const resetDate = usage?.reset_at
    ? new Date(usage.reset_at).toLocaleDateString('pt-BR')
    : null;

  // Carrega dados ao montar
  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    usage,
    isLoading,
    error,
    isUnlimited,
    isNearLimit,
    hasReachedLimit,
    resetDate,
    refresh: fetchUsage,
  };
}
