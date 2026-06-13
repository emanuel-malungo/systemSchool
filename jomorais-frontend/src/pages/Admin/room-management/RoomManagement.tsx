import { useState } from 'react'
import { Plus, Search, DoorOpen } from 'lucide-react'
import { useRoomsManager } from '../../../hooks/useRoom'
import type { Room, RoomInput } from '../../../types/room.types'
import RoomTable from '../../../components/room-management/RoomTable'
import RoomFormModal from '../../../components/room-management/RoomFormModal'
import DeleteConfirmModal from '../../../components/room-management/DeleteConfirmModal'
import Container from '../../../components/layout/Container'

export default function RoomManagement() {
  // Estados de paginação e busca
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Estados dos modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  // Hook de gerenciamento de salas
  const {
    rooms,
    pagination,
    isLoading,
    createRoom,
    updateRoom,
    deleteRoom,
    isCreating,
    isUpdating,
    isDeleting,
  } = useRoomsManager({
    page: currentPage,
    search: searchTerm,
  })

  // Handlers de paginação
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handlers de busca
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // Handlers dos modais - Criar
  const handleOpenCreateModal = () => {
    setSelectedRoom(null)
    setIsFormModalOpen(true)
  }

  // Handlers dos modais - Editar
  const handleEdit = (room: Room) => {
    setSelectedRoom(room)
    setIsFormModalOpen(true)
  }

  // Handlers dos modais - Deletar
  const handleDelete = (room: Room) => {
    setSelectedRoom(room)
    setIsDeleteModalOpen(true)
  }

  // Handlers de submissão
  const handleFormSubmit = (data: RoomInput) => {
    if (selectedRoom) {
      // Atualizar sala existente
      updateRoom(
        { id: selectedRoom.codigo, roomData: data },
        {
          onSuccess: () => {
            setIsFormModalOpen(false)
            setSelectedRoom(null)
          },
        }
      )
    } else {
      // Criar nova sala
      createRoom(data, {
        onSuccess: () => {
          setIsFormModalOpen(false)
        },
      })
    }
  }

  const handleConfirmDelete = () => {
    if (selectedRoom) {
      deleteRoom(selectedRoom.codigo, {
        onSuccess: () => {
          setIsDeleteModalOpen(false)
          setSelectedRoom(null)
        },
      })
    }
  }

  const totalItems = pagination?.totalItems || 0

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <DoorOpen className="h-6 w-6 text-[#007C00]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Gerenciamento de Salas
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100">
                  <div className="w-1.5 h-1.5 bg-[#007C00] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[#007C00] font-medium">{totalItems} Salas Ativas</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Gerencie as salas de aula da instituição
              </p>
            </div>
          </div>
          
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] transition-colors shadow-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nova Sala
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
                placeholder="Pesquisar por nome da sala..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all text-sm"
              />
            </div>
          </div>

          {/* Contador de Resultados */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Mostrando <span className="font-medium text-gray-900">{rooms.length}</span> de <span className="font-medium text-gray-900">{totalItems}</span> resultados
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

      {/* Tabela de Salas */}
      <RoomTable
        rooms={rooms}
        isLoading={isLoading}
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modais */}
        <RoomFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false)
            setSelectedRoom(null)
          }}
          onSubmit={handleFormSubmit}
          room={selectedRoom}
          isLoading={isCreating || isUpdating}
        />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedRoom(null)
        }}
        onConfirm={handleConfirmDelete}
        roomName={selectedRoom?.designacao || ''}
        isLoading={isDeleting}
      />
      </div>
    </Container>
  )
}
