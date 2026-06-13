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
  MapPin,
  Award
} from 'lucide-react'
import { useAuth, usePermissions } from '../../hooks/useAuth'

interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  href?: string
  children?: MenuItem[]
}

export default function Sidebar() {
  const location = useLocation()
  const { logout } = useAuth()
  const { permissions, canAccess, userType } = usePermissions()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const professorMenuItems: MenuItem[] = React.useMemo(() => [
    {
      title: "Dashboard",
      icon: Home,
      href: "/professor/dashboard"
    },
    {
      title: "Meu Perfil",
      icon: Users,
      href: "/professor/perfil"
    },
    {
      title: "Minhas Notas",
      icon: BookOpen,
      href: "/professor/minhas-notas"
    }
  ], [])

  const directorMenuItems: MenuItem[] = React.useMemo(() => [
    {
      title: "Painel do Diretor",
      icon: Home,
      href: "/director/dashboard"
    },
    {
      title: "Lançamento da Turma",
      icon: BarChart3,
      href: "/director/lancar-notas"
    },
    {
      title: "Boletins da Turma",
      icon: FileText,
      href: "/director/boletins"
    },
    {
      title: "Meu Perfil",
      icon: Users,
      href: "/professor/perfil"
    },
    {
      title: "Lançamento (Minhas Disciplinas)",
      icon: BookOpen,
      href: "/professor/lancar-notas"
    },
    {
      title: "Minhas Notas",
      icon: FileText,
      href: "/professor/minhas-notas"
    }
  ], [])

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
        { title: "Lançamento de Notas", icon: BarChart3, href: "/admin/teacher-management/grade-launching" },
        { title: "Pautas", icon: FileText, href: "/admin/teacher-management/pauta" },
        { title: "Notas por Disciplina", icon: BookOpen, href: "/admin/teacher-management/notes-by-discipline" },
        { title: "Certificados", icon: Award, href: "/admin/teacher-management/certificates" },
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
        { title: "Boletim de Notas", icon: FileText, href: "/admin/reports-management/boletim" },
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
        { title: "Períodos de Lançamento", icon: Calendar, href: "/admin/settings-management/periodos-lancamento" },
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

  const visibleMenuItems = React.useMemo(() => {
    if (userType === 'professor') {
      return professorMenuItems
    }
    if (userType === 'director') {
      return directorMenuItems
    }
    return filterMenuItems(menuItems)
  }, [userType, professorMenuItems, directorMenuItems, filterMenuItems, menuItems])

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
              w-full flex items-center justify-between px-4 py-3 rounded-lg
              text-gray-600 hover:bg-gray-100 hover:text-gray-900
              transition-all duration-200
              ${isOpen ? 'bg-gray-50 text-gray-900 font-medium' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <Icon size={20} className={isOpen ? 'text-gray-900' : ''} />
              <span className="font-medium text-sm">{item.title}</span>
            </div>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
          
          <div 
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1">
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
          flex items-center gap-3 px-4 py-3 rounded-lg mb-1
          font-medium text-sm
          transition-all duration-200
          ${active 
            ? 'bg-green-50 text-green-700 font-semibold' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
          ${isChild ? 'py-2 text-xs' : ''}
        `}
      >
        <Icon size={isChild ? 18 : 20} />
        <span>{item.title}</span>
      </Link>
    )
  }

  return (
    <aside ref={sidebarRef} className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
      {/* Logo/Branding - Fixo no topo */}
      <div className="p-6 h-16 flex items-center shrink-0">
        <div className="flex items-center gap-3 select-none">
          <div className="w-9 h-9 bg-[#007C00] rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm shrink-0">
            J
          </div>
          <div>
            <h2 className="text-gray-800 font-bold text-base leading-tight tracking-wider uppercase">Jomorais</h2>
            <p className="text-gray-400 text-[9px] uppercase font-bold tracking-widest">Sistema Escolar</p>
          </div>
        </div>
      </div>

      {/* Menu Items - Área com scroll */}
      <nav className="flex-1 overflow-y-auto p-4 sidebar-scroll">
        {visibleMenuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Botão de Logout + Footer - Fixo no rodapé */}
      <div className="shrink-0 bg-white">
        <div className="p-4 border-t border-gray-100 pb-2">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg
                     bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 font-medium text-sm
                     transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Sair do Sistema</span>
          </button>
        </div>
        
        {/* Mini Ilustração Skyline para Consistência */}
        <div className="w-full h-10 select-none pointer-events-none mb-1 opacity-70">
          <svg className="w-full h-full" viewBox="0 0 256 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Camada Traseira (Verde Claro / Menta) */}
            <path d="M0 40 V20 Q50 10 100 25 T200 20 Q228 15 256 25 V40 H0Z" fill="#a7f3d0" opacity="0.5" />
            
            {/* Camada Intermediária (Verde Médio / Esmeralda) */}
            <path d="M0 40 V28 Q60 18 120 33 T240 28 Q248 25 256 30 V40 H0Z" fill="#10b981" opacity="0.6" />
            
            {/* Pequenos elementos geométricos */}
            <rect x="35" y="18" width="10" height="22" fill="#007C00" />
            <polygon points="35,18 40,11 45,18" fill="#005a00" />
            <rect x="180" y="22" width="12" height="18" fill="#007C00" />
            <rect x="192" y="24" width="8" height="16" fill="#005a00" />

            {/* Camada Frontal (Verde Principal da Plataforma) */}
            <path d="M0 40 V33 Q80 30 160 35 T256 34 V40 H0Z" fill="#005a00" />
          </svg>
        </div>

        <div className="px-4 pb-4">
          <p className="text-gray-400 text-[10px] text-center uppercase tracking-wider font-semibold">
            © 2025 Sistema Escolar
          </p>
        </div>
      </div>
    </aside>
  )
}
