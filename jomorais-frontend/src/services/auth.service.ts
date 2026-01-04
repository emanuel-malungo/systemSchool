import api from "../utils/api.utils";
import { toast } from "react-toastify";
import { setToken as saveToken, getToken, removeToken } from "../utils/token.utils";
import type {
    LegacyLoginCredentials,
    LegacyRegisterData,
    ModernLoginCredentials,
    ModernRegisterData,
    AuthResponse,
    LoginResponse,
    LegacyUser,
    ModernUser,
    UserType
} from "../types/auth.types";

export default class authService {

    static async login(credentials: LegacyLoginCredentials): Promise<AuthResponse<LoginResponse>> {
        try {
            const response = await api.post("/api/auth/legacy/login", credentials);
            
            // Salvar token e dados do usuário no localStorage
            if (response.data.success && response.data.data.token) {
                saveToken(response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                toast.success(response.data.message || 'Login realizado com sucesso!');
            }
            
            return response.data;
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao fazer login';
            toast.error(errorMessage);
            throw error;
        }
    }

    static logout(): void {
        // Limpar dados do localStorage
        removeToken();
        localStorage.removeItem('user');
        toast.info('Sessão encerrada com sucesso!');
    }

    static async getCurrentUser(): Promise<AuthResponse<LegacyUser>> {
        const response = await api.get("/api/auth/legacy/me");
        return response.data;
    }

    static async register(userData: LegacyRegisterData): Promise<AuthResponse<LegacyUser>> {
        try {
            const response = await api.post("/api/auth/legacy/register", userData);
            
            if (response.data.success) {
                toast.success(response.data.message || 'Usuário registrado com sucesso!');
            }
            
            return response.data;
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao registrar usuário';
            toast.error(errorMessage);
            throw error;
        }
    }

    // Método adicional para verificar se o usuário está autenticado
    static async isAuthenticated(): Promise<boolean> {
        try {
            await this.getCurrentUser();
            return true;
        } catch {
            return false;
        }
    }

    // Método para obter tipos de usuário
    static async getUserTypes(): Promise<AuthResponse<UserType[]>> {
        const response = await api.get("/api/auth/user-types");
        return response.data;
    }

    // ===============================
    // MÉTODOS PARA SISTEMA MODERNO
    // ===============================

    static async modernLogin(credentials: ModernLoginCredentials): Promise<AuthResponse<LoginResponse>> {
        try {
            const response = await api.post("/api/auth/login", credentials);
            
            // Salvar token e dados do usuário no localStorage
            if (response.data.success && response.data.data.token) {
                saveToken(response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                toast.success(response.data.message || 'Login realizado com sucesso!');
            }
            
            return response.data;
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao fazer login';
            toast.error(errorMessage);
            throw error;
        }
    }

    static async modernRegister(userData: ModernRegisterData): Promise<AuthResponse<ModernUser>> {
        try {
            const response = await api.post("/api/auth/register", userData);
            
            if (response.data.success) {
                toast.success(response.data.message || 'Usuário registrado com sucesso!');
            }
            
            return response.data;
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao registrar usuário';
            toast.error(errorMessage);
            throw error;
        }
    }

    static async modernGetCurrentUser(): Promise<AuthResponse<ModernUser>> {
        const response = await api.get("/api/auth/me");
        return response.data;
    }

    // ===============================
    // MÉTODOS UTILITÁRIOS
    // ===============================

    // Obter token do localStorage
    static getToken(): string | null {
        return getToken();
    }

    // Obter dados do usuário do localStorage
    static getStoredUser(): LegacyUser | ModernUser | null {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    }

    // Verificar se há token válido
    static hasValidToken(): boolean {
        const token = getToken();
        if (!token) return false;
        
        try {
            // Verificar se o token tem formato JWT válido (3 partes separadas por .)
            const parts = token.split('.');
            if (parts.length !== 3) return false;
            
            // Verificar se o token não está expirado
            const payload = JSON.parse(atob(parts[1])) as { exp: number };
            const currentTime = Date.now() / 1000;
            
            // Adicionar margem de 10 segundos para evitar race conditions
            const isValid = payload.exp > (currentTime + 10);
            
            // Se o token está para expirar ou já expirou, limpar sessão
            if (!isValid) {
                console.warn('🔐 Token expirado detectado localmente');
                this.clearSession();
            }
            
            return isValid;
        } catch (error) {
            // Se não conseguir decodificar, considerar inválido e limpar
            console.error('🔐 Erro ao validar token:', error);
            this.clearSession();
            return false;
        }
    }

    // Limpar sessão completamente
    static clearSession(): void {
        if (typeof window !== 'undefined') {
            removeToken();
            localStorage.removeItem('user');
        }
    }

}