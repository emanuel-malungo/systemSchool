import { useState } from 'react'
import api from '../../../utils/api.utils'
import { useTurmas } from '../../../hooks/useTurma'
import Container from '../../../components/layout/Container'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import { BoletimPdfGenerator } from '../../../utils/BoletimPdfGenerator'
import type { IBoletimTurmaData } from '../../../utils/BoletimPdfGenerator'
import { BoletimFiltersModal } from '../../../components/reports-management'
import { FileText, Printer, BookOpen, Users, AlertCircle} from 'lucide-react'

// Trimestres fixos
const TRIMESTRES = [
  { codigo: 1, designacao: '1º Trimestre' },
  { codigo: 2, designacao: '2º Trimestre' },
  { codigo: 3, designacao: '3º Trimestre' },
]

export default function BoletimManagement() {
  const [selectedTurma, setSelectedTurma] = useState('')
  const [selectedTrimestre, setSelectedTrimestre] = useState('')
  const [selectedAnoLetivo, setSelectedAnoLetivo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<IBoletimTurmaData | null>(null)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const { data: anosData } = useAnosLectivos({ page: 1, limit: 100 })
  const { data: turmasData } = useTurmas({ page: 1, limit: 500 })

  const anos = anosData?.data || []
  const turmas = turmasData?.data || []

  // Filtrar turmas pelo ano lectivo selecionado
  const turmasFiltradas = selectedAnoLetivo
    ? turmas.filter((t: any) => t.codigo_AnoLectivo === parseInt(selectedAnoLetivo))
    : turmas

  const canGenerate = selectedTurma && selectedTrimestre && selectedAnoLetivo

  const handlePreview = async () => {
    if (!canGenerate) return
    setIsLoading(true)
    setError(null)
    setPreviewData(null)
    try {
      const response = await api.get<{ success: boolean; data: IBoletimTurmaData }>(
        `/api/grades/boletins-turma?codigoTurma=${selectedTurma}&codigoTrimestre=${selectedTrimestre}&codigoAnoLectivo=${selectedAnoLetivo}`
      )
      if (response.data.success) {
        setPreviewData(response.data.data)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erro ao carregar boletim'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    if (!previewData) return
    BoletimPdfGenerator.generatePDF(previewData)
  }

  const trimestreLabel = TRIMESTRES.find(t => t.codigo === parseInt(selectedTrimestre))?.designacao || ''

  return (
    <Container>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-[#007C00]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Boletim de Notas
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Gere e imprima os boletins individuais por turma e trimestre
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Selecionar Turma
            </button>
            {previewData && (
              <button
                id="btn-imprimir-boletins"
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
              >
                <Printer className="h-4 w-4" />
                Imprimir PDF
              </button>
            )}
          </div>
        </div>

        {/* ── Modal de Filtros ── */}
        <BoletimFiltersModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          anos={anos}
          turmasFiltradas={turmasFiltradas}
          trimestres={TRIMESTRES}
          selectedAnoLetivo={selectedAnoLetivo}
          selectedTurma={selectedTurma}
          selectedTrimestre={selectedTrimestre}
          onAnoLetivoChange={(val) => { setSelectedAnoLetivo(val); setSelectedTurma(''); }}
          onTurmaChange={setSelectedTurma}
          onTrimestreChange={setSelectedTrimestre}
          onApply={handlePreview}
          isLoading={isLoading}
        />

        {/* ── Erro ── */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">Aviso</p>
              <p className="text-yellow-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ── Preview ── */}
        {previewData && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            {/* Cabeçalho do preview */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-green-50">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[#007C00]" />
                <div>
                  <p className="font-bold text-gray-800">
                    Turma {previewData.turma.designacao} — {trimestreLabel}
                  </p>
                  <p className="text-sm text-gray-500">
                    {previewData.totalAlunos} aluno{previewData.totalAlunos !== 1 ? 's' : ''} •{' '}
                    Ano Lectivo: {previewData.anoLetivo} •{' '}
                    {previewData.disciplinas.length} disciplina{previewData.disciplinas.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[#007C00]"
              >
                {previewData.boletins.filter(b => b.situacao === 'TRANSITA').length} transitam
              </span>
            </div>

            {/* Tabela de prévia */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Nº</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Nome do Aluno</th>
                    {previewData.disciplinas.map(disc => (
                      <th key={disc.codigo} className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 min-w-[50px]" title={disc.designacao}>
                        {disc.abreviatura || disc.designacao.substring(0, 6)}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Média</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Situação</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Faltas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewData.boletins.map((boletim) => (
                    <tr key={boletim.aluno.codigo} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{boletim.numero}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{boletim.aluno.nome}</td>
                      {previewData.disciplinas.map(disc => {
                        const nota = boletim.notas.find(n => n.codigoDisciplina === disc.codigo)
                        const val = nota?.nota
                        const cor = val === undefined ? '#9ca3af' : val < 10 ? '#dc2626' : '#059669'
                        return (
                          <td key={disc.codigo} className="px-2 py-3 text-center font-semibold" style={{ color: cor }}>
                            {val !== undefined ? val : '–'}
                          </td>
                        )
                      })}
                      <td className={`px-4 py-3 text-center font-bold ${boletim.mediaGeral >= 10 ? 'text-[#007C00]' : 'text-red-600'}`}>
                        {boletim.mediaGeral}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            boletim.situacao === 'TRANSITA' ? 'bg-green-100 text-[#007C00]' : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {boletim.situacao}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 font-mono">{boletim.faltas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rodapé da tabela */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50">
              <div>
                Directora de turma: <span className="font-semibold text-gray-700">{previewData.directorTurma}</span>
                {' '}| Contacto: <span className="font-semibold text-gray-700">{previewData.contactoDirector}</span>
              </div>
              <button
                id="btn-imprimir-boletins-bottom"
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#007C00] hover:bg-[#005a00] text-white font-medium text-sm shadow transition-all duration-200 active:scale-[0.98]"
              >
                <Printer className="h-4 w-4" />
                Gerar PDF
              </button>
            </div>
          </div>
        )}

        {/* ── Estado vazio ── */}
        {!previewData && !isLoading && !error && (
          <div className="bg-white rounded-2xl shadow-md border border-dashed border-gray-200 p-16 text-center">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-green-50">
              <BookOpen className="h-10 w-10 text-[#007C00]" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">Nenhum boletim carregado</h3>
            <p className="text-gray-400 mt-2 max-w-sm mx-auto">
              Selecione a turma, trimestre e ano lectivo acima e clique em <strong>Carregar Boletim</strong>
              para visualizar e imprimir os boletins individuais.
            </p>
          </div>
        )}
      </div>
    </Container>
  )
}
