import { useState } from 'react'
import { Plus, Search, UserCog, Filter, X } from 'lucide-react'
import { useUsersManager } from '../../../hooks/useUsers'
import UserTable from '../../../components/settings-management/Users/UserTable'
import UserFormModal from '../../../components/settings-management/Users/UserFormModal'
import UserViewModal from '../../../components/settings-management/Users/UserViewModal'
import DeleteConfirmModal from '../../../components/settings-management/Users/DeleteConfirmModal'
import type { LegacyUser, CreateLegacyUserDTO, UpdateLegacyUserDTO } from '../../../types/users.types'
import Container from '../../../components/layout/Container'

export default function UsersManagement() {
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<LegacyUser | null>(null)
  const [userToDelete, setUserToDelete] = useState<LegacyUser | null>(null)

  // Hook de gerenciamento de usuários
  const {
    users,
    meta,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createUserAsync,
    updateUserAsync,
    deleteUserAsync,
  } = useUsersManager({ page: currentPage })

  // Filtrar usuários localmente
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Handlers
  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsFormModalOpen(true)
  }

  const handleEditUser = (user: LegacyUser) => {
    setSelectedUser(user)
    setIsFormModalOpen(true)
  }

  const handleViewUser = (user: LegacyUser) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (user: LegacyUser) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
        await deleteUserAsync(userToDelete.codigo)
        setIsDeleteModalOpen(false)
        setUserToDelete(null)
    }
  }


  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <Container>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
            <UserCog className="h-6 w-6 text-[#007C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Usuários
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie os usuários do sistema, suas permissões e status
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreateUser}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
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
              placeholder="Pesquisar por nome ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
            />
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Mostrando <span className="text-gray-900 font-semibold">{filteredUsers.length}</span> de <span className="text-gray-900 font-semibold">{meta?.totalItems || 0}</span> usuários
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

      {/* Tabela de Usuários */}
      <UserTable
        users={filteredUsers}
        isLoading={isLoading}
        onEdit={handleEditUser}
        onView={handleViewUser}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={meta?.totalPages || 1}
        onPageChange={handlePageChange}
      />

      {/* Modais */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onSubmit={async (data: CreateLegacyUserDTO | UpdateLegacyUserDTO) => {
            if (selectedUser) {
              await updateUserAsync({ id: selectedUser.codigo, userData: data })
            } else {
              await createUserAsync(data as CreateLegacyUserDTO)
            }
            setIsFormModalOpen(false)
            setSelectedUser(null)
        }}
        isSubmitting={isCreating || isUpdating}
      />

      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onEdit={() => {
          setIsViewModalOpen(false)
          setIsFormModalOpen(true)
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setUserToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        userName={userToDelete?.nome || ''}
        isDeleting={isDeleting}
      />
    </Container>
  )
}
