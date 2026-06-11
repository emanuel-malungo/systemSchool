import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users, Filter, X } from 'lucide-react'
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

  const handleClearFilters = () => {
    setSearchTerm('')
    setMatriculaId('')
    setCurrentPage(1)
  }

  const totalPages = pagination?.totalPages || 1
  const totalItems = pagination?.totalItems || 0
  const hasActiveFilters = searchTerm || matriculaId

  return (
    <Container>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-[#007C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Estudantes
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie os estudantes matriculados no sistema
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreateStudent}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Estudante
        </button>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtros de pesquisa</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Barra de Pesquisa Geral */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
            />
          </div>
          
          {/* Busca por ID da Matrícula */}
          <div className="md:w-56 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ID da matrícula..."
              value={matriculaId}
              onChange={(e) => {
                setMatriculaId(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
            />
          </div>
        </div>

        {/* Contador de Resultados e Ações */}
        <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Mostrando <span className="text-gray-900 font-semibold">{students.length}</span> de <span className="text-gray-900 font-semibold">{totalItems}</span> estudantes
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
            >
              <X className="h-3.5 w-3.5" />
              Limpar filtros
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
