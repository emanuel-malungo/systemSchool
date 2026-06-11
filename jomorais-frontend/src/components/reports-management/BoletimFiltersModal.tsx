import { Filter, X, ChevronDown, Loader2 } from 'lucide-react'

interface BoletimFiltersModalProps {
  isOpen: boolean
  onClose: () => void
  anos: any[]
  turmasFiltradas: any[]
  trimestres: any[]
  selectedAnoLetivo: string
  selectedTurma: string
  selectedTrimestre: string
  onAnoLetivoChange: (val: string) => void
  onTurmaChange: (val: string) => void
  onTrimestreChange: (val: string) => void
  onApply: () => void
  isLoading: boolean
}

export default function BoletimFiltersModal({
  isOpen,
  onClose,
  anos,
  turmasFiltradas,
  trimestres,
  selectedAnoLetivo,
  selectedTurma,
  selectedTrimestre,
  onAnoLetivoChange,
  onTurmaChange,
  onTrimestreChange,
  onApply,
  isLoading
}: BoletimFiltersModalProps) {
  if (!isOpen) return null

  const canApply = selectedAnoLetivo && selectedTurma && selectedTrimestre

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007C00]/10 rounded-lg flex items-center justify-center">
              <Filter className="h-5 w-5 text-[#007C00]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Configurar Boletim</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Ano Lectivo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ano Lectivo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedAnoLetivo}
                onChange={e => onAnoLetivoChange(e.target.value)}
                className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] bg-gray-50 transition"
              >
                <option value="">Selecione o ano lectivo...</option>
                {anos.map((ano: any) => (
                  <option key={ano.codigo} value={ano.codigo}>
                    {ano.designacao}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Turma */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Turma <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedTurma}
                onChange={e => onTurmaChange(e.target.value)}
                disabled={!selectedAnoLetivo}
                className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Selecione a turma...</option>
                {turmasFiltradas.map((turma: any) => (
                  <option key={turma.codigo} value={turma.codigo}>
                    {turma.designacao}
                    {turma.tb_classes?.designacao ? ` – ${turma.tb_classes.designacao}ª Cl.` : ''}
                    {turma.tb_cursos?.designacao ? ` | ${turma.tb_cursos.designacao}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Trimestre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trimestre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedTrimestre}
                onChange={e => onTrimestreChange(e.target.value)}
                className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] bg-gray-50 transition"
              >
                <option value="">Selecione o trimestre...</option>
                {trimestres.map(t => (
                  <option key={t.codigo} value={t.codigo}>
                    {t.designacao}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onApply()
              onClose()
            }}
            disabled={!canApply || isLoading}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${canApply ? 'bg-[#007C00] hover:bg-[#005a00]' : 'bg-gray-400'}`}
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</>
            ) : (
              'Carregar Boletim'
            )}
          </button>
        </div>
        
      </div>
    </div>
  )
}
