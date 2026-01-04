import { useState } from 'react'
import { Plus, Search, UserCheck } from 'lucide-react'
import { useDirectorTurmasManager } from '../../../hooks/useDirectorTurma'
import type { IDiretorTurma, IDiretorTurmaInput } from '../../../types/directorTurma.types'
import DirectorTurmaTable from '../../../components/director-turma-management/DirectorTurmaTable'
import DirectorTurmaFormModal from '../../../components/director-turma-management/DirectorTurmaFormModal'
import DeleteConfirmModal from '../../../components/director-turma-management/DeleteConfirmModal'
import Container from '../../../components/layout/Container'

export default function DirectorTurmaManagement() {
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
      <div className="mb-8 bg-linear-to-br from-emerald-50 via-white to-emerald-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-emerald-600 to-emerald-800 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Diretores de Turma
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie os diretores responsáveis pelas turmas
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateDirectorTurma}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-600 to-emerald-800 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Novo Diretor de Turma
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por professor ou turma..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando <span className="text-emerald-600 font-bold">{directorTurmas.length}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> diretores de turma
          </span>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
              className="text-sm text-emerald-600 hover:text-emerald-800 font-medium hover:underline transition-all"
            >
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
