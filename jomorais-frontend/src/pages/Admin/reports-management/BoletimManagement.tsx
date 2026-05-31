import { useState } from 'react'
import { FileText, Printer, BookOpen, Users, ChevronDown, AlertCircle, Loader2 } from 'lucide-react'
import Container from '../../../components/layout/Container'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import { useTurmas } from '../../../hooks/useTurma'
import { BoletimPdfGenerator } from '../../../utils/BoletimPdfGenerator'
import type { IBoletimTurmaData } from '../../../utils/BoletimPdfGenerator'
import api from '../../../utils/api.utils'

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
        <div
          className="rounded-2xl shadow-lg overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #0d5c35 50%, #1e7a4a 100%)' }}
        >
          <div className="absolute inset-0 opacity-10">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-white"
                style={{
                  width: `${80 + i * 40}px`,
                  height: `${80 + i * 40}px`,
                  top: `${-20 + i * 5}px`,
                  right: `${-10 + i * 15}px`,
                }}
              />
            ))}
          </div>
          <div className="relative z-10 p-8 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Boletim de Notas</h1>
                <p className="text-green-200 mt-1">
                  Gere e imprima os boletins individuais por turma e trimestre
                </p>
              </div>
            </div>
            {previewData && (
              <button
                id="btn-imprimir-boletins"
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                <Printer className="h-5 w-5" />
                Imprimir PDF
              </button>
            )}
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Selecionar Turma e Período
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Ano Lectivo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ano Lectivo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-ano-letivo"
                  value={selectedAnoLetivo}
                  onChange={e => { setSelectedAnoLetivo(e.target.value); setSelectedTurma(''); }}
                  className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition"
                >
                  <option value="">Selecione o ano lectivo...</option>
                  {anos.map((ano: any) => (
                    <option key={ano.codigo} value={ano.codigo}>
                      {ano.designacao}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Turma */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Turma <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-turma"
                  value={selectedTurma}
                  onChange={e => setSelectedTurma(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition"
                >
                  <option value="">Selecione a turma...</option>
                  {turmasFiltradas.map((turma: any) => (
                    <option key={turma.codigo} value={turma.codigo}>
                      {turma.designacao}
                      {turma.tb_classes?.designacao ? ` – ${turma.tb_classes.designacao}ª Cl.` : ''}
                      {turma.tb_cursos?.designacao ? ` | ${turma.tb_cursos.designacao}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Trimestre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trimestre <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-trimestre"
                  value={selectedTrimestre}
                  onChange={e => setSelectedTrimestre(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition"
                >
                  <option value="">Selecione o trimestre...</option>
                  {TRIMESTRES.map(t => (
                    <option key={t.codigo} value={t.codigo}>
                      {t.designacao}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              id="btn-carregar-boletim"
              onClick={handlePreview}
              disabled={!canGenerate || isLoading}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: canGenerate ? 'linear-gradient(135deg, #059669, #047857)' : '#9ca3af' }}
            >
              {isLoading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> A carregar...</>
              ) : (
                <><FileText className="h-5 w-5" /> Carregar Boletim</>
              )}
            </button>
          </div>
        </div>

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
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-600" />
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
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: '#059669' }}
              >
                {previewData.boletins.filter(b => b.situacao === 'TRANSITA').length} transitam
              </span>
            </div>

            {/* Tabela de prévia */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
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
                      <td className="px-4 py-3 text-center font-bold" style={{ color: boletim.mediaGeral >= 10 ? '#059669' : '#dc2626' }}>
                        {boletim.mediaGeral}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: boletim.situacao === 'TRANSITA' ? '#dcfce7' : '#fee2e2',
                            color: boletim.situacao === 'TRANSITA' ? '#059669' : '#dc2626',
                          }}
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
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500"
              style={{ background: '#f8fafc' }}>
              <div>
                Directora de turma: <span className="font-semibold text-gray-700">{previewData.directorTurma}</span>
                {' '}| Contacto: <span className="font-semibold text-gray-700">{previewData.contactoDirector}</span>
              </div>
              <button
                id="btn-imprimir-boletins-bottom"
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-white font-semibold shadow transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
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
            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
              <BookOpen className="h-10 w-10 text-green-400" />
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
