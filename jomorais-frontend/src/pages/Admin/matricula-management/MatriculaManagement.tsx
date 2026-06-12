import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, GraduationCap, Filter, X } from 'lucide-react'
import { useMatriculasManager } from '../../../hooks/useMatricula'
import MatriculaTable from '../../../components/matricula-management/MatriculaTable'
import MatriculaViewModal from '../../../components/matricula-management/MatriculaViewModal'
import DeleteConfirmModal from '../../../components/matricula-management/DeleteConfirmModal'
import type { IMatricula } from '../../../types/matricula.types'
import Container from '../../../components/layout/Container'

export default function MatriculaManagement() {
  const navigate = useNavigate()
  
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMatricula, setSelectedMatricula] = useState<IMatricula | null>(null)
  const [matriculaToDelete, setMatriculaToDelete] = useState<IMatricula | null>(null)

  // Hook de gerenciamento de matrículas
  const {
    matriculas,
    pagination,
    isLoading,
    isDeleting,
    deleteMatriculaAsync,
  } = useMatriculasManager({ 
    page: currentPage,
    search: searchTerm,
  })

  // Handlers
  const handleCreateMatricula = () => {
    navigate('/admin/student-management/enrolls/add')
  }

  const handleEditMatricula = (matricula: IMatricula) => {
    navigate(`/admin/student-management/enrolls/edit/${matricula.codigo}`)
  }

  const handleViewMatricula = (matricula: IMatricula) => {
    setSelectedMatricula(matricula)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (matricula: IMatricula) => {
    setMatriculaToDelete(matricula)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (matriculaToDelete) {
      try {
        await deleteMatriculaAsync(matriculaToDelete.codigo)
        setIsDeleteModalOpen(false)
        setMatriculaToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar matrícula:', error)
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }


  const totalPages = pagination?.totalPages || 1
  const totalItems = pagination?.totalItems || 0
  const hasActiveFilters = searchTerm

  const handleClearFilters = () => {
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <Container>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap className="h-6 w-6 text-[#007C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Matrículas
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie as matrículas dos alunos no sistema
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreateMatricula}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nova Matrícula
        </button>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtros de pesquisa</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Barra de Pesquisa */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por aluno ou curso..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
            />
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Mostrando <span className="text-gray-900 font-semibold">{matriculas.length}</span> de <span className="text-gray-900 font-semibold">{totalItems}</span> matrículas
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
            >
              <X className="h-3.5 w-3.5" />
              Limpar pesquisa
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Matrículas */}
      <MatriculaTable
        matriculas={matriculas}
        isLoading={isLoading}
        onEdit={handleEditMatricula}
        onView={handleViewMatricula}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modais */}
      <MatriculaViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedMatricula(null)
        }}
        matricula={selectedMatricula}
        onEdit={() => {
          setIsViewModalOpen(false)
          handleEditMatricula(selectedMatricula!)
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setMatriculaToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        studentName={matriculaToDelete?.tb_alunos?.nome || 'Aluno'}
        isDeleting={isDeleting}
      />
    </Container>
  )
}
