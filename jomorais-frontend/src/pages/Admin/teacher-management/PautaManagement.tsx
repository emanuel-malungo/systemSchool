import { useState, useMemo } from 'react'
import {
  FileText,
  Download,
  Share2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react'
import Container from '../../../components/layout/Container'
import {
  usePauta,
  useGeneratePauta,
  useExportPautaPDF,
  useExportPautaExcel,
  usePublishPauta,
} from '../../../hooks/useGrade'

interface FilterState {
  codigoTurma: string
  codigoTrimestre: string
  codigoAnoLectivo: string
  page: number
  limit: number
}

export default function PautaManagement() {
  // Estados de filtro
  const [filters, setFilters] = useState<FilterState>({
    codigoTurma: '',
    codigoTrimestre: '1',
    codigoAnoLectivo: '',
    page: 1,
    limit: 15,
  })

  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false)

  // Hooks de dados
  const { data: pautaData, isLoading: isLoadingPauta } = usePauta(
    parseInt(filters.codigoTurma) || 0,
    parseInt(filters.codigoTrimestre) || 1,
    parseInt(filters.codigoAnoLectivo) || 0,
    !!filters.codigoTurma && !!filters.codigoAnoLectivo
  )

  // Hooks de mutação
  const { mutate: generatePauta, isPending: isGenerating } = useGeneratePauta()
  const { mutate: exportPDF, isPending: isExportingPDF } = useExportPautaPDF()
  const { mutate: exportExcel, isPending: isExportingExcel } = useExportPautaExcel()
  const { mutate: publishPauta, isPending: isPublishing } = usePublishPauta()

  // Dados extraídos
  const pauta = pautaData?.data

  // Itens da pauta com paginação
  const paginatedItems = useMemo(() => {
    if (!pauta?.itens) return { items: [], total: 0, pages: 0 }

    const start = (filters.page - 1) * filters.limit
    const end = start + filters.limit
    const items = pauta.itens.slice(start, end)

    return {
      items,
      total: pauta.itens.length,
      pages: Math.ceil(pauta.itens.length / filters.limit),
    }
  }, [pauta, filters.page, filters.limit])

  // Handlers
  const handleGeneratePauta = () => {
    if (!filters.codigoTurma || !filters.codigoAnoLectivo) {
      alert('Por favor, selecione turma e ano letivo')
      return
    }

    generatePauta({
      codigoTurma: parseInt(filters.codigoTurma),
      codigoTrimestre: parseInt(filters.codigoTrimestre),
      codigoAnoLectivo: parseInt(filters.codigoAnoLectivo),
    })
    setShowGenerateConfirm(false)
  }

  const handleExportPDF = () => {
    if (!pauta) {
      alert('Nenhuma pauta para exportar')
      return
    }

    exportPDF({
      codigoTurma: pauta.codigoTurma,
      codigoTrimestre: pauta.codigoTrimestre,
      codigoAnoLectivo: pauta.codigoAnoLectivo,
    })
  }

  const handleExportExcel = () => {
    if (!pauta) {
      alert('Nenhuma pauta para exportar')
      return
    }

    exportExcel({
      codigoTurma: pauta.codigoTurma,
      codigoTrimestre: pauta.codigoTrimestre,
      codigoAnoLectivo: pauta.codigoAnoLectivo,
    })
  }

  const handlePublishPauta = () => {
    if (!pauta) {
      alert('Nenhuma pauta para publicar')
      return
    }

    if (confirm('Tem certeza que deseja publicar esta pauta? As notas ficarão visíveis para os alunos.')) {
      publishPauta({
        codigoTurma: pauta.codigoTurma,
        codigoTrimestre: pauta.codigoTrimestre,
      })
    }
  }

  const getStatusBadge = (status: 'Aprovado' | 'Reprovado') => {
    if (status === 'Aprovado') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-4 w-4 mr-1" />
          Aprovado
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        <XCircle className="h-4 w-4 mr-1" />
        Reprovado
      </span>
    )
  }

  const totalPages = paginatedItems.pages
  const currentPage = filters.page

  return (
    <Container>
      {/* Header */}
      <div className="mb-8 bg-linear-to-br from-purple-50 via-white to-purple-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100/30 rounded-full -ml-12 -mb-12"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <FileText className="h-8 w-8 text-white" />
              </div>

              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Gestão de Pautas
                </h1>
                <p className="text-gray-600 text-lg">
                  Gere, visualize e publique pautas consolidadas de notas por turma
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código da Turma *
            </label>
            <input
              type="number"
              value={filters.codigoTurma}
              onChange={e => setFilters(f => ({ ...f, codigoTurma: e.target.value, page: 1 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
              placeholder="Ex: 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trimestre
            </label>
            <select
              value={filters.codigoTrimestre}
              onChange={e => setFilters(f => ({ ...f, codigoTrimestre: e.target.value, page: 1 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
            >
              <option value="1">1º Trimestre</option>
              <option value="2">2º Trimestre</option>
              <option value="3">3º Trimestre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ano Letivo *
            </label>
            <input
              type="number"
              value={filters.codigoAnoLectivo}
              onChange={e => setFilters(f => ({ ...f, codigoAnoLectivo: e.target.value, page: 1 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00]"
              placeholder="Ex: 1"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowGenerateConfirm(true)}
              disabled={!filters.codigoTurma || !filters.codigoAnoLectivo || isGenerating}
              className="w-full px-4 py-2 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
              Gerar Pauta
            </button>
          </div>
        </div>
      </div>

      {/* Ações de Exportação */}
      {pauta && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total de Alunos</p>
                <p className="text-3xl font-bold text-gray-900">{pauta.totalAlunos}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Aprovados</p>
                <p className="text-3xl font-bold text-green-600">{pauta.alunosAprovados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Reprovados</p>
                <p className="text-3xl font-bold text-red-600">{pauta.alunosReprovados}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Média Geral</p>
                <p className="text-3xl font-bold text-purple-600">{pauta.mediaGeral.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      {pauta && (
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 font-medium"
          >
            {isExportingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar PDF
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 font-medium"
          >
            {isExportingExcel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar Excel
          </button>

          <button
            onClick={handlePublishPauta}
            disabled={isPublishing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 font-medium"
          >
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            Publicar Pauta
          </button>

          <button
            onClick={() => setFilters(f => ({ ...f, page: 1 }))}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium ml-auto"
          >
            <Calendar className="h-4 w-4" />
            Atualizar
          </button>
        </div>
      )}

      {/* Tabela de Pauta */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {!pauta || isLoadingPauta ? (
            <div className="px-6 py-12 text-center">
              {isLoadingPauta ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#007C00]" />
                  <p className="text-gray-600">Carregando pauta...</p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                  <p className="text-gray-600 font-medium">Nenhuma pauta encontrada</p>
                  <p className="text-sm text-gray-500">Selecione os filtros e clique em "Gerar Pauta"</p>
                </>
              )}
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Aluno</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Disciplina</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nota</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tipo Avaliação</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                        <p className="text-gray-600 font-medium">Nenhum resultado</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{item.nomeAluno}</p>
                          <p className="text-xs text-gray-500">Código: {item.codigoAluno}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{item.nomeDisciplina}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-lg text-gray-900">{item.nota.toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{item.tipoAvaliacao}</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages} ({paginatedItems.total} itens)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>
                    <button
                      onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Geração */}
      {showGenerateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gerar Pauta</h2>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja gerar a pauta para:
            </p>

            <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Turma:</span>
                <span className="font-medium text-gray-900">#{filters.codigoTurma}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trimestre:</span>
                <span className="font-medium text-gray-900">
                  {parseInt(filters.codigoTrimestre)}º
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ano Letivo:</span>
                <span className="font-medium text-gray-900">#{filters.codigoAnoLectivo}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowGenerateConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGeneratePauta}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 bg-[#007C00] text-white rounded-lg font-medium hover:bg-[#005a00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gerar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}
