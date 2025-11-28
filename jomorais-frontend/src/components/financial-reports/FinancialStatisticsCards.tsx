import { DollarSign, TrendingUp, TrendingDown, CreditCard, Users, Percent } from 'lucide-react'
import type { FinancialStatistics } from '../../types/financial-reports.types'

interface FinancialStatisticsCardsProps {
  statistics?: FinancialStatistics
}

export default function FinancialStatisticsCards({ statistics }: FinancialStatisticsCardsProps) {
  const formatCurrency = (value: number | undefined) => {
    const safeValue = value || 0
    return `${safeValue.toLocaleString('pt-AO', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })} Kz`
  }

  const formatPercentage = (value: number | undefined) => {
    const safeValue = value || 0
    return `${safeValue.toFixed(1)}%`
  }

  // Provide default values if statistics is undefined or incomplete
  const safeStatistics = {
    valorTotalArrecadado: statistics?.valorTotalArrecadado || 0,
    valorTotalPendente: statistics?.valorTotalPendente || 0,
    valorTotalAtrasado: statistics?.valorTotalAtrasado || 0,
    totalTransacoes: statistics?.totalTransacoes || 0,
    transacoesPagas: statistics?.transacoesPagas || 0,
    transacoesPendentes: statistics?.transacoesPendentes || 0,
    transacoesAtrasadas: statistics?.transacoesAtrasadas || 0,
    transacoesCanceladas: statistics?.transacoesCanceladas || 0,
    percentualArrecadacao: statistics?.percentualArrecadacao || 0,
    ticketMedio: statistics?.ticketMedio || 0,
    distribuicaoPorTipo: {
      pagamentos: statistics?.distribuicaoPorTipo?.pagamentos || 0,
      propinas: statistics?.distribuicaoPorTipo?.propinas || 0,
      multas: statistics?.distribuicaoPorTipo?.multas || 0,
      descontos: statistics?.distribuicaoPorTipo?.descontos || 0,
    },
    distribuicaoPorMetodo: {
      dinheiro: statistics?.distribuicaoPorMetodo?.dinheiro || 0,
      transferencia: statistics?.distribuicaoPorMetodo?.transferencia || 0,
      multicaixa: statistics?.distribuicaoPorMetodo?.multicaixa || 0,
      outros: statistics?.distribuicaoPorMetodo?.outros || 0,
    }
  }

  const cards = [
    {
      title: 'Valor Total Arrecadado',
      value: formatCurrency(safeStatistics.valorTotalArrecadado),
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-600'
    },
    {
      title: 'Valor Total Pendente',
      value: formatCurrency(safeStatistics.valorTotalPendente),
      icon: TrendingDown,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Valor Total Atrasado',
      value: formatCurrency(safeStatistics.valorTotalAtrasado),
      icon: CreditCard,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      textColor: 'text-red-600'
    },
    {
      title: 'Total de Transações',
      value: safeStatistics.totalTransacoes.toLocaleString('pt-AO'),
      icon: DollarSign,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600'
    },
    {
      title: 'Percentual de Arrecadação',
      value: formatPercentage(safeStatistics.percentualArrecadacao),
      icon: Percent,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-600'
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(safeStatistics.ticketMedio),
      icon: Users,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className={`${card.bgColor} rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}

      {/* Additional Statistics Cards */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transações por Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pagas</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-600">
                {safeStatistics.transacoesPagas}
              </span>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${safeStatistics.totalTransacoes > 0 ? (safeStatistics.transacoesPagas / safeStatistics.totalTransacoes) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pendentes</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-yellow-600">
                {safeStatistics.transacoesPendentes}
              </span>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ 
                    width: `${safeStatistics.totalTransacoes > 0 ? (safeStatistics.transacoesPendentes / safeStatistics.totalTransacoes) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Atrasadas</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-red-600">
                {safeStatistics.transacoesAtrasadas}
              </span>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ 
                    width: `${safeStatistics.totalTransacoes > 0 ? (safeStatistics.transacoesAtrasadas / safeStatistics.totalTransacoes) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Canceladas</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                {safeStatistics.transacoesCanceladas}
              </span>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full" 
                  style={{ 
                    width: `${safeStatistics.totalTransacoes > 0 ? (safeStatistics.transacoesCanceladas / safeStatistics.totalTransacoes) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Tipo</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pagamentos</span>
            <span className="text-sm font-medium text-blue-600">
              {safeStatistics.distribuicaoPorTipo.pagamentos}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Propinas</span>
            <span className="text-sm font-medium text-purple-600">
              {safeStatistics.distribuicaoPorTipo.propinas}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Multas</span>
            <span className="text-sm font-medium text-red-600">
              {safeStatistics.distribuicaoPorTipo.multas}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Descontos</span>
            <span className="text-sm font-medium text-green-600">
              {safeStatistics.distribuicaoPorTipo.descontos}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Dinheiro</span>
            <span className="text-sm font-medium text-green-600">
              {safeStatistics.distribuicaoPorMetodo.dinheiro}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Transferência</span>
            <span className="text-sm font-medium text-blue-600">
              {safeStatistics.distribuicaoPorMetodo.transferencia}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Multicaixa</span>
            <span className="text-sm font-medium text-orange-600">
              {safeStatistics.distribuicaoPorMetodo.multicaixa}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Outros</span>
            <span className="text-sm font-medium text-gray-600">
              {safeStatistics.distribuicaoPorMetodo.outros}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
