import { Eye, Download } from 'lucide-react'

interface Student {
  id: number
  nome: string
  numeroMatricula: string
  classe: string
  curso: string
  estado: string
}

interface StudentsPreviewTableProps {
  students: Student[]
  currentPage: number
  totalPages: number
  itemsPerPage: number
  onViewDetails: (studentId: number) => void
  onGenerateIndividualReport: (studentId: number) => void
  onPageChange: (page: number) => void
}

export default function StudentsPreviewTable({
  students,
  currentPage,
  totalPages,
  itemsPerPage,
  onViewDetails,
  onGenerateIndividualReport,
  onPageChange
}: StudentsPreviewTableProps) {
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentStudents = students.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Lista pré-visualizada dos Alunos</h3>
        <p className="text-sm text-gray-600">Visualize os dados antes de gerar o relatório</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Aluno</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº de Matrícula</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentStudents.map((student, index) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {startIndex + index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{student.nome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.numeroMatricula}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.classe}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.curso}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    student.estado === 'Ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : student.estado === 'Transferido'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onViewDetails(student.id)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => onGenerateIndividualReport(student.id)}
                      className="text-green-600 hover:text-green-900 flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Gerar Relatório
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, students.length)} de {students.length} alunos
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  )
}
