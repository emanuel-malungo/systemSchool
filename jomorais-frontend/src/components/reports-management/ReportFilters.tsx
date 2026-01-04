import { Filter, X } from 'lucide-react'

interface ReportFilters {
  anoAcademico: string
  classe: string
  curso: string
  estado: string
  genero: string
  periodo: string
  dataMatriculaFrom: string
  dataMatriculaTo: string
}

interface FilterOptions {
  anosAcademicos: Array<{ codigo: number; designacao: string; anoInicial: string; anoFinal: string }>
  classes: Array<{ codigo: number; designacao: string }>
  cursos: Array<{ codigo: number; designacao: string }>
  periodos: Array<{ codigo: number; designacao: string }>
}

interface ReportFiltersProps {
  filters: ReportFilters
  filterOptions?: FilterOptions
  isLoadingOptions?: boolean
  onFilterChange: (key: keyof ReportFilters, value: string) => void
  onApplyFilters: () => void
  onClearFilters: () => void
}

export default function ReportFilters({
  filters,
  filterOptions,
  isLoadingOptions = false,
  onFilterChange,
  onApplyFilters,
  onClearFilters
}: ReportFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filtros Relevantes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Ano Académico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ano Académico</label>
          <select
            value={filters.anoAcademico}
            onChange={(e) => onFilterChange('anoAcademico', e.target.value)}
            disabled={isLoadingOptions}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Todos</option>
            {filterOptions?.anosAcademicos?.map((ano) => (
              <option key={ano.codigo} value={ano.designacao}>
                {ano.designacao}
              </option>
            ))}
          </select>
        </div>

        {/* Classe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Classe / Série</label>
          <select
            value={filters.classe}
            onChange={(e) => onFilterChange('classe', e.target.value)}
            disabled={isLoadingOptions}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Todas</option>
            {filterOptions?.classes?.map((classe) => (
              <option key={classe.codigo} value={classe.designacao}>
                {classe.designacao}
              </option>
            ))}
          </select>
        </div>

        {/* Curso */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Curso / Área</label>
          <select
            value={filters.curso}
            onChange={(e) => onFilterChange('curso', e.target.value)}
            disabled={isLoadingOptions}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Todos</option>
            {filterOptions?.cursos?.map((curso) => (
              <option key={curso.codigo} value={curso.designacao}>
                {curso.designacao}
              </option>
            ))}
          </select>
        </div>

        {/* Estado do Aluno */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado do Aluno</label>
          <select
            value={filters.estado}
            onChange={(e) => onFilterChange('estado', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Transferido">Transferido</option>
            <option value="Desistente">Desistente</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>

        {/* Género */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
          <select
            value={filters.genero}
            onChange={(e) => onFilterChange('genero', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
        </div>

        {/* Período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
          <select
            value={filters.periodo}
            onChange={(e) => onFilterChange('periodo', e.target.value)}
            disabled={isLoadingOptions}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Todos</option>
            {filterOptions?.periodos?.map((periodo) => (
              <option key={periodo.codigo} value={periodo.designacao}>
                {periodo.designacao}
              </option>
            ))}
          </select>
        </div>

        {/* Data de Matrícula - De */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Matrícula (De)</label>
          <input
            type="date"
            value={filters.dataMatriculaFrom}
            onChange={(e) => onFilterChange('dataMatriculaFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Data de Matrícula - Até */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Matrícula (Até)</label>
          <input
            type="date"
            value={filters.dataMatriculaTo}
            onChange={(e) => onFilterChange('dataMatriculaTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onApplyFilters}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Filter className="h-4 w-4" />
          Aplicar Filtros
        </button>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
          Limpar Filtros
        </button>
      </div>
    </div>
  )
}
