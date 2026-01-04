import { X, FileText, Users } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useAnosLectivos } from '../../hooks/useAnoLectivo'
import { useTurmas } from '../../hooks/useTurma'
import { useStudentsByTurma, useAllTurmasWithStudents, useGenerateSingleTurmaPDF, useGenerateSingleTurmaDOC, useGenerateAllTurmasPDF, useGenerateAllTurmasDOC } from '../../hooks/useTurmaReport'
import Button from '../common/Button'

interface StudentReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function StudentReportModal({
  isOpen,
  onClose,
}: StudentReportModalProps) {
  const [anoLectivoId, setAnoLectivoId] = useState<number | undefined>(undefined)
  const [reportType, setReportType] = useState<'single' | 'all'>('single')
  const [turmaId, setTurmaId] = useState<number | undefined>(undefined)
  const [fileFormat, setFileFormat] = useState<'pdf' | 'doc'>('pdf')

  // Buscar anos letivos
  const { data: anosLectivosData, isLoading: isLoadingAnos } = useAnosLectivos({
    page: 1,
    limit: 100,
  })
  const anosLectivos = anosLectivosData?.data || []

  // Buscar turmas APENAS do ano letivo selecionado (performance otimizada)
  // A requisição só é feita quando há um ano letivo selecionado
  const { data: turmasData, isLoading: isLoadingTurmas } = useTurmas({ 
    page: 1, 
    limit: 200,  // Suficiente para um ano letivo
    anoLectivo: anoLectivoId  // Filtro no backend - chave para performance
  })
  
  // Turmas já vêm filtradas do backend
  const turmasByAnoLectivo = useMemo(() => {
    if (!anoLectivoId) return []  // Retorna vazio se não houver ano letivo
    const data = turmasData?.data || []
    return data
  }, [turmasData, anoLectivoId])

  // Hooks de relatórios
  const { mutate: generateSinglePDF, isPending: isGeneratingSinglePDF } = useGenerateSingleTurmaPDF()
  const { mutate: generateSingleDOC, isPending: isGeneratingSingleDOC } = useGenerateSingleTurmaDOC()
  const { mutate: generateAllPDF, isPending: isGeneratingAllPDF } = useGenerateAllTurmasPDF()
  const { mutate: generateAllDOC, isPending: isGeneratingAllDOC } = useGenerateAllTurmasDOC()

  // Buscar dados da turma selecionada
  const { data: studentsData } = useStudentsByTurma(turmaId || 0, reportType === 'single' && !!turmaId)
  
  // Buscar todas as turmas com alunos (não usado diretamente, mas necessário para o hook)
  useAllTurmasWithStudents(anoLectivoId, reportType === 'all' && !!anoLectivoId)

  // Reset turma quando mudar o tipo de relatório
  useEffect(() => {
    if (reportType === 'all') {
      setTurmaId(undefined)
    }
  }, [reportType])

  // Reset turma quando o ano letivo mudar
  useEffect(() => {
    setTurmaId(undefined)
  }, [anoLectivoId])

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setAnoLectivoId(undefined)
      setReportType('single')
      setTurmaId(undefined)
      setFileFormat('pdf')
    }
  }, [isOpen])

  const handleGenerate = () => {
    if (!anoLectivoId) {
      alert('Por favor, selecione um ano letivo')
      return
    }

    if (reportType === 'single') {
      if (!turmaId) {
        alert('Por favor, selecione uma turma')
        return
      }

      const turma = turmasByAnoLectivo.find(t => t.codigo === turmaId)
      if (!turma) {
        alert('Turma não encontrada')
        return
      }

      const turmaData = {
        ...turma,
        alunos: studentsData || []
      }

      if (fileFormat === 'pdf') {
        generateSinglePDF(turmaData)
      } else {
        generateSingleDOC(turmaData)
      }
    } else {
      // Todas as turmas
      if (fileFormat === 'pdf') {
        generateAllPDF(anoLectivoId)
      } else {
        generateAllDOC(anoLectivoId)
      }
    }
  }

  const handlePrint = () => {
    if (!anoLectivoId) {
      alert('Por favor, selecione um ano letivo')
      return
    }

    if (reportType === 'single' && !turmaId) {
      alert('Por favor, selecione uma turma')
      return
    }

    // Gerar o relatório e depois imprimir
    handleGenerate()
    
    // Aguardar um momento para o arquivo ser baixado antes de tentar imprimir
    setTimeout(() => {
      window.print()
    }, 1500)
  }

  const isGenerating = isGeneratingSinglePDF || isGeneratingSingleDOC || isGeneratingAllPDF || isGeneratingAllDOC
  const canGenerate = anoLectivoId && (reportType === 'all' || (reportType === 'single' && turmaId))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/20 transition-opacity"
        onClick={isGenerating ? undefined : onClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-[#007C00] to-[#005a00] rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Relatório de Alunos por Turma
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Selecione o tipo de relatório que deseja gerar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Ano Letivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano Letivo <span className="text-red-500">*</span>
            </label>
            <select
                value={anoLectivoId || ''}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : undefined
                  setAnoLectivoId(value)
                }}
                disabled={isGenerating || isLoadingAnos}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
                aria-label="Selecione o ano letivo"
            >
              <option value="">Selecione o ano letivo</option>
              {anosLectivos.map((ano) => (
                <option key={ano.codigo} value={ano.codigo}>
                  {ano.designacao}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Relatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Relatório
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                <input
                  type="radio"
                  name="reportType"
                  value="single"
                  checked={reportType === 'single'}
                  onChange={(e) => setReportType(e.target.value as 'single' | 'all')}
                  disabled={isGenerating}
                  className="h-4 w-4 text-[#007C00] focus:ring-[#007C00] border-gray-300"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Turma Específica</p>
                  <p className="text-xs text-gray-500">Gerar relatório de uma turma selecionada</p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                <input
                  type="radio"
                  name="reportType"
                  value="all"
                  checked={reportType === 'all'}
                  onChange={(e) => setReportType(e.target.value as 'single' | 'all')}
                  disabled={isGenerating}
                  className="h-4 w-4 text-[#007C00] focus:ring-[#007C00] border-gray-300"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Todas as Turmas</p>
                  <p className="text-xs text-gray-500">Gerar relatório consolidado de todas as turmas</p>
                </div>
              </label>
            </div>
          </div>

          {/* Selecionar Turma (apenas se tipo for 'single') */}
          {reportType === 'single' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Turma <span className="text-red-500">*</span>
              </label>
              
              {/* Select de turmas */}
              <select
                  value={turmaId || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined
                    setTurmaId(value)
                  }}
                  disabled={isGenerating || !anoLectivoId || isLoadingTurmas}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  aria-label="Selecione uma turma"
              >
                <option value="">
                  {!anoLectivoId 
                    ? 'Selecione um ano letivo primeiro' 
                    : isLoadingTurmas 
                    ? 'Carregando turmas...' 
                    : turmasByAnoLectivo.length === 0
                    ? 'Nenhuma turma encontrada'
                    : 'Selecione uma turma'
                  }
                </option>
                {turmasByAnoLectivo.map((turma) => (
                  <option key={turma.codigo} value={turma.codigo}>
                    {turma.designacao} - {turma.tb_classes?.designacao || 'N/A'} - {turma.tb_cursos?.designacao || 'N/A'}
                  </option>
                ))}
              </select>
              
              {/* Indicador de status */}
              {anoLectivoId && !isLoadingTurmas && (
                <p className="text-xs text-gray-500 mt-1">
                  {turmasByAnoLectivo.length} turma(s) disponível(is)
                </p>
              )}
            </div>
          )}

          {/* Formato do Arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Formato do Arquivo
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                <input
                  type="radio"
                  name="fileFormat"
                  value="pdf"
                  checked={fileFormat === 'pdf'}
                  onChange={(e) => setFileFormat(e.target.value as 'pdf' | 'doc')}
                  disabled={isGenerating}
                  className="h-4 w-4 text-[#007C00] focus:ring-[#007C00] border-gray-300"
                />
                <div className="ml-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">PDF</p>
                    <p className="text-xs text-gray-500">Portable Document Format</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                <input
                  type="radio"
                  name="fileFormat"
                  value="doc"
                  checked={fileFormat === 'doc'}
                  onChange={(e) => setFileFormat(e.target.value as 'pdf' | 'doc')}
                  disabled={isGenerating}
                  className="h-4 w-4 text-[#007C00] focus:ring-[#007C00] border-gray-300"
                />
                <div className="ml-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">DOC</p>
                    <p className="text-xs text-gray-500">Microsoft Word</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Informação */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ℹ️ O relatório será gerado com a lista de alunos matriculados na(s) turma(s) selecionada(s) 
              para o ano letivo escolhido.
            </p>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex gap-3 p-6 border-t border-gray-200 shrink-0">
          <Button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            variant="secondary"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !canGenerate}
            loading={isGenerating}
            variant="primary"
            className="flex-1 bg-[#007C00] hover:bg-[#005a00] flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Gerar {fileFormat.toUpperCase()}
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            disabled={isGenerating || !canGenerate}
            loading={isGenerating}
            variant="secondary"
            className="flex-1 flex items-center justify-center gap-2 border-blue-500 text-blue-500 hover:bg-blue-50"
          >
            <FileText className="h-4 w-4" />
            Imprimir {fileFormat.toUpperCase()}
          </Button>
        </div>
      </div>
    </div>
  )
}
