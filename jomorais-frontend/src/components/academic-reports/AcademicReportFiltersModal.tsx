import { X, Filter } from 'lucide-react'
import type { AcademicReportFilters, AcademicFilterOptions } from '../../types/academic-reports.types'

interface AcademicReportFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: AcademicReportFilters
  filterOptions: AcademicFilterOptions
  isLoadingOptions: boolean
  onFilterChange: (key: keyof AcademicReportFilters, value: string | undefined) => void
  onApplyFilters: () => void
  onClearFilters: () => void
}

export default function AcademicReportFiltersModal({
  isOpen,
  onClose,
  filters,
  filterOptions,
  isLoadingOptions,
  onFilterChange,
  onApplyFilters,
  onClearFilters
}: AcademicReportFiltersProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007C00]/10 rounded-lg flex items-center justify-center">
              <Filter className="h-5 w-5 text-[#007C00]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Filtros Avançados</h2>
              <p className="text-sm text-gray-500">Refine a busca de relatórios académicos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Ano Académico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ano Académico
          </label>
          <select
            value={filters.anoAcademico || ''}
            onChange={(e) => onFilterChange('anoAcademico', e.target.value || undefined)}
            disabled={isLoadingOptions}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] disabled:bg-gray-100"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] disabled:bg-gray-100"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] disabled:bg-gray-100"
          >
            <option value="">Todos os Cursos</option>
            {filterOptions.cursos?.map((curso) => (
              <option key={curso.codigo} value={curso.designacao}>
                {curso.designacao}
              </option>
            ))}
          </select>
        </div>

        {/* Turma */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Turma
          </label>
          <select
            value={filters.turma || ''}
            onChange={(e) => onFilterChange('turma', e.target.value || undefined)}
            disabled={isLoadingOptions}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] disabled:bg-gray-100"
          >
            <option value="">Todas as Turmas</option>
            {filterOptions.turmas?.map((turma) => (
              <option key={turma.codigo} value={turma.designacao}>
                {turma.designacao} - {turma.classe}
              </option>
            ))}
          </select>
        </div>

        {/* Status do Aluno */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status do Aluno
          </label>
          <select
            value={filters.statusAluno || 'todos'}
            onChange={(e) => onFilterChange('statusAluno', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00]"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativo</option>
            <option value="transferido">Transferido</option>
            <option value="desistente">Desistente</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>

      </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClearFilters}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Limpar Filtros
          </button>
          
          <button
            onClick={() => {
              onApplyFilters()
              onClose()
            }}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#007C00] rounded-xl hover:bg-[#005a00] transition-colors shadow-sm"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  )
}
