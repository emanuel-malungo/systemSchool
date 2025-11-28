import { useState } from 'react'
import { Plus, Search, DoorOpen } from 'lucide-react'
import { useRoomsManager } from '../../../hooks/useRoom'
import type { Room, RoomInput } from '../../../types/room.types'
import RoomTable from '../../../components/room-management/RoomTable'
import RoomFormModal from '../../../components/room-management/RoomFormModal'
import RoomViewModal from '../../../components/room-management/RoomViewModal'
import DeleteConfirmModal from '../../../components/room-management/DeleteConfirmModal'
import Container from '../../../components/layout/Container'

export default function RoomManagement() {
  // Estados de paginação e busca
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Estados dos modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
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

  // Handlers dos modais - Visualizar
  const handleView = (room: Room) => {
    setSelectedRoom(room)
    setIsViewModalOpen(true)
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
      {/* Header */}
      <div className="mb-8 bg-linear-to-br from-blue-50 via-white to-blue-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <DoorOpen className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Gerenciamento de Salas
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie as salas de aula da instituição
                </p>
              </div>
            </div>
            
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Nova Sala
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
              placeholder="Pesquisar por nome da sala..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
            />
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando <span className="text-[#007C00] font-bold">{rooms.length}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> salas
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

      {/* Tabela de Salas */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <RoomTable
          rooms={rooms}
          isLoading={isLoading}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

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

        <RoomViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setSelectedRoom(null)
          }}
          room={selectedRoom}
          onEdit={handleEdit}
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
    </Container>
  )
}
