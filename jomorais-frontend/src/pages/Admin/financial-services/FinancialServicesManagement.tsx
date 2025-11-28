import { useState } from 'react'
import { Plus, Search, DollarSign, Coins, Tag, FileText } from 'lucide-react'
import Container from '../../../components/layout/Container'

// Hooks
import {
  useMoedas,
  useCreateMoeda,
  useUpdateMoeda,
  useDeleteMoeda,
  useCategoriasServicos,
  useCreateCategoriaServico,
  useUpdateCategoriaServico,
  useDeleteCategoriaServico,
  useTiposServicosManager,
} from '../../../hooks/useFinancialServices'

// Types
import type {
  IMoeda,
  IMoedaInput,
  ICategoriaServico,
  ICategoriaServicoInput,
  ITipoServico,
  ITipoServicoInput,
} from '../../../types/financialService.types'

// Componentes de Moedas
import MoedaTable from '../../../components/financial-services/MoedaTable'
import MoedaFormModal from '../../../components/financial-services/MoedaFormModal'
import MoedaViewModal from '../../../components/financial-services/MoedaViewModal'
import MoedaDeleteModal from '../../../components/financial-services/MoedaDeleteModal'

// Componentes de Categorias
import CategoriaServicoTable from '../../../components/financial-services/CategoriaServicoTable'
import CategoriaServicoFormModal from '../../../components/financial-services/CategoriaServicoFormModal'

// Componentes de Tipos de Serviços
import TipoServicoTable from '../../../components/financial-services/TipoServicoTable'
import TipoServicoFormModal from '../../../components/financial-services/TipoServicoFormModal'

type TabType = 'moedas' | 'categorias' | 'tipos-servicos'

export default function FinancialServicesManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('tipos-servicos')

  // Estados de paginação e busca - Moedas
  const [moedaPage, setMoedaPage] = useState(1)
  const [moedaPageSize, setMoedaPageSize] = useState(10)
  const [moedaSearch, setMoedaSearch] = useState('')

  // Estados de paginação e busca - Categorias
  const [categoriaPage, setCategoriaPage] = useState(1)
  const [categoriaPageSize, setCategoriaPageSize] = useState(10)
  const [categoriaSearch, setCategoriaSearch] = useState('')

  // Estados de paginação e busca - Tipos de Serviços
  const [tipoServicoPage, setTipoServicoPage] = useState(1)
  const [tipoServicoPageSize, setTipoServicoPageSize] = useState(10)
  const [tipoServicoSearch, setTipoServicoSearch] = useState('')

  // Estados dos modais - Moedas
  const [isMoedaFormOpen, setIsMoedaFormOpen] = useState(false)
  const [isMoedaViewOpen, setIsMoedaViewOpen] = useState(false)
  const [isMoedaDeleteOpen, setIsMoedaDeleteOpen] = useState(false)
  const [selectedMoeda, setSelectedMoeda] = useState<IMoeda | null>(null)

  // Estados dos modais - Categorias
  const [isCategoriaFormOpen, setIsCategoriaFormOpen] = useState(false)
  const [isCategoriaDeleteOpen, setIsCategoriaDeleteOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<ICategoriaServico | null>(null)

  // Estados dos modais - Tipos de Serviços
  const [isTipoServicoFormOpen, setIsTipoServicoFormOpen] = useState(false)
  const [isTipoServicoDeleteOpen, setIsTipoServicoDeleteOpen] = useState(false)
  const [selectedTipoServico, setSelectedTipoServico] = useState<ITipoServico | null>(null)

  // Hooks de dados - Moedas
  const { data: moedasData, isLoading: isLoadingMoedas } = useMoedas({
    page: moedaPage,
    limit: moedaPageSize,
    search: moedaSearch,
  })
  const createMoeda = useCreateMoeda()
  const updateMoeda = useUpdateMoeda()
  const deleteMoeda = useDeleteMoeda()

  // Hooks de dados - Categorias
  const { data: categoriasData, isLoading: isLoadingCategorias } = useCategoriasServicos({
    page: categoriaPage,
    limit: categoriaPageSize,
    search: categoriaSearch,
  })
  const createCategoria = useCreateCategoriaServico()
  const updateCategoria = useUpdateCategoriaServico()
  const deleteCategoria = useDeleteCategoriaServico()

  // Hooks de dados - Tipos de Serviços
  const {
    tiposServicos,
    pagination: tiposServicosPagination,
    isLoading: isLoadingTiposServicos,
    createTipoServico,
    updateTipoServico,
    deleteTipoServico,
    isCreating: isCreatingTipoServico,
    isUpdating: isUpdatingTipoServico,
    isDeleting: isDeletingTipoServico,
  } = useTiposServicosManager({
    page: tipoServicoPage,
    limit: tipoServicoPageSize,
    filters: { search: tipoServicoSearch },
  })

  // ========== HANDLERS MOEDAS ==========
  const handleCreateMoeda = () => {
    setSelectedMoeda(null)
    setIsMoedaFormOpen(true)
  }

  const handleEditMoeda = (moeda: IMoeda) => {
    setSelectedMoeda(moeda)
    setIsMoedaFormOpen(true)
  }

  const handleViewMoeda = (moeda: IMoeda) => {
    setSelectedMoeda(moeda)
    setIsMoedaViewOpen(true)
  }

  const handleDeleteMoeda = (moeda: IMoeda) => {
    setSelectedMoeda(moeda)
    setIsMoedaDeleteOpen(true)
  }

  const handleMoedaFormSubmit = (data: IMoedaInput) => {
    if (selectedMoeda) {
      updateMoeda.mutate(
        { id: selectedMoeda.codigo, data },
        {
          onSuccess: () => {
            setIsMoedaFormOpen(false)
            setSelectedMoeda(null)
          },
        }
      )
    } else {
      createMoeda.mutate(data, {
        onSuccess: () => {
          setIsMoedaFormOpen(false)
        },
      })
    }
  }

  const handleConfirmDeleteMoeda = () => {
    if (selectedMoeda) {
      deleteMoeda.mutate(selectedMoeda.codigo, {
        onSuccess: () => {
          setIsMoedaDeleteOpen(false)
          setSelectedMoeda(null)
        },
      })
    }
  }

  // ========== HANDLERS CATEGORIAS ==========
  const handleCreateCategoria = () => {
    setSelectedCategoria(null)
    setIsCategoriaFormOpen(true)
  }

  const handleEditCategoria = (categoria: ICategoriaServico) => {
    setSelectedCategoria(categoria)
    setIsCategoriaFormOpen(true)
  }

  const handleDeleteCategoria = (categoria: ICategoriaServico) => {
    setSelectedCategoria(categoria)
    setIsCategoriaDeleteOpen(true)
  }

  const handleCategoriaFormSubmit = (data: ICategoriaServicoInput) => {
    if (selectedCategoria) {
      updateCategoria.mutate(
        { id: selectedCategoria.codigo, data },
        {
          onSuccess: () => {
            setIsCategoriaFormOpen(false)
            setSelectedCategoria(null)
          },
        }
      )
    } else {
      createCategoria.mutate(data, {
        onSuccess: () => {
          setIsCategoriaFormOpen(false)
        },
      })
    }
  }

  const handleConfirmDeleteCategoria = () => {
    if (selectedCategoria) {
      deleteCategoria.mutate(selectedCategoria.codigo, {
        onSuccess: () => {
          setIsCategoriaDeleteOpen(false)
          setSelectedCategoria(null)
        },
      })
    }
  }

  // ========== HANDLERS TIPOS DE SERVIÇOS ==========
  const handleCreateTipoServico = () => {
    setSelectedTipoServico(null)
    setIsTipoServicoFormOpen(true)
  }

  const handleEditTipoServico = (tipo: ITipoServico) => {
    setSelectedTipoServico(tipo)
    setIsTipoServicoFormOpen(true)
  }

  const handleViewTipoServico = (tipo: ITipoServico) => {
    setSelectedTipoServico(tipo)
    setIsTipoServicoFormOpen(true)
  }

  const handleDeleteTipoServico = (tipo: ITipoServico) => {
    setSelectedTipoServico(tipo)
    setIsTipoServicoDeleteOpen(true)
  }

  const handleTipoServicoFormSubmit = (data: ITipoServicoInput) => {
    if (selectedTipoServico) {
      updateTipoServico(
        { id: selectedTipoServico.codigo, data },
        {
          onSuccess: () => {
            setIsTipoServicoFormOpen(false)
            setSelectedTipoServico(null)
          },
        }
      )
    } else {
      createTipoServico(data, {
        onSuccess: () => {
          setIsTipoServicoFormOpen(false)
        },
      })
    }
  }

  const handleConfirmDeleteTipoServico = () => {
    if (selectedTipoServico) {
      deleteTipoServico(selectedTipoServico.codigo, {
        onSuccess: () => {
          setIsTipoServicoDeleteOpen(false)
          setSelectedTipoServico(null)
        },
      })
    }
  }

  // ========== TABS CONFIG ==========
  const tabs = [
    {
      id: 'tipos-servicos' as TabType,
      label: 'Tipos de Serviços',
      icon: FileText,
      count: tiposServicosPagination?.totalItems || 0,
    },
    {
      id: 'categorias' as TabType,
      label: 'Categorias',
      icon: Tag,
      count: categoriasData?.pagination?.totalItems || 0,
    },
    {
      id: 'moedas' as TabType,
      label: 'Moedas',
      icon: Coins,
      count: moedasData?.pagination?.totalItems || 0,
    },
  ]

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
                <DollarSign className="h-8 w-8 text-white" />
              </div>

              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Serviços Financeiros
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie moedas, categorias e tipos de serviços da instituição
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (activeTab === 'moedas') handleCreateMoeda()
                else if (activeTab === 'categorias') handleCreateCategoria()
                else handleCreateTipoServico()
              }}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Novo {activeTab === 'moedas' ? 'Moeda' : activeTab === 'categorias' ? 'Categoria' : 'Serviço'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'border-[#007C00] text-[#007C00]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === tab.id
                        ? 'bg-[#007C00] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'moedas' && (
        <>
          {/* Filtros e Pesquisa - Moedas */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar moedas..."
                  value={moedaSearch}
                  onChange={(e) => {
                    setMoedaSearch(e.target.value)
                    setMoedaPage(1)
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
                />
              </div>

              <div className="flex items-center gap-3 bg-gray-50 px-4 rounded-xl border border-gray-200">
                <label htmlFor="moeda-page-size" className="text-sm text-gray-600 font-medium">Exibir:</label>
                <select
                  id="moeda-page-size"
                  value={moedaPageSize}
                  onChange={(e) => {
                    setMoedaPageSize(Number(e.target.value))
                    setMoedaPage(1)
                  }}
                  className="bg-transparent py-3 pr-8 focus:outline-none text-gray-700 font-medium cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">
                Mostrando <span className="text-[#007C00] font-bold">{moedasData?.data.length || 0}</span> de{' '}
                <span className="text-gray-900 font-bold">{moedasData?.pagination?.totalItems || 0}</span> moedas
              </span>
              {moedaSearch && (
                <button
                  onClick={() => {
                    setMoedaSearch('')
                    setMoedaPage(1)
                  }}
                  className="text-sm text-[#007C00] hover:text-[#005a00] font-medium hover:underline transition-all"
                >
                  Limpar pesquisa
                </button>
              )}
            </div>
          </div>

          <MoedaTable
            moedas={moedasData?.data || []}
            isLoading={isLoadingMoedas}
            currentPage={moedaPage}
            totalPages={moedasData?.pagination?.totalPages || 1}
            onPageChange={setMoedaPage}
            onView={handleViewMoeda}
            onEdit={handleEditMoeda}
            onDelete={handleDeleteMoeda}
          />
        </>
      )}

      {activeTab === 'categorias' && (
        <>
          {/* Filtros e Pesquisa - Categorias */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar categorias..."
                  value={categoriaSearch}
                  onChange={(e) => {
                    setCategoriaSearch(e.target.value)
                    setCategoriaPage(1)
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
                />
              </div>

              <div className="flex items-center gap-3 bg-gray-50 px-4 rounded-xl border border-gray-200">
                <label htmlFor="categoria-page-size" className="text-sm text-gray-600 font-medium">Exibir:</label>
                <select
                  id="categoria-page-size"
                  value={categoriaPageSize}
                  onChange={(e) => {
                    setCategoriaPageSize(Number(e.target.value))
                    setCategoriaPage(1)
                  }}
                  className="bg-transparent py-3 pr-8 focus:outline-none text-gray-700 font-medium cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">
                Mostrando <span className="text-[#007C00] font-bold">{categoriasData?.data.length || 0}</span> de{' '}
                <span className="text-gray-900 font-bold">{categoriasData?.pagination?.totalItems || 0}</span> categorias
              </span>
              {categoriaSearch && (
                <button
                  onClick={() => {
                    setCategoriaSearch('')
                    setCategoriaPage(1)
                  }}
                  className="text-sm text-[#007C00] hover:text-[#005a00] font-medium hover:underline transition-all"
                >
                  Limpar pesquisa
                </button>
              )}
            </div>
          </div>

          <CategoriaServicoTable
            categorias={categoriasData?.data || []}
            isLoading={isLoadingCategorias}
            currentPage={categoriaPage}
            totalPages={categoriasData?.pagination?.totalPages || 1}
            onPageChange={setCategoriaPage}
            onView={handleEditCategoria}
            onEdit={handleEditCategoria}
            onDelete={handleDeleteCategoria}
          />
        </>
      )}

      {activeTab === 'tipos-servicos' && (
        <>
          {/* Filtros e Pesquisa - Tipos de Serviços */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar tipos de serviços..."
                  value={tipoServicoSearch}
                  onChange={(e) => {
                    setTipoServicoSearch(e.target.value)
                    setTipoServicoPage(1)
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
                />
              </div>

              <div className="flex items-center gap-3 bg-gray-50 px-4 rounded-xl border border-gray-200">
                <label htmlFor="tipo-servico-page-size" className="text-sm text-gray-600 font-medium">Exibir:</label>
                <select
                  id="tipo-servico-page-size"
                  value={tipoServicoPageSize}
                  onChange={(e) => {
                    setTipoServicoPageSize(Number(e.target.value))
                    setTipoServicoPage(1)
                  }}
                  className="bg-transparent py-3 pr-8 focus:outline-none text-gray-700 font-medium cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">
                Mostrando <span className="text-[#007C00] font-bold">{tiposServicos.length}</span> de{' '}
                <span className="text-gray-900 font-bold">{tiposServicosPagination?.totalItems || 0}</span> serviços
              </span>
              {tipoServicoSearch && (
                <button
                  onClick={() => {
                    setTipoServicoSearch('')
                    setTipoServicoPage(1)
                  }}
                  className="text-sm text-[#007C00] hover:text-[#005a00] font-medium hover:underline transition-all"
                >
                  Limpar pesquisa
                </button>
              )}
            </div>
          </div>

          <TipoServicoTable
            tiposServicos={tiposServicos}
            isLoading={isLoadingTiposServicos}
            currentPage={tipoServicoPage}
            totalPages={tiposServicosPagination?.totalPages || 1}
            onPageChange={setTipoServicoPage}
            onView={handleViewTipoServico}
            onEdit={handleEditTipoServico}
            onDelete={handleDeleteTipoServico}
          />
        </>
      )}

      {/* Modais - Moedas */}
      <MoedaFormModal
        isOpen={isMoedaFormOpen}
        onClose={() => {
          setIsMoedaFormOpen(false)
          setSelectedMoeda(null)
        }}
        onSubmit={handleMoedaFormSubmit}
        moeda={selectedMoeda}
        isLoading={createMoeda.isPending || updateMoeda.isPending}
      />

      <MoedaViewModal
        isOpen={isMoedaViewOpen}
        onClose={() => {
          setIsMoedaViewOpen(false)
          setSelectedMoeda(null)
        }}
        moeda={selectedMoeda}
        onEdit={() => {
          setIsMoedaViewOpen(false)
          handleEditMoeda(selectedMoeda!)
        }}
      />

      <MoedaDeleteModal
        isOpen={isMoedaDeleteOpen}
        onClose={() => {
          setIsMoedaDeleteOpen(false)
          setSelectedMoeda(null)
        }}
        onConfirm={handleConfirmDeleteMoeda}
        moedaName={selectedMoeda?.designacao || ''}
        isLoading={deleteMoeda.isPending}
      />

      {/* Modais - Categorias */}
      <CategoriaServicoFormModal
        isOpen={isCategoriaFormOpen}
        onClose={() => {
          setIsCategoriaFormOpen(false)
          setSelectedCategoria(null)
        }}
        onSubmit={handleCategoriaFormSubmit}
        categoria={selectedCategoria}
        isLoading={createCategoria.isPending || updateCategoria.isPending}
      />

      <MoedaDeleteModal
        isOpen={isCategoriaDeleteOpen}
        onClose={() => {
          setIsCategoriaDeleteOpen(false)
          setSelectedCategoria(null)
        }}
        onConfirm={handleConfirmDeleteCategoria}
        moedaName={selectedCategoria?.designacao || ''}
        isLoading={deleteCategoria.isPending}
      />

      {/* Modais - Tipos de Serviços */}
      <TipoServicoFormModal
        isOpen={isTipoServicoFormOpen}
        onClose={() => {
          setIsTipoServicoFormOpen(false)
          setSelectedTipoServico(null)
        }}
        onSubmit={handleTipoServicoFormSubmit}
        tipoServico={selectedTipoServico}
        isLoading={isCreatingTipoServico || isUpdatingTipoServico}
      />

      <MoedaDeleteModal
        isOpen={isTipoServicoDeleteOpen}
        onClose={() => {
          setIsTipoServicoDeleteOpen(false)
          setSelectedTipoServico(null)
        }}
        onConfirm={handleConfirmDeleteTipoServico}
        moedaName={selectedTipoServico?.designacao || ''}
        isLoading={isDeletingTipoServico}
      />
    </Container>
  )
}
