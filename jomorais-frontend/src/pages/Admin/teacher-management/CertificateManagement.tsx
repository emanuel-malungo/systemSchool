import { useState, useMemo } from 'react'
import {
  Award,
  Plus,
  Eye,
  Trash2,
  Filter,
  Loader2,
  AlertCircle,
  PenTool,
  Download,
} from 'lucide-react'
import Container from '../../../components/layout/Container'
import { usePageTitle } from '../../../hooks/usePageTitle'
import {
  useCertificates,
  useCreateCertificate,
  useSignCertificate,
  useDeleteCertificate,
} from '../../../hooks/useCertificate'
import { useAlunosByTurma, useTurmasComplete } from '../../../hooks/useTurma'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import { usePermissions } from '../../../hooks/useAuth'
import { toast } from 'react-toastify'
import type { ITurma } from '../../../types/turma.types'
import { CertificateWordGenerator } from '../../../utils/CertificateWordGenerator'
import certificateService from '../../../services/certificate.service'

export default function CertificateManagement() {
  usePageTitle('Gestão de Certificados')
  const { user, userType } = usePermissions()
  const isViewOnlyRole = userType === 'pedagogico' || userType === 'chefe de secretaria' || userType === 'assistente administrativo'

  // Estados
  const [filterAnoLectivo, setFilterAnoLectivo] = useState('')
  const [filterAluno, setFilterAluno] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)
  const [isDownloading, setIsDownloading] = useState<number | null>(null)

  // Formulário criação
  const [createForm, setCreateForm] = useState({
    codigoTurma: '',
    codigoAluno: '',
    codigoAnoLectivo: '',
    observacoes: '',
  })

  // Hooks de dados
  const { data: anosLetivosData } = useAnosLectivos({
    page: 1,
    limit: 100,
  })
  const { data: turmasData } = useTurmasComplete('')

  const anosLetivos = anosLetivosData?.data || []
  const turmas = Array.isArray(turmasData) ? turmasData : turmasData?.data || []

  // Filtro de alunos por turma selecionada
  const selectedTurma = useMemo(() => {
    if (!createForm.codigoTurma) return null
    return turmas.find((t: ITurma) => t.codigo?.toString() === createForm.codigoTurma)
  }, [turmas, createForm.codigoTurma])

  const { data: alunosResponse } = useAlunosByTurma(
    selectedTurma?.codigo || 0,
    !!selectedTurma?.codigo
  )
  const alunos = (alunosResponse as any)?.data || []

  // Buscar certificados
  const { data: certificatesResponse, isLoading: isLoadingCertificates } = useCertificates(
    page,
    10,
    {
      codigoAluno: filterAluno ? parseInt(filterAluno) : undefined,
      status: (filterStatus || undefined) as "Pendente" | "Assinado" | undefined,
      codigoAnoLectivo: filterAnoLectivo ? parseInt(filterAnoLectivo) : undefined,
    }
  )

  const certificates = certificatesResponse?.data || []
  const totalPages = certificatesResponse?.pagination?.totalPages || 1

  // Mutations
  const { mutateAsync: createCertificate, isPending: isCreating } = useCreateCertificate()
  const { mutateAsync: signCertificate, isPending: isSigning } = useSignCertificate()
  const { mutateAsync: deleteCertificate, isPending: isDeleting } = useDeleteCertificate()

  // Handlers
  const handleCreateCertificate = async () => {
    if (!createForm.codigoAluno || !createForm.codigoAnoLectivo) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      await createCertificate({
        codigoAluno: parseInt(createForm.codigoAluno),
        codigoAnoLectivo: parseInt(createForm.codigoAnoLectivo),
        observacoes: createForm.observacoes,
      } as any)
      toast.success('Certificado criado com sucesso')
      setShowCreateModal(false)
      setCreateForm({
        codigoTurma: '',
        codigoAluno: '',
        codigoAnoLectivo: '',
        observacoes: '',
      })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar certificado')
    }
  }

  const handleSignCertificate = async (certificateId: number) => {
    if (!user?.id) {
      toast.error('Usuário não identificado')
      return
    }

    try {
      await signCertificate({
        id: certificateId,
        codigoUtilizador: Number(user.id),
      })
      toast.success('Certificado assinado com sucesso')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao assinar certificado')
    }
  }

  const handleDeleteCertificate = async (certificateId: number) => {
    if (!window.confirm('Tem a certeza que deseja cancelar este certificado?')) return

    try {
      await deleteCertificate(certificateId)
      toast.success('Certificado cancelado')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar certificado')
    }
  }

  const handleDownloadWord = async (certificateId: number) => {
    try {
      setIsDownloading(certificateId)
      const res = await certificateService.getCertificateById(certificateId)
      if (res && res.data) {
        await CertificateWordGenerator.generateWord(res.data as any)
        toast.success('Documento Word gerado com sucesso')
      } else {
        toast.error('Erro ao obter dados do certificado')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar documento Word do certificado')
    } finally {
      setIsDownloading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Assinado':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">✓ Assinado</span>
      case 'Pendente':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">⏳ Pendente</span>
      case 'Cancelado':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">✗ Cancelado</span>
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{status}</span>
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-8 h-8 text-amber-600" />
              Gestão de Certificados
            </h1>
            <p className="text-gray-600 mt-2">Emitir, assinar e gerenciar certificados de alunos</p>
          </div>
          {!isViewOnlyRole && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Certificado
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-700">Filtros</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ano Letivo</label>
              <select
                value={filterAnoLectivo}
                onChange={(e) => {
                  setFilterAnoLectivo(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Todos</option>
                {anosLetivos.map((ano) => (
                  <option key={`ano-${ano.codigo}`} value={ano.codigo || ''}>
                    {ano.designacao}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Todos</option>
                <option value="Pendente">Pendente</option>
                <option value="Assinado">Assinado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Limpar Filtros</label>
              <button
                onClick={() => {
                  setFilterAnoLectivo('')
                  setFilterAluno('')
                  setFilterStatus('')
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Certificados */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoadingCertificates ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum certificado encontrado</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Turma / Curso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Ano Letivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {certificates.map((cert: any) => (
                    <tr key={cert.Codigo} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {cert.NumeroCertificado}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cert.tb_alunos?.Nome || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {(() => {
                          const confirmacao = cert.tb_alunos?.tb_matriculas?.tb_confirmacoes?.[0]
                          const classe = confirmacao?.tb_turmas?.tb_classes?.designacao
                          const curso = cert.tb_alunos?.tb_matriculas?.tb_cursos?.designacao
                          if (classe && curso) return `${classe} - ${curso}`
                          if (classe) return classe
                          if (curso) return curso
                          return '-'
                        })()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cert.tb_ano_lectivo?.designacao || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(cert.Status)}
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedCertificate(cert)
                            setShowDetailModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {!isViewOnlyRole && cert.Status === 'Pendente' && (
                          <button
                            onClick={() => handleSignCertificate(cert.Codigo)}
                            disabled={isSigning}
                            className="text-green-600 hover:text-green-800 flex items-center gap-1 disabled:opacity-50"
                            title="Assinar"
                          >
                            {isSigning ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <PenTool className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {cert.Status === 'Assinado' && (
                          <button
                            onClick={() => handleDownloadWord(cert.Codigo)}
                            disabled={isDownloading === cert.Codigo}
                            className="text-amber-600 hover:text-amber-800 flex items-center gap-1 disabled:opacity-50"
                            title="Descarregar Word"
                          >
                            {isDownloading === cert.Codigo ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {!isViewOnlyRole && cert.Status !== 'Cancelado' && (
                          <button
                            onClick={() => handleDeleteCertificate(cert.Codigo)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50"
                            title="Cancelar"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal: Criar Certificado */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Novo Certificado</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano Letivo *
                </label>
                <select
                  value={createForm.codigoAnoLectivo}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, codigoAnoLectivo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Selecione...</option>
                  {anosLetivos.map((ano, idx) => (
                    <option key={`filter-ano-${idx}-${ano.codigo}`} value={ano.codigo || ''}>
                      {ano.designacao}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turma *
                </label>
                <select
                  value={createForm.codigoTurma}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, codigoTurma: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Selecione...</option>
                  {turmas
                    .filter(
                      (t: ITurma) =>
                        !createForm.codigoAnoLectivo ||
                        t.codigo_AnoLectivo?.toString() === createForm.codigoAnoLectivo
                    )
                    .map((turma: ITurma) => (
                      <option key={`turma-${turma.codigo}`} value={turma.codigo || ''}>
                        {turma.designacao}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aluno *
                </label>
                <select
                  value={createForm.codigoAluno}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, codigoAluno: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  disabled={!selectedTurma}
                >
                  <option value="">Selecione turma primeiro...</option>
                  {alunos.map((aluno: any) => (
                    <option key={`aluno-${aluno.Codigo || aluno.codigo}`} value={aluno.Codigo || aluno.codigo}>
                      {aluno.Nome || aluno.nome}
                    </option>
                  ))}
                </select>
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={createForm.observacoes}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, observacoes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Notas adicionais..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCertificate}
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                Criar Certificado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Certificado */}
      {showDetailModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Detalhes do Certificado</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Número do Certificado</p>
                <p className="text-lg font-semibold">{selectedCertificate.NumeroCertificado}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="mt-2">{getStatusBadge(selectedCertificate.Status)}</div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Aluno</p>
                <p className="text-lg font-semibold">{selectedCertificate.tb_alunos?.Nome}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Turma / Curso / Classe</p>
                <p className="text-lg font-semibold">
                  {(() => {
                    const confirmacao = selectedCertificate.tb_alunos?.tb_matriculas?.tb_confirmacoes?.[0]
                    const classe = confirmacao?.tb_turmas?.tb_classes?.designacao
                    const curso = selectedCertificate.tb_alunos?.tb_matriculas?.tb_cursos?.designacao
                    const turma = confirmacao?.tb_turmas?.designacao
                    const parts = []
                    if (classe) parts.push(classe)
                    if (turma) parts.push(`Turma ${turma}`)
                    if (curso) parts.push(curso)
                    return parts.length > 0 ? parts.join(' - ') : '-'
                  })()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Ano Letivo</p>
                <p className="text-lg font-semibold">
                  {selectedCertificate.tb_ano_lectivo?.designacao}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Data de Emissão</p>
                <p className="text-lg font-semibold">
                  {new Date(selectedCertificate.DataEmissao).toLocaleDateString('pt-PT')}
                </p>
              </div>

              {selectedCertificate.Status === 'Assinado' && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Data de Assinatura</p>
                    <p className="text-lg font-semibold">
                      {new Date(selectedCertificate.DataAssinatura).toLocaleDateString(
                        'pt-PT'
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Assinado Por</p>
                    <p className="text-lg font-semibold">
                      {selectedCertificate.AssinadoPor?.Nome || '-'}
                    </p>
                  </div>
                </>
              )}

              {selectedCertificate.observacoes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Observações</p>
                  <p className="text-base mt-2">{selectedCertificate.observacoes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-8">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fechar
              </button>
              {!isViewOnlyRole && selectedCertificate.Status === 'Pendente' && (
                <button
                  onClick={() => {
                    handleSignCertificate(selectedCertificate.Codigo)
                    setShowDetailModal(false)
                  }}
                  disabled={isSigning}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSigning ? 'Assinando...' : 'Assinar Certificado'}
                </button>
              )}
              {selectedCertificate.Status === 'Assinado' && (
                <button
                  onClick={() => {
                    handleDownloadWord(selectedCertificate.Codigo)
                    setShowDetailModal(false)
                  }}
                  disabled={isDownloading === selectedCertificate.Codigo}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDownloading === selectedCertificate.Codigo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Descarregar Word
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}
