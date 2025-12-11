/**
 * Hook para gerenciar sites confiáveis
 */
import { useState, useEffect, useCallback } from 'react';
import { trustedSitesApi, UserTrustedSite, UserTrustedSiteStats } from '@/lib/api';
import { toast } from 'sonner';

export function useTrustedSites() {
  const [sites, setSites] = useState<UserTrustedSite[]>([]);
  const [stats, setStats] = useState<UserTrustedSiteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca sites da lista pessoal
  const fetchSites = useCallback(async (favoritesOnly = false) => {
    // Verifica se o usuário está autenticado
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await trustedSitesApi.getMyList({ 
        limit: 100,
        favorites_only: favoritesOnly 
      });
      setSites(data.items);
    } catch (err: any) {
      console.error('Erro ao buscar sites:', err);
      // Não mostra erro se for não autenticado
      if (err.status !== 401) {
        setError(err.detail || 'Erro ao carregar sites');
        toast.error('Erro ao carregar sites');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Busca estatísticas
  const fetchStats = useCallback(async () => {
    // Verifica se o usuário está autenticado
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      return;
    }

    try {
      const data = await trustedSitesApi.getMyListStats();
      setStats(data);
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  }, []);

  // Adiciona site à lista
  const addSite = useCallback(async (siteId: number, data?: {
    custom_name?: string;
    notes?: string;
    is_favorite?: boolean;
  }) => {
    try {
      await trustedSitesApi.addToMyList({
        site_id: siteId,
        ...data
      });
      await fetchSites();
      await fetchStats();
      toast.success('Site adicionado à sua lista');
      return true;
    } catch (err: any) {
      console.error('Erro ao adicionar site:', err);
      toast.error(err.detail || 'Erro ao adicionar site');
      return false;
    }
  }, [fetchSites, fetchStats]);

  // Remove site da lista
  const removeSite = useCallback(async (siteId: number) => {
    try {
      await trustedSitesApi.removeFromMyList(siteId);
      setSites(sites.filter(s => s.site_id !== siteId));
      await fetchStats();
      toast.success('Site removido da sua lista');
      return true;
    } catch (err: any) {
      console.error('Erro ao remover site:', err);
      toast.error(err.detail || 'Erro ao remover site');
      return false;
    }
  }, [sites, fetchStats]);

  // Atualiza site na lista
  const updateSite = useCallback(async (siteId: number, data: {
    custom_name?: string;
    notes?: string;
    is_favorite?: boolean;
  }) => {
    try {
      await trustedSitesApi.updateMyListSite(siteId, data);
      await fetchSites();
      await fetchStats();
      toast.success('Site atualizado');
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar site:', err);
      toast.error(err.detail || 'Erro ao atualizar site');
      return false;
    }
  }, [fetchSites, fetchStats]);

  // Toggle favorito
  const toggleFavorite = useCallback(async (siteId: number) => {
    const site = sites.find(s => s.site_id === siteId);
    if (!site) return false;

    return updateSite(siteId, {
      is_favorite: !site.is_favorite
    });
  }, [sites, updateSite]);

  // Registra clique
  const registerClick = useCallback(async (siteId: number) => {
    try {
      await trustedSitesApi.registerClick(siteId);
    } catch (err: any) {
      console.error('Erro ao registrar clique:', err);
    }
  }, []);

  // Carrega dados ao montar
  useEffect(() => {
    fetchSites();
    fetchStats();
  }, [fetchSites, fetchStats]);

  return {
    sites,
    stats,
    isLoading,
    error,
    addSite,
    removeSite,
    updateSite,
    toggleFavorite,
    registerClick,
    refresh: fetchSites,
  };
}
