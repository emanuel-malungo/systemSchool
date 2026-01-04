import { X, Edit2, User, Shield, Calendar, Activity, Award } from 'lucide-react'
import type { LegacyUser } from '../../../types/users.types'
import { commonUserAccessTypes } from '../../../mocks/userAccessTypes.mock'
import { getStatusByCode, getStatusColor } from '../../../mocks/status.mock'
import Button from '../../common/Button'

interface UserViewModalProps {
  isOpen: boolean
  onClose: () => void
  user: LegacyUser | null
  onEdit: () => void
}

export default function UserViewModal({
  isOpen,
  onClose,
  user,
  onEdit,
}: UserViewModalProps) {
  if (!isOpen || !user) return null

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Data inválida'
    }
  }

  // Buscar a designação do tipo de usuário no mock
  const getUserTypeName = () => {
    // Primeiro tenta buscar no mock pelo código
    const userType = commonUserAccessTypes.find(
      (type) => type.codigo === user.codigo_Tipo_Utilizador
    )
    
    // Se encontrar no mock, retorna
    if (userType) {
      return userType.designacao
    }
    
    // Se não encontrar no mock, tenta usar o que veio da API
    if (user.tb_tipos_utilizador?.tipoDesignacao) {
      return user.tb_tipos_utilizador.tipoDesignacao
    }
    
    // Log para debug
    console.log('Código de tipo não encontrado no modal:', user.codigo_Tipo_Utilizador)
    
    return 'N/A'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/20 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalhes do Usuário</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="space-y-6">
            {/* Cabeçalho do Usuário */}
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="h-16 w-16 rounded-full bg-[#007C00] flex items-center justify-center text-white text-2xl font-bold">
                {user.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{user.nome}</h3>
                <p className="text-gray-600">@{user.user}</p>
              </div>
              <div>
                {user.codigoStatus ? (
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      getStatusColor(user.codigoStatus)
                    }`}
                  >
                    {getStatusByCode(user.codigoStatus)?.designacao || 'N/A'}
                  </span>
                ) : (
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      user.estadoActual === 'ATIVO'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.estadoActual}
                  </span>
                )}
              </div>
            </div>

            {/* Informações do Usuário */}
            <div className="grid grid-cols-2 gap-6">
              {/* Código */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Código</p>
                  <p className="text-base font-semibold text-gray-900">#{user.codigo}</p>
                </div>
              </div>

              {/* Tipo de Usuário */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo de Usuário</p>
                  <p className="text-base font-semibold text-gray-900">
                    {getUserTypeName()}
                  </p>
                </div>
              </div>

              {/* Data de Cadastro */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-[#007C00]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de Cadastro</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(user.dataCadastro)}
                  </p>
                </div>
              </div>

              {/* Status de Login */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status de Login</p>
                  <p className="text-base font-semibold text-gray-900">
                    {user.loginStatus === 'ON' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                  user.codigoStatus
                    ? getStatusColor(user.codigoStatus).split(' ')[0]
                    : user.estadoActual === 'ATIVO'
                    ? 'bg-green-100'
                    : 'bg-red-100'
                }`}>
                  <Award className={`h-5 w-5 ${
                    user.codigoStatus
                      ? getStatusColor(user.codigoStatus).split(' ')[1].replace('text-', '')
                      : user.estadoActual === 'ATIVO'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-gray-900">
                      {user.codigoStatus
                        ? getStatusByCode(user.codigoStatus)?.designacao || 'N/A'
                        : user.estadoActual}
                    </p>
                    {user.codigoStatus && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        getStatusColor(user.codigoStatus)
                      }`}>
                        {getStatusByCode(user.codigoStatus)?.tb_tipo_status.designacao}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Informações Adicionais</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nome de Usuário:</span>
                  <span className="ml-2 text-gray-900 font-medium">{user.user}</span>
                </div>
                <div>
                  <span className="text-gray-500">Código do Tipo:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {user.codigo_Tipo_Utilizador}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer com Ações */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
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
              className="flex-1 bg-[#007C00] hover:bg-[#005a00] focus:ring-[#007C00]/40 border-[#007C00]"
            >
              <Edit2 className="h-4 w-4" />
              Editar Usuário
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
