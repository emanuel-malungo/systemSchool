import { useState, useEffect } from 'react'
import { X, FileText, FileDown, Loader2, AlertCircle } from 'lucide-react'
import { useAnosLectivos } from '../../hooks/useAnoLectivo'
import TurmaReportService from '../../services/turmaReport.service'
import api from '../../utils/api.utils'

interface DebtorsReportModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Turma {
  codigo: number
  designacao: string
}

export default function DebtorsReportModal({ isOpen, onClose }: DebtorsReportModalProps) {
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState<number | null>(null)
  const [selectedTurma, setSelectedTurma] = useState<number | null>(null)
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [isLoadingTurmas, setIsLoadingTurmas] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCheckingDebtors, setIsCheckingDebtors] = useState(false)
  const [debtorsCount, setDebtorsCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: anosLectivosData } = useAnosLectivos({ page: 1, limit: 100 })
  const anosLectivos = anosLectivosData?.data || []

  // Carregar turmas quando ano lectivo for selecionado
  useEffect(() => {
    if (selectedAnoLectivo) {
      loadTurmasByAnoLectivo(selectedAnoLectivo)
    } else {
      setTurmas([])
      setSelectedTurma(null)
      setDebtorsCount(null)
    }
  }, [selectedAnoLectivo])

  // Verificar devedores quando turma for selecionada
  useEffect(() => {
    if (selectedTurma) {
      checkDebtors()
    } else if (selectedAnoLectivo) {
      checkDebtors()
    } else {
      setDebtorsCount(null)
    }
  }, [selectedTurma, selectedAnoLectivo])

  const loadTurmasByAnoLectivo = async (anoLectivoId: number) => {
    setIsLoadingTurmas(true)
    setError(null)
    try {
      const response = await api.get(`/api/academic-management/turmas`, {
        params: { anoLectivo: anoLectivoId, limit: 1000 }
      })
      
      if (response.data.success) {
        setTurmas(response.data.data)
      }
    } catch (err) {
      console.error('Erro ao carregar turmas:', err)
      setError('Erro ao carregar turmas')
    } finally {
      setIsLoadingTurmas(false)
    }
  }

  const checkDebtors = async () => {
    if (!selectedAnoLectivo) return

    setIsCheckingDebtors(true)
    setError(null)
    
    try {
      if (selectedTurma) {
        // Verificar devedores de uma turma específica
        const response = await api.get(`/api/academic-management/turmas/${selectedTurma}/devedores`)
        console.log('📊 DEBUG - Resposta da API (Turma específica):', response.data)
        console.log('📊 DEBUG - Devedores encontrados:', response.data.data?.devedores)
        console.log('📊 DEBUG - Total de devedores:', response.data.data?.devedores?.length)
        
        if (response.data.success) {
          setDebtorsCount(response.data.data.devedores.length)
        }
      } else {
        // Verificar devedores de todas as turmas do ano lectivo
        const response = await api.get(`/api/academic-management/anos-lectivos/${selectedAnoLectivo}/devedores`)
        console.log('📊 DEBUG - Resposta da API (Todas turmas):', response.data)
        console.log('📊 DEBUG - Turmas com devedores:', response.data.data?.turmas)
        
        if (response.data.success) {
          const total = response.data.data.turmas.reduce((acc: number, turma: any) => acc + turma.devedores.length, 0)
          console.log('📊 DEBUG - Total de devedores no ano:', total)
          setDebtorsCount(total)
        }
      }
    } catch (err) {
      console.error('❌ Erro ao verificar devedores:', err)
      setDebtorsCount(null)
    } finally {
      setIsCheckingDebtors(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!selectedAnoLectivo) {
      setError('Por favor, selecione um ano lectivo')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      if (selectedTurma) {
        // Gerar relatório de uma turma específica
        await TurmaReportService.generateDebtorsPDFSingleTurma(selectedTurma)
      } else {
        // Gerar relatório de todas as turmas do ano lectivo
        await TurmaReportService.generateDebtorsPDFAllTurmas(selectedAnoLectivo)
      }
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      setError(err instanceof Error ? err.message : 'Erro ao gerar PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateDOC = async () => {
    if (!selectedAnoLectivo) {
      setError('Por favor, selecione um ano lectivo')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      if (selectedTurma) {
        // Gerar relatório de uma turma específica
        await TurmaReportService.generateDebtorsDOCSingleTurma(selectedTurma)
      } else {
        // Gerar relatório de todas as turmas do ano lectivo
        await TurmaReportService.generateDebtorsDOCAllTurmas(selectedAnoLectivo)
      }
    } catch (err) {
      console.error('Erro ao gerar DOC:', err)
      setError(err instanceof Error ? err.message : 'Erro ao gerar DOC')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    setSelectedAnoLectivo(null)
    setSelectedTurma(null)
    setTurmas([])
    setDebtorsCount(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-orange-500 to-orange-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Lista de Devedores</h2>
                <p className="text-orange-100 text-sm mt-1">
                  Gerar relatório de alunos com pendências financeiras
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
              aria-label="Fechar"
              title="Fechar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 hrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Erro</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Informação */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Instruções:</strong> Selecione o ano lectivo e opcionalmente uma turma específica. 
              Se nenhuma turma for selecionada, o relatório incluirá todas as turmas do ano lectivo.
            </p>
          </div>

          {/* Filtros */}
          <div className="space-y-4">
            {/* Ano Lectivo */}
            <div>
              <label htmlFor="ano-lectivo-select" className="block text-sm font-medium text-gray-700 mb-2">
                Ano Lectivo <span className="text-red-500">*</span>
              </label>
              <select
                id="ano-lectivo-select"
                value={selectedAnoLectivo || ''}
                onChange={(e) => setSelectedAnoLectivo(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Selecione o ano lectivo</option>
                {anosLectivos.map((ano) => (
                  <option key={ano.codigo} value={ano.codigo}>
                    {ano.designacao} ({ano.anoInicial}/{ano.anoFinal})
                  </option>
                ))}
              </select>
            </div>

            {/* Turma (opcional) */}
            <div>
              <label htmlFor="turma-select" className="block text-sm font-medium text-gray-700 mb-2">
                Turma (Opcional)
              </label>
              <select
                id="turma-select"
                value={selectedTurma || ''}
                onChange={(e) => setSelectedTurma(e.target.value ? Number(e.target.value) : null)}
                disabled={!selectedAnoLectivo || isLoadingTurmas}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Todas as turmas</option>
                {isLoadingTurmas ? (
                  <option disabled>Carregando turmas...</option>
                ) : (
                  turmas.map((turma) => (
                    <option key={turma.codigo} value={turma.codigo}>
                      {turma.designacao}
                    </option>
                  ))
                )}
              </select>
              {isLoadingTurmas && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Carregando turmas...
                </p>
              )}
            </div>
          </div>

          {/* Resumo */}
          {selectedAnoLectivo && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Resumo do Relatório</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Ano Lectivo:</strong>{' '}
                  {anosLectivos.find(a => a.codigo === selectedAnoLectivo)?.designacao}
                </p>
                <p>
                  <strong>Turma:</strong>{' '}
                  {selectedTurma 
                    ? turmas.find(t => t.codigo === selectedTurma)?.designacao 
                    : 'Todas as turmas'}
                </p>
                {isCheckingDebtors ? (
                  <p className="flex items-center gap-2 text-orange-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando devedores...
                  </p>
                ) : debtorsCount !== null && (
                  <p>
                    <strong>Total de Devedores:</strong>{' '}
                    <span className={debtorsCount === 0 ? 'text-red-600 font-bold' : 'text-orange-600 font-bold'}>
                      {debtorsCount}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Aviso: Sem devedores */}
          {debtorsCount === 0 && !isCheckingDebtors && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Sem Devedores</p>
                <p className="text-sm text-yellow-700 mt-1">
                  {selectedTurma 
                    ? 'Esta turma não possui alunos com pendências financeiras.'
                    : 'Não há alunos com pendências financeiras neste ano lectivo.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancelar
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleGenerateDOC}
              disabled={!selectedAnoLectivo || isGenerating || debtorsCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Gerar DOC
                </>
              )}
            </button>

            <button
              onClick={handleGeneratePDF}
              disabled={!selectedAnoLectivo || isGenerating || debtorsCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Gerar PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
