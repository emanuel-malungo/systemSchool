import { Search, Filter, X } from 'lucide-react'
import type { AcademicReportFilters, AcademicFilterOptions } from '../../types/academic-reports.types'

interface AcademicReportFiltersProps {
  filters: AcademicReportFilters
  filterOptions: AcademicFilterOptions
  isLoadingOptions: boolean
  onFilterChange: (key: keyof AcademicReportFilters, value: string | undefined) => void
  onApplyFilters: () => void
  onClearFilters: () => void
}

export default function AcademicReportFilters({
  filters,
  filterOptions,
  isLoadingOptions,
  onFilterChange,
  onApplyFilters,
  onClearFilters
}: AcademicReportFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filtros Acadêmicos</h2>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
          >
            <option value="">Todas as Turmas</option>
            {filterOptions.turmas?.map((turma) => (
              <option key={turma.codigo} value={turma.designacao}>
                {turma.designacao} - {turma.classe}
              </option>
            ))}
          </select>
        </div>

        {/* Disciplina */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Disciplina
          </label>
          <select
            value={filters.disciplina || ''}
            onChange={(e) => onFilterChange('disciplina', e.target.value || undefined)}
            disabled={isLoadingOptions}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
          >
            <option value="">Todas as Disciplinas</option>
            {filterOptions.disciplinas?.map((disciplina) => (
              <option key={disciplina.codigo} value={disciplina.designacao}>
                {disciplina.designacao}
              </option>
            ))}
          </select>
        </div>

        {/* Professor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professor
          </label>
          <select
            value={filters.professor || ''}
            onChange={(e) => onFilterChange('professor', e.target.value || undefined)}
            disabled={isLoadingOptions}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
          >
            <option value="">Todos os Professores</option>
            {filterOptions.professores?.map((professor) => (
              <option key={professor.codigo} value={professor.nome}>
                {professor.nome}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Todos os Períodos</option>
            {filterOptions.periodos?.map((periodo) => (
              <option key={periodo.value} value={periodo.value}>
                {periodo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Trimestre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trimestre
          </label>
          <select
            value={filters.trimestre || 'todos'}
            onChange={(e) => onFilterChange('trimestre', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="todos">Todos os Trimestres</option>
            <option value="1">1º Trimestre</option>
            <option value="2">2º Trimestre</option>
            <option value="3">3º Trimestre</option>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativo</option>
            <option value="transferido">Transferido</option>
            <option value="desistente">Desistente</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>

        {/* Tipo de Relatório */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Relatório
          </label>
          <select
            value={filters.tipoRelatorio || 'todos'}
            onChange={(e) => onFilterChange('tipoRelatorio', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="notas">Notas</option>
            <option value="frequencia">Frequência</option>
            <option value="aproveitamento">Aproveitamento</option>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onApplyFilters}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
