import { useState } from 'react'
import { Plus, Search, Users, FileText, DollarSign } from 'lucide-react'
import { useTurmasManager } from '../../../hooks/useTurma'
import { useAnosLectivos } from '../../../hooks/useAnoLectivo'
import TurmaTable from '../../../components/turma-management/TurmaTable'
import TurmaFormModal from '../../../components/turma-management/TurmaFormModal'
import DeleteConfirmModal from '../../../components/turma-management/DeleteConfirmModal'
import StudentReportModal from '../../../components/turma-management/StudentReportModal'
import DebtorsReportModal from '../../../components/turma-management/DebtorsReportModal'
import type { ITurma, ITurmaInput } from '../../../types/turma.types'
import Container from '../../../components/layout/Container'

export default function TurmaManagement() {
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState<number | undefined>(undefined)
  
  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isDebtorsModalOpen, setIsDebtorsModalOpen] = useState(false)
  const [turmaToDelete, setTurmaToDelete] = useState<ITurma | null>(null)
  const [turmaToEdit, setTurmaToEdit] = useState<ITurma | null>(null)

  // Hook de gerenciamento de turmas com filtros
  const {
    turmas,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createTurmaAsync,
    updateTurmaAsync,
    deleteTurmaAsync,
  } = useTurmasManager({ 
    page: currentPage,
    search: searchTerm,
    anoLectivo: selectedAnoLectivo,
  })

  // Hook para carregar anos letivos
  const { data: anosLectivosData } = useAnosLectivos({ page: 1, limit: 100 })
  const anosLectivos = anosLectivosData?.data || []

  // Handlers
  const handleCreateTurma = () => {
    setTurmaToEdit(null)
    setIsFormModalOpen(true)
  }

  const handleEditTurma = (turma: ITurma) => {
    setTurmaToEdit(turma)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: ITurmaInput) => {
    try {
      if (turmaToEdit) {
        // Atualizar turma existente
        await updateTurmaAsync({
          id: turmaToEdit.codigo,
          turmaData: data,
        })
      } else {
        // Criar nova turma
        await createTurmaAsync(data)
      }
      setIsFormModalOpen(false)
      setTurmaToEdit(null)
    } catch (error) {
      console.error('Erro ao salvar turma:', error)
    }
  }

  const handleDeleteClick = (turma: ITurma) => {
    setTurmaToDelete(turma)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (turmaToDelete) {
      try {
        await deleteTurmaAsync(turmaToDelete.codigo)
        setIsDeleteModalOpen(false)
        setTurmaToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar turma:', error)
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 text-[#007C00]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Gerenciamento de Turmas
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100">
                  <div className="w-1.5 h-1.5 bg-[#007C00] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[#007C00] font-medium">{totalItems} Turmas</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Gerencie as turmas, classes e organização acadêmica
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Botão de Lista de Alunos */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#007C00] text-[#007C00] rounded-lg hover:bg-green-50 transition-colors shadow-sm font-medium text-sm"
            >
              <FileText className="h-4 w-4" />
              Lista de Alunos
            </button>

            {/* Botão de Lista de Devedores */}
            <button
              onClick={() => setIsDebtorsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors shadow-sm font-medium text-sm"
            >
              <DollarSign className="h-4 w-4" />
              Lista de Devedores
            </button>

            <button
              onClick={handleCreateTurma}
              className="flex items-center gap-2 px-4 py-2 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] transition-colors shadow-sm font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Nova Turma
            </button>
          </div>
        </div>

        {/* Filtros e Pesquisa */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barra de Pesquisa */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por turma, classe ou curso..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all text-sm"
              />
            </div>

            {/* Filtro por Ano Letivo */}
            <div className="w-full md:w-64">
              <select
                value={selectedAnoLectivo || ''}
                onChange={(e) => {
                  setSelectedAnoLectivo(e.target.value ? Number(e.target.value) : undefined)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all text-sm bg-white"
              >
                <option value="">Todos os anos letivos</option>
                {anosLectivos.map((ano) => (
                  <option key={ano.codigo} value={ano.codigo}>
                    {ano.designacao} ({ano.anoInicial}/{ano.anoFinal})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contador de Resultados */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Mostrando <span className="font-medium text-gray-900">{turmas.length}</span> de <span className="font-medium text-gray-900">{totalItems}</span> resultados
              {selectedAnoLectivo && (
                <span className="ml-1 text-gray-400">
                  - Ano letivo: {anosLectivos.find(a => a.codigo === selectedAnoLectivo)?.designacao}
                </span>
              )}
            </span>
            {(searchTerm || selectedAnoLectivo) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedAnoLectivo(undefined)
                  setCurrentPage(1)
                }}
                className="text-sm text-[#007C00] hover:text-[#005a00] font-medium transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

      {/* Tabela de Turmas */}
      <TurmaTable
        turmas={turmas}
        isLoading={isLoading}
        onEdit={handleEditTurma}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <TurmaFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setTurmaToEdit(null)
        }}
        onSubmit={handleFormSubmit}
        turma={turmaToEdit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setTurmaToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        turmaName={turmaToDelete?.designacao || 'Turma'}
        isDeleting={isDeleting}
      />

      <StudentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <DebtorsReportModal
        isOpen={isDebtorsModalOpen}
        onClose={() => setIsDebtorsModalOpen(false)}
      />
      </div>
    </Container>
  )
}
