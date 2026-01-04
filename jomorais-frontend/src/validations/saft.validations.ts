import * as yup from 'yup'
import type { ISAFTExportConfig } from '../types/saft.types'

// Validação para configuração básica de exportação SAFT
export const saftExportConfigSchema = yup.object({
  startDate: yup
    .string()
    .required('Data de início é obrigatória')
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      'Data deve estar no formato YYYY-MM-DD'
    )
    .test(
      'is-valid-date',
      'Data de início inválida',
      (value) => {
        if (!value) return false
        const date = new Date(value)
        return date instanceof Date && !isNaN(date.getTime())
      }
    ),

  endDate: yup
    .string()
    .required('Data de fim é obrigatória')
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      'Data deve estar no formato YYYY-MM-DD'
    )
    .test(
      'is-valid-date',
      'Data de fim inválida',
      (value) => {
        if (!value) return false
        const date = new Date(value)
        return date instanceof Date && !isNaN(date.getTime())
      }
    )
    .test(
      'is-after-start-date',
      'Data de fim deve ser posterior à data de início',
      function (value) {
        const { startDate } = this.parent
        if (!value || !startDate) return true
        return new Date(value) >= new Date(startDate)
      }
    )
    .test(
      'max-period',
      'Período máximo permitido é de 12 meses',
      function (value) {
        const { startDate } = this.parent
        if (!value || !startDate) return true
        
        const start = new Date(startDate)
        const end = new Date(value)
        const diffInMs = end.getTime() - start.getTime()
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24)
        
        return diffInDays <= 365 // Máximo de 1 ano
      }
    ),

  includeCustomers: yup.boolean(),
  includeProducts: yup.boolean(),
  includeInvoices: yup.boolean(),
  includePayments: yup.boolean(),

  companyInfo: yup.object({
    nif: yup
      .string()
      .required('NIF da empresa é obrigatório')
      .matches(
        /^\d{9}$/,
        'NIF deve conter exatamente 9 dígitos'
      )
      .test(
        'nif-validation',
        'NIF inválido',
        (value) => {
          if (!value || value.length !== 9) return false
          
          // Validação básica de NIF angolano
          const digits = value.split('').map(Number)
          const checksum = digits.slice(0, 8).reduce((sum, digit, index) => {
            return sum + digit * (9 - index)
          }, 0)
          
          const remainder = checksum % 11
          const checkDigit = remainder < 2 ? remainder : 11 - remainder
          
          return checkDigit === digits[8]
        }
      ),

    name: yup
      .string()
      .required('Nome da empresa é obrigatório')
      .min(5, 'Nome deve ter pelo menos 5 caracteres')
      .max(200, 'Nome deve ter no máximo 200 caracteres')
      .matches(
        /^[a-zA-ZÀ-ÿ0-9\s\-\.\,]+$/,
        'Nome contém caracteres inválidos'
      ),

    address: yup
      .string()
      .required('Endereço é obrigatório')
      .min(10, 'Endereço deve ter pelo menos 10 caracteres')
      .max(200, 'Endereço deve ter no máximo 200 caracteres'),

    city: yup
      .string()
      .required('Cidade é obrigatória')
      .min(2, 'Cidade deve ter pelo menos 2 caracteres')
      .max(100, 'Cidade deve ter no máximo 100 caracteres')
      .matches(
        /^[a-zA-ZÀ-ÿ\s\-]+$/,
        'Cidade contém caracteres inválidos'
      ),

    postalCode: yup
      .string()
      .optional()
      .matches(
        /^\d{4}$/,
        'Código postal deve ter 4 dígitos'
      ),

    phone: yup
      .string()
      .optional()
      .matches(
        /^\+244\s?\d{9}$/,
        'Telefone deve estar no formato +244 XXXXXXXXX'
      ),

    email: yup
      .string()
      .optional()
      .email('Email inválido')
      .max(100, 'Email deve ter no máximo 100 caracteres')
  }).required(),

  softwareInfo: yup.object({
    name: yup
      .string()
      .required('Nome do software é obrigatório')
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),

    version: yup
      .string()
      .required('Versão do software é obrigatória')
      .matches(
        /^\d+(\.\d+)*$/,
        'Versão deve estar no formato X.X ou X.X.X'
      ),

    certificateNumber: yup
      .string()
      .required('Número do certificado é obrigatório')
      .matches(
        /^\d+$/,
        'Número do certificado deve conter apenas números'
      ),

    companyNIF: yup
      .string()
      .required('NIF da empresa do software é obrigatório')
      .matches(
        /^\d{9}$/,
        'NIF deve conter exatamente 9 dígitos'
      )
  }).required()
})

// Validação rápida para verificar se pelo menos um tipo de dados está selecionado
export const validateDataSelection = (config: Partial<ISAFTExportConfig>): boolean => {
  return !!(
    config.includeCustomers ||
    config.includeProducts ||
    config.includeInvoices ||
    config.includePayments
  )
}

// Validação para verificar se o período é válido
export const validatePeriod = (startDate: string, endDate: string): { valid: boolean; error?: string } => {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, error: 'Datas inválidas' }
    }

    if (end <= start) {
      return { valid: false, error: 'Data de fim deve ser posterior à data de início' }
    }

    const diffInMs = end.getTime() - start.getTime()
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

    if (diffInDays > 365) {
      return { valid: false, error: 'Período máximo permitido é de 12 meses' }
    }

    // Verificar se as datas não são futuras
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Fim do dia atual

    if (end > today) {
      return { valid: false, error: 'Data de fim não pode ser futura' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Erro ao validar período' }
  }
}

// Validação para NIF angolano
export const validateNIF = (nif: string): boolean => {
  if (!nif || nif.length !== 9 || !/^\d{9}$/.test(nif)) {
    return false
  }

  const digits = nif.split('').map(Number)
  const checksum = digits.slice(0, 8).reduce((sum, digit, index) => {
    return sum + digit * (9 - index)
  }, 0)

  const remainder = checksum % 11
  const checkDigit = remainder < 2 ? remainder : 11 - remainder

  return checkDigit === digits[8]
}

// Validação para campos obrigatórios antes da exportação
export const validateBeforeExport = (config: ISAFTExportConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validar período
  const periodValidation = validatePeriod(config.startDate, config.endDate)
  if (!periodValidation.valid) {
    errors.push(periodValidation.error || 'Período inválido')
  }

  // Validar seleção de dados
  if (!validateDataSelection(config)) {
    errors.push('Selecione pelo menos um tipo de dados para exportar')
  }

  // Validar informações da empresa
  if (!config.companyInfo?.nif) {
    errors.push('NIF da empresa é obrigatório')
  } else if (!validateNIF(config.companyInfo.nif)) {
    errors.push('NIF da empresa é inválido')
  }

  if (!config.companyInfo?.name || config.companyInfo.name.trim().length < 5) {
    errors.push('Nome da empresa é obrigatório e deve ter pelo menos 5 caracteres')
  }

  if (!config.companyInfo?.address || config.companyInfo.address.trim().length < 10) {
    errors.push('Endereço da empresa é obrigatório e deve ter pelo menos 10 caracteres')
  }

  if (!config.companyInfo?.city || config.companyInfo.city.trim().length < 2) {
    errors.push('Cidade da empresa é obrigatória')
  }

  // Validar informações do software
  if (!config.softwareInfo?.name || config.softwareInfo.name.trim().length < 3) {
    errors.push('Nome do software é obrigatório')
  }

  if (!config.softwareInfo?.version) {
    errors.push('Versão do software é obrigatória')
  }

  if (!config.softwareInfo?.companyNIF) {
    errors.push('NIF da empresa do software é obrigatório')
  } else if (!validateNIF(config.softwareInfo.companyNIF)) {
    errors.push('NIF da empresa do software é inválido')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Validação específica para arquivo SAFT gerado
export const validateSAFTFile = (fileContent: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  try {
    // Verificar se é um XML válido básico
    if (!fileContent.includes('<?xml') || !fileContent.includes('<AuditFile')) {
      errors.push('Arquivo não está no formato XML SAFT válido')
    }

    // Verificar se contém elementos obrigatórios
    const requiredElements = [
      '<Header>',
      '<AuditFileVersion>',
      '<CompanyID>',
      '<TaxRegistrationNumber>',
      '<CompanyName>',
      '<FiscalYear>',
      '<StartDate>',
      '<EndDate>',
      '</Header>',
      '<MasterFiles>',
      '</MasterFiles>',
      '<SourceDocuments>',
      '</SourceDocuments>',
      '</AuditFile>'
    ]

    requiredElements.forEach(element => {
      if (!fileContent.includes(element)) {
        errors.push(`Elemento obrigatório ausente: ${element}`)
      }
    })

    // Verificar tamanho mínimo
    if (fileContent.length < 1000) {
      errors.push('Arquivo SAFT parece estar incompleto (muito pequeno)')
    }

    // Verificar se contém namespace correto
    if (!fileContent.includes('xmlns="urn:OECD:StandardAuditFile-Tax:AO_1.04_01"')) {
      errors.push('Namespace SAFT-AO não encontrado')
    }

  } catch (error) {
    errors.push('Erro ao validar estrutura do arquivo SAFT')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Função utilitária para formatar mensagens de erro
export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return ''
  if (errors.length === 1) return errors[0]
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n')
}

export default {
  saftExportConfigSchema,
  validateDataSelection,
  validatePeriod,
  validateNIF,
  validateBeforeExport,
  validateSAFTFile,
  formatValidationErrors
}