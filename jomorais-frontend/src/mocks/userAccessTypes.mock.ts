import type { UserAccessType } from "../types/users.types";

/**
 * Mock de tipos de acesso de usuários
 * Representa os diferentes níveis de permissão no sistema
 */
export const mockUserAccessTypes: UserAccessType[] = [
  {
    codigo: 6,
    designacao: "Administrador"
  },
  {
    codigo: 7,
    designacao: "Administrador"
  },
  {
    codigo: 9,
    designacao: "Assistente Administrativo"
  },
  {
    codigo: 4,
    designacao: "Chefe de Secretaria"
  },
  {
    codigo: 1,
    designacao: "lidia"
  },
  {
    codigo: 2,
    designacao: "Operador"
  },
  {
    codigo: 3,
    designacao: "Pedagogico"
  },
  {
    codigo: 8,
    designacao: "PROFESSOR (A)"
  },
  {
    codigo: 5,
    designacao: "Tesouraria"
  }
];

/**
 * Resposta mockada da API completa
 */
export const mockUserAccessTypesResponse = {
  success: true,
  data: mockUserAccessTypes
};

/**
 * Busca um tipo de acesso pelo código
 * @param codigo - Código do tipo de acesso
 * @returns Tipo de acesso encontrado ou undefined
 */
export const getUserAccessTypeByCode = (codigo: number): UserAccessType | undefined => {
  return mockUserAccessTypes.find(type => type.codigo === codigo);
};

/**
 * Busca tipos de acesso por designação (pesquisa parcial)
 * @param searchTerm - Termo de busca
 * @returns Array de tipos de acesso que correspondem à busca
 */
export const searchUserAccessTypes = (searchTerm: string): UserAccessType[] => {
  const term = searchTerm.toLowerCase();
  return mockUserAccessTypes.filter(type => 
    type.designacao.toLowerCase().includes(term)
  );
};

/**
 * Retorna todos os tipos de acesso ordenados por designação
 * @returns Array de tipos de acesso ordenados
 */
export const getSortedUserAccessTypes = (): UserAccessType[] => {
  return [...mockUserAccessTypes].sort((a, b) => 
    a.designacao.localeCompare(b.designacao)
  );
};

/**
 * Tipos de acesso mais comuns (excluindo duplicatas e entradas inválidas)
 */
export const commonUserAccessTypes: UserAccessType[] = [
  {
    codigo: 6,
    designacao: "Administrador"
  },
  {
    codigo: 7,
    designacao: "Administrador"
  },
  {
    codigo: 9,
    designacao: "Assistente Administrativo"
  },
  {
    codigo: 4,
    designacao: "Chefe de Secretaria"
  },
  {
    codigo: 1,
    designacao: "lidia"
  },
  {
    codigo: 2,
    designacao: "Operador"
  },
  {
    codigo: 3,
    designacao: "Pedagogico"
  },
  {
    codigo: 8,
    designacao: "PROFESSOR (A)"
  },
  {
    codigo: 5,
    designacao: "Tesouraria"
  }
];
