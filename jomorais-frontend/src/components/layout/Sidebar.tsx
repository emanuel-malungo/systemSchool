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
  LogOut
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  href?: string
  children?: MenuItem[]
}

export default function Sidebar() {
  const location = useLocation()
  const { logout } = useAuth()
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
        // { title: "Relatórios de Vendas", icon: TrendingUp, href: "/admin/financeiro/relatorios-vendas" },
        { title: "Exportação SAFT-AO", icon: Shield, href: "/admin/financeiro/saft" },
        { title: "Serviços Financeiros", icon: FileText, href: "/admin/financial-services" },
        { title: "Notas de Crédito", icon: FileText, href: "/admin/financeiro/notas-credito" }
      ]
    },
    {
      title: "Relatórios",
      icon: BarChart3,
      children: [
        { title: "Relatórios de Alunos", icon: Users, href: "/admin/reports-management/students" },
        // { title: "Relatórios Financeiros", icon: DollarSign, href: "/admin/reports-management/financial" },
        { title: "Relatórios Acadêmicos", icon: BookOpen, href: "/admin/reports-management/academic" }
      ]
    },
    {
      title: "Configurações",
      icon: Settings,
      children: [
        { title: "Dados Institucionais", icon: Building, href: "/admin/settings-management/instituicao" },
        { title: "Ano Letivo", icon: Calendar, href: "/admin/settings-management/ano-letivo" },
        { title: "Usuários", icon: UserCog, href: "/admin/users" }
      ]
    }
  ], [])

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
    
    menuItems.forEach(item => {
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
  }, [location.pathname, menuItems, hasActiveChild])

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
              text-gray-300 hover:bg-white/10 hover:text-white
              transition-all duration-200
              ${isOpen ? 'bg-white/10 text-white border-l-4 border-white' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <Icon size={20} className={isOpen ? 'text-white' : ''} />
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
            <div className="ml-4 pl-4 border-l-2 border-white/10 space-y-1">
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
            ? 'bg-white text-[#007C00] shadow-lg' 
            : 'text-gray-300 hover:bg-white/10 hover:text-white'
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
    <aside ref={sidebarRef} className="fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-[#007C00] to-[#005a00] shadow-2xl z-50 flex flex-col">
      {/* Logo/Branding - Fixo no topo */}
      <div className="p-6 border-b border-white/10 h-16 flex items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
            <img src="/icon.png" alt="Logo Jomorais" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">Jomorais</h2>
            <p className="text-green-200 text-xs">Sistema Escolar</p>
          </div>
        </div>
      </div>

      {/* Menu Items - Área com scroll */}
      <nav className="flex-1 overflow-y-auto p-4 sidebar-scroll">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Botão de Logout + Footer - Fixo no rodapé */}
      <div className="shrink-0 bg-[#005a00]">
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg
                     bg-white/10 hover:bg-white/20 text-white font-medium text-sm
                     transition-all duration-200 hover:shadow-lg"
          >
            <LogOut size={20} />
            <span>Sair do Sistema</span>
          </button>
        </div>
        <div className="px-4 pb-4">
          <p className="text-green-200 text-xs text-center">
            © 2025 Sistema Escolar
          </p>
        </div>
      </div>
    </aside>
  )
}
