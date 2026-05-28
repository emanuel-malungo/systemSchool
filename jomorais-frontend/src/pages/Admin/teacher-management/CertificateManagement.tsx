import { useState, useMemo } from 'react'
import {
  Award,
  Plus,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Loader2,
  AlertCircle,
  PenTool,
} from 'lucide-react'
import Container from '../../../components/layout/Container'
import {
  useCertificates,
  useCreateCertificate,
  useSignCertificate,
  useDeleteCertificate,
} from '../../../hooks/useCertificate'
import { useAlunosByTurma, useTurmasComplete } from '../../../hooks/useTurma'
import { useDisciplinas } from '../../../hooks/useDisciplina'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import { useAuth } from '../../../hooks/useAuth'
import { toast } from 'react-toastify'
import type { ITurma } from '../../../types/turma.types'

export default function CertificateManagement() {
  const { user } = useAuth()

  // Estados
  const [filterAnoLectivo, setFilterAnoLectivo] = useState('')
  const [filterAluno, setFilterAluno] = useState('')
  const [filterDisciplina, setFilterDisciplina] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)

  // Formulário criação
  const [createForm, setCreateForm] = useState({
    codigoTurma: '',
    codigoAluno: '',
    codigoDisciplina: '',
    codigoAnoLectivo: '',
    observacoes: '',
  })

  // Hooks de dados
  const { data: anosLetivosData, isLoading: isLoadingAnosLetivos } = useAnosLectivos({
    page: 1,
    limit: 100,
  })
  const { data: turmasData } = useTurmasComplete('')
  const { data: disciplinasData } = useDisciplinas()

  const anosLetivos = anosLetivosData?.data || []
  const turmas = Array.isArray(turmasData) ? turmasData : turmasData?.data || []
  const disciplines = Array.isArray(disciplinasData) ? disciplinasData : []

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
      codigoDisciplina: filterDisciplina ? parseInt(filterDisciplina) : undefined,
      status: filterStatus || undefined,
      codigoAnoLectivo: filterAnoLectivo ? parseInt(filterAnoLectivo) : undefined,
    },
    true
  )

  const certificates = certificatesResponse?.data || []
  const totalPages = certificatesResponse?.pagination?.totalPages || 1

  // Mutations
  const { mutateAsync: createCertificate, isPending: isCreating } = useCreateCertificate()
  const { mutateAsync: signCertificate, isPending: isSigning } = useSignCertificate()
  const { mutateAsync: deleteCertificate, isPending: isDeleting } = useDeleteCertificate()

  // Handlers
  const handleCreateCertificate = async () => {
    if (!createForm.codigoAluno || !createForm.codigoDisciplina || !createForm.codigoAnoLectivo) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      await createCertificate({
        codigoAluno: parseInt(createForm.codigoAluno),
        codigoDisciplina: parseInt(createForm.codigoDisciplina),
        codigoAnoLectivo: parseInt(createForm.codigoAnoLectivo),
        observacoes: createForm.observacoes,
      })
      toast.success('Certificado criado com sucesso')
      setShowCreateModal(false)
      setCreateForm({
        codigoTurma: '',
        codigoAluno: '',
        codigoDisciplina: '',
        codigoAnoLectivo: '',
        observacoes: '',
      })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar certificado')
    }
  }

  const handleSignCertificate = async (certificateId: number) => {
    if (!user?.codigo) {
      toast.error('Usuário não identificado')
      return
    }

    try {
      await signCertificate({
        id: certificateId,
        codigoUtilizador: user.codigo,
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Certificado
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-700">Filtros</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Disciplina</label>
              <select
                value={filterDisciplina}
                onChange={(e) => {
                  setFilterDisciplina(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Todas</option>
                {disciplines.map((disc: any) => (
                  <option key={`filter-disc-${disc.codigo}`} value={disc.codigo || ''}>
                    {disc.designacao}
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
                  setFilterDisciplina('')
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
                      Disciplina
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
                        {cert.tb_disciplinas?.designacao || '-'}
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

                        {cert.Status === 'Pendente' && (
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

                        {cert.Status !== 'Cancelado' && (
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
                  Disciplina *
                </label>
                <select
                  value={createForm.codigoDisciplina}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, codigoDisciplina: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Selecione...</option>
                  {disciplines.map((disc: any) => (
                    <option key={`disc-${disc.codigo}`} value={disc.codigo || ''}>
                      {disc.designacao}
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
                <p className="text-sm text-gray-600">Disciplina</p>
                <p className="text-lg font-semibold">
                  {selectedCertificate.tb_disciplinas?.designacao}
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
              {selectedCertificate.Status === 'Pendente' && (
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
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}
