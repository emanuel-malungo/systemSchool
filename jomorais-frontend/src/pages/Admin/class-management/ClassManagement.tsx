import { useState } from 'react'
import { Plus, Search, GraduationCap } from 'lucide-react'
import { useClassesManager } from '../../../hooks/useClass'
import ClassTable from '../../../components/class-management/ClassTable'
import ClassFormModal from '../../../components/class-management/ClassFormModal'
import DeleteConfirmModal from '../../../components/class-management/DeleteConfirmModal'
import type { IClass, IClassInput } from '../../../types/class.types'
import Container from '../../../components/layout/Container'

export default function ClassManagement() {
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [classToDelete, setClassToDelete] = useState<IClass | null>(null)
  const [classToEdit, setClassToEdit] = useState<IClass | null>(null)

  // Hook de gerenciamento de classes
  const {
    classes,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createClassAsync,
    updateClassAsync,
    deleteClassAsync,
  } = useClassesManager({ 
    page: currentPage,
    search: searchTerm,
  })

  // Handlers
  const handleCreateClass = () => {
    setClassToEdit(null)
    setIsFormModalOpen(true)
  }

  const handleEditClass = (classItem: IClass) => {
    setClassToEdit(classItem)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: IClassInput) => {
    try {
      if (classToEdit) {
        // Atualizar classe existente
        await updateClassAsync({
          id: classToEdit.codigo,
          classData: data,
        })
      } else {
        // Criar nova classe
        await createClassAsync(data)
      }
      setIsFormModalOpen(false)
      setClassToEdit(null)
    } catch (error) {
      console.error('Erro ao salvar classe:', error)
    }
  }

  const handleDeleteClick = (classItem: IClass) => {
    setClassToDelete(classItem)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (classToDelete) {
      try {
        await deleteClassAsync(classToDelete.codigo)
        setIsDeleteModalOpen(false)
        setClassToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar classe:', error)
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
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Gerenciamento de Classes
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie as classes e suas configurações
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateClass}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Nova Classe
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
              placeholder="Pesquisar por nome da classe..."
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
            Mostrando <span className="text-[#007C00] font-bold">{classes.length}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> classes
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

      {/* Tabela de Classes */}
      <ClassTable
        classes={classes}
        isLoading={isLoading}
        onEdit={handleEditClass}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <ClassFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setClassToEdit(null)
        }}
        onSubmit={handleFormSubmit}
        classItem={classToEdit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setClassToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        className={classToDelete?.designacao || 'Classe'}
        isDeleting={isDeleting}
      />
    </Container>
  )
}
