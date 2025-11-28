import { X, Pencil, Hash, User, Mail, Phone, Award, CheckCircle, XCircle } from 'lucide-react'
import type { IDocente } from '../../types/teacher.types'
import Button from '../common/Button'

interface TeacherViewModalProps {
  isOpen: boolean
  onClose: () => void
  teacher: IDocente | null
  onEdit: (teacher: IDocente) => void
}

export default function TeacherViewModal({
  isOpen,
  onClose,
  teacher,
  onEdit,
}: TeacherViewModalProps) {
  if (!isOpen || !teacher) return null

  const handleEdit = () => {
    onEdit(teacher)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#007C00]/10 flex items-center justify-center">
                <User className="h-6 w-6 text-[#007C00]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Professor</h2>
                <p className="text-sm text-gray-500 mt-0.5">Informações completas do professor</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Informações Principais */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Código</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">#{teacher.codigo}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Nome</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{teacher.nome}</p>
              </div>
            </div>

            {/* Contactos */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Email</span>
                </div>
                <p className="text-sm text-gray-900">{teacher.email}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Contacto</span>
                </div>
                <p className="text-sm text-gray-900">{teacher.contacto}</p>
              </div>
            </div>

            {/* Especialidade e Status */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Especialidade</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {teacher.tb_especialidade.designacao}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                </div>
                {teacher.status === 1 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inativo
                  </span>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            {teacher._count && (
              <div className="bg-linear-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Estatísticas</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Disciplinas</p>
                    <p className="text-2xl font-bold text-[#007C00]">{teacher._count.tb_disciplinas_docente || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Diretor de Turmas</p>
                    <p className="text-2xl font-bold text-[#007C00]">{teacher._count.tb_directores_turmas || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Turmas</p>
                    <p className="text-2xl font-bold text-[#007C00]">{teacher._count.tb_docente_turma || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="secondary" onClick={onClose}>
              Fechar
            </Button>
            <Button type="button" variant="primary" onClick={handleEdit} className="bg-[#007C00] hover:bg-[#005a00]">
              <Pencil className="h-4 w-4 mr-2" />
              Editar Professor
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
