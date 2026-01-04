// Sistema de controle de acesso baseado em tipos de usuário

export interface UserPermissions {
  // Abas principais
  canAccessStudentManagement: boolean
  canAccessAcademicManagement: boolean
  canAccessFinancial: boolean
  canAccessReports: boolean
  canAccessSettings: boolean
  
  // Sub-abas financeiras
  canAccessPayments: boolean
  canAccessInvoices: boolean
  canAccessFinancialReports: boolean
  canAccessSAFT: boolean
  canAccessFinancialSettings: boolean
}

// Mapeamento de tipos de usuário para designações
export const USER_TYPE_MAPPING: Record<number, string> = {
  1: 'lidia',
  2: 'operador', 
  3: 'assistente administrativo',
  4: 'professor',
  5: 'pedagogico',
  6: 'administrador',
  7: 'chefe de secretaria'
}

// Definir permissões por tipo de usuário
export const USER_PERMISSIONS: Record<string, UserPermissions> = {
  // Administrador - Acesso total
  'administrador': {
    canAccessStudentManagement: true,
    canAccessAcademicManagement: true,
    canAccessFinancial: true,
    canAccessReports: true,
    canAccessSettings: true,
    canAccessPayments: true,
    canAccessInvoices: true,
    canAccessFinancialReports: true,
    canAccessSAFT: true,
    canAccessFinancialSettings: true,
  },
  
  // Chefe de Secretaria - Acesso total
  'chefe de secretaria': {
    canAccessStudentManagement: true,
    canAccessAcademicManagement: true,
    canAccessFinancial: true,
    canAccessReports: true,
    canAccessSettings: true,
    canAccessPayments: true,
    canAccessInvoices: true,
    canAccessFinancialReports: true,
    canAccessSAFT: true,
    canAccessFinancialSettings: true,
  },
  
  // Assistente Administrativo - Acesso limitado
  'assistente administrativo': {
    canAccessStudentManagement: true,
    canAccessAcademicManagement: true,
    canAccessFinancial: true, // Aba visível
    canAccessReports: false,
    canAccessSettings: false,
    canAccessPayments: true, // Apenas pagamentos
    canAccessInvoices: false,
    canAccessFinancialReports: false,
    canAccessSAFT: false,
    canAccessFinancialSettings: false,
  },
  
  // Lidia - Acesso limitado
  'lidia': {
    canAccessStudentManagement: true,
    canAccessAcademicManagement: true,
    canAccessFinancial: true, // Aba visível
    canAccessReports: false,
    canAccessSettings: false,
    canAccessPayments: true, // Apenas pagamentos
    canAccessInvoices: false,
    canAccessFinancialReports: false,
    canAccessSAFT: false,
    canAccessFinancialSettings: false,
  },
  
  // Operador - Acesso limitado
  'operador': {
    canAccessStudentManagement: true,
    canAccessAcademicManagement: true,
    canAccessFinancial: true, // Aba visível
    canAccessReports: false,
    canAccessSettings: false,
    canAccessPayments: true, // Apenas pagamentos
    canAccessInvoices: false,
    canAccessFinancialReports: false,
    canAccessSAFT: false,
    canAccessFinancialSettings: false,
  },
  
  // Professor - Acesso limitado
  'professor': {
    canAccessStudentManagement: true,
    canAccessAcademicManagement: true,
    canAccessFinancial: false,
    canAccessReports: false,
    canAccessSettings: false,
    canAccessPayments: false,
    canAccessInvoices: false,
    canAccessFinancialReports: false,
    canAccessSAFT: false,
    canAccessFinancialSettings: false,
  },
  
  // Pedagógico - Acesso limitado
  'pedagogico': {
    canAccessStudentManagement: true,
    canAccessAcademicManagement: true,
    canAccessFinancial: false,
    canAccessReports: false,
    canAccessSettings: false,
    canAccessPayments: false,
    canAccessInvoices: false,
    canAccessFinancialReports: false,
    canAccessSAFT: false,
    canAccessFinancialSettings: false,
  },
}

// Função para obter permissões do usuário
export function getUserPermissions(userType: number, userTypeDesignacao?: string): UserPermissions {
  // Primeiro tenta usar a designação direta
  if (userTypeDesignacao) {
    const normalizedDesignacao = userTypeDesignacao.toLowerCase()
    if (USER_PERMISSIONS[normalizedDesignacao]) {
      return USER_PERMISSIONS[normalizedDesignacao]
    }
  }
  
  // Se não encontrar, usa o mapeamento por código
  const mappedType = USER_TYPE_MAPPING[userType]
  if (mappedType && USER_PERMISSIONS[mappedType]) {
    return USER_PERMISSIONS[mappedType]
  }
  
  // Fallback: sem permissões
  return {
    canAccessStudentManagement: false,
    canAccessAcademicManagement: false,
    canAccessFinancial: false,
    canAccessReports: false,
    canAccessSettings: false,
    canAccessPayments: false,
    canAccessInvoices: false,
    canAccessFinancialReports: false,
    canAccessSAFT: false,
    canAccessFinancialSettings: false,
  }
}

// Função para verificar se o usuário pode acessar uma rota
export function canAccessRoute(path: string, permissions: UserPermissions): boolean {
  // Rotas de gestão de alunos
  if (path.startsWith('/admin/student-management')) {
    return permissions.canAccessStudentManagement
  }
  
  // Rotas de gestão acadêmica
  if (path.startsWith('/admin/academic-management') || 
      path.startsWith('/admin/discipline-management')) {
    return permissions.canAccessAcademicManagement
  }
  
  // Rotas de professores (incluído na gestão acadêmica)
  if (path.startsWith('/admin/teacher-management')) {
    return permissions.canAccessAcademicManagement
  }
  
  // Rotas de gestão financeira
  if (path.startsWith('/admin/payment-management')) {
    return permissions.canAccessPayments
  }
  
  if (path.startsWith('/admin/financial-services')) {
    return permissions.canAccessFinancialSettings
  }
  
  // Rotas financeiras
  if (path.startsWith('/admin/financeiro')) {
    if (path.includes('/pagamentos')) {
      return permissions.canAccessPayments
    }
    if (path.includes('/faturas') || path.includes('/invoices')) {
      return permissions.canAccessInvoices
    }
    if (path.includes('/saft')) {
      return permissions.canAccessSAFT
    }
    if (path.includes('/relatorios-financeiros')) {
      return permissions.canAccessFinancialReports
    }
    // Para outras rotas financeiras, verificar acesso geral
    return permissions.canAccessFinancial
  }
  
  // Rotas de relatórios
  if (path.startsWith('/admin/reports-management')) {
    return permissions.canAccessReports
  }
  
  // Rotas de configurações
  if (path.startsWith('/admin/settings-management') || 
      path.startsWith('/admin/users')) {
    return permissions.canAccessSettings
  }
  
  // Dashboard sempre acessível para usuários autenticados
  if (path === '/admin' || path === '/admin/dashboard') {
    return true
  }
  
  // Por padrão, negar acesso
  return false
}

// Função para verificar se deve mostrar um item de menu
export function shouldShowMenuItem(menuPath: string, permissions: UserPermissions): boolean {
  return canAccessRoute(menuPath, permissions)
}