import { useState } from 'react'
import { Plus, Search, UserCheck, Filter, X } from 'lucide-react'
import { useDirectorTurmasManager } from '../../../hooks/useDirectorTurma'
import type { IDiretorTurma, IDiretorTurmaInput } from '../../../types/directorTurma.types'
import DirectorTurmaTable from '../../../components/director-turma-management/DirectorTurmaTable'
import DirectorTurmaFormModal from '../../../components/director-turma-management/DirectorTurmaFormModal'
import DeleteConfirmModal from '../../../components/director-turma-management/DeleteConfirmModal'
import Container from '../../../components/layout/Container'
import { usePageTitle } from '../../../hooks/usePageTitle'

export default function DirectorTurmaManagement() {
  usePageTitle('Diretores de Turma')

  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [directorTurmaToDelete, setDirectorTurmaToDelete] = useState<IDiretorTurma | null>(null)
  const [directorTurmaToEdit, setDirectorTurmaToEdit] = useState<IDiretorTurma | null>(null)

  const {
    directorTurmas,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createDirectorTurmaAsync,
    updateDirectorTurmaAsync,
    deleteDirectorTurmaAsync,
  } = useDirectorTurmasManager({ 
    page: currentPage,
    search: searchTerm,
  })

  const handleCreateDirectorTurma = () => {
    setDirectorTurmaToEdit(null)
    setIsFormModalOpen(true)
  }

  const handleEditDirectorTurma = (directorTurma: IDiretorTurma) => {
    setDirectorTurmaToEdit(directorTurma)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: IDiretorTurmaInput) => {
    try {
      if (directorTurmaToEdit) {
        await updateDirectorTurmaAsync({
          id: directorTurmaToEdit.codigo,
          data,
        })
      } else {
        await createDirectorTurmaAsync(data)
      }
      setIsFormModalOpen(false)
      setDirectorTurmaToEdit(null)
    } catch (error) {
      console.error('Erro ao salvar diretor de turma:', error)
    }
  }

  const handleDeleteClick = (directorTurma: IDiretorTurma) => {
    setDirectorTurmaToDelete(directorTurma)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (directorTurmaToDelete) {
      try {
        await deleteDirectorTurmaAsync(directorTurmaToDelete.codigo)
        setIsDeleteModalOpen(false)
        setDirectorTurmaToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar diretor de turma:', error)
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
            <UserCheck className="h-6 w-6 text-[#007C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Diretores de Turma
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie os diretores responsáveis pelas turmas
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreateDirectorTurma}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Diretor de Turma
        </button>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtros de pesquisa</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por professor ou turma..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
            />
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Mostrando <span className="text-gray-900 font-semibold">{directorTurmas.length}</span> de <span className="text-gray-900 font-semibold">{totalItems}</span> diretores de turma
          </span>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
            >
              <X className="h-3.5 w-3.5" />
              Limpar pesquisa
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <DirectorTurmaTable
          directorTurmas={directorTurmas}
          isLoading={isLoading}
          onEdit={handleEditDirectorTurma}
          onDelete={handleDeleteClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <DirectorTurmaFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setDirectorTurmaToEdit(null)
        }}
        onSubmit={handleFormSubmit}
        directorTurma={directorTurmaToEdit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDirectorTurmaToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        directorTurmaInfo={
          directorTurmaToDelete
            ? `${directorTurmaToDelete.tb_turmas?.designacao} - ${directorTurmaToDelete.tb_docente?.nome}`
            : ''
        }
        isLoading={isDeleting}
      />
    </Container>
  )
}
