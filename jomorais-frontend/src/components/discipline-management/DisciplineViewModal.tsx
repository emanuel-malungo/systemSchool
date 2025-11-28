import { X, Edit2, BookOpen, GraduationCap, BookMarked, Activity } from 'lucide-react'
import type { IDiscipline } from '../../types/discipline.types'
import Button from '../common/Button'

interface DisciplineViewModalProps {
  isOpen: boolean
  onClose: () => void
  discipline: IDiscipline | null
  onEdit: () => void
}

export default function DisciplineViewModal({
  isOpen,
  onClose,
  discipline,
  onEdit,
}: DisciplineViewModalProps) {
  if (!isOpen || !discipline) return null

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 1:
        return {
          label: 'Ativa',
          className: 'bg-green-100 text-green-800',
          icon: null,
        }
      case 0:
        return {
          label: 'Inativa',
          className: 'bg-red-100 text-red-800',
          icon: null,
        }
      default:
        return {
          label: 'Desconhecido',
          className: 'bg-gray-100 text-gray-800',
          icon: null,
        }
    }
  }

  const getTipoInfo = (cadeiraEspecifica?: number) => {
    if (cadeiraEspecifica === 1) {
      return {
        label: 'Específica',
        className: 'bg-purple-100 text-purple-800',
        icon: <BookMarked className="h-4 w-4" />,
      }
    }
    return {
      label: 'Geral',
      className: 'bg-blue-100 text-blue-800',
      icon: null,
    }
  }

  const statusInfo = getStatusInfo(discipline.status)
  const tipoInfo = getTipoInfo(discipline.cadeiraEspecifica)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-[#007C00] to-[#005a00]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Detalhes da Disciplina</h2>
                <p className="text-green-100 text-sm">Visualização completa</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              title="Fechar"
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
                <span className="text-lg font-bold text-gray-900">#{discipline.codigo}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${tipoInfo.className}`}>
                  {tipoInfo.icon}
                  {tipoInfo.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </span>
              </div>
            </div>

            {/* Designação */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#007C00] rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Designação da Disciplina
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{discipline.designacao}</p>
                </div>
              </div>
            </div>

            {/* Curso */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Curso
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {discipline.tb_cursos?.designacao || 'Não definido'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tipo de Disciplina */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  discipline.cadeiraEspecifica === 1 ? 'bg-purple-500' : 'bg-blue-500'
                }`}>
                  <BookMarked className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Tipo de Disciplina
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {discipline.cadeiraEspecifica === 1 ? 'Específica' : 'Geral'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {discipline.cadeiraEspecifica === 1 
                      ? 'Disciplina específica do curso' 
                      : 'Disciplina de formação geral'}
                  </p>
                </div>
              </div>
            </div>

            {/* Grade Curricular */}
            {discipline.tb_grade_curricular && discipline.tb_grade_curricular.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Grade Curricular
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {discipline.tb_grade_curricular.length} {discipline.tb_grade_curricular.length === 1 ? 'registro' : 'registros'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Esta disciplina está presente em {discipline.tb_grade_curricular.length} grade(s) curricular(es)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  discipline.status === 1 ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {discipline.status === 1 ? 'Ativa' : 'Inativa'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {discipline.status === 1 
                      ? 'Disciplina disponível para uso' 
                      : 'Disciplina não disponível para uso'}
                  </p>
                </div>
              </div>
            </div>
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
              Editar Disciplina
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
