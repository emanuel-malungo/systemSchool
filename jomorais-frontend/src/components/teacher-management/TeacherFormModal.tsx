import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X, Info } from 'lucide-react'
import type { IDocente, IDocenteInput } from '../../types/teacher.types'
import { useEspecialidades } from '../../hooks/useTeacher'
import { mockStatus } from '../../mocks/status.mock'
import Button from '../common/Button'
import Input from '../common/Input'

interface TeacherFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: IDocenteInput) => void
  teacher: IDocente | null
  isLoading: boolean
}

// Schema de validação
const validationSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório').min(3, 'Mínimo 3 caracteres'),
  email: yup.string().required('Email é obrigatório').email('Email inválido'),
  contacto: yup.string().required('Contacto é obrigatório').min(9, 'Mínimo 9 caracteres'),
  codigo_Especialidade: yup.number().required('Especialidade é obrigatória').positive('Selecione uma especialidade'),
  status: yup.number().required('Status é obrigatório').positive('Selecione um status'),
})

type FormData = IDocenteInput

export default function TeacherFormModal({
  isOpen,
  onClose,
  onSubmit,
  teacher,
  isLoading,
}: TeacherFormModalProps) {
  const isEditMode = !!teacher

  // Buscar especialidades
  const { data: especialidadesData, isLoading: isLoadingEspecialidades } = useEspecialidades()
  const especialidades = especialidadesData?.data || []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      nome: '',
      email: '',
      contacto: '',
      codigo_Especialidade: 0,
      status: 1,
    },
  })

  // Preenche o formulário quando está em modo de edição
  useEffect(() => {
    if (teacher && isOpen) {
      reset({
        nome: teacher.nome,
        email: teacher.email,
        contacto: teacher.contacto,
        codigo_Especialidade: teacher.codigo_Especialidade,
        status: teacher.status,
      })
    } else if (!isOpen) {
      reset({
        nome: '',
        email: '',
        contacto: '',
        codigo_Especialidade: 0,
        status: 1,
      })
    }
  }, [teacher, isOpen, reset])

  const onSubmitForm = (data: FormData) => {
    onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={isLoading ? undefined : onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar Professor' : 'Novo Professor'}
            </h2>
            <button 
              onClick={onClose} 
              disabled={isLoading} 
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Fechar modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-6">
            {/* Nome */}
            <div>
              <Input
                {...register('nome')}
                label="Nome Completo"
                placeholder="Ex: João Silva"
                error={errors.nome?.message}
                required
                disabled={isLoading}
              />
            </div>

            {/* Grid com 2 colunas */}
            <div className="grid grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <Input
                  {...register('email')}
                  type="email"
                  label="Email"
                  placeholder="professor@escola.com"
                  error={errors.email?.message}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Contacto */}
              <div>
                <Input
                  {...register('contacto')}
                  label="Contacto"
                  placeholder="923456789"
                  error={errors.contacto?.message}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Grid com 2 colunas */}
            <div className="grid grid-cols-2 gap-6">
              {/* Especialidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidade <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('codigo_Especialidade', { valueAsNumber: true })}
                  disabled={isLoading || isLoadingEspecialidades}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                    errors.codigo_Especialidade ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  } ${isLoading || isLoadingEspecialidades ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value={0}>Selecione a especialidade</option>
                  {especialidades.map((esp) => (
                    <option key={esp.codigo} value={esp.codigo}>
                      {esp.designacao}
                    </option>
                  ))}
                </select>
                {errors.codigo_Especialidade && (
                  <p className="mt-1 text-sm text-red-500">{errors.codigo_Especialidade.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status', { valueAsNumber: true })}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                    errors.status ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value={0}>Selecione o status</option>
                  {mockStatus.map((status) => (
                    <option key={status.codigo} value={status.codigo}>
                      {status.designacao}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Informações Importantes
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• O email será usado para login no sistema</li>
                    <li>• A especialidade define as disciplinas que pode lecionar</li>
                    <li>• Professores inativos não podem ser atribuídos a turmas</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={isLoading} className="bg-[#007C00] hover:bg-[#005a00]">
                {isEditMode ? 'Atualizar' : 'Criar'} Professor
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
