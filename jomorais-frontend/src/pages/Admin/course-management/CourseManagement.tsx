import { useState } from 'react'
import { Plus, Search, BookOpen } from 'lucide-react'
import { useCoursesManager } from '../../../hooks/useCourse'
import CourseTable from '../../../components/course-management/CourseTable'
import CourseFormModal from '../../../components/course-management/CourseFormModal'
import DeleteConfirmModal from '../../../components/course-management/DeleteConfirmModal'
import type { ICourse, ICourseInput } from '../../../types/course.types'
import Container from '../../../components/layout/Container'
import { usePageTitle } from '../../../hooks/usePageTitle'

export default function CourseManagement() {
  usePageTitle('Gerenciamento de Cursos')

  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<ICourse | null>(null)
  const [courseToEdit, setCourseToEdit] = useState<ICourse | null>(null)

  // Hook de gerenciamento de cursos
  const {
    courses,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createCourseAsync,
    updateCourseAsync,
    deleteCourseAsync,
  } = useCoursesManager({ 
    page: currentPage, 
    search: searchTerm,
  })

  // Handlers
  const handleCreateCourse = () => {
    setCourseToEdit(null)
    setIsFormModalOpen(true)
  }

  const handleEditCourse = (course: ICourse) => {
    setCourseToEdit(course)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: ICourseInput) => {
    try {
      if (courseToEdit) {
        // Atualizar curso existente
        await updateCourseAsync({
          id: courseToEdit.codigo,
          courseData: data,
        })
      } else {
        // Criar novo curso
        await createCourseAsync(data)
      }
      setIsFormModalOpen(false)
      setCourseToEdit(null)
    } catch (error) {
      console.error('Erro ao salvar curso:', error)
    }
  }


  const handleDeleteClick = (course: ICourse) => {
    setCourseToDelete(course)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (courseToDelete) {
      try {
        await deleteCourseAsync(courseToDelete.codigo)
        setIsDeleteModalOpen(false)
        setCourseToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar curso:', error)
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-[#007C00]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Gerenciamento de Cursos
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100">
                  <div className="w-1.5 h-1.5 bg-[#007C00] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[#007C00] font-medium">{totalItems} Cursos Ativos</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Gerencie os cursos oferecidos pela instituição
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCreateCourse}
            className="flex items-center gap-2 px-4 py-2 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] transition-colors shadow-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Novo Curso
          </button>
        </div>

        {/* Filtros e Pesquisa */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barra de Pesquisa */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome do curso..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all text-sm"
              />
            </div>
          </div>

          {/* Contador de Resultados */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Mostrando <span className="font-medium text-gray-900">{courses.length}</span> de <span className="font-medium text-gray-900">{totalItems}</span> resultados
            </span>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
                className="text-sm text-[#007C00] hover:text-[#005a00] font-medium transition-colors"
              >
                Limpar pesquisa
              </button>
            )}
          </div>
        </div>

      {/* Tabela de Cursos */}
      <CourseTable
        courses={courses}
        isLoading={isLoading}
        onEdit={handleEditCourse}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />


      <CourseFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setCourseToEdit(null)
        }}
        onSubmit={handleFormSubmit}
        course={courseToEdit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setCourseToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        courseName={courseToDelete?.designacao || 'Curso'}
        isDeleting={isDeleting}
      />
      </div>
    </Container>
  )
}
