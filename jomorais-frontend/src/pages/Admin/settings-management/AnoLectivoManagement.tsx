import { useState } from 'react'
import { Plus, Search, Calendar, Filter, X } from 'lucide-react'
import { useAnosLectivosManager } from '../../../hooks/useAnoLectivo'
import AnoLectivoTable from '../../../components/settings-management/AnoLectivo/AnoLectivoTable'
import AnoLectivoFormModal from '../../../components/settings-management/AnoLectivo/AnoLectivoFormModal'
import AnoLectivoViewModal from '../../../components/settings-management/AnoLectivo/AnoLectivoViewModal'
import DeleteConfirmModal from '../../../components/settings-management/AnoLectivo/DeleteConfirmModal'
import type { IAnoLectivo, IAnoLectivoInput } from '../../../types/anoLectivo.types'
import Container from '../../../components/layout/Container'

export default function AnoLectivoManagement() {
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState<IAnoLectivo | null>(null)
  const [anoLectivoToDelete, setAnoLectivoToDelete] = useState<IAnoLectivo | null>(null)

  // Hook de gerenciamento de anos letivos
  const {
    anosLectivos,
    meta,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createAnoLectivoAsync,
    updateAnoLectivoAsync,
    deleteAnoLectivoAsync,
  } = useAnosLectivosManager({ page: currentPage })

  // Filtrar anos letivos localmente
  const filteredAnosLectivos = anosLectivos.filter(anoLectivo => {
    const matchesSearch = 
      anoLectivo.designacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anoLectivo.anoInicial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anoLectivo.anoFinal.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Handlers
  const handleCreateAnoLectivo = () => {
    setSelectedAnoLectivo(null)
    setIsFormModalOpen(true)
  }

  const handleEditAnoLectivo = (anoLectivo: IAnoLectivo) => {
    setSelectedAnoLectivo(anoLectivo)
    setIsFormModalOpen(true)
  }

  const handleViewAnoLectivo = (anoLectivo: IAnoLectivo) => {
    setSelectedAnoLectivo(anoLectivo)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (anoLectivo: IAnoLectivo) => {
    setAnoLectivoToDelete(anoLectivo)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (anoLectivoToDelete) {
        await deleteAnoLectivoAsync(anoLectivoToDelete.codigo)
        setIsDeleteModalOpen(false)
        setAnoLectivoToDelete(null)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }


  const totalPages = meta?.totalPages || pagination?.totalPages || 1
  const totalItems = meta?.total || pagination?.totalItems || 0

  return (
    <Container>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="h-6 w-6 text-[#007C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Anos Letivos
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie os anos letivos do sistema acadêmico
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreateAnoLectivo}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Ano Letivo
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
              placeholder="Pesquisar por designação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
            />
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Mostrando <span className="text-gray-900 font-semibold">{filteredAnosLectivos.length}</span> de <span className="text-gray-900 font-semibold">{totalItems}</span> anos letivos
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
            >
              <X className="h-3.5 w-3.5" />
              Limpar pesquisa
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Anos Letivos */}
      <AnoLectivoTable
        anosLectivos={filteredAnosLectivos}
        isLoading={isLoading}
        onEdit={handleEditAnoLectivo}
        onView={handleViewAnoLectivo}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modais */}
      <AnoLectivoFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedAnoLectivo(null)
        }}
        anoLectivo={selectedAnoLectivo}
        onSubmit={async (data: IAnoLectivoInput) => {
          try {
            if (selectedAnoLectivo) {
              await updateAnoLectivoAsync({ id: selectedAnoLectivo.codigo, anoLectivoData: data })
            } else {
              await createAnoLectivoAsync(data)
            }
            setIsFormModalOpen(false)
            setSelectedAnoLectivo(null)
          } catch (error) {
            console.error('Erro ao salvar ano letivo:', error)
          }
        }}
        isSubmitting={isCreating || isUpdating}
      />

      <AnoLectivoViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedAnoLectivo(null)
        }}
        anoLectivo={selectedAnoLectivo}
        onEdit={() => {
          setIsViewModalOpen(false)
          setIsFormModalOpen(true)
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setAnoLectivoToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        anoLectivoName={anoLectivoToDelete?.designacao || ''}
        isDeleting={isDeleting}
      />
    </Container>
  )
}
