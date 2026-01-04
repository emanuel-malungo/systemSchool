import * as yup from 'yup'

// Validação para criar usuário legado
export const createLegacyUserSchema = yup.object({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  user: yup
    .string()
    .required('Nome de usuário é obrigatório')
    .min(3, 'Nome de usuário deve ter no mínimo 3 caracteres')
    .max(50, 'Nome de usuário deve ter no máximo 50 caracteres')
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      'Nome de usuário deve conter apenas letras, números, _ ou -'
    )
    .trim(),
  
  passe: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  
  codigo_Tipo_Utilizador: yup
    .number()
    .required('Tipo de usuário é obrigatório')
    .positive('Tipo de usuário inválido')
    .integer('Tipo de usuário inválido'),
  
  estadoActual: yup
    .string()
    .oneOf(['ATIVO', 'INATIVO'], 'Estado deve ser ATIVO ou INATIVO')
    .default('ATIVO')
}).required()

// Validação para atualizar usuário legado
export const updateLegacyUserSchema = yup.object({
  nome: yup
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  user: yup
    .string()
    .min(3, 'Nome de usuário deve ter no mínimo 3 caracteres')
    .max(50, 'Nome de usuário deve ter no máximo 50 caracteres')
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      'Nome de usuário deve conter apenas letras, números, _ ou -'
    )
    .trim(),
  
  passe: yup
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  
  codigo_Tipo_Utilizador: yup
    .number()
    .positive('Tipo de usuário inválido')
    .integer('Tipo de usuário inválido'),
  
  estadoActual: yup
    .string()
    .oneOf(['ATIVO', 'INATIVO'], 'Estado deve ser ATIVO ou INATIVO')
})

// Validação para filtros de busca
export const userFiltersSchema = yup.object({
  search: yup
    .string()
    .trim()
    .max(100, 'Busca deve ter no máximo 100 caracteres'),
  
  estadoActual: yup
    .string()
    .oneOf(['ATIVO', 'INATIVO'], 'Estado deve ser ATIVO ou INATIVO'),
  
  codigo_Tipo_Utilizador: yup
    .number()
    .positive('Tipo de usuário inválido')
    .integer('Tipo de usuário inválido')
})

// Validação para paginação
export const paginationSchema = yup.object({
  page: yup
    .number()
    .positive('Página deve ser um número positivo')
    .integer('Página deve ser um número inteiro')
    .default(1),
  
  limit: yup
    .number()
    .positive('Limite deve ser um número positivo')
    .integer('Limite deve ser um número inteiro')
    .min(1, 'Limite mínimo é 1')
    .max(100, 'Limite máximo é 100')
    .default(10)
})

// Tipos inferidos dos schemas (útil para TypeScript)
export type CreateLegacyUserInput = yup.InferType<typeof createLegacyUserSchema>
export type UpdateLegacyUserInput = yup.InferType<typeof updateLegacyUserSchema>
export type UserFiltersInput = yup.InferType<typeof userFiltersSchema>
export type PaginationInput = yup.InferType<typeof paginationSchema>
