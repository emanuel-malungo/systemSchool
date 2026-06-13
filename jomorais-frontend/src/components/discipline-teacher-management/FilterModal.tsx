import { X, Filter, RotateCcw } from 'lucide-react'

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    professorFilter: string;
    disciplinaFilter: string;
    tipoFilter: string;
  };
  setFilters: (filters: { professorFilter: string; disciplinaFilter: string; tipoFilter: string }) => void;
  professoresList: any[];
  disciplinasList: any[];
  onClear: () => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  setFilters,
  professoresList,
  disciplinasList,
  onClear
}: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Filter className="h-5 w-5 text-[#007C00]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Filtros Avançados</h2>
              <p className="text-xs text-gray-500">Refine a busca por atribuições</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Professor Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Professor</label>
            <select
              value={filters.professorFilter}
              onChange={(e) => setFilters({ ...filters, professorFilter: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all text-sm text-gray-700"
            >
              <option value="all">Todos os Professores</option>
              {professoresList.map((prof) => (
                <option key={prof.codigo} value={prof.codigo}>
                  {prof.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Disciplina Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Disciplina</label>
            <select
              value={filters.disciplinaFilter}
              onChange={(e) => setFilters({ ...filters, disciplinaFilter: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all text-sm text-gray-700"
            >
              <option value="all">Todas as Disciplinas</option>
              {disciplinasList.map((disc) => (
                <option key={disc.codigo} value={disc.codigo}>
                  {disc.designacao}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Atribuição</label>
            <select
              value={filters.tipoFilter}
              onChange={(e) => setFilters({ ...filters, tipoFilter: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all text-sm text-gray-700"
            >
              <option value="all">Todos os Tipos</option>
              <option value="disciplina">Apenas Disciplinas</option>
              <option value="turma">Apenas Turmas</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between sticky bottom-0">
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar Filtros
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#007C00] text-white text-sm font-medium rounded-xl hover:bg-[#005a00] transition-colors shadow-sm"
          >
            Aplicar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
