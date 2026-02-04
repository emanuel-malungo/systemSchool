import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
	Home,
	Users,
	GraduationCap,
	BookOpen,
	DollarSign,
	BarChart3,
	Settings,
	School,
	UserCheck,
	FileText,
	Wallet,
	Shield,
	Building,
	Calendar,
	UserCog,
	ChevronDown,
	DoorOpen,
	LogOut,
	Bug,
	MapPin
} from 'lucide-react'
import { useAuth, usePermissions } from '../../hooks/useAuth'
import iconLogo from '../../assets/images/iconEmalungo.png'

interface MenuItem {
	title: string
	icon: React.ComponentType<{ className?: string; size?: number }>
	href?: string
	children?: MenuItem[]
}

export default function Sidebar() {
	const location = useLocation()
	const { logout } = useAuth()
	const { permissions, canAccess } = usePermissions()
	const sidebarRef = useRef<HTMLDivElement>(null)
	const [openMenus, setOpenMenus] = useState<string[]>([])

	const menuItems: MenuItem[] = React.useMemo(() => [
		{
			title: "Dashboard",
			icon: Home,
			href: "/admin"
		},
		{
			title: "Gestão de Alunos",
			icon: Users,
			children: [
				{ title: "Alunos", icon: Users, href: "/admin/student-management/student" },
				{ title: "Matrículas", icon: GraduationCap, href: "/admin/student-management/enrolls" },
				{ title: "Confirmações", icon: UserCheck, href: "/admin/student-management/confirmations" },
				{ title: "Transferências", icon: FileText, href: "/admin/student-management/transfers" },
				{ title: "Proveniências", icon: Building, href: "/admin/student-management/proveniencias" }
			]
		},
		{
			title: "Gestão Acadêmica",
			icon: BookOpen,
			children: [
				{ title: "Cursos", icon: School, href: "/admin/academic-management/cursos" },
				{ title: "Disciplinas", icon: BookOpen, href: "/admin/discipline-management" },
				{ title: "Classes", icon: GraduationCap, href: "/admin/academic-management/classes" },
				{ title: "Turmas", icon: School, href: "/admin/academic-management/turmas" },
				{ title: "Salas", icon: DoorOpen, href: "/admin/academic-management/salas" },
			]
		},
		{
			title: "Professores",
			icon: GraduationCap,
			children: [
				{ title: "Professores", icon: GraduationCap, href: "/admin/teacher-management/teacher" },
				{ title: "Disciplinas do Docente", icon: BookOpen, href: "/admin/teacher-management/discipline-teacher" },
				{ title: "Diretores de Turma", icon: UserCheck, href: "/admin/teacher-management/director-turma" }
			]
		},
		{
			title: "Financeiro",
			icon: DollarSign,
			children: [
				{ title: "Pagamentos", icon: Wallet, href: "/admin/payment-management/payments" },
				{ title: "Exportação SAFT-AO", icon: FileText, href: "/admin/financeiro/saft" },
				{ title: "Serviços Financeiros", icon: FileText, href: "/admin/financial-services" },
				{ title: "Notas de Crédito", icon: FileText, href: "/admin/financeiro/notas-credito" }
			]
		},
		{
			title: "Relatórios",
			icon: BarChart3,
			children: [
				{ title: "Relatórios de Alunos", icon: Users, href: "/admin/reports-management/students" },
				{ title: "Relatórios Acadêmicos", icon: BookOpen, href: "/admin/reports-management/academic" },
				{ title: "Relatório de Vendas", icon: DollarSign, href: "/admin/reports-management/sales" }
			]
		},
		{
			title: "Configurações",
			icon: Settings,
			children: [
				{ title: "Dados Institucionais", icon: Building, href: "/admin/settings-management/instituicao" },
				{ title: "Ano Letivo", icon: Calendar, href: "/admin/settings-management/ano-letivo" },
				{ title: "Gestão Geográfica", icon: MapPin, href: "/admin/settings-management/geographic" },
				{ title: "Usuários", icon: UserCog, href: "/admin/users" }
			]
		},
		{
			title: "Debug",
			icon: Bug,
			children: [
				{ title: "Permissões", icon: Shield, href: "/admin/debug/permissions" }
			]
		}
	], [])

	// Filtrar itens do menu baseado nas permissões
	const filterMenuItems = React.useCallback((items: MenuItem[]): MenuItem[] => {
		return items.filter(item => {
			if (item.href === "/admin") return true

			switch (item.title) {
				case "Gestão de Alunos":
					return permissions.canAccessStudentManagement
				case "Gestão Acadêmica":
					return permissions.canAccessAcademicManagement
				case "Professores":
					return permissions.canAccessAcademicManagement
				case "Financeiro":
					return permissions.canAccessFinancial
				case "Relatórios":
					return permissions.canAccessReports
				case "Configurações":
					return permissions.canAccessSettings
				case "Debug":
					return permissions.canAccessSettings // Apenas admins podem ver debug
				default:
					return true
			}
		}).map(item => {
			if (item.children) {
				const filteredChildren = item.children.filter(child => {
					if (!child.href) return true

					if (item.title === "Financeiro") {
						if (child.href.includes('/payment-management') || child.href.includes('/pagamentos')) {
							return permissions.canAccessPayments
						}
						if (child.href.includes('/relatorios-vendas') || child.href.includes('/financial')) {
							return permissions.canAccessFinancialReports
						}
						if (child.href.includes('/saft')) {
							return permissions.canAccessSAFT
						}
						if (child.href.includes('/financial-services') || child.href.includes('/credit-notes')) {
							return permissions.canAccessFinancialSettings
						}
					}

					return canAccess.menuItem(child.href)
				})

				if (filteredChildren.length === 0 && item.children.length > 0) {
					return null
				}

				return { ...item, children: filteredChildren }
			}

			return item
		}).filter(Boolean) as MenuItem[]
	}, [permissions, canAccess])

	const visibleMenuItems = React.useMemo(
		() => filterMenuItems(menuItems),
		[filterMenuItems, menuItems]
	)

	// Função auxiliar para verificar se algum filho está ativo
	const hasActiveChild = React.useCallback((item: MenuItem): boolean => {
		if (!item.children) return false
		return item.children.some(child =>
			child.href && location.pathname.startsWith(child.href)
		)
	}, [location.pathname])

	// Abrir automaticamente dropdowns que contêm a rota ativa
	useEffect(() => {
		const menusToOpen: string[] = []

		visibleMenuItems.forEach(item => {
			if (hasActiveChild(item)) {
				menusToOpen.push(item.title)
			}
		})

		if (menusToOpen.length > 0) {
			setOpenMenus(prev => {
				const newOpenMenus = [...prev]
				menusToOpen.forEach(menu => {
					if (!newOpenMenus.includes(menu)) {
						newOpenMenus.push(menu)
					}
				})
				return newOpenMenus
			})
		}
	}, [location.pathname, visibleMenuItems, hasActiveChild])

	// Fechar dropdowns ao clicar fora do sidebar
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
				setOpenMenus([])
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const toggleMenu = (title: string) => {
		setOpenMenus(prev =>
			prev.includes(title)
				? prev.filter(item => item !== title)
				: [...prev, title]
		)
	}

	const isActive = (href: string) => location.pathname === href

	const renderMenuItem = (item: MenuItem, isChild = false) => {
		const Icon = item.icon
		const hasChildren = item.children && item.children.length > 0
		const isOpen = openMenus.includes(item.title)
		const active = item.href ? isActive(item.href) : false

		if (hasChildren) {
			return (
				<div key={item.title} className="mb-1">
					<button
						onClick={() => toggleMenu(item.title)}
						className={`
              w-full flex items-center justify-between px-4 py-3.5 rounded-2xl
              transition-all duration-300 group
              ${isOpen
								? 'bg-[#3964d7]/5 text-[#3964d7]'
								: 'text-gray-500 hover:bg-gray-50 hover:text-[#1e293b]'
							}
            `}
					>
						<div className="flex items-center gap-3.5">
							<div className={`
                w-[34px] h-[34px] flex items-center justify-center rounded-xl transition-all duration-300
                ${isOpen ? 'bg-[#3964d7] text-white shadow-lg shadow-[#3964d7]/20' : 'bg-gray-100/50 text-gray-400 group-hover:text-gray-600'}
              `}>
								<Icon size={18} />
							</div>
							<span className="font-bold text-[13px] tracking-tight">{item.title}</span>
						</div>
						<ChevronDown
							size={14}
							className={`transition-transform duration-500 ease-out ${isOpen ? 'rotate-180 opacity-100' : 'rotate-0 opacity-40'}`}
						/>
					</button>

					<div
						className={`
              overflow-hidden transition-all duration-500 ease-in-out
              ${isOpen ? 'max-h-[500px] opacity-100 mt-2 mb-4' : 'max-h-0 opacity-0'}
            `}
					>
						<div className="ml-8 pl-5 border-l border-gray-100 space-y-1.5">
							{item.children?.map(child => renderMenuItem(child, true))}
						</div>
					</div>
				</div>
			)
		}

		return (
			<Link
				key={item.title}
				to={item.href || '#'}
				className={`
          flex items-center gap-3.5 px-4 py-3.5 rounded-2xl mb-1
          font-bold text-[13px] tracking-tight
          transition-all duration-300 group relative
          ${active
						? 'bg-[#3964d7] text-white shadow-[0_8px_20px_-6px_rgba(57,100,215,0.4)]'
						: 'text-gray-500 hover:bg-gray-50 hover:text-[#1e293b]'
					}
          ${isChild ? 'py-2.5 text-xs font-semibold' : ''}
        `}
			>
				<div className={`
          flex items-center justify-center rounded-xl transition-all duration-300
          ${isChild ? '' : 'w-[34px] h-[34px] bg-gray-100/50 group-hover:bg-gray-200/50'}
          ${active && !isChild ? 'bg-white/20' : ''}
        `}>
					<Icon size={isChild ? 14 : 18} />
				</div>
				<span>{item.title}</span>
				{active && !isChild && (
					<div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
				)}
			</Link>
		)
	}

	return (
		<aside ref={sidebarRef} className="fixed left-0 top-0 h-screen w-68 bg-white z-50 flex flex-col font-sans border-r border-gray-100">
			{/* Logo/Branding - Fixo no topo */}
			<div className="p-6 h-20 flex items-center shrink-0 mb-4">
				<div className="flex items-center gap-4 group cursor-pointer">
					<div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center p-2 shadow-inner group-hover:bg-[#3964d7]/10 transition-all duration-500">
						<img src={iconLogo} alt="Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
					</div>
					<div>
						<h2 className="text-[#1e293b] font-black text-lg tracking-tight leading-none mb-1">emSchool</h2>
						<p className="text-[#3964d7] text-[10px] font-bold uppercase tracking-widest opacity-80">Sistema Escolar</p>
					</div>
				</div>
			</div>

			{/* Menu Items - Área com scroll */}
			<nav className="flex-1 overflow-y-auto px-4 sidebar-scroll space-y-1">
				{visibleMenuItems.map(item => renderMenuItem(item))}
			</nav>

			{/* Botão de Logout + Footer - Fixo no rodapé */}
			<div className="shrink-0 pt-4">
				<div className="px-4 pb-4">
					<button
						onClick={logout}
						className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl
                     bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 font-bold text-sm
                     transition-all duration-300 border border-gray-100 hover:border-red-100"
					>
						<LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
						<span>Sair do Sistema</span>
					</button>
				</div>
				<div className="px-6 pb-8 flex items-center justify-between">
					<p className="text-gray-400 text-[11px] font-medium">
						© 2026 emSchool
					</p>
					<div className="flex gap-2 items-center">
						<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
						<span className="text-[10px] text-gray-400 font-bold uppercase">Online</span>
					</div>
				</div>
			</div>
		</aside>
	)
}
