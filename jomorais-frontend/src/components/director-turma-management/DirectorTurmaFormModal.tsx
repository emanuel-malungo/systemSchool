import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X, Info, Search } from 'lucide-react'
import type { IDiretorTurma, IDiretorTurmaInput } from '../../types/directorTurma.types'
import { useTeachersComplete } from '../../hooks/useTeacher'
import { useTurmas } from '../../hooks/useTurma'
import { useAnosLectivos } from '../../hooks/useAnoLectivo'
import Button from '../common/Button'
import Input from '../common/Input'

interface DirectorTurmaFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: IDiretorTurmaInput) => void
  directorTurma: IDiretorTurma | null
  isLoading: boolean
}

const validationSchema = yup.object({
  codigoDocente: yup.number().required('Professor é obrigatório').positive('Selecione um professor'),
  codigoTurma: yup.number().required('Turma é obrigatória').positive('Selecione uma turma'),
  codigoAnoLectivo: yup.number().required('Ano letivo é obrigatório').positive('Informe o ano letivo'),
  designacao: yup.string().nullable(),
})

type FormData = IDiretorTurmaInput

export default function DirectorTurmaFormModal({
  isOpen,
  onClose,
  onSubmit,
  directorTurma,
  isLoading,
}: DirectorTurmaFormModalProps) {
  const isEditMode = !!directorTurma
  const [docenteSearch, setDocenteSearch] = useState('')
  const [turmaSearch, setTurmaSearch] = useState('')

  const { data: docentesData, isLoading: isLoadingDocentes } = useTeachersComplete()
  const { data: turmasData, isLoading: isLoadingTurmas } = useTurmas()
  const { data: anosLectivosData, isLoading: isLoadingAnosLectivos } = useAnosLectivos()
  
  const docentes = docentesData?.data || []
  const turmas = turmasData?.data || []
  const anosLectivos = anosLectivosData?.data || []

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      codigoDocente: 0,
      codigoTurma: 0,
      codigoAnoLectivo: 0,
      designacao: null,
    },
  })

  // Observa o ano letivo selecionado para filtrar turmas
  const selectedAnoLectivo = watch('codigoAnoLectivo')

  const filteredDocentes = docentes.filter(d => 
    d.nome.toLowerCase().includes(docenteSearch.toLowerCase()) ||
    d.email.toLowerCase().includes(docenteSearch.toLowerCase())
  )

  const filteredTurmas = turmas.filter(t => {
    const matchesSearch = t.designacao.toLowerCase().includes(turmaSearch.toLowerCase())
    const matchesAnoLectivo = selectedAnoLectivo === 0 || t.codigo_AnoLectivo === selectedAnoLectivo
    return matchesSearch && matchesAnoLectivo
  })

  // Reseta a turma quando o ano letivo mudar
  useEffect(() => {
    if (selectedAnoLectivo !== 0 && !isEditMode) {
      reset((formValues) => ({
        ...formValues,
        codigoTurma: 0,
      }))
    }
  }, [selectedAnoLectivo, isEditMode, reset])

  useEffect(() => {
    if (directorTurma && isOpen) {
      reset({
        codigoDocente: directorTurma.codigoDocente,
        codigoTurma: directorTurma.codigoTurma,
        codigoAnoLectivo: directorTurma.codigoAnoLectivo,
        designacao: directorTurma.designacao,
      })
    } else if (!isOpen) {
      reset({
        codigoDocente: 0,
        codigoTurma: 0,
        codigoAnoLectivo: 0,
        designacao: null,
      })
      setDocenteSearch('')
      setTurmaSearch('')
    }
  }, [directorTurma, isOpen, reset])

  const onSubmitForm = (data: FormData) => {
    onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={isLoading ? undefined : onClose} />

        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Editar Diretor de Turma' : 'Novo Diretor de Turma'}
            </h2>
            <button onClick={onClose} disabled={isLoading} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="director-turma-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            {/* Designação */}
            <div>
              <Input
                {...register('designacao')}
                label="Designação (Opcional)"
                placeholder="Ex: Diretor Principal"
                error={errors.designacao?.message}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professor <span className="text-red-500">*</span>
              </label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar professor..."
                  value={docenteSearch}
                  onChange={(e) => setDocenteSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
                  disabled={isLoading || isLoadingDocentes}
                />
              </div>
              <select
                {...register('codigoDocente', { valueAsNumber: true })}
                disabled={isLoading || isLoadingDocentes}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                  errors.codigoDocente ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                } ${isLoading || isLoadingDocentes ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              >
                <option value={0}>Selecione o professor</option>
                {filteredDocentes.map((docente) => (
                  <option key={docente.codigo} value={docente.codigo}>
                    {docente.nome} - {docente.email}
                  </option>
                ))}
              </select>
              {errors.codigoDocente && (
                <p className="mt-1 text-sm text-red-500">{errors.codigoDocente.message}</p>
              )}
            </div>

            {/* Grid com 2 colunas */}
            <div className="grid grid-cols-2 gap-6">
              {/* Ano Letivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano Letivo <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('codigoAnoLectivo', { valueAsNumber: true })}
                  disabled={isLoading || isLoadingAnosLectivos}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                    errors.codigoAnoLectivo ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  } ${isLoading || isLoadingAnosLectivos ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value={0}>Selecione o ano letivo</option>
                  {anosLectivos.map((ano) => (
                    <option key={ano.codigo} value={ano.codigo}>
                      {ano.designacao}
                    </option>
                  ))}
                </select>
                {errors.codigoAnoLectivo && (
                  <p className="mt-1 text-sm text-red-500">{errors.codigoAnoLectivo.message}</p>
                )}
              </div>

              {/* Turma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turma <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar turma..."
                    value={turmaSearch}
                    onChange={(e) => setTurmaSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
                    disabled={isLoading || isLoadingTurmas || selectedAnoLectivo === 0}
                  />
                </div>
                <select
                  {...register('codigoTurma', { valueAsNumber: true })}
                  disabled={isLoading || isLoadingTurmas || (selectedAnoLectivo !== 0 && filteredTurmas.length === 0)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all ${
                    errors.codigoTurma ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  } ${isLoading || isLoadingTurmas ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value={0}>
                    {selectedAnoLectivo === 0 
                      ? 'Selecione primeiro um ano letivo' 
                      : filteredTurmas.length === 0 
                        ? 'Nenhuma turma disponível para este ano letivo' 
                        : 'Selecione a turma'}
                  </option>
                  {filteredTurmas.map((turma) => (
                    <option key={turma.codigo} value={turma.codigo}>
                      {turma.designacao}
                    </option>
                  ))}
                </select>
                {errors.codigoTurma && (
                  <p className="mt-1 text-sm text-red-500">{errors.codigoTurma.message}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Informação</h4>
                  <p className="text-sm text-blue-700">
                    O diretor de turma é responsável pela gestão pedagógica e administrativa da turma.
                    Selecione primeiro o ano letivo para ver as turmas disponíveis. Use a barra de busca para encontrar rapidamente professores e turmas.
                  </p>
                </div>
              </div>
            </div>

            </form>
          </div>
          
          <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-xl">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} size="md">
              Cancelar
            </Button>
            <Button type="submit" form="director-turma-form" variant="primary" loading={isLoading} size="md" className="bg-[#007C00] hover:bg-[#005a00]">
              {isEditMode ? 'Atualizar' : 'Criar'} Diretor de Turma
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
