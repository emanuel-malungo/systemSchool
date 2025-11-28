import { useState } from 'react'
import { Plus, Search, BookOpen } from 'lucide-react'
import { useCoursesManager } from '../../../hooks/useCourse'
import CourseTable from '../../../components/course-management/CourseTable'
import CourseViewModal from '../../../components/course-management/CourseViewModal'
import CourseFormModal from '../../../components/course-management/CourseFormModal'
import DeleteConfirmModal from '../../../components/course-management/DeleteConfirmModal'
import type { ICourse, ICourseInput } from '../../../types/course.types'
import Container from '../../../components/layout/Container'

export default function CourseManagement() {
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null)
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

  const handleViewCourse = (course: ICourse) => {
    setSelectedCourse(course)
    setIsViewModalOpen(true)
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
      {/* Header */}
      <div className="mb-8 bg-linear-to-br from-blue-50 via-white to-blue-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Gerenciamento de Cursos
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie os cursos oferecidos pela instituição
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateCourse}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Novo Curso
            </button>
          </div>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra de Pesquisa */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome do curso..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
            />
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando <span className="text-[#007C00] font-bold">{courses.length}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> cursos
          </span>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
              className="text-sm text-[#007C00] hover:text-[#005a00] font-medium hover:underline transition-all"
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
        onView={handleViewCourse}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modais */}
      <CourseViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedCourse(null)
        }}
        course={selectedCourse}
        onEdit={() => {
          setIsViewModalOpen(false)
          handleEditCourse(selectedCourse!)
        }}
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
    </Container>
  )
}
