import { X, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { IConfirmation, IConfirmationInput } from '../../types/confirmation.types'
import { useMatriculas } from '../../hooks/useMatricula'
import { useTurmas } from '../../hooks/useTurma'
import { useAnosLectivos } from '../../hooks/useAnoLectivo'
import Button from '../common/Button'
import Input from '../common/Input'
import { mockStatus } from '../../mocks/status.mock'

interface ConfirmationFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: IConfirmationInput) => void
  confirmation?: IConfirmation | null
  isLoading: boolean
}

export default function ConfirmationFormModal({
  isOpen,
  onClose,
  onSubmit,
  confirmation,
  isLoading,
}: ConfirmationFormModalProps) {
  const isEditMode = !!confirmation
  const [searchTerm, setSearchTerm] = useState('')
  const [turmaSearchTerm, setTurmaSearchTerm] = useState('')
  const [debouncedTurmaSearch, setDebouncedTurmaSearch] = useState('')
  const [selectedMatricula, setSelectedMatricula] = useState<{ 
    codigo: number
    aluno: string
    curso: string
  } | null>(null)
  const [selectedTurma, setSelectedTurma] = useState<{
    codigo: number
    designacao: string
    classe?: string
    curso?: string
  } | null>(null)
  const [showMatriculaList, setShowMatriculaList] = useState(false)
  const [showTurmaList, setShowTurmaList] = useState(false)

  // Debounce para busca de turmas
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTurmaSearch(turmaSearchTerm)
    }, 500) // Espera 500ms após parar de digitar

    return () => clearTimeout(timer)
  }, [turmaSearchTerm])

  // Buscar matrículas
  const { data: matriculasData, isLoading: isLoadingMatriculas } = useMatriculas({
    page: 1,
    limit: 50,
    search: searchTerm,
  })

  const matriculas = matriculasData?.data || []

  // Buscar turmas com debounce
  const { data: turmasData, isLoading: isLoadingTurmas } = useTurmas({
    page: 1,
    limit: 20,
    search: debouncedTurmaSearch,
  })
  const turmas = turmasData?.data || []

  // Buscar anos letivos
  const { data: anosLectivosData, isLoading: isLoadingAnosLectivos } = useAnosLectivos({
    page: 1,
    limit: 100,
  })
  const anosLectivos = anosLectivosData?.data || []

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<IConfirmationInput>({
    defaultValues: {
      codigo_Status: 1, // Status padrão: Ativo
    },
  })

  // Preenche o formulário quando está em modo de edição
  useEffect(() => {
    if (confirmation && isOpen) {
      setValue('codigo_Matricula', confirmation.codigo_Matricula)
      setValue('codigo_Turma', confirmation.codigo_Turma)
      setValue('codigo_Ano_lectivo', confirmation.codigo_Ano_lectivo)
      setValue('codigo_Status', confirmation.codigo_Status )
      setValue('classificacao', confirmation.classificacao || '')
      
      // Formata a data para o input datetime-local
      if (confirmation.data_Confirmacao && typeof confirmation.data_Confirmacao === 'string') {
        const date = new Date(confirmation.data_Confirmacao)
        const formattedDate = date.toISOString().slice(0, 16)
        setValue('data_Confirmacao', formattedDate)
      }

      // Formata mes_Comecar se existir
      if (confirmation.mes_Comecar && typeof confirmation.mes_Comecar === 'string') {
        const date = new Date(confirmation.mes_Comecar)
        const formattedDate = date.toISOString().slice(0, 16)
        setValue('mes_Comecar', formattedDate)
      }
      
      // Define a matrícula selecionada em modo de edição
      if (confirmation.tb_matriculas) {
        setSelectedMatricula({
          codigo: confirmation.codigo_Matricula,
          aluno: confirmation.tb_matriculas.tb_alunos?.nome || 'Aluno',
          curso: confirmation.tb_matriculas.tb_cursos?.designacao || 'Curso'
        })
      }

      // Define a turma selecionada em modo de edição
      if (confirmation.tb_turmas) {
        setSelectedTurma({
          codigo: confirmation.codigo_Turma,
          designacao: confirmation.tb_turmas.designacao || 'Turma',
          classe: confirmation.tb_turmas.tb_classes?.designacao,
          curso: undefined
        })
      }
    } else if (!isOpen) {
      reset()
      setSelectedMatricula(null)
      setSelectedTurma(null)
      setSearchTerm('')
      setTurmaSearchTerm('')
      setShowMatriculaList(false)
      setShowTurmaList(false)
    }
  }, [confirmation, isOpen, setValue, reset])

  // Handler para selecionar uma matrícula
  const handleSelectMatricula = (matricula: { 
    codigo: number
    aluno: string
    curso: string
  }) => {
    setSelectedMatricula(matricula)
    setValue('codigo_Matricula', matricula.codigo)
    setShowMatriculaList(false)
    setSearchTerm('')
  }

  // Handler para selecionar uma turma
  const handleSelectTurma = (turma: {
    codigo: number
    designacao: string
    classe?: string
    curso?: string
  }) => {
    setSelectedTurma(turma)
    setValue('codigo_Turma', turma.codigo)
    setShowTurmaList(false)
    setTurmaSearchTerm('')
  }

  // Fechar listas ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMatriculaList) {
        setShowMatriculaList(false)
      }
      if (showTurmaList) {
        setShowTurmaList(false)
      }
    }

    if (showMatriculaList || showTurmaList) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showMatriculaList, showTurmaList])

  const handleFormSubmit = (data: IConfirmationInput) => {
    // Converte as datas para ISO string
    const formattedData = {
      ...data,
      data_Confirmacao: new Date(data.data_Confirmacao).toISOString(),
      mes_Comecar: data.mes_Comecar ? new Date(data.mes_Comecar).toISOString() : null,
      codigo_Utilizador: 1, // TODO: Pegar do contexto de autenticação
    }
    onSubmit(formattedData)
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
              {isEditMode ? 'Editar Confirmação' : 'Nova Confirmação'}
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Fechar modal"
              title="Fechar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Seleção/Visualização da Matrícula */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matrícula <span className="text-red-500">*</span>
                </label>
                
                {isEditMode ? (
                  // Modo de edição: apenas exibe a matrícula
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                    {selectedMatricula ? (
                      <div>
                        <p className="font-medium">{selectedMatricula.aluno}</p>
                        <p className="text-sm text-gray-500">{selectedMatricula.curso}</p>
                      </div>
                    ) : (
                      'Matrícula não disponível'
                    )}
                  </div>
                ) : (
                  // Modo de criação: busca de matrícula
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar matrícula por aluno ou curso..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setShowMatriculaList(true)
                        }}
                        onFocus={() => setShowMatriculaList(true)}
                        disabled={isLoading || !!selectedMatricula}
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                          errors.codigo_Matricula
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300'
                        } ${isLoading || selectedMatricula ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                      />
                    </div>

                    {/* Matrícula Selecionada */}
                    {selectedMatricula && (
                      <div className="mt-2 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#007C00] flex items-center justify-center text-white font-bold">
                            {selectedMatricula.aluno.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedMatricula.aluno}</p>
                            <p className="text-xs text-gray-500">{selectedMatricula.curso}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMatricula(null)
                            setValue('codigo_Matricula', 0)
                            setSearchTerm('')
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Remover matrícula selecionada"
                          title="Remover"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}

                    {/* Lista de Matrículas */}
                    {showMatriculaList && searchTerm && !selectedMatricula && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoadingMatriculas ? (
                          <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#007C00] mx-auto"></div>
                            <p className="mt-2 text-sm">Buscando matrículas...</p>
                          </div>
                        ) : matriculas.length > 0 ? (
                          <ul className="py-2">
                            {matriculas.map((matricula) => (
                              <li key={matricula.codigo}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectMatricula({ 
                                    codigo: matricula.codigo,
                                    aluno: matricula.tb_alunos?.nome || 'Aluno',
                                    curso: matricula.tb_cursos?.designacao || 'Curso'
                                  })}
                                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
                                >
                                  <div className="h-10 w-10 rounded-full bg-[#007C00] flex items-center justify-center text-white font-bold shrink-0">
                                    {matricula.tb_alunos?.nome?.charAt(0).toUpperCase() || 'A'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {matricula.tb_alunos?.nome || 'Nome não disponível'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {matricula.tb_cursos?.designacao || 'Curso não disponível'}
                                    </p>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <p className="text-sm">Nenhuma matrícula encontrada</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Campo hidden para o código da matrícula */}
                    <input
                      type="hidden"
                      {...register('codigo_Matricula', {
                        required: 'Selecione uma matrícula',
                        min: { value: 1, message: 'Selecione uma matrícula válida' },
                      })}
                    />
                    {errors.codigo_Matricula && !selectedMatricula && (
                      <p className="mt-1 text-sm text-red-500">{errors.codigo_Matricula.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Seleção de Turma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turma <span className="text-red-500">*</span>
                </label>
                
                {isEditMode ? (
                  // Modo de edição: apenas exibe a turma
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                    {selectedTurma ? (
                      <div>
                        <p className="font-medium">{selectedTurma.designacao}</p>
                        <p className="text-sm text-gray-500">
                          {selectedTurma.classe && `${selectedTurma.classe} - `}
                          {selectedTurma.curso || 'Curso não disponível'}
                        </p>
                      </div>
                    ) : (
                      'Turma não disponível'
                    )}
                  </div>
                ) : (
                  // Modo de criação: busca de turma
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar turma..."
                        value={turmaSearchTerm}
                        onChange={(e) => {
                          setTurmaSearchTerm(e.target.value)
                          setShowTurmaList(true)
                        }}
                        onFocus={() => setShowTurmaList(true)}
                        disabled={isLoading || !!selectedTurma}
                        className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                          errors.codigo_Turma
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300'
                        } ${isLoading || selectedTurma ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                      />
                      {/* Loading indicator quando está digitando */}
                      {(isLoadingTurmas || (turmaSearchTerm !== debouncedTurmaSearch && turmaSearchTerm.length > 0)) && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-[#007C00] border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Turma Selecionada */}
                    {selectedTurma && (
                      <div className="mt-2 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedTurma.designacao}</p>
                          <p className="text-xs text-gray-500">
                            {selectedTurma.classe && `${selectedTurma.classe} - `}
                            {selectedTurma.curso || 'Curso não disponível'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTurma(null)
                            setValue('codigo_Turma', 0)
                            setTurmaSearchTerm('')
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Remover turma selecionada"
                          title="Remover"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}

                    {/* Lista de Turmas */}
                    {showTurmaList && !selectedTurma && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoadingTurmas ? (
                          <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#007C00] mx-auto"></div>
                            <p className="mt-2 text-sm">Buscando turmas...</p>
                          </div>
                        ) : turmas.length > 0 ? (
                          <ul className="py-2">
                            {turmas.map((turma) => (
                              <li key={turma.codigo}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectTurma({
                                    codigo: turma.codigo,
                                    designacao: turma.designacao,
                                    classe: turma.tb_classes?.designacao,
                                    curso: turma.tb_cursos?.designacao
                                  })}
                                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                                >
                                  <p className="text-sm font-medium text-gray-900">
                                    {turma.designacao}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {turma.tb_classes?.designacao && `${turma.tb_classes.designacao} - `}
                                    {turma.tb_cursos?.designacao || 'Curso não disponível'}
                                  </p>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <p className="text-sm">Nenhuma turma encontrada</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Campo hidden para o código da turma */}
                    <input
                      type="hidden"
                      {...register('codigo_Turma', {
                        required: 'Selecione uma turma',
                        min: { value: 1, message: 'Selecione uma turma válida' },
                      })}
                    />
                    {errors.codigo_Turma && !selectedTurma && (
                      <p className="mt-1 text-sm text-red-500">{errors.codigo_Turma.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Seleção de Ano Letivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano Letivo <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('codigo_Ano_lectivo', {
                    required: 'Ano letivo é obrigatório',
                    valueAsNumber: true,
                  })}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                    errors.codigo_Ano_lectivo
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value="">Selecione o ano letivo</option>
                  {isLoadingAnosLectivos ? (
                    <option disabled>Carregando...</option>
                  ) : (
                    anosLectivos.map((anoLectivo) => (
                      <option key={anoLectivo.codigo} value={anoLectivo.codigo}>
                        {anoLectivo.designacao}
                      </option>
                    ))
                  )}
                </select>
                {errors.codigo_Ano_lectivo && (
                  <p className="mt-1 text-sm text-red-500">{errors.codigo_Ano_lectivo.message}</p>
                )}
              </div>

              {/* Data da Confirmação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Confirmação <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  {...register('data_Confirmacao', {
                    required: 'Data da confirmação é obrigatória',
                  })}
                  error={errors.data_Confirmacao?.message}
                  disabled={isLoading}
                />
              </div>

              {/* Mês para Começar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mês para Começar
                </label>
                <Input
                  type="datetime-local"
                  {...register('mes_Comecar')}
                  error={errors.mes_Comecar?.message}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Data prevista para início das aulas (opcional)
                </p>
              </div>

              {/* Grid com 2 colunas */}
              <div className="grid grid-cols-2 gap-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('codigo_Status', {
                      required: 'Status é obrigatório',
                      valueAsNumber: true,
                    })}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                      errors.codigo_Status
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    aria-label="Selecionar status"
                  >
                    <option value="">Selecione o status</option>
                    {mockStatus.map((status) => (
                      <option key={status.codigo} value={status.codigo}>
                        {status.designacao}
                      </option>
                    ))}
                  </select>
                  {errors.codigo_Status && (
                    <p className="mt-1 text-sm text-red-500">{errors.codigo_Status.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Status da confirmação do aluno
                  </p>
                </div>

                {/* Classificação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classificação
                  </label>
                  <select
                    {...register('classificacao')}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                      errors.classificacao
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    aria-label="Selecionar classificação"
                  >
                    <option value="">Selecione a classificação</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Reprovado">Reprovado</option>
                  </select>
                  {errors.classificacao && (
                    <p className="mt-1 text-sm text-red-500">{errors.classificacao.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Classificação do aluno (opcional)
                  </p>
                </div>
              </div>

              {/* Informações Importantes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  ℹ️ Informações Importantes
                </h4>
                <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                  <li>A confirmação vincula uma matrícula a uma turma específica</li>
                  <li>Certifique-se de que a turma e o ano letivo estão corretos</li>
                  <li>A classificação pode ser preenchida posteriormente</li>
                  <li>Status "Ativa" indica que a confirmação está vigente</li>
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
              disabled={isLoading}
              loading={isLoading}
              variant="primary"
              className="flex-1 bg-[#007C00] hover:bg-[#005a00]"
            >
              {isEditMode ? 'Atualizar Confirmação' : 'Criar Confirmação'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
