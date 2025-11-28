/**
 * Componente para monitorar a expiração do token globalmente
 * Não renderiza nada visualmente, apenas monitora e age quando necessário
 */

import { useTokenExpiration } from '../../hooks/useTokenExpiration';

export const TokenExpirationMonitor = () => {
  // Monitorar token com configurações padrão
  useTokenExpiration({
    checkInterval: 30000,      // Verificar a cada 30 segundos
    warningTime: 300,          // Avisar 5 minutos antes de expirar
    autoLogoutTime: 60,        // Logout automático 1 minuto antes de expirar
    enableWarning: true        // Habilitar avisos
  });

  // Este componente não renderiza nada
  return null;
};

export default TokenExpirationMonitor;
