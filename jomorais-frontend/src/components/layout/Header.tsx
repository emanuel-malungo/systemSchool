import { useState } from 'react'
import { User, Settings } from 'lucide-react'
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
		<header className="fixed top-2 left-70 right-4 h-18 bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-3xl z-40 transition-all duration-300">
			<div className="h-full px-4 flex items-center justify-end">
				{/* Ações do Header */}
				<div className="flex items-center gap-6">
					{/* Menu do Usuário */}
					<div className="relative">
						<button
							onClick={() => setShowUserMenu(!showUserMenu)}
							className="flex items-center gap-4 group hover:bg-gray-50/80 px-2 py-2 rounded-2xl transition-all duration-300 cursor-pointer"
						>
							<div className="text-right hidden sm:block">
								<p className="text-[13px] font-black text-[#1e293b] leading-none mb-1 group-hover:text-[#3964d7] transition-colors">
									{getUserName()}
								</p>
								<p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest transition-opacity group-hover:opacity-100">
									{getUserRole()}
								</p>
							</div>

							<div className="relative">
								<div className="w-11 h-11 bg-[#3964d7] rounded-xl flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)] transform group-hover:rotate-6 transition-transform duration-500">
									<span className="text-white font-black text-sm tracking-tighter">
										{getUserInitials()}
									</span>
								</div>
								<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
							</div>
						</button>

						{/* Dropdown do Usuário */}
						{showUserMenu && (
							<div className="absolute right-0 mt-4 w-72 bg-white rounded-4xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
								<div className="p-6 bg-gray-50/50 border-b border-gray-100">
									<div className="flex items-center gap-4 mb-4">
										<div className="w-14 h-14 bg-[#3964d7] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
											<span className="text-white font-black text-lg">
												{getUserInitials()}
											</span>
										</div>
										<div className="flex-1 overflow-hidden">
											<p className="text-sm font-black text-[#1e293b] truncate">
												{getUserName()}
											</p>
											<p className="text-xs text-gray-400 font-medium truncate">
												{getUserEmail()}
											</p>
										</div>
									</div>
									<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#3964d7]/10 rounded-xl text-[10px] text-[#3964d7] font-black uppercase tracking-widest">
										<div className="w-1 h-1 rounded-full bg-[#3964d7]"></div>
										{getUserRole()}
									</div>
								</div>

								<div className="p-3">
									<button className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50 rounded-2xl text-sm text-[#1e293b] font-bold transition-all group">
										<div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-[#3964d7]/10 group-hover:text-[#3964d7] transition-all">
											<User size={16} />
										</div>
										<span>Configurações do Perfil</span>
									</button>
									<button className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50 rounded-2xl text-sm text-[#1e293b] font-bold transition-all group">
										<div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-[#3964d7]/10 group-hover:text-[#3964d7] transition-all">
											<Settings size={16} />
										</div>
										<span>Preferências</span>
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
