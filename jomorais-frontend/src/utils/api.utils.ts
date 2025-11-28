import axios from 'axios';
import { getToken, removeToken } from './token.utils';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.exemplo.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag para evitar múltiplos toasts de logout
let isLoggingOut = false;

// Função para fazer logout automático
const handleAutoLogout = () => {
  if (isLoggingOut) return;
  
  isLoggingOut = true;
  
  // Limpar dados de autenticação
  removeToken();
  localStorage.removeItem('user');
  
  // Mostrar mensagem ao usuário
  toast.error('Sessão expirada. Por favor, faça login novamente.', {
    autoClose: 5000,
    toastId: 'session-expired' // Evita duplicatas
  });
  
  // Redirecionar para página de login após um pequeno delay
  setTimeout(() => {
    window.location.href = '/auth';
    isLoggingOut = false;
  }, 1000);
};

// Intercepta requisições
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepta respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || '';
    
    // Token inválido ou expirado (401 ou 403)
    if (status === 401 || status === 403) {
      // Verificar se é erro de token
      const isTokenError = 
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('expirado') ||
        errorMessage.toLowerCase().includes('expired') ||
        errorMessage.toLowerCase().includes('inválido') ||
        errorMessage.toLowerCase().includes('invalid') ||
        error.response?.data?.code === 'APP_ERROR';
      
      if (isTokenError) {
        console.error('🔐 Token inválido ou expirado detectado:', errorMessage);
        handleAutoLogout();
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;