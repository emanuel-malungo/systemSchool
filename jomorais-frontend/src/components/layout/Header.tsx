import { useState } from 'react'
import { User, Settings, Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { user } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Função auxiliar para verificar se é usuário legado ou moderno
  const getUserName = () => {
    if (!user) return 'Usuário'
    if ('nome' in user) return user.nome // LegacyUser
    return user.name // ModernUser
  }

  const getUserEmail = () => {
    if (!user) return ''
    if ('username' in user && user.username) return user.username
    if ('email' in user && user.email) return user.email
    return ''
  }

  const getUserInitials = () => {
    const name = getUserName()
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getUserRole = () => {
    if (!user) return ''
    if ('tipoDesignacao' in user) return user.tipoDesignacao
    return 'Usuário'
  }

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-40">
      <div className="h-full px-6 flex items-center justify-end gap-6">
        
        {/* Ações do Header */}
        <div className="flex items-center gap-2">
          {/* Notificações */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          
          <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>

          {/* Menu do Usuário */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-full transition-colors border border-transparent hover:border-gray-200"
            >
              <div className="w-8 h-8 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-full flex items-center justify-center shadow-xs">
                <span className="text-white font-bold text-xs">
                  {getUserInitials()}
                </span>
              </div>
              <div className="text-left hidden md:block px-1">
                <p className="text-sm font-semibold text-gray-700 leading-tight">
                  {getUserName()}
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-medium">
                  {getUserRole()}
                </p>
              </div>
            </button>

            {/* Dropdown do Usuário */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-base">
                        {getUserInitials()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {getUserName()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getUserEmail()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 px-2 py-1 bg-green-50 rounded text-xs text-[#007C00] font-medium">
                    {getUserRole()}
                  </div>
                </div>
                <div className="py-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                    <User size={16} />
                    <span>Meu Perfil</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                    <Settings size={16} />
                    <span>Configurações</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
