import { Search, Filter, X } from 'lucide-react'
import type { FinancialReportFilters, FinancialFilterOptions } from '../../types/financial-reports.types'

interface FinancialReportFiltersProps {
  filters: FinancialReportFilters
  filterOptions: FinancialFilterOptions
  isLoadingOptions: boolean
  onFilterChange: (key: keyof FinancialReportFilters, value: string | number | undefined) => void
  onApplyFilters: () => void
  onClearFilters: () => void
}

export default function FinancialReportFilters({
  filters,
  filterOptions,
  isLoadingOptions,
  onFilterChange,
  onApplyFilters,
  onClearFilters
}: FinancialReportFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5 text-green-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filtros de Pesquisa</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {/* Ano Académico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ano Académico
          </label>
          <select
            value={filters.anoAcademico || ''}
            onChange={(e) => onFilterChange('anoAcademico', e.target.value || undefined)}
            disabled={isLoadingOptions}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
          >
            <option value="">Todos os Anos</option>
            {filterOptions.anosAcademicos?.map((ano) => (
              <option key={ano.codigo} value={ano.designacao}>
                {ano.designacao}
              </option>
            ))}
          </select>
        </div>

        {/* Classe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Classe
          </label>
          <select
            value={filters.classe || ''}
            onChange={(e) => onFilterChange('classe', e.target.value || undefined)}
            disabled={isLoadingOptions}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
          >
            <option value="">Todas as Classes</option>
            {filterOptions.classes?.map((classe) => (
              <option key={classe.codigo} value={classe.designacao}>
                {classe.designacao}
              </option>
            ))}
          </select>
        </div>

        {/* Curso */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Curso
          </label>
          <select
            value={filters.curso || ''}
            onChange={(e) => onFilterChange('curso', e.target.value || undefined)}
            disabled={isLoadingOptions}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
          >
            <option value="">Todos os Cursos</option>
            {filterOptions.cursos?.map((curso) => (
              <option key={curso.codigo} value={curso.designacao}>
                {curso.designacao}
              </option>
            ))}
          </select>
        </div>

        {/* Período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <select
            value={filters.periodo || ''}
            onChange={(e) => onFilterChange('periodo', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos os Períodos</option>
            {filterOptions.periodos?.map((periodo) => (
              <option key={periodo.value} value={periodo.value}>
                {periodo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Transação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Transação
          </label>
          <select
            value={filters.tipoTransacao || 'todos'}
            onChange={(e) => onFilterChange('tipoTransacao', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {filterOptions.tiposTransacao?.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status de Pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status de Pagamento
          </label>
          <select
            value={filters.statusPagamento || 'todos'}
            onChange={(e) => onFilterChange('statusPagamento', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {filterOptions.statusPagamento?.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Data Início */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Início
          </label>
          <input
            type="date"
            value={filters.dataInicio || ''}
            onChange={(e) => onFilterChange('dataInicio', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Data Fim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Fim
          </label>
          <input
            type="date"
            value={filters.dataFim || ''}
            onChange={(e) => onFilterChange('dataFim', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Valor Mínimo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor Mínimo (Kz)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filters.valorMinimo || ''}
            onChange={(e) => onFilterChange('valorMinimo', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Valor Máximo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor Máximo (Kz)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filters.valorMaximo || ''}
            onChange={(e) => onFilterChange('valorMaximo', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onApplyFilters}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Search className="h-4 w-4" />
          Aplicar Filtros
        </button>
        
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4" />
          Limpar Filtros
        </button>
      </div>
    </div>
  )
}
