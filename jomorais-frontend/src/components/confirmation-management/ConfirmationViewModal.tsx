import { X, Edit2, User, Calendar, GraduationCap, FileText, CheckCircle, Building } from 'lucide-react'
import { useConfirmation } from '../../hooks/useConfirmation'
import type { IConfirmation } from '../../types/confirmation.types'
import Button from '../common/Button'

interface ConfirmationViewModalProps {
  isOpen: boolean
  onClose: () => void
  confirmation: IConfirmation | null
  onEdit?: () => void  // Opcional - apenas para administradores
}

export default function ConfirmationViewModal({
  isOpen,
  onClose,
  confirmation,
  onEdit,
}: ConfirmationViewModalProps) {
  // Busca dados completos da confirmação
  const { data: confirmationData, isLoading } = useConfirmation(
    confirmation?.codigo || 0,
    isOpen && !!confirmation
  )
  
  // Usa os dados completos se disponíveis, senão usa os dados básicos
  const fullConfirmation = confirmationData?.data || confirmation
  
  if (!isOpen || !confirmation) return null
  
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
  
  if (!fullConfirmation) return null

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
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
            <h2 className="text-2xl font-bold text-gray-900">Detalhes da Confirmação</h2>
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
            {/* Cabeçalho da Confirmação */}
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="h-16 w-16 rounded-full bg-[#007C00] flex items-center justify-center text-white text-2xl font-bold">
                {fullConfirmation.tb_matriculas?.tb_alunos?.nome?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {fullConfirmation.tb_matriculas?.tb_alunos?.nome || 'Aluno não disponível'}
                </h3>
                <p className="text-gray-600">Confirmação #{fullConfirmation.codigo}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  fullConfirmation.codigo_Status === 1
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusText(fullConfirmation.codigo_Status)}
                </span>
              </div>
            </div>

            {/* Informações da Confirmação */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-[#007C00]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de Confirmação</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(fullConfirmation.data_Confirmacao)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mês Começar</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullConfirmation.mes_Comecar ? formatDate(fullConfirmation.mes_Comecar) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Classificação</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullConfirmation.classificacao || 'Pendente'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Curso</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullConfirmation.tb_matriculas?.tb_cursos?.designacao || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações da Turma */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Building className="h-4 w-4 text-[#007C00]" />
                Informações da Turma
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Turma:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullConfirmation.tb_turmas?.designacao || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Classe:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullConfirmation.tb_turmas?.tb_classes?.designacao || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sala:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullConfirmation.tb_turmas?.tb_salas?.designacao || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Período:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullConfirmation.tb_turmas?.tb_periodos?.designacao || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Capacidade:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullConfirmation.tb_turmas?.max_Alunos || 'N/A'} alunos
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status da Turma:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullConfirmation.tb_turmas?.status || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do Aluno */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-[#007C00]" />
                Dados do Aluno
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nome Completo</p>
                    <p className="text-base font-semibold text-gray-900">
                      {fullConfirmation.tb_matriculas?.tb_alunos?.nome || 'N/A'}
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
                      {fullConfirmation.tb_matriculas?.tb_alunos?.sexo || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do Utilizador */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#007C00]" />
                Confirmado por
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nome:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullConfirmation.tb_utilizadores?.nome || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Usuário:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullConfirmation.tb_utilizadores?.user || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
            {onEdit && (
              <Button
                type="button"
                onClick={onEdit}
                variant="primary"
                className="flex-1 bg-[#007C00] hover:bg-[#005a00]"
              >
                <Edit2 className="h-4 w-4" />
                Editar Confirmação
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
