import { X, Edit2, User, Calendar, Building, FileText, AlertCircle } from 'lucide-react'
import { useTransfer } from '../../hooks/useTransfer'
import type { ITransfer } from '../../types/transfer.types'
import Button from '../common/Button'

interface TransferViewModalProps {
  isOpen: boolean
  onClose: () => void
  transfer: ITransfer | null
  onEdit: () => void
}

export default function TransferViewModal({
  isOpen,
  onClose,
  transfer,
  onEdit,
}: TransferViewModalProps) {
  // Busca dados completos da transferência
  const { data: transferData, isLoading } = useTransfer(
    transfer?.codigo || 0,
    isOpen && !!transfer
  )
  
  // Usa os dados completos se disponíveis, senão usa os dados básicos
  const fullTransfer = transferData?.data || transfer
  
  if (!isOpen || !transfer) return null
  
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
  
  if (!fullTransfer) return null

  const formatDate = (date: string | object | null) => {
    if (!date) return 'N/A'
    if (typeof date === 'object') return 'N/A'
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

  // Mapeamento de motivos
  const getMotivoText = (codigoMotivo: number) => {
    const motivos: Record<number, string> = {
      1: 'Mudança de Residência',
      2: 'Problemas Financeiros',
      3: 'Insatisfação com a Escola',
      4: 'Problemas de Saúde',
      5: 'Outros Motivos',
    }
    return motivos[codigoMotivo] || `Motivo ${codigoMotivo}`
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header fixo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">Detalhes da Transferência</h2>
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
            {/* Cabeçalho da Transferência */}
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
              <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-bold">
                {fullTransfer.tb_alunos?.nome?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {fullTransfer.tb_alunos?.nome || 'Aluno não disponível'}
                </h3>
                <p className="text-gray-600">Transferência #{fullTransfer.codigo}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                  Transferido
                </span>
              </div>
            </div>

            {/* Informações da Transferência */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data da Transferência</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(fullTransfer.dataTransferencia)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Escola Destino</p>
                  <p className="text-base font-semibold text-gray-900">
                    Escola #{fullTransfer.codigoEscola}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 col-span-2">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Motivo da Transferência</p>
                  <p className="text-base font-semibold text-gray-900">
                    {getMotivoText(fullTransfer.codigoMotivo)}
                  </p>
                </div>
              </div>
            </div>

            {/* Observações */}
            {fullTransfer.obs && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#007C00]" />
                  Observações
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {fullTransfer.obs}
                  </p>
                </div>
              </div>
            )}

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
                      {fullTransfer.tb_alunos?.nome || 'N/A'}
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
                      {fullTransfer.tb_alunos?.sexo || 'N/A'}
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
                      {fullTransfer.tb_alunos?.dataNascimento ? formatDate(fullTransfer.tb_alunos.dataNascimento) : 'N/A'}
                    </p>
                  </div>
                </div>

                {fullTransfer.tb_alunos?.telefone && (
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="text-base font-semibold text-gray-900">
                        {fullTransfer.tb_alunos.telefone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informações do Encarregado */}
            {fullTransfer.tb_alunos?.tb_encarregados && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#007C00]" />
                  Encarregado de Educação
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nome:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {fullTransfer.tb_alunos.tb_encarregados.nome}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Telefone:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {fullTransfer.tb_alunos.tb_encarregados.telefone}
                      </span>
                    </div>
                    {fullTransfer.tb_alunos.tb_encarregados.email && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 text-gray-900 font-medium">
                          {fullTransfer.tb_alunos.tb_encarregados.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Informações do Utilizador */}
            {fullTransfer.tb_utilizadores && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#007C00]" />
                  Transferência Registrada por
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nome:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {fullTransfer.tb_utilizadores.nome}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Usuário:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {fullTransfer.tb_utilizadores.user}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data de Atualização */}
            {fullTransfer.dataActualizacao && typeof fullTransfer.dataActualizacao === 'string' && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Última atualização: {formatDate(fullTransfer.dataActualizacao)}</span>
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
              Editar Transferência
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
