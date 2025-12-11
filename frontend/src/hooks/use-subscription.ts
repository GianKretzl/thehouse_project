/**
 * Hook para gerenciar assinatura e planos
 */
import { useState, useEffect, useCallback } from 'react';
import { subscriptionsApi, SubscriptionInfo } from '@/lib/api';
import { toast } from 'sonner';

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca informações da assinatura atual
  const fetchSubscription = useCallback(async () => {
    // Verifica se o usuário está autenticado
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await subscriptionsApi.getCurrent();
      setSubscription(data);
    } catch (err: any) {
      console.error('Erro ao buscar assinatura:', err);
      // Não mostra erro se for não autenticado
      if (err.status !== 401) {
        setError(err.detail || 'Erro ao carregar assinatura');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Busca informações de todos os planos
  const fetchPlans = useCallback(async () => {
    try {
      const data = await subscriptionsApi.getPlans();
      setPlans(data);
    } catch (err: any) {
      console.error('Erro ao buscar planos:', err);
    }
  }, []);

  // Busca histórico de assinaturas
  const fetchHistory = useCallback(async () => {
    try {
      const data = await subscriptionsApi.getHistory();
      setHistory(data.items || []);
    } catch (err: any) {
      console.error('Erro ao buscar histórico:', err);
    }
  }, []);

  // Muda o plano
  const changePlan = useCallback(async (newPlan: 'free' | 'family' | 'premium') => {
    try {
      const response = await subscriptionsApi.changePlan(newPlan);
      toast.success(response.message);
      await fetchSubscription(); // Recarrega informações
      return true;
    } catch (err: any) {
      console.error('Erro ao mudar plano:', err);
      toast.error(err.detail || 'Erro ao mudar plano');
      return false;
    }
  }, [fetchSubscription]);

  // Cancela assinatura
  const cancelSubscription = useCallback(async (immediate = false, reason?: string) => {
    try {
      const response = await subscriptionsApi.cancel(immediate, reason);
      toast.success(response.message);
      await fetchSubscription(); // Recarrega informações
      return true;
    } catch (err: any) {
      console.error('Erro ao cancelar assinatura:', err);
      toast.error(err.detail || 'Erro ao cancelar assinatura');
      return false;
    }
  }, [fetchSubscription]);

  // Helpers para verificar status
  const isPremium = subscription?.plan_type === 'premium';
  const isFamily = subscription?.plan_type === 'family';
  const isFree = subscription?.plan_type === 'free';
  const hasUnlimitedVerifications = subscription?.monthly_verifications_limit === -1;
  
  // Calcula porcentagem de uso
  const usagePercentage = subscription && !hasUnlimitedVerifications
    ? Math.round((subscription.monthly_verifications_used / (subscription.monthly_verifications_limit || 1)) * 100)
    : 0;

  // Verifica se está próximo do limite
  const isNearLimit = usagePercentage >= 80 && !hasUnlimitedVerifications;
  const hasReachedLimit = subscription?.verifications_remaining === 0 && !hasUnlimitedVerifications;

  // Carrega dados ao montar
  useEffect(() => {
    fetchSubscription();
    fetchPlans();
    fetchHistory();
  }, [fetchSubscription, fetchPlans, fetchHistory]);

  return {
    subscription,
    plans,
    history,
    isLoading,
    error,
    isPremium,
    isFamily,
    isFree,
    hasUnlimitedVerifications,
    usagePercentage,
    isNearLimit,
    hasReachedLimit,
    changePlan,
    cancelSubscription,
    refresh: fetchSubscription,
  };
}
