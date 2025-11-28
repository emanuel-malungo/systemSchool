import { useState } from 'react'
import { Plus, Search, UserCog } from 'lucide-react'
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
      <div className="mb-8 bg-linear-to-br from-green-50 via-white to-green-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-100/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              {/* Ícone com background */}
              <div className="w-16 h-16 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <UserCog className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Gerenciamento de Usuários
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie os usuários do sistema, suas permissões e status
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateUser}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Novo Usuário
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
              placeholder="Pesquisar por nome ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
            />
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando <span className="text-[#007C00] font-bold">{filteredUsers.length}</span> de <span className="text-gray-900 font-bold">{meta?.totalItems || 0}</span> usuários
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
