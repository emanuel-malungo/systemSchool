import { X, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { ITransfer, ITransferInput } from '../../types/transfer.types'
import { useStudents } from '../../hooks/useStudent'
import { useProvenienciasComplete } from '../../hooks/useProveniencia'
import Button from '../common/Button'
import Input from '../common/Input'

interface TransferFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ITransferInput) => void
  transfer?: ITransfer | null
  isLoading: boolean
}

export default function TransferFormModal({
  isOpen,
  onClose,
  onSubmit,
  transfer,
  isLoading,
}: TransferFormModalProps) {
  const isEditMode = !!transfer
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<{ codigo: number; nome: string } | null>(null)
  const [showStudentList, setShowStudentList] = useState(false)

  // Buscar alunos
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    page: 1,
    limit: 50,
    search: searchTerm,
  })

  const students = studentsData?.data || []

  // Buscar proveniências (escolas)
  const { data: provenienciasData, isLoading: isLoadingProveniencias } = useProvenienciasComplete()
  const proveniencias = provenienciasData?.data || []

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ITransferInput>()

  // Preenche o formulário quando está em modo de edição
  useEffect(() => {
    if (transfer && isOpen) {
      setValue('codigoAluno', transfer.codigoAluno)
      setValue('codigoEscola', transfer.codigoEscola)
      setValue('codigoMotivo', transfer.codigoMotivo)
      setValue('obs', transfer.obs || '')
      
      // Formata a data para o input datetime-local
      if (transfer.dataTransferencia && typeof transfer.dataTransferencia === 'string') {
        const date = new Date(transfer.dataTransferencia)
        const formattedDate = date.toISOString().slice(0, 16)
        setValue('dataTransferencia', formattedDate)
      }
      
      // Define o aluno selecionado em modo de edição
      if (transfer.tb_alunos) {
        setSelectedStudent({
          codigo: transfer.codigoAluno,
          nome: transfer.tb_alunos.nome
        })
      }
    } else if (!isOpen) {
      reset()
      setSelectedStudent(null)
      setSearchTerm('')
      setShowStudentList(false)
    }
  }, [transfer, isOpen, setValue, reset])

  // Handler para selecionar um aluno
  const handleSelectStudent = (student: { codigo: number; nome: string }) => {
    setSelectedStudent(student)
    setValue('codigoAluno', student.codigo)
    setShowStudentList(false)
    setSearchTerm('')
  }

  // Fechar lista ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      if (showStudentList) {
        setShowStudentList(false)
      }
    }

    if (showStudentList) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showStudentList])

  const handleFormSubmit = (data: ITransferInput) => {
    // Converte a data para ISO string
    const formattedData = {
      ...data,
      dataTransferencia: new Date(data.dataTransferencia).toISOString(),
    }
    onSubmit(formattedData)
  }

  if (!isOpen) return null

  const motivos = [
    { value: 1, label: 'Mudança de Residência' },
    { value: 2, label: 'Problemas Financeiros' },
    { value: 3, label: 'Insatisfação com a Escola' },
    { value: 4, label: 'Problemas de Saúde' },
    { value: 5, label: 'Outros Motivos' },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/20 transition-opacity"
          onClick={isLoading ? undefined : onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar Transferência' : 'Nova Transferência'}
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
              {/* Seleção/Visualização do Aluno */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aluno <span className="text-red-500">*</span>
                </label>
                
                {isEditMode ? (
                  // Modo de edição: apenas exibe o nome do aluno
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                    {selectedStudent?.nome || 'Aluno não disponível'}
                  </div>
                ) : (
                  // Modo de criação: busca de aluno
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar aluno por nome..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setShowStudentList(true)
                        }}
                        onFocus={() => setShowStudentList(true)}
                        disabled={isLoading || !!selectedStudent}
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                          errors.codigoAluno
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300'
                        } ${isLoading || selectedStudent ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                      />
                    </div>

                    {/* Aluno Selecionado */}
                    {selectedStudent && (
                      <div className="mt-2 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#007C00] flex items-center justify-center text-white font-bold">
                            {selectedStudent.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedStudent.nome}</p>
                            <p className="text-xs text-gray-500">Código: {selectedStudent.codigo}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent(null)
                            setValue('codigoAluno', 0)
                            setSearchTerm('')
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}

                    {/* Lista de Alunos */}
                    {showStudentList && searchTerm && !selectedStudent && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoadingStudents ? (
                          <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#007C00] mx-auto"></div>
                            <p className="mt-2 text-sm">Buscando alunos...</p>
                          </div>
                        ) : students.length > 0 ? (
                          <ul className="py-2">
                            {students.map((student) => (
                              <li key={student.codigo}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectStudent({ codigo: student.codigo, nome: student.nome })}
                                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
                                >
                                  <div className="h-10 w-10 rounded-full bg-[#007C00] flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {student.nome.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{student.nome}</p>
                                    <p className="text-xs text-gray-500">Código: {student.codigo}</p>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <p className="text-sm">Nenhum aluno encontrado</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Campo hidden para o código do aluno */}
                    <input
                      type="hidden"
                      {...register('codigoAluno', {
                        required: 'Selecione um aluno',
                        min: { value: 1, message: 'Selecione um aluno válido' },
                      })}
                    />
                    {errors.codigoAluno && !selectedStudent && (
                      <p className="mt-1 text-sm text-red-500">{errors.codigoAluno.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Escola Destino */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escola Destino <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('codigoEscola', {
                    required: 'Escola destino é obrigatória',
                    valueAsNumber: true,
                  })}
                  disabled={isLoading || isLoadingProveniencias}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                    errors.codigoEscola
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                  } ${isLoading || isLoadingProveniencias ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value="">
                    {isLoadingProveniencias ? 'Carregando escolas...' : 'Selecione a escola destino'}
                  </option>
                  {proveniencias.map((proveniencia) => (
                    <option key={proveniencia.codigo} value={proveniencia.codigo}>
                      {proveniencia.designacao}
                    </option>
                  ))}
                </select>
                {errors.codigoEscola && (
                  <p className="mt-1 text-sm text-red-500">{errors.codigoEscola.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Selecione a escola para onde o aluno será transferido
                </p>
              </div>

              {/* Data da Transferência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Transferência <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  {...register('dataTransferencia', {
                    required: 'Data da transferência é obrigatória',
                  })}
                  error={errors.dataTransferencia?.message}
                  disabled={isLoading}
                />
              </div>

              {/* Motivo da Transferência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da Transferência <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('codigoMotivo', {
                    required: 'Motivo é obrigatório',
                    valueAsNumber: true,
                  })}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                    errors.codigoMotivo
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value="">Selecione um motivo</option>
                  {motivos.map((motivo) => (
                    <option key={motivo.value} value={motivo.value}>
                      {motivo.label}
                    </option>
                  ))}
                </select>
                {errors.codigoMotivo && (
                  <p className="mt-1 text-sm text-red-500">{errors.codigoMotivo.message}</p>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  {...register('obs')}
                  disabled={isLoading}
                  rows={4}
                  placeholder="Digite observações adicionais sobre a transferência (opcional)"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all resize-none ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Máximo de 500 caracteres
                </p>
              </div>

              {/* Informações Importantes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                  ⚠️ Informações Importantes
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1 ml-4 list-disc">
                  <li>A transferência será registrada no sistema</li>
                  <li>O aluno será marcado como transferido</li>
                  <li>Certifique-se de que todos os dados estão corretos</li>
                  <li>Esta ação pode ser revertida posteriormente</li>
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
              {isEditMode ? 'Atualizar Transferência' : 'Criar Transferência'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
