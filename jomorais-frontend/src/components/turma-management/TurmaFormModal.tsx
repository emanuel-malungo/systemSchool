import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { ITurma, ITurmaInput } from '../../types/turma.types'
import { useAnosLectivos } from '../../hooks/useAnoLectivo'
import { useClasses } from '../../hooks/useClass'
import { useCourses } from '../../hooks/useCourse'
import { useRoomsComplete } from '../../hooks/useRoom'
import { mockPeriods } from '../../mocks/periods.mock'
import Button from '../common/Button'
import Input from '../common/Input'

interface TurmaFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ITurmaInput) => void
  turma?: ITurma | null
  isLoading: boolean
}

export default function TurmaFormModal({
  isOpen,
  onClose,
  onSubmit,
  turma,
  isLoading,
}: TurmaFormModalProps) {
  const isEditMode = !!turma
  
  // Usar hooks para buscar dados
  const { data: classesData, isLoading: isLoadingClasses } = useClasses()
  const { data: cursosData, isLoading: isLoadingCursos } = useCourses()
  const { data: salasData, isLoading: isLoadingSalas } = useRoomsComplete()
  const { data: anosLectivosData } = useAnosLectivos()
  
  const classes = classesData?.data || []
  const cursos = cursosData?.data || []
  const salas = salasData?.data || []
  const anosLectivos = anosLectivosData?.data || []
  
  // Usar mock de períodos
  const periodos = mockPeriods
  
  const isLoadingOptions = isLoadingClasses || isLoadingCursos || isLoadingSalas

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ITurmaInput>()

  // Preenche o formulário quando está em modo de edição
  useEffect(() => {
    if (turma && isOpen) {
      setValue('designacao', turma.designacao)
      setValue('codigo_Classe', turma.codigo_Classe)
      setValue('codigo_Curso', turma.codigo_Curso)
      setValue('codigo_Sala', turma.codigo_Sala)
      setValue('codigo_Periodo', turma.codigo_Periodo)
      setValue('codigo_AnoLectivo', turma.codigo_AnoLectivo)
      setValue('max_Alunos', turma.max_Alunos)
    } else if (!isOpen) {
      reset()
    }
  }, [turma, isOpen, setValue, reset])

  const handleFormSubmit = (data: ITurmaInput) => {
    // Adicionar status padrão
    const turmaData = {
      ...data,
      status: 'Ativo' // Valor padrão
    }
    onSubmit(turmaData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/20 transition-opacity"
          onClick={isLoading ? undefined : onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar Turma' : 'Nova Turma'}
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Designação da Turma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designação da Turma <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Turma A, Turma B, etc."
                  {...register('designacao', {
                    required: 'Designação é obrigatória',
                    minLength: { value: 2, message: 'Mínimo de 2 caracteres' },
                  })}
                  error={errors.designacao?.message}
                  disabled={isLoading}
                />
              </div>

              {/* Grid com 2 colunas */}
              <div className="grid grid-cols-2 gap-6">
                {/* Classe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classe <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('codigo_Classe', {
                      required: 'Classe é obrigatória',
                      valueAsNumber: true,
                    })}
                    disabled={isLoading || isLoadingOptions}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                      errors.codigo_Classe
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    } ${isLoading || isLoadingOptions ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  >
                    <option value="">Selecione a classe</option>
                    {isLoadingOptions ? (
                      <option disabled>Carregando...</option>
                    ) : (
                      classes.map((classe) => (
                        <option key={classe.codigo} value={classe.codigo}>
                          {classe.designacao}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.codigo_Classe && (
                    <p className="mt-1 text-sm text-red-500">{errors.codigo_Classe.message}</p>
                  )}
                </div>

                {/* Curso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Curso <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('codigo_Curso', {
                      required: 'Curso é obrigatório',
                      valueAsNumber: true,
                    })}
                    disabled={isLoading || isLoadingOptions}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                      errors.codigo_Curso
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    } ${isLoading || isLoadingOptions ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  >
                    <option value="">Selecione o curso</option>
                    {isLoadingOptions ? (
                      <option disabled>Carregando...</option>
                    ) : (
                      cursos.map((curso) => (
                        <option key={curso.codigo} value={curso.codigo}>
                          {curso.designacao}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.codigo_Curso && (
                    <p className="mt-1 text-sm text-red-500">{errors.codigo_Curso.message}</p>
                  )}
                </div>
              </div>

              {/* Grid com 2 colunas */}
              <div className="grid grid-cols-2 gap-6">
                {/* Sala */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sala <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('codigo_Sala', {
                      required: 'Sala é obrigatória',
                      valueAsNumber: true,
                    })}
                    disabled={isLoading || isLoadingOptions}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                      errors.codigo_Sala
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    } ${isLoading || isLoadingOptions ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  >
                    <option value="">Selecione a sala</option>
                    {isLoadingOptions ? (
                      <option disabled>Carregando...</option>
                    ) : (
                      salas.map((sala) => (
                        <option key={sala.codigo} value={sala.codigo}>
                          {sala.designacao}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.codigo_Sala && (
                    <p className="mt-1 text-sm text-red-500">{errors.codigo_Sala.message}</p>
                  )}
                </div>

                {/* Período */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('codigo_Periodo', {
                      required: 'Período é obrigatório',
                      valueAsNumber: true,
                    })}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                      errors.codigo_Periodo
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  >
                    <option value="">Selecione o período</option>
                    {periodos.map((periodo) => (
                      <option key={periodo.codigo} value={periodo.codigo}>
                        {periodo.designacao}
                      </option>
                    ))}
                  </select>
                  {errors.codigo_Periodo && (
                    <p className="mt-1 text-sm text-red-500">{errors.codigo_Periodo.message}</p>
                  )}
                </div>
              </div>

              {/* Grid com 2 colunas */}
              <div className="grid grid-cols-2 gap-6">
                {/* Ano Letivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ano Letivo <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('codigo_AnoLectivo', {
                      required: 'Ano letivo é obrigatório',
                      valueAsNumber: true,
                    })}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                      errors.codigo_AnoLectivo
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  >
                    <option value="">Selecione o ano letivo</option>
                    {anosLectivos.map((anoLectivo) => (
                      <option key={anoLectivo.codigo} value={anoLectivo.codigo}>
                        {anoLectivo.designacao}
                      </option>
                    ))}
                  </select>
                  {errors.codigo_AnoLectivo && (
                    <p className="mt-1 text-sm text-red-500">{errors.codigo_AnoLectivo.message}</p>
                  )}
                </div>

                {/* Capacidade Máxima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidade Máxima de Alunos <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 30"
                    {...register('max_Alunos', {
                      required: 'Capacidade máxima é obrigatória',
                      valueAsNumber: true,
                      min: { value: 1, message: 'Mínimo de 1 aluno' },
                    })}
                    error={errors.max_Alunos?.message}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Informações Importantes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  ℹ️ Informações Importantes
                </h4>
                <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                  <li>A designação da turma deve ser única</li>
                  <li>Certifique-se de que a sala está disponível para o período selecionado</li>
                  <li>Todos os campos são obrigatórios para criar uma turma</li>
                </ul>
              </div>
            </div>
          </form>

          {/* Footer com Ações */}
          <div className="flex gap-3 p-6 border-t border-gray-200 shrink-0">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(handleFormSubmit)}
              disabled={isLoading || isLoadingOptions}
              loading={isLoading}
              variant="primary"
              className="flex-1 bg-[#007C00] hover:bg-[#005a00]"
            >
              {isEditMode ? 'Atualizar Turma' : 'Criar Turma'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
