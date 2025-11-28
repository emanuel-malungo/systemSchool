import { X, User, IdCard, GraduationCap } from 'lucide-react'
import type { StudentAcademicData } from '../../types/academic-reports.types'

interface AcademicStudentDetailsModalProps {
  isOpen: boolean
  student: StudentAcademicData | null
  onClose: () => void
}

export default function AcademicStudentDetailsModal({
  isOpen,
  student,
  onClose,
}: AcademicStudentDetailsModalProps) {
  if (!isOpen || !student) return null

  const getSafeLabel = (value?: string) => {
    if (!value || value === 'N/A') return 'Não definido'
    return value
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            Detalhes do Aluno
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Informações básicas */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Informações Básicas
            </p>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Nome</p>
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {student.nomeAluno}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Matrícula</p>
                  <p className="text-sm font-medium text-gray-900">
                    {student.numeroMatricula}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {student.status || 'Indefinido'}
                </span>
              </div>
            </div>
          </div>

          {/* Dados acadêmicos resumidos */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Dados Acadêmicos
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border border-gray-200 rounded-xl p-3 bg-white flex items-start gap-2">
                <GraduationCap className="h-4 w-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Classe</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getSafeLabel(student.classe)}
                  </p>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-3 bg-white flex items-start gap-2">
                <IdCard className="h-4 w-4 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Curso</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getSafeLabel(student.curso)}
                  </p>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-3 bg-white flex items-start gap-2">
                <IdCard className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Turma</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getSafeLabel(student.turma)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Observação sobre dados detalhados */}
          <div className="mt-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3">
            <p className="text-xs text-gray-600">
              Dados detalhados de notas, frequência e disciplinas ainda não estão disponíveis neste módulo
              de relatórios acadêmicos. No momento, esta visão mostra apenas informações básicas do aluno.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
