import { Users, Award, ArrowRightLeft, AlertTriangle, GraduationCap } from 'lucide-react'
import type { AcademicStatistics } from '../../types/academic-reports.types'

interface AcademicStatisticsCardsProps {
  statistics: AcademicStatistics
}

export default function AcademicStatisticsCards({ statistics }: AcademicStatisticsCardsProps) {
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const cards = [
    {
      title: 'Total de Alunos',
      value: statistics.totalAlunos.toLocaleString('pt-AO'),
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600'
    },
    {
      title: 'Alunos Ativos',
      value: `${statistics.alunosAtivos.toLocaleString('pt-AO')} (${formatPercentage(statistics.distribuicaoStatus.percentualAtivos)})`,
      icon: Award,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-600'
    },
    {
      title: 'Alunos Transferidos',
      value: `${statistics.alunosTransferidos.toLocaleString('pt-AO')} (${formatPercentage(statistics.distribuicaoStatus.percentualTransferidos)})`,
      icon: ArrowRightLeft,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Alunos Desistentes',
      value: `${statistics.alunosDesistentes.toLocaleString('pt-AO')} (${formatPercentage(statistics.distribuicaoStatus.percentualDesistentes)})`,
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      textColor: 'text-red-600'
    },
    {
      title: 'Alunos Finalizados',
      value: `${statistics.alunosFinalizados.toLocaleString('pt-AO')} (${formatPercentage(statistics.distribuicaoStatus.percentualFinalizados)})`,
      icon: GraduationCap,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-600'
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
    </div>
  )
}
