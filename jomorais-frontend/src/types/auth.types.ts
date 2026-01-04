// Interfaces para autenticação

// ===============================
// SISTEMA LEGADO
// ===============================

export interface LegacyLoginCredentials {
    user: string;
    passe: string;
}

export interface LegacyRegisterData {
    nome: string;
    user: string;
    passe: string;
    codigo_Tipo_Utilizador: number;
    estadoActual: string;
}

export interface LegacyUser {
    id: number;
    nome: string;
    username: string;
    tipo: number;
    tipoDesignacao: string;
    estadoActual: string;
    dataCadastro: string;
    loginStatus?: string;
    legacy: true;
}

// ===============================
// SISTEMA MODERNO
// ===============================

export interface ModernLoginCredentials {
    login: string;
    password: string;
}

export interface ModernRegisterData {
    name: string;
    email: string;
    password: string;
    tipo?: number;
    username?: string;
}

export interface ModernUser {
    id: string;
    name: string;
    username: string;
    email: string;
    tipo: number;
    foto?: string;
    created_at: string;
    updated_at: string;
}

// ===============================
// RESPOSTA DA API
// ===============================

export interface AuthResponse<T = Record<string, unknown>> {
    success: boolean;
    message: string;
    data?: T;
}

export interface LoginResponse {
    user: LegacyUser | ModernUser;
    token: string;
}

export interface UserType {
    codigo: number;
    designacao: string;
}