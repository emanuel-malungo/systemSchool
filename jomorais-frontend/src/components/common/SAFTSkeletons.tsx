import { FileText, Settings, Calendar, Building2, Users, Receipt, DollarSign, TrendingUp } from 'lucide-react'

// Skeleton para as estatísticas
export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[
      { icon: Receipt, bgClass: 'from-blue-50 to-blue-100' },
      { icon: DollarSign, bgClass: 'from-green-50 to-green-100' },
      { icon: TrendingUp, bgClass: 'from-purple-50 to-purple-100' },
      { icon: Users, bgClass: 'from-orange-50 to-orange-100' }
    ].map((item, i) => (
      <div key={i} className={`bg-gradient-to-br ${item.bgClass} rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse`}>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center">
            <item.icon className="h-6 w-6 text-gray-400" />
          </div>
        </div>
        <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
        <div className="h-8 bg-gray-300 rounded w-20 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-16"></div>
      </div>
    ))}
  </div>
)

// Skeleton para o formulário de configuração
export const ConfigFormSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
    <div className="p-8">
      {/* Header do formulário */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-300 rounded-xl flex items-center justify-center">
          <Settings className="h-5 w-5 text-gray-400" />
        </div>
        <div className="h-6 bg-gray-300 rounded w-48"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna 1 */}
        <div className="space-y-6">
          {/* Período */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="h-5 bg-gray-300 rounded w-32"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Dados a incluir */}
          <div>
            <div className="h-5 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="h-5 w-5 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna 2 */}
        <div className="space-y-6">
          {/* Informações da empresa */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div className="h-5 bg-gray-300 rounded w-36"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Informações do software */}
          <div>
            <div className="h-5 bg-gray-300 rounded w-36 mb-4"></div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-64"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 bg-gray-300 rounded w-32"></div>
          <div className="h-10 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    </div>
  </div>
)

// Skeleton para o header
export const HeaderSkeleton = () => (
  <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
    <div className="relative p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-300 rounded-2xl flex items-center justify-center">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-300 rounded w-72"></div>
            <div className="h-5 bg-gray-300 rounded w-96"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="h-4 bg-gray-300 rounded w-64"></div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="h-12 bg-gray-300 rounded-xl w-32"></div>
          <div className="h-12 bg-gray-300 rounded-xl w-24"></div>
        </div>
      </div>
    </div>
  </div>
)

// Skeleton completo da página
export const SAFTPageSkeleton = () => (
  <div className="space-y-6">
    <HeaderSkeleton />
    <StatsSkeleton />
    <ConfigFormSkeleton />
  </div>
)

// Skeleton para modais
export const ModalSkeleton = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 shadow-2xl animate-pulse">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-300 rounded w-48"></div>
          <div className="h-4 bg-gray-300 rounded w-72"></div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="h-5 bg-gray-300 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-gray-300 rounded w-16"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 h-12 bg-gray-300 rounded-xl"></div>
        <div className="flex-1 h-12 bg-gray-300 rounded-xl"></div>
      </div>
    </div>
  </div>
)

// Skeleton para progresso de exportação
export const ProgressSkeleton = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl animate-pulse">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-300 rounded-2xl mx-auto mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-48 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-64 mx-auto mb-6"></div>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div className="bg-blue-600 h-3 rounded-full w-3/4"></div>
        </div>
        
        <div className="h-4 bg-gray-300 rounded w-20 mx-auto mb-4"></div>
        
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    </div>
  </div>
)

export default {
  StatsSkeleton,
  ConfigFormSkeleton,
  HeaderSkeleton,
  SAFTPageSkeleton,
  ModalSkeleton,
  ProgressSkeleton
}