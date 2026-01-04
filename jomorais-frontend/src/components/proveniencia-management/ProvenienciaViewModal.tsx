import { X, Edit2, Building, MapPin, Phone, Calendar, User } from 'lucide-react'
import { useProveniencia } from '../../hooks/useProveniencia'
import type { Proveniencia } from '../../types/proveniencia.types'
import Button from '../common/Button'

interface ProvenienciaViewModalProps {
  isOpen: boolean
  onClose: () => void
  proveniencia: Proveniencia | null
  onEdit: () => void
}

export default function ProvenienciaViewModal({
  isOpen,
  onClose,
  proveniencia,
  onEdit,
}: ProvenienciaViewModalProps) {
  // Busca dados completos da proveniência
  const { data: provenienciaData, isLoading } = useProveniencia(
    proveniencia?.codigo || 0,
    isOpen && !!proveniencia
  )
  
  // Usa os dados completos se disponíveis, senão usa os dados básicos
  const fullProveniencia = provenienciaData?.data || proveniencia
  
  if (!isOpen || !proveniencia) return null
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={onClose} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!fullProveniencia) return null

  const formatDate = (date: string | Date) => {
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

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header fixo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">Detalhes da Proveniência</h2>
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
            {/* Cabeçalho da Proveniência */}
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="h-16 w-16 rounded-full bg-[#007C00] flex items-center justify-center text-white text-2xl font-bold">
                {fullProveniencia.designacao?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {fullProveniencia.designacao || 'Proveniência não disponível'}
                </h3>
                <p className="text-gray-600">Código #{fullProveniencia.codigo}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  fullProveniencia.codigoStatus === 1
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusText(fullProveniencia.codigoStatus)}
                </span>
              </div>
            </div>

            {/* Informações da Proveniência */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Designação</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullProveniencia.designacao || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Localização</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullProveniencia.localizacao || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contacto</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullProveniencia.contacto || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-[#007C00]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de Cadastro</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(fullProveniencia.dataCadastro)}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações do Utilizador */}
            {fullProveniencia.tb_utilizadores && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#007C00]" />
                  Cadastrado por
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nome:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {fullProveniencia.tb_utilizadores.nome}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Usuário:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {fullProveniencia.tb_utilizadores.user}
                      </span>
                    </div>
                    {fullProveniencia.tb_utilizadores.email && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 text-gray-900 font-medium">
                          {fullProveniencia.tb_utilizadores.email}
                        </span>
                      </div>
                    )}
                  </div>
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
              Editar Proveniência
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
