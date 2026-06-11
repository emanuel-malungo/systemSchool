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
      bgColor: 'bg-white',
      iconBg: 'bg-[#007C00]/10',
      iconColor: 'text-[#007C00]',
      textColor: 'text-gray-900',
      description: 'Matriculados no período'
    },
    {
      title: 'Alunos Ativos',
      value: `${statistics.alunosAtivos.toLocaleString('pt-AO')} (${formatPercentage(statistics.distribuicaoStatus.percentualAtivos)})`,
      icon: Award,
      bgColor: 'bg-white',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      textColor: 'text-gray-900',
      description: 'Frequência regular'
    },
    {
      title: 'Alunos Transferidos',
      value: `${statistics.alunosTransferidos.toLocaleString('pt-AO')} (${formatPercentage(statistics.distribuicaoStatus.percentualTransferidos)})`,
      icon: ArrowRightLeft,
      bgColor: 'bg-white',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      textColor: 'text-gray-900',
      description: 'Transferidos para outras escolas'
    },
    {
      title: 'Alunos Desistentes',
      value: `${statistics.alunosDesistentes.toLocaleString('pt-AO')} (${formatPercentage(statistics.distribuicaoStatus.percentualDesistentes)})`,
      icon: AlertTriangle,
      bgColor: 'bg-white',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      textColor: 'text-gray-900',
      description: 'Cancelamentos e desistências'
    },
    {
      title: 'Alunos Finalizados',
      value: `${statistics.alunosFinalizados.toLocaleString('pt-AO')} (${formatPercentage(statistics.distribuicaoStatus.percentualFinalizados)})`,
      icon: GraduationCap,
      bgColor: 'bg-white',
      iconBg: 'bg-[#007C00]/10',
      iconColor: 'text-[#007C00]',
      textColor: 'text-gray-900',
      description: 'Concluintes do ciclo'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className={`${card.bgColor} rounded-xl p-5 border border-gray-200 hover:shadow-sm hover:border-gray-300 transition-all duration-200 flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <div>
              <p className={`text-2xl font-bold ${card.textColor} tracking-tight`}>
                {card.value}
              </p>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {card.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {card.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
