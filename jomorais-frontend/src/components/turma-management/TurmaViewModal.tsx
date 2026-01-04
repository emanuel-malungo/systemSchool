import { X, Edit2, Users, BookOpen, Home, Clock, Calendar, CheckCircle, XCircle, Archive } from 'lucide-react'
import type { ITurma } from '../../types/turma.types'
import Button from '../common/Button'

interface TurmaViewModalProps {
  isOpen: boolean
  onClose: () => void
  turma: ITurma | null
  onEdit?: () => void
}

export default function TurmaViewModal({
  isOpen,
  onClose,
  turma,
  onEdit,
}: TurmaViewModalProps) {
  if (!isOpen || !turma) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'Inativo':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'Arquivado':
        return <Archive className="h-5 w-5 text-gray-600" />
      default:
        return <CheckCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">Ativo</span>
      case 'Inativo':
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">Inativo</span>
      case 'Arquivado':
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">Arquivado</span>
      default:
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/20 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0 bg-gradient-to-r from-green-50 to-white">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#007C00] to-[#005a00] flex items-center justify-center text-white font-bold text-xl">
                {turma.designacao?.charAt(0).toUpperCase() || 'T'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {turma.designacao}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(turma.status)}
                  {getStatusBadge(turma.status)}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Informações Principais */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#007C00]" />
                  Informações Acadêmicas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Classe</p>
                    <p className="text-base font-medium text-gray-900">
                      {turma.tb_classes?.designacao || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Curso</p>
                    <p className="text-base font-medium text-gray-900">
                      {turma.tb_cursos?.designacao || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Localização e Horário */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="h-5 w-5 text-[#007C00]" />
                  Localização e Horário
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Sala</p>
                    <p className="text-base font-medium text-gray-900">
                      {turma.tb_salas?.designacao || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Período</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <p className="text-base font-medium text-gray-900">
                        {turma.tb_periodos?.designacao || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacidade */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-5 border border-green-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#007C00]" />
                  Capacidade
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Máximo de Alunos</p>
                    <p className="text-3xl font-bold text-[#007C00]">
                      {turma.max_Alunos || 0}
                    </p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-[#007C00] flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Ano Letivo */}
              {turma.codigo_AnoLectivo && (
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#007C00]" />
                    Ano Letivo
                  </h3>
                  <p className="text-base font-medium text-gray-900">
                    Código: {turma.codigo_AnoLectivo}
                  </p>
                </div>
              )}

              {/* Informações Adicionais */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  ℹ️ Informações Adicionais
                </h4>
                <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                  <li>Código da Turma: <span className="font-semibold">{turma.codigo}</span></li>
                  <li>Status atual: <span className="font-semibold">{turma.status}</span></li>
                  {turma.max_Alunos && (
                    <li>Capacidade máxima: <span className="font-semibold">{turma.max_Alunos} alunos</span></li>
                  )}
                </ul>
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
                className="flex-1 bg-[#007C00] hover:bg-[#005a00] flex items-center justify-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Editar Turma
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
