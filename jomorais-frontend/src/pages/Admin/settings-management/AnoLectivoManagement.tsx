import { useState } from 'react'
import { Plus, Search, Calendar } from 'lucide-react'
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
      <div className="mb-8 bg-linear-to-br from-green-50 via-white to-green-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-100/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Gerenciamento de Anos Letivos
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie os anos letivos do sistema acadêmico
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateAnoLectivo}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Novo Ano Letivo
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
              placeholder="Pesquisar por designação ou ano..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
            />
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando <span className="text-[#007C00] font-bold">{filteredAnosLectivos.length}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> anos letivos
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-sm text-[#007C00] hover:text-[#005a00] font-medium hover:underline transition-all"
            >
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
