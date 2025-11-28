import { X, Edit2, User, Calendar, GraduationCap, FileText, CheckCircle, Phone, Mail, MapPin, Users } from 'lucide-react'
import { useMatricula } from '../../hooks/useMatricula'
import type { IMatricula } from '../../types/matricula.types'
import Button from '../common/Button'

interface MatriculaViewModalProps {
  isOpen: boolean
  onClose: () => void
  matricula: IMatricula | null
  onEdit: () => void
}

export default function MatriculaViewModal({
  isOpen,
  onClose,
  matricula,
  onEdit,
}: MatriculaViewModalProps) {
  // Busca dados completos da matrícula
  const { data: matriculaData, isLoading } = useMatricula(matricula?.codigo || 0, isOpen && !!matricula)
  
  // Usa os dados completos se disponíveis, senão usa os dados básicos
  const fullMatricula = matriculaData?.data || matricula
  
  if (!isOpen || !matricula) return null
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={onClose} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!fullMatricula) return null

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return 'Data inválida'
    }
  }

  const getStatusText = (status: number) => {
    return status === 1 ? 'Ativa' : 'Inativa'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header fixo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">Detalhes da Matrícula</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
            {/* Cabeçalho da Matrícula */}
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="h-16 w-16 rounded-full bg-[#007C00] flex items-center justify-center text-white text-2xl font-bold">
                {fullMatricula.tb_alunos.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{fullMatricula.tb_alunos.nome}</h3>
                <p className="text-gray-600">Matrícula #{fullMatricula.codigo}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  fullMatricula.codigoStatus === 1
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusText(fullMatricula.codigoStatus)}
                </span>
              </div>
            </div>

            {/* Informações da Matrícula */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-[#007C00]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de Matrícula</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(fullMatricula.data_Matricula)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Curso</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullMatricula.tb_cursos.designacao}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações Pessoais do Aluno */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-[#007C00]" />
                Dados Pessoais do Aluno
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nome Completo</p>
                    <p className="text-base font-semibold text-gray-900">
                      {fullMatricula.tb_alunos.nome}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sexo</p>
                    <p className="text-base font-semibold text-gray-900">
                      {fullMatricula.tb_alunos.sexo}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-[#007C00]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data de Nascimento</p>
                    <p className="text-base font-semibold text-gray-900">
                      {fullMatricula.tb_alunos.dataNascimento ? formatDate(fullMatricula.tb_alunos.dataNascimento) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="text-base font-semibold text-gray-900">
                      {fullMatricula.tb_alunos.telefone && fullMatricula.tb_alunos.telefone.trim() !== '' ? fullMatricula.tb_alunos.telefone : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-semibold text-gray-900">
                      {fullMatricula.tb_alunos.email && fullMatricula.tb_alunos.email.trim() !== '' ? fullMatricula.tb_alunos.email : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Morada</p>
                    <p className="text-base font-semibold text-gray-900">
                      {fullMatricula.tb_alunos.morada || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filiação */}
            {(fullMatricula.tb_alunos.pai || fullMatricula.tb_alunos.mae) && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#007C00]" />
                  Filiação
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nome do Pai</p>
                      <p className="text-base font-semibold text-gray-900">
                        {fullMatricula.tb_alunos.pai || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nome da Mãe</p>
                      <p className="text-base font-semibold text-gray-900">
                        {fullMatricula.tb_alunos.mae || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Informações do Utilizador */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#007C00]" />
                Matriculado por
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nome:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullMatricula.tb_utilizadores.nome}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Usuário:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullMatricula.tb_utilizadores.user}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmações */}
            {fullMatricula.tb_confirmacoes && fullMatricula.tb_confirmacoes.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#007C00]" />
                  Confirmações ({fullMatricula.tb_confirmacoes.length})
                </h4>
                <div className="space-y-3">
                  {fullMatricula.tb_confirmacoes.map((confirmacao) => (
                    <div key={confirmacao.codigo} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Turma:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {confirmacao.tb_turmas.designacao}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Classe:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {confirmacao.tb_turmas.tb_classes.designacao}
                          </span>
                        </div>
                        {confirmacao.data_Confirmacao && (
                          <div>
                            <span className="text-gray-500">Data Confirmação:</span>
                            <span className="ml-2 text-gray-900 font-medium">
                              {formatDate(confirmacao.data_Confirmacao)}
                            </span>
                          </div>
                        )}
                        {confirmacao.mes_Comecar && (
                          <div>
                            <span className="text-gray-500">Mês Começar:</span>
                            <span className="ml-2 text-gray-900 font-medium">
                              {confirmacao.mes_Comecar}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Footer com Ações */}
          <div className="flex gap-3 p-6 border-t border-gray-200 shrink-0">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={onEdit}
              variant="primary"
              className="flex-1 bg-[#007C00] hover:bg-[#005a00]"
            >
              <Edit2 className="h-4 w-4" />
              Editar Matrícula
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
