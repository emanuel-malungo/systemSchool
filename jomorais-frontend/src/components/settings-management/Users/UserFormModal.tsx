import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import type { LegacyUser, CreateLegacyUserDTO, UpdateLegacyUserDTO } from '../../../types/users.types'
import { commonUserAccessTypes } from '../../../mocks/userAccessTypes.mock'
import { commonStatus } from '../../../mocks/status.mock'
import Button from '../../common/Button'
import Input from '../../common/Input'

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  user: LegacyUser | null
  onSubmit: (data: CreateLegacyUserDTO | UpdateLegacyUserDTO) => void
  isSubmitting: boolean
}

// Schema de validação dinâmico baseado se está editando ou criando
const createValidationSchema = (isEditing: boolean) => {
  const baseSchema = {
    nome: yup.string().required('Nome é obrigatório'),
    user: yup.string().required('Nome de usuário é obrigatório'),
    codigo_Tipo_Utilizador: yup.number().required('Tipo de usuário é obrigatório'),
    codigoStatus: yup.number().required('Status é obrigatório'),
  }

  if (isEditing) {
    return yup.object({
      ...baseSchema,
      passe: yup.string().optional(),
    })
  }

  return yup.object({
    ...baseSchema,
    passe: yup.string().required('Senha é obrigatória'),
  })
}

type FormData = {
  nome: string
  user: string
  passe: string
  codigo_Tipo_Utilizador: number
  codigoStatus: number
}

export default function UserFormModal({
  isOpen,
  onClose,
  user,
  onSubmit,
  isSubmitting,
}: UserFormModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isEditing = !!user

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(createValidationSchema(isEditing)) as any,
    defaultValues: {
      nome: '',
      user: '',
      passe: '',
      codigo_Tipo_Utilizador: 6,
      codigoStatus: 1,
    },
  })

  // Resetar form quando modal abrir ou usuário mudar
  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          nome: user.nome,
          user: user.user,
          passe: '',
          codigo_Tipo_Utilizador: user.codigo_Tipo_Utilizador,
          codigoStatus: user.codigoStatus || 1,
        })
      } else {
        reset({
          nome: '',
          user: '',
          passe: '',
          codigo_Tipo_Utilizador: 6,
          codigoStatus: 1,
        })
      }
      setShowPassword(false)
    }
  }, [user, isOpen, reset])

  const onSubmitForm = (data: FormData) => {
    if (isEditing) {
      // Atualização - não envia senha se estiver vazia
      const updateData: UpdateLegacyUserDTO = {
        nome: data.nome,
        user: data.user,
        codigo_Tipo_Utilizador: data.codigo_Tipo_Utilizador,
        codigoStatus: data.codigoStatus,
      }
      if (data.passe) {
        updateData.passe = data.passe
      }
      onSubmit(updateData)
    } else {
      // Criação - envia todos os dados
      const createData: CreateLegacyUserDTO = {
        nome: data.nome,
        user: data.user,
        passe: data.passe,
        codigo_Tipo_Utilizador: data.codigo_Tipo_Utilizador,
        codigoStatus: data.codigoStatus,
      }
      onSubmit(createData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/20 transition-opacity"
          onClick={isSubmitting ? undefined : onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {user ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
              aria-label="Fechar modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {/* Nome */}
            <Controller
              name="nome"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Nome Completo"
                  placeholder="Digite o nome completo"
                  error={errors.nome?.message}
                  disabled={isSubmitting}
                  required
                />
              )}
            />

            {/* Usuário */}
            <Controller
              name="user"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Nome de Usuário"
                  placeholder="Digite o nome de usuário"
                  error={errors.user?.message}
                  disabled={isSubmitting}
                  required
                />
              )}
            />

            {/* Senha */}
            <Controller
              name="passe"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type={showPassword ? 'text' : 'password'}
                  label="Senha"
                  placeholder={isEditing ? 'Deixe vazio para não alterar' : 'Digite a senha'}
                  error={errors.passe?.message}
                  disabled={isSubmitting}
                  required={!isEditing}
                  showPasswordToggle={true}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />
              )}
            />

            {/* Tipo de Usuário */}
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Usuário <span className="text-red-500">*</span>
              </label>
              <Controller
                name="codigo_Tipo_Utilizador"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="tipo"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] ${
                      errors.codigo_Tipo_Utilizador ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione um tipo</option>
                    {commonUserAccessTypes.map((type) => (
                      <option key={type.codigo} value={type.codigo}>
                        {type.designacao}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.codigo_Tipo_Utilizador && (
                <p className="mt-1 text-sm text-red-600">{errors.codigo_Tipo_Utilizador.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="codigoStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <Controller
                name="codigoStatus"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="codigoStatus"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] ${
                      errors.codigoStatus ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione um status</option>
                    {commonStatus.map((status) => (
                      <option key={status.codigo} value={status.codigo}>
                        {status.designacao}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.codigoStatus && (
                <p className="mt-1 text-sm text-red-600">{errors.codigoStatus.message}</p>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                className="flex-1"
                loading={isSubmitting}
              >
                {isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
