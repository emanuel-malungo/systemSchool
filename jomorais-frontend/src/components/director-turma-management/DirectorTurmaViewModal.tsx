import { X, Pencil, Hash, User, School, Calendar, FileText, UserCheck } from 'lucide-react'
import type { IDiretorTurma } from '../../types/directorTurma.types'
import Button from '../common/Button'

interface DirectorTurmaViewModalProps {
  isOpen: boolean
  onClose: () => void
  directorTurma: IDiretorTurma | null
  onEdit: (directorTurma: IDiretorTurma) => void
}

export default function DirectorTurmaViewModal({
  isOpen,
  onClose,
  directorTurma,
  onEdit,
}: DirectorTurmaViewModalProps) {
  if (!isOpen || !directorTurma) return null

  const handleEdit = () => {
    onEdit(directorTurma)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Diretor de Turma</h2>
                <p className="text-sm text-gray-500 mt-0.5">Informações completas</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Código</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">#{directorTurma.codigo}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Ano Letivo</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{directorTurma.codigoAnoLectivo}</p>
              </div>
            </div>

            {directorTurma.designacao && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Designação</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{directorTurma.designacao}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-emerald-600" />
                  <span className="text-base font-semibold text-gray-900">Diretor</span>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-bold text-gray-900">
                    {directorTurma.tb_docente?.nome || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Contacto: {directorTurma.tb_docente?.contacto || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <School className="h-5 w-5 text-blue-600" />
                  <span className="text-base font-semibold text-gray-900">Turma</span>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-bold text-gray-900">
                    {directorTurma.tb_turmas?.designacao || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="secondary" onClick={onClose}>
              Fechar
            </Button>
            <Button type="button" variant="primary" onClick={handleEdit} className="bg-emerald-600 hover:bg-emerald-700">
              <Pencil className="h-4 w-4 mr-2" />
              Editar Diretor de Turma
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
