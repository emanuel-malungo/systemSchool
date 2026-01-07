import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'
import { useStudentsManager } from '../../../hooks/useStudent'
import StudentTable from '../../../components/student-management/StudentTable'
import StudentViewModal from '../../../components/student-management/StudentViewModal'
import DeleteConfirmModal from '../../../components/student-management/DeleteConfirmModal'
import type { Student } from '../../../types/student.types'
import Container from '../../../components/layout/Container'

export default function StudentManagement() {
  const navigate = useNavigate()
  
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [matriculaId, setMatriculaId] = useState('')
  
  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

  // Hook de gerenciamento de estudantes
  const {
    students,
    pagination,
    isLoading,
    isDeleting,
    deleteStudentAsync,
  } = useStudentsManager({ 
    page: currentPage, 
    search: searchTerm,
    matriculaId: matriculaId,
  })

  // Handlers
  const handleCreateStudent = () => {
    navigate('/admin/student-management/student/add')
  }

  const handleEditStudent = (student: Student) => {
    navigate(`/admin/student-management/student/edit/${student.codigo}`)
  }

  const handleViewStudent = (student: Student) => {
    // Abre o modal com o ID do estudante para buscar dados completos
    setSelectedStudent(student)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (studentToDelete) {
      try {
        await deleteStudentAsync(studentToDelete.codigo)
        setIsDeleteModalOpen(false)
        setStudentToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar estudante:', error)
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const totalPages = pagination?.totalPages || 1
  const totalItems = pagination?.totalItems || 0

  return (
    <Container>
      {/* Header */}
      <div className="mb-8 bg-linear-to-br from-green-50 via-white to-green-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-100/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Users className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Gerenciamento de Estudantes
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie os estudantes matriculados no sistema
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateStudent}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Novo Estudante
            </button>
          </div>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra de Pesquisa Geral */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
            />
          </div>
          
          {/* Busca por ID da Matrícula */}
          <div className="md:w-64 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ID da matrícula..."
              value={matriculaId}
              onChange={(e) => {
                setMatriculaId(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
            />
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando <span className="text-[#007C00] font-bold">{students.length}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> estudantes
          </span>
          {(searchTerm || matriculaId) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setMatriculaId('')
                setCurrentPage(1)
              }}
              className="text-sm text-[#007C00] hover:text-[#005a00] font-medium hover:underline transition-all"
            >
              Limpar pesquisa
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Estudantes */}
      <StudentTable
        students={students}
        isLoading={isLoading}
        onEdit={handleEditStudent}
        onView={handleViewStudent}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modais */}
      <StudentViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedStudent(null)
        }}
        student={selectedStudent}
        onEdit={() => {
          setIsViewModalOpen(false)
          handleEditStudent(selectedStudent!)
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setStudentToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        studentName={studentToDelete?.nome || ''}
        isDeleting={isDeleting}
      />
    </Container>
  )
}
