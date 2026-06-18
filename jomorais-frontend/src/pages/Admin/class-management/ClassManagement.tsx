import { useState } from 'react'
import { Plus, Search, GraduationCap } from 'lucide-react'
import { useClassesManager } from '../../../hooks/useClass'
import ClassTable from '../../../components/class-management/ClassTable'
import ClassFormModal from '../../../components/class-management/ClassFormModal'
import DeleteConfirmModal from '../../../components/class-management/DeleteConfirmModal'
import type { IClass, IClassInput } from '../../../types/class.types'
import Container from '../../../components/layout/Container'
import { usePageTitle } from '../../../hooks/usePageTitle'

export default function ClassManagement() {
  usePageTitle('Gerenciamento de Classes')

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6 text-[#007C00]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Gerenciamento de Classes
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100">
                  <div className="w-1.5 h-1.5 bg-[#007C00] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[#007C00] font-medium">{totalItems} Classes Ativas</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Gerencie as classes e suas configurações
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCreateClass}
            className="flex items-center gap-2 px-4 py-2 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] transition-colors shadow-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nova Classe
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
                placeholder="Pesquisar por nome da classe..."
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
              Mostrando <span className="font-medium text-gray-900">{classes.length}</span> de <span className="font-medium text-gray-900">{totalItems}</span> resultados
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
      </div>
    </Container>
  )
}
