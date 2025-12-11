/**
 * Hook para gerenciar notificações
 */
import { useState, useEffect, useCallback } from 'react';
import { notificationsApi, Notification } from '@/lib/api';
import { toast } from 'sonner';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca notificações
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    // Verifica se o usuário está autenticado
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await notificationsApi.getAll(0, 50, unreadOnly);
      setNotifications(response.items);
      setUnreadCount(response.unread_count);
    } catch (err: any) {
      console.error('Erro ao buscar notificações:', err);
      // Não mostra erro se for não autenticado
      if (err.status !== 401) {
        setError(err.detail || 'Erro ao carregar notificações');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Busca contador de não lidas
  const fetchUnreadCount = useCallback(async () => {
    // Verifica se o usuário está autenticado
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      return;
    }

    try {
      const response = await notificationsApi.getUnreadCount();
      setUnreadCount(response.unread_count);
    } catch (err: any) {
      // Não mostra erro se for não autenticado
      if (err.status !== 401) {
        console.error('Erro ao buscar contador:', err);
      }
    }
  }, []);

  // Marca notificações como lidas
  const markAsRead = useCallback(async (notificationIds: number[]) => {
    try {
      await notificationsApi.markAsRead(notificationIds);
      // Atualiza estado local
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      toast.success('Notificações marcadas como lidas');
    } catch (err: any) {
      console.error('Erro ao marcar como lida:', err);
      toast.error('Erro ao marcar notificações');
    }
  }, []);

  // Marca todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success(response.message);
    } catch (err: any) {
      console.error('Erro ao marcar todas como lidas:', err);
      toast.error('Erro ao marcar todas as notificações');
    }
  }, []);

  // Deleta notificação
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationsApi.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notificação removida');
    } catch (err: any) {
      console.error('Erro ao deletar notificação:', err);
      toast.error('Erro ao remover notificação');
    }
  }, []);

  // Carrega notificações ao montar
  useEffect(() => {
    fetchNotifications();
    
    // Atualiza contador a cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
}
