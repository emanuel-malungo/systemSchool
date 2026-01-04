/**
 * Hook para monitorar expiração de token JWT
 * Faz logout automático quando o token está prestes a expirar
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import authService from '../services/auth.service';
import { toast } from 'react-toastify';

interface UseTokenExpirationOptions {
  checkInterval?: number; // Intervalo de verificação em ms (padrão: 30s)
  warningTime?: number; // Tempo antes de expirar para mostrar aviso em segundos (padrão: 5min)
  autoLogoutTime?: number; // Tempo antes de expirar para logout automático em segundos (padrão: 1min)
  enableWarning?: boolean; // Mostrar aviso antes de expirar
}

export const useTokenExpiration = (options: UseTokenExpirationOptions = {}) => {
  const {
    checkInterval = 30000, // 30 segundos
    warningTime = 300, // 5 minutos
    autoLogoutTime = 60, // 1 minuto
    enableWarning = true
  } = options;

  const { logout, isAuthenticated } = useAuth();
  const warningShownRef = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Obtém o tempo restante do token em segundos
   */
  const getTokenTimeRemaining = useCallback((): number | null => {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1])) as { exp: number };
      const currentTime = Date.now() / 1000;
      const timeRemaining = payload.exp - currentTime;

      return timeRemaining > 0 ? timeRemaining : 0;
    } catch {
      return null;
    }
  }, []);

  /**
   * Verifica o status do token e toma ações apropriadas
   */
  const checkTokenStatus = useCallback(() => {
    if (!isAuthenticated) return;

    const timeRemaining = getTokenTimeRemaining();
    
    if (timeRemaining === null) {
      console.warn('🔐 Token inválido detectado');
      logout();
      return;
    }

    // Token expirado ou prestes a expirar (menos de 1 minuto)
    if (timeRemaining <= autoLogoutTime) {
      console.warn('🔐 Token expirado - fazendo logout automático');
      toast.error('Sua sessão expirou. Faça login novamente.', {
        toastId: 'token-expired',
        autoClose: 5000
      });
      logout();
      return;
    }

    // Mostrar aviso se o token está próximo de expirar
    if (enableWarning && timeRemaining <= warningTime && !warningShownRef.current) {
      const minutes = Math.floor(timeRemaining / 60);
      toast.warning(
        `Sua sessão expirará em ${minutes} minuto${minutes !== 1 ? 's' : ''}. Salve seu trabalho.`,
        {
          toastId: 'token-warning',
          autoClose: 10000
        }
      );
      warningShownRef.current = true;
    }

    // Resetar flag de aviso se o token foi renovado
    if (timeRemaining > warningTime && warningShownRef.current) {
      warningShownRef.current = false;
    }
  }, [isAuthenticated, getTokenTimeRemaining, logout, autoLogoutTime, warningTime, enableWarning]);

  /**
   * Inicia o monitoramento
   */
  useEffect(() => {
    if (!isAuthenticated) {
      // Limpar intervalo se não estiver autenticado
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    // Verificar imediatamente
    checkTokenStatus();

    // Configurar verificação periódica
    checkIntervalRef.current = setInterval(checkTokenStatus, checkInterval);

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, checkTokenStatus, checkInterval]);

  /**
   * Listener para mudanças de visibilidade da página
   * Verifica o token quando o usuário volta para a aba
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        console.log('🔍 Verificando token após retorno à aba...');
        checkTokenStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, checkTokenStatus]);

  /**
   * Listener para eventos de storage
   * Detecta quando o token é removido em outra aba
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token' && event.newValue === null && isAuthenticated) {
        console.warn('🔐 Token removido em outra aba - fazendo logout');
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, logout]);

  return {
    getTokenTimeRemaining,
    checkTokenStatus
  };
};

export default useTokenExpiration;
