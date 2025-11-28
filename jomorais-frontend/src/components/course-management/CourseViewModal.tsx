import { X, Edit2, Calendar, BookOpen, FileText, Archive } from 'lucide-react'
import type { ICourse } from '../../types/course.types'
import Button from '../common/Button'

interface CourseViewModalProps {
  isOpen: boolean
  onClose: () => void
  course: ICourse | null
  onEdit: () => void
}

export default function CourseViewModal({
  isOpen,
  onClose,
  course,
  onEdit,
}: CourseViewModalProps) {
  if (!isOpen || !course) return null

  const getStatusInfo = (statusCode: number) => {
    switch (statusCode) {
      case 1:
        return {
          label: 'Ativo',
          className: 'bg-green-100 text-green-800',
          icon: null,
        }
      case 2:
        return {
          label: 'Inativo',
          className: 'bg-red-100 text-red-800',
          icon: null,
        }
      case 3:
        return {
          label: 'Arquivado',
          className: 'bg-gray-100 text-gray-800',
          icon: <Archive className="h-4 w-4" />,
        }
      default:
        return {
          label: 'Desconhecido',
          className: 'bg-gray-100 text-gray-800',
          icon: null,
        }
    }
  }

  const statusInfo = getStatusInfo(course.codigo_Status)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#007C00] to-[#005a00]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Detalhes do Curso</h2>
                <p className="text-green-100 text-sm">Visualização completa</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Código e Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Código:</span>
                <span className="text-lg font-bold text-gray-900">#{course.codigo}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </div>

            {/* Designação */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#007C00] rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Designação do Curso
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{course.designacao}</p>
                </div>
              </div>
            </div>

            {/* Duração */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Duração
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {course.duracao ? `${course.duracao} ${course.duracao === 1 ? 'ano' : 'anos'}` : 'Não definida'}
                  </p>
                </div>
              </div>
            </div>

            {/* Descrição */}
            {course.descricao && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Descrição
                    </label>
                    <p className="text-gray-700 leading-relaxed">{course.descricao}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Datas de Criação/Atualização */}
            {(course.createdAt || course.updatedAt) && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                {course.createdAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Criado em
                    </label>
                    <p className="text-sm text-gray-700">
                      {new Date(course.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                {course.updatedAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Atualizado em
                    </label>
                    <p className="text-sm text-gray-700">
                      {new Date(course.updatedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Fechar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Editar Curso
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
